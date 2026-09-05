import db from "../../../models/index.js";

const {
  sequelize,
  WasteEntry,
  WasteEntryDetail,
  WasteMaster,
  PackingType,
  Godown,
} = db;

//////////////////////////////////////////////////////
// CREATE
//////////////////////////////////////////////////////
export const create = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    if (
      !data.date ||
      !data.shift ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details");
    }

    let calculatedTotal = 0;

    const detailsToCreate = data.details.map((detail) => {
      const netWt = parseFloat(detail.netWeight) || 0;
      calculatedTotal += netWt;

      return {
        wasteMasterId: detail.wasteMasterId,
        packingTypeId: detail.packingTypeId,
        godownId: detail.godownId,
        netWeight: netWt,
        department: detail.department,
      };
    });

    // create master entry
    const entry = await WasteEntry.create(
      {
        date: data.date,
        shift: data.shift || "ALL",
        totalNetWeight: calculatedTotal,
        remarks: data.remarks || null,
      },
      { transaction }
    );

    // create details
    await WasteEntryDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        wasteEntryId: entry.id,
      })),
      { transaction }
    );

    await transaction.commit();

    return await getById(entry.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//////////////////////////////////////////////////////
// GET ALL
//////////////////////////////////////////////////////
export const getAll = async (filters = {}) => {
  const where = {};

  if (filters.date) where.date = filters.date;
  if (filters.shift) where.shift = filters.shift;

  return await WasteEntry.findAll({
    where,
    include: [
      {
        model: WasteEntryDetail,
        as: "details",
        include: [
          {
            model: WasteMaster,
            as: "waste",
            attributes: ["id", "department", "waste"],
          },
          {
            model: PackingType,
            as: "packingType",
            attributes: ["id", "name", "tareWeight"],
          },
          {
            model: Godown,
            as: "godown",
            attributes: ["id", "godownName", "locationName"],
          },
        ],
      },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

//////////////////////////////////////////////////////
// GET BY ID
//////////////////////////////////////////////////////
export const getById = async (id) => {
  const entry = await WasteEntry.findByPk(id, {
    include: [
      {
        model: WasteEntryDetail,
        as: "details",
        include: [
          {
            model: WasteMaster,
            as: "waste",
            attributes: ["id", "department", "waste"],
          },
          {
            model: PackingType,
            as: "packingType",
            attributes: ["id", "name", "tareWeight"],
          },
          {
            model: Godown,
            as: "godown",
            attributes: ["id", "godownName", "locationName"],
          },
        ],
      },
    ],
  });

  if (!entry) {
    throw new Error("Waste entry not found");
  }

  return entry;
};

//////////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////////
export const update = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const entry = await WasteEntry.findByPk(id, { transaction });

    if (!entry) {
      throw new Error("Waste entry not found");
    }

    let calculatedTotal = entry.totalNetWeight;

    // if details updated
    if (data.details && Array.isArray(data.details)) {
      calculatedTotal = 0;

      const newDetails = data.details.map((detail) => {
        const netWt = parseFloat(detail.netWeight) || 0;
        calculatedTotal += netWt;

        return {
          wasteEntryId: id,
          wasteMasterId: detail.wasteMasterId,
          packingTypeId: detail.packingTypeId,
          godownId: detail.godownId,
          netWeight: netWt,
          department: detail.department,
        };
      });

      // remove old
      await WasteEntryDetail.destroy({
        where: { wasteEntryId: id },
        transaction,
      });

      // insert new
      await WasteEntryDetail.bulkCreate(newDetails, { transaction });
    }

    await entry.update(
      {
        date: data.date ?? entry.date,
        shift: data.shift ?? entry.shift,
        totalNetWeight: calculatedTotal,
        remarks: data.remarks ?? entry.remarks,
      },
      { transaction }
    );

    await transaction.commit();

    return await getById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////
export const remove = async (id) => {
  const entry = await WasteEntry.findByPk(id);

  if (!entry) {
    throw new Error("Waste entry not found");
  }

  // CASCADE deletes details automatically
  await entry.destroy();

  return true;
};

export const bulkImport = async (data) => {
  const transaction = await sequelize.transaction();
  try {
    const { headers, details } = data;

    if (!headers || !details) {
      throw new Error("Invalid import payload: headers and details are required");
    }

    // 1. Prepare maps for Foreign Key lookups
    const legacyWasteCodeToName = {
      1: "LICKERIN FLY",
      3: "FLAT STRIPS",
      4: "COMBER NOILS",
      5: "ROVING WASTE",
      6: "FAN WASTE",
      7: "SWEEPINGS",
      8: "PICKING WASTE",
      9: "YARN WASTE",
      37: "MICRODUST 1",
      38: "MICRODUST 2"
    };

    const normalizeName = (name) => {
      if (!name) return "";
      return name.trim().toLowerCase()
        .replace(/\s+/g, "")
        .replace(/['"“”\-\/\\\.]/g, "");
    };

    const wasteMasters = await WasteMaster.findAll({ raw: true, transaction });
    const wasteMasterByName = new Map();
    wasteMasters.forEach((wm) => {
      wasteMasterByName.set(normalizeName(wm.waste), wm.id);
    });

    const deptCodeToName = {
      1: "Blow Room",
      2: "Carding",
      5: "Speed Frame",
      7: "Spinning",
      8: "Auto Coner",
      9: "Blow Room",
      11: "Blow Room"
    };

    const godowns = await Godown.findAll({ raw: true, transaction });
    const godownByName = new Map();
    godowns.forEach((g) => {
      godownByName.set(g.godownName.trim().toUpperCase(), g.id);
    });
    const defaultGodownId = godownByName.get("AB") || (godowns.length > 0 ? godowns[0].id : 1);

    const packingTypes = await PackingType.findAll({ raw: true, transaction });
    const packingTypeByCode = new Map();
    packingTypes.forEach((pt) => {
      packingTypeByCode.set(Number(pt.code || pt._id || pt.id), pt.id);
    });
    const defaultPackingTypeId = packingTypeByCode.get(1) || (packingTypes.length > 0 ? packingTypes[0].id : 1);

    // 2. Safe truncate tables
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;", { transaction });
    await sequelize.query("TRUNCATE TABLE `waste_entry_details`;", { transaction });
    await sequelize.query("TRUNCATE TABLE `waste_entries`;", { transaction });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;", { transaction });

    // 3. Group details by Waste Entry Code (Header ID)
    const detailsByEntryId = new Map();
    const entryTotalWeights = new Map();

    details.forEach((d) => {
      const entryId = Number(d["Code"] !== undefined ? d["Code"] : d.code);
      if (!entryId || isNaN(entryId)) return;

      const wasteCode = Number(d["Waste Code"] !== undefined ? d["Waste Code"] : d.wasteCode);
      const oldName = legacyWasteCodeToName[wasteCode];
      const wasteMasterId = oldName ? wasteMasterByName.get(normalizeName(oldName)) : null;
      
      if (!wasteMasterId) return;

      const netWt = parseFloat(d["Net Wgt"] !== undefined ? d["Net Wgt"] : d.netWeight || 0);
      if (isNaN(netWt) || netWt <= 0) return;

      const deptCode = Number(d["Dept Code"] !== undefined ? d["Dept Code"] : d.deptCode);
      const department = deptCodeToName[deptCode] || "General";

      const godownStr = String(d["Godown"] || "").trim().toUpperCase();
      const godownId = godownByName.get(godownStr) || defaultGodownId;

      const packingCode = Number(d["Packing type Code"] !== undefined ? d["Packing type Code"] : d.packingTypeCode);
      const packingTypeId = packingTypeByCode.get(packingCode) || defaultPackingTypeId;

      if (!detailsByEntryId.has(entryId)) {
        detailsByEntryId.set(entryId, []);
        entryTotalWeights.set(entryId, 0);
      }

      detailsByEntryId.get(entryId).push({
        wasteMasterId,
        packingTypeId,
        godownId,
        netWeight: netWt,
        department
      });

      entryTotalWeights.set(entryId, entryTotalWeights.get(entryId) + netWt);
    });

    // 4. Parse headers & Bulk Insert
    const headersToInsert = [];
    const entryIdToFinalId = new Map();

    headers.forEach((h, index) => {
      let entryId, shift, dateVal;

      if (Array.isArray(h)) {
        entryId = Number(h[0]);
        shift = String(h[1] || "ALL").trim();
        dateVal = h[2];
      } else {
        entryId = Number(h[0] !== undefined ? h[0] : h["Code"] || h.code || index + 1);
        shift = String(h[1] || h["Shift"] || "ALL").trim();
        dateVal = h[2] || h["Date"] || h.date;
      }

      if (!entryId || isNaN(entryId)) return;

      let dateFormatted = new Date().toISOString().split('T')[0];
      if (dateVal && String(dateVal).trim().toUpperCase() !== 'NULL') {
        const s = String(dateVal).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          dateFormatted = s.substring(0, 10);
        } else if (typeof dateVal === 'number' || (!isNaN(Number(s)) && !s.includes('-') && !s.includes('/'))) {
          const num = Number(s);
          const dateObj = new Date((num - 25569) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) {
            dateFormatted = dateObj.toISOString().split('T')[0];
          }
        } else if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
          dateFormatted = dateVal.toISOString().split('T')[0];
        } else {
          const parsed = new Date(s);
          if (!isNaN(parsed.getTime())) {
            dateFormatted = parsed.toISOString().split('T')[0];
          }
        }
      }

      const totalNetWeight = entryTotalWeights.get(entryId) || 0;

      headersToInsert.push({
        id: entryId,
        date: dateFormatted,
        shift: shift || "ALL",
        totalNetWeight,
        remarks: null
      });

      entryIdToFinalId.set(entryId, entryId);
    });

    await WasteEntry.bulkCreate(headersToInsert, { transaction });

    // 5. Bulk Insert Details
    const detailsToInsert = [];

    for (const [entryId, entryDetails] of detailsByEntryId.entries()) {
      const finalWasteEntryId = entryIdToFinalId.get(entryId);
      if (!finalWasteEntryId) continue;

      entryDetails.forEach((d) => {
        detailsToInsert.push({
          wasteEntryId: finalWasteEntryId,
          wasteMasterId: d.wasteMasterId,
          packingTypeId: d.packingTypeId,
          godownId: d.godownId,
          netWeight: d.netWeight,
          department: d.department
        });
      });
    }

    await WasteEntryDetail.bulkCreate(detailsToInsert, { transaction });

    await transaction.commit();
    return {
      importedCount: headersToInsert.length
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
