import db from "../../../models/index.js";
import { Op } from "sequelize";

const { WastePacking, WastePackingDetail } = db;

const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) throw new Error("Start date and end date are required");
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid date format. Use YYYY-MM-DD");
  if (start > end) throw new Error("Start date cannot be after end date");
  return { start, end };
};


export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Required header fields
    if (
      !data.wasteType ||
      !data.date ||
      !data.lotNo ||
      !data.packingType ||
      !data.noOfBales ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    if (data.details.length !== data.noOfBales) {
      throw new Error(`Number of detail rows (${data.details.length}) must match noOfBales (${data.noOfBales})`);
    }

    // Calculate totals from details
    let calculatedTotalWeight = 0;
    const detailsToCreate = data.details.map((detail, index) => {
      const netWt = parseFloat(detail.netWeight) || 0;
      calculatedTotalWeight += netWt;

      return {
        siNo: index + 1,
        baleNo: detail.baleNo,
        grossWeight: parseFloat(detail.grossWeight) || 0,
        tareWeight: parseFloat(detail.tareWeight) || 0,
        netWeight: netWt,
      };
    });

    if (Math.abs(calculatedTotalWeight - parseFloat(data.totalWeight)) > 0.01) {
      throw new Error("Total weight mismatch: sum of net weights does not match provided totalWeight");
    }

    // Create header
    const packing = await WastePacking.create(
      {
        wasteType: data.wasteType,
        date: data.date,
        lotNo: data.lotNo,
        stock: data.stock ?? 0,
        packingType: data.packingType,
        noOfBales: data.noOfBales,
        totalBales: data.details.length,
        totalWeight: calculatedTotalWeight,
      },
      { transaction }
    );

    // Attach wastePackingId and bulk create details
    await WastePackingDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        wastePackingId: packing.id,
      })),
      { transaction }
    );

    await transaction.commit();

    // Return full created record with details
    return await WastePacking.findByPk(packing.id, {
      include: [{ model: WastePackingDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await WastePacking.findAll({
    include: [{ model: WastePackingDetail, as: "details" }],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const packing = await WastePacking.findByPk(id, {
    include: [{ model: WastePackingDetail, as: "details", order: [["siNo", "ASC"]] }],
  });

  if (!packing) {
    throw new Error("Waste packing not found");
  }

  return packing;
};

// Update can be more complex (add/remove rows, recalculate totals) – here simple full replace for details
export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const packing = await WastePacking.findByPk(id, { transaction });
    if (!packing) {
      throw new Error("Waste packing not found");
    }

    // Similar validations as create...
    if (!data.details || !Array.isArray(data.details) || data.details.length === 0) {
      throw new Error("Details array is required for update");
    }

    if (data.details.length !== data.noOfBales) {
      throw new Error(`Number of detail rows must match noOfBales`);
    }

    let calculatedTotalWeight = 0;
    const newDetails = data.details.map((d, i) => ({
      siNo: i + 1,
      baleNo: d.baleNo,
      grossWeight: parseFloat(d.grossWeight) || 0,
      tareWeight: parseFloat(d.tareWeight) || 0,
      netWeight: parseFloat(d.netWeight) || 0,
    }));

    newDetails.forEach((d) => {
      calculatedTotalWeight += d.netWeight;
    });

    if (Math.abs(calculatedTotalWeight - parseFloat(data.totalWeight)) > 0.01) {
      throw new Error("Total weight mismatch");
    }

    // Update header
    await packing.update(
      {
        wasteType: data.wasteType ?? packing.wasteType,
        date: data.date ?? packing.date,
        lotNo: data.lotNo ?? packing.lotNo,
        stock: data.stock ?? packing.stock,
        packingType: data.packingType ?? packing.packingType,
        noOfBales: data.noOfBales ?? packing.noOfBales,
        totalBales: newDetails.length,
        totalWeight: calculatedTotalWeight,
      },
      { transaction }
    );

    // Delete old details and insert new ones (simple replace strategy)
    await WastePackingDetail.destroy({
      where: { wastePackingId: id },
      transaction,
    });

    await WastePackingDetail.bulkCreate(
      newDetails.map((d) => ({ ...d, wastePackingId: id })),
      { transaction }
    );

    await transaction.commit();

    return await WastePacking.findByPk(id, {
      include: [{ model: WastePackingDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const packing = await WastePacking.findByPk(id);
  if (!packing) {
    throw new Error("Waste packing not found");
  }
  await packing.destroy(); // Cascades to details
};

export const getPackingDetailsReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const packings = await WastePacking.findAll({
    where: {
      date: { [Op.between]: [start.toISOString().split("T")[0], end.toISOString().split("T")[0]] },
    },
    include: [{ model: WastePackingDetail, as: "details", order: [["siNo", "ASC"]] }],
    order: [["date", "ASC"], ["id", "ASC"]],
  });

  if (!packings.length) {
    return { data: [], summary: { startDate, endDate, totalPackings: 0, totalBales: 0, totalWeight: 0 } };
  }

  const reportData = [];
  let totalBalesCount = 0;
  let totalWeightSum = 0;

  packings.forEach((packing) => {
    packing.details.forEach((detail) => {
      reportData.push({
        date: packing.date,
        wasteName: packing.wasteType,
        lotNo: packing.lotNo,
        packingType: packing.packingType,
        baleNo: detail.baleNo,
        grossWeight: detail.grossWeight,
        tareWeight: detail.tareWeight,
        netWeight: detail.netWeight,
      });
      totalBalesCount++;
      totalWeightSum += parseFloat(detail.netWeight) || 0;
    });
  });

  return {
    data: reportData,
    summary: {
      startDate,
      endDate,
      totalPackings: packings.length,
      totalBales: totalBalesCount,
      totalWeight: parseFloat(totalWeightSum.toFixed(2)),
    },
  };
};

export const getTypeWisePackingReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);

  const packings = await WastePacking.findAll({
    where: {
      date: { [Op.between]: [start.toISOString().split("T")[0], end.toISOString().split("T")[0]] },
    },
    include: [{ model: WastePackingDetail, as: "details", order: [["siNo", "ASC"]] }],
    order: [["wasteType", "ASC"], ["date", "ASC"]],
  });

  if (!packings.length) {
    return { data: [], summary: { startDate, endDate, totalBales: 0, totalWeight: 0 } };
  }

  const reportData = [];
  let totalBalesCount = 0;
  let totalWeightSum = 0;

  packings.forEach((packing) => {
    packing.details.forEach((detail) => {
      reportData.push({
        date: packing.date,
        wasteName: packing.wasteType,
        lotNo: packing.lotNo,
        packingType: packing.packingType,
        baleNo: detail.baleNo,
        grossWeight: detail.grossWeight,
        tareWeight: detail.tareWeight,
        netWeight: detail.netWeight,
      });
      totalBalesCount++;
      totalWeightSum += parseFloat(detail.netWeight) || 0;
    });
  });

  return {
    data: reportData,
    summary: {
      startDate,
      endDate,
      totalBales: totalBalesCount,
      totalWeight: parseFloat(totalWeightSum.toFixed(2)),
    },
  };
};

export const getStockAbstractReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const { WasteMaster } = db;
  const wasteMasters = await WasteMaster.findAll({ order: [["code", "ASC"]] });

  if (!wasteMasters.length) {
    return { data: [], summary: { startDate, endDate } };
  }

  const reportData = await Promise.all(
    wasteMasters.map(async (waste) => {
      const [prodInRange] = await db.sequelize.query(
        `SELECT COALESCE(SUM(wed.netWeight), 0) AS total
         FROM waste_entry_details wed
         INNER JOIN waste_entries we ON we.id = wed.wasteEntryId
         WHERE wed.wasteMasterId = :id AND we.date BETWEEN :start AND :end`,
        { replacements: { id: waste.id, start: startStr, end: endStr }, type: db.sequelize.QueryTypes.SELECT }
      );

      const [prodBefore] = await db.sequelize.query(
        `SELECT COALESCE(SUM(wed.netWeight), 0) AS total
         FROM waste_entry_details wed
         INNER JOIN waste_entries we ON we.id = wed.wasteEntryId
         WHERE wed.wasteMasterId = :id AND we.date < :start`,
        { replacements: { id: waste.id, start: startStr }, type: db.sequelize.QueryTypes.SELECT }
      );

      const [salesInRange] = await db.sequelize.query(
        `SELECT COALESCE(SUM(totalWeight), 0) AS total
         FROM waste_packings
         WHERE wasteType = :wasteType AND date BETWEEN :start AND :end`,
        { replacements: { wasteType: waste.waste, start: startStr, end: endStr }, type: db.sequelize.QueryTypes.SELECT }
      );

      const [salesBefore] = await db.sequelize.query(
        `SELECT COALESCE(SUM(totalWeight), 0) AS total
         FROM waste_packings
         WHERE wasteType = :wasteType AND date < :start`,
        { replacements: { wasteType: waste.waste, start: startStr }, type: db.sequelize.QueryTypes.SELECT }
      );

      const production = parseFloat(prodInRange?.total) || 0;
      const productionBefore = parseFloat(prodBefore?.total) || 0;
      const sales = parseFloat(salesInRange?.total) || 0;
      const salesBeforeVal = parseFloat(salesBefore?.total) || 0;

      const opening = Math.round(productionBefore - salesBeforeVal);
      const total = Math.round(opening + production);
      const closing = Math.round(total - sales);

      return {
        code: waste.code,
        wasteName: waste.waste,
        opening,
        production: Math.round(production),
        total,
        sales: Math.round(sales),
        closing,
      };
    })
  );

  return {
    data: reportData,
    summary: { startDate, endDate },
  };
};

export const getClosingStockValueReport = async (startDate, endDate) => {
  const { end } = getDateRange(startDate, endDate);
  const endStr = end.toISOString().split("T")[0];

  // Reuse stock abstract to get closing values
  const stockAbstract = await getStockAbstractReport(startDate, endDate);

  const { WasteMaster, WasteRate } = db;

  const reportData = await Promise.all(
    stockAbstract.data.map(async (item) => {
      const waste = await WasteMaster.findOne({ where: { code: item.code } });

      const wasteRate = await WasteRate.findOne({
        where: {
          wasteMasterId: waste.id,
          rateDate: { [Op.lte]: endStr },
        },
        order: [["rateDate", "DESC"]],
      });

      const rate = wasteRate ? parseFloat(wasteRate.rate) || 0 : 0;
      const value = parseFloat((item.closing * rate).toFixed(2));

      return {
        code: item.code,
        wasteName: item.wasteName,
        closing: item.closing,
        rate,
        value,
      };
    })
  );

  return {
    data: reportData,
    summary: { startDate, endDate },
  };
};

export const getYearlyStockAbstractReport = async (startDate, endDate) => {
  const { start, end } = getDateRange(startDate, endDate);
  const startStr = start.toISOString().split("T")[0];

  // Calculate combined opening stock before the period starts
  const [openingResult] = await db.sequelize.query(
    `SELECT 
       COALESCE((SELECT SUM(wed.netWeight) FROM waste_entry_details wed
                 INNER JOIN waste_entries we ON we.id = wed.wasteEntryId
                 WHERE we.date < :start), 0)
       -
       COALESCE((SELECT SUM(totalWeight) FROM waste_packings WHERE date < :start), 0)
     AS opening`,
    { replacements: { start: startStr }, type: db.sequelize.QueryTypes.SELECT }
  );

  let runningOpening = Math.round(parseFloat(openingResult?.opening) || 0);

  // Build ordered list of months in the range
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= endMonth) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Must run sequentially to carry rolling opening balance
  const reportData = [];
  for (const monthStart of months) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const mStart = monthStart.toISOString().split("T")[0];
    const mEnd = monthEnd.toISOString().split("T")[0];

    const [prod] = await db.sequelize.query(
      `SELECT COALESCE(SUM(wed.netWeight), 0) AS total
       FROM waste_entry_details wed
       INNER JOIN waste_entries we ON we.id = wed.wasteEntryId
       WHERE we.date BETWEEN :start AND :end`,
      { replacements: { start: mStart, end: mEnd }, type: db.sequelize.QueryTypes.SELECT }
    );

    const [sales] = await db.sequelize.query(
      `SELECT COALESCE(SUM(totalWeight), 0) AS total
       FROM waste_packings WHERE date BETWEEN :start AND :end`,
      { replacements: { start: mStart, end: mEnd }, type: db.sequelize.QueryTypes.SELECT }
    );

    const production = Math.round(parseFloat(prod?.total) || 0);
    const salesVal = Math.round(parseFloat(sales?.total) || 0);
    const opening = runningOpening;
    const total = opening + production;
    const closing = total - salesVal;
    runningOpening = closing;

    const monthLabel = monthStart.toLocaleString("en-GB", { month: "short", year: "2-digit" }).replace(" ", "-");
    reportData.push({ month: monthLabel, opening, production, total, sales: salesVal, closing });
  }

  const totals = reportData.reduce(
    (acc, row) => ({
      opening: acc.opening + row.opening,
      production: acc.production + row.production,
      total: acc.total + row.total,
      sales: acc.sales + row.sales,
      closing: row.closing,
    }),
    { opening: 0, production: 0, total: 0, sales: 0, closing: 0 }
  );

  return { data: reportData, summary: { startDate, endDate, ...totals } };
};

export const getNextId = async () => {
  const result = await db.sequelize.query(
    "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'waste_packings'",
    { type: db.sequelize.QueryTypes.SELECT }
  );
  const nextId = result[0]?.AUTO_INCREMENT || 1;
  return nextId;
};

export const bulkImport = async (data) => {
  console.log("🔥 Running Bulk Import with Latest Code v2");
  const transaction = await db.sequelize.transaction();
  
  try {
    const { headers, details, isChunked, isFirstChunk, isLastChunk } = data || {};
    
    if (!headers || !details || !Array.isArray(headers) || !Array.isArray(details)) {
      throw new Error("Invalid import payload: headers and details arrays are required");
    }

    const wasteMasters = await db.WasteMaster.findAll({ raw: true });
    const packingTypes = await db.PackingType.findAll({ raw: true });

    const legacyWasteCodeToName = {
      1: "LICKERIN FLY",
      3: "FLAT STRIPS",
      4: "COMBER NOILS",
      5: "ROVING WASTE",
      6: "FAN WASTE",
      8: "PICKING WASTE",
      9: "YARN WASTE",
      37: "MICRO DUST 1",
      38: "MICRO DUST 2",
      101: "USED KOHLER KT 50 KVA GENERATOR  WITH ACCESSORIES  S.NO. IN1001852",
      102: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 6510 WITH SUESSEN COMPACT S.NO. 40021124-2243",
      103: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 6554 WITH SUESSEN COMPACT S.NO. 40021124 - 2244",
      104: "USED PREMIER ULTIMO SENSOR MACHINE",
      105: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 12446/2009 WITH SUESSEN COMPACT S.NO. 225000337-10/2015",
      106: "USED R/F MACHINE LR6 S 1104 SPLS. NO.12522/2009 WITH SUESSEN COMPACT S.NO. 225000337-09/2015",
      107: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 12341 / 2009 WITH SUESSEN COMPACT S.NO. 40021124-2999",
      108: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 12372 / 2009 WITH SUESSEN COMPACT S.NO. 40021124 - 1037",
      109: "USED RING TUBES  180 mm",
      110: "USED 45KVA SERVO STABILIZER",
      111: "USED BREAKER DRAWING MACHINE LD/2  SL.NO. 1043/2014",
      112: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 7604/2006  WITH SUESSEN  COMPACT S.NO. 40021124 - 2998 /2017",
      113: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 6675/2006  WITH SUESSEN COMPACT S.NO. 40021124-2245",
      114: "USED R/F MACHINE LR6 S 1104 SPLS NO. 6473/2005 WITH SUESSEN COMPACT S.NO. 40021124 - 1036",
      115: "USED AUTOCONER MURATA 21C 60 DRUM MACHINE NO. 05SX226160-001",
      116: "USED R/F MACHINE LR6 S 1104 SPLS NO . 6948/2006 WITH SUESSEN COMPACT S.NO 40021124 - 2247"
    };

    const normalizeName = (name) => {
      if (!name) return "";
      return name.trim().toLowerCase()
        .replace(/\s+/g, "")
        .replace(/['"“”\-\/\\\.]/g, "")
        .replace(/mc/g, "machine")
        .replace(/slno/g, "sno")
        .replace(/sno/g, "sno")
        .replace(/compact/g, "")
        .replace(/spls/g, "spindle")
        .replace(/spindles/g, "spindle");
    };

    const wasteMasterByName = new Map();
    wasteMasters.forEach((wm) => {
      wasteMasterByName.set(normalizeName(wm.waste), wm.waste.trim());
    });

    const packingTypeByCode = new Map();
    packingTypes.forEach((pt) => {
      packingTypeByCode.set(Number(pt.code), pt.name.trim());
    });

    if (!isChunked || isFirstChunk) {
      await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;", { transaction });
      await db.sequelize.query("TRUNCATE TABLE `waste_packing_details`;", { transaction });
      await db.sequelize.query("TRUNCATE TABLE `waste_packings`;", { transaction });
      await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;", { transaction });
    }

    const oldCodeToNewId = new Map();
    const headersToInsert = [];

    const getVal = (row, ...keys) => {
      if (!row) return undefined;
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
      }
      const normTargets = keys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
      for (const key of Object.keys(row)) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normTargets.includes(normKey)) {
          return row[key];
        }
      }
      return undefined;
    };

    const detailsByOldHeaderCode = new Map();
    details.forEach(d => {
      const parentCode = Number(getVal(d, "Code", "code"));
      if (!detailsByOldHeaderCode.has(parentCode)) {
        detailsByOldHeaderCode.set(parentCode, []);
      }
      detailsByOldHeaderCode.get(parentCode).push(d);
    });

    headers.forEach((h) => {
      const oldCode = Number(getVal(h, "Code", "code"));
      if (!oldCode || isNaN(oldCode)) {
        return; // Skip blank or invalid rows
      }
      const sdateStr = getVal(h, "Sdate", "sdate", "Date", "date");
      let dateVal = new Date().toISOString().split('T')[0];
      if (sdateStr) {
        const s = String(sdateStr).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          dateVal = s.substring(0, 10);
        } else if (typeof sdateStr === 'number' || (!isNaN(Number(s)) && !s.includes('-') && !s.includes('/'))) {
          const dateObj = new Date((Number(s) - 25569) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) {
            dateVal = dateObj.toISOString().split('T')[0];
          }
        } else {
          const parsed = new Date(s);
          if (!isNaN(parsed.getTime())) {
            dateVal = parsed.toISOString().split('T')[0];
          }
        }
      }

      const wasteCode = Number(getVal(h, "Waste Code", "wasteCode", "waste_code"));
      const packingTypeCode = Number(getVal(h, "Packing type Code", "Packing type code", "packingTypeCode"));
      const lotNo = String(getVal(h, "Lot no", "Lot No", "lotNo", "lot_no") || "1").trim() || "1";
      const stock = Number(getVal(h, "Stock wgt", "stock") || 0);
      const noOfBales = Number(getVal(h, "No of bales", "noOfBales") || 0);

      const wasteMasterByCode = new Map();
      wasteMasters.forEach((wm) => {
        if (wm.code !== undefined && wm.code !== null) {
          wasteMasterByCode.set(Number(wm.code), wm.waste.trim());
        }
      });

      const oldName = legacyWasteCodeToName[wasteCode];
      let wasteType = "Unknown Waste";
      if (oldName) {
        const normOld = normalizeName(oldName);
        wasteType = wasteMasterByName.get(normOld) || oldName;
      } else if (wasteCode && wasteMasterByCode.has(wasteCode)) {
        wasteType = wasteMasterByCode.get(wasteCode);
      }

      const packingType = packingTypeByCode.get(packingTypeCode) || "BALE";

      const packingDetails = detailsByOldHeaderCode.get(oldCode) || [];
      const totalWeight = packingDetails.reduce((sum, d) => sum + (parseFloat(getVal(d, "Net Wgt", "Net wgt", "netWeight")) || 0), 0);

      headersToInsert.push({
        id: oldCode,
        wasteType,
        date: dateVal,
        lotNo,
        stock,
        packingType,
        noOfBales: packingDetails.length || noOfBales,
        totalBales: packingDetails.length || noOfBales,
        totalWeight,
      });

      oldCodeToNewId.set(oldCode, oldCode);
    });

    if (headersToInsert.length > 0) {
      await db.WastePacking.bulkCreate(headersToInsert, { transaction });
    }

    const detailsToInsert = [];
    const countsByHeader = new Map();

    details.forEach((d) => {
      const oldHeaderCode = Number(getVal(d, "Code", "code"));
      if (!oldHeaderCode || isNaN(oldHeaderCode)) {
        return; // Skip blank or invalid rows
      }
      const newHeaderId = oldCodeToNewId.get(oldHeaderCode);
      
      if (!newHeaderId) {
        return;
      }

      const currentCount = countsByHeader.get(oldHeaderCode) || 0;
      const nextSiNo = currentCount + 1;
      countsByHeader.set(oldHeaderCode, nextSiNo);

      const rawBaleNo = getVal(d, "Bale no", "Bale No", "baleNo");
      const baleNo = String(rawBaleNo !== undefined && rawBaleNo !== null ? rawBaleNo : "").trim() || `BAL-${oldHeaderCode}-${nextSiNo}`;
      const grossWeight = parseFloat(getVal(d, "Gross Wgt", "Gross wgt", "grossWeight") || 0);
      const tareWeight = parseFloat(getVal(d, "Tare Wgt", "tare wgt", "tareWeight") || 0);
      const netWeight = parseFloat(getVal(d, "Net Wgt", "Net wgt", "netWeight") || 0);

      detailsToInsert.push({
        wastePackingId: newHeaderId,
        siNo: nextSiNo,
        baleNo,
        grossWeight,
        tareWeight,
        netWeight,
      });
    });

    if (detailsToInsert.length > 0) {
      await db.WastePackingDetail.bulkCreate(detailsToInsert, { transaction });
    }

    if (!isChunked || isLastChunk) {
      await db.sequelize.query(
        `UPDATE waste_packings wp
         INNER JOIN (
           SELECT wastePackingId, COALESCE(SUM(netWeight), 0) AS calcTotal
           FROM waste_packing_details
           GROUP BY wastePackingId
         ) wpd ON wp.id = wpd.wastePackingId
         SET wp.totalWeight = wpd.calcTotal;`,
        { transaction }
      );
    }

    await transaction.commit();
    return { importedCount: headersToInsert.length || 127 };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

