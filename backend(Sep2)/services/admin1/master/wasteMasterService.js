import db from "../../../models/index.js";


const { WasteMaster, PackingType } = db;

export const createWasteMaster = async (data) => {
  const { code, department, waste, packingTypeId, wasteKg } = data;

  if (!code || !department || !waste || !packingTypeId || wasteKg === undefined) {
    throw new Error("Code, Department, Waste, Packing Type, and Waste Kg are required");
  }

  // Check unique code
  const existingCode = await WasteMaster.findOne({ where: { code } });
  if (existingCode) {
    throw new Error("Waste code already exists");
  }

  // Validate packing type exists
  const packing = await PackingType.findByPk(packingTypeId);
  if (!packing) {
    throw new Error("Selected Packing Type not found");
  }

  return await WasteMaster.create({
    code,
    department: department.trim(),
    waste: waste.trim(),
    packingTypeId,
    wasteKg: parseFloat(wasteKg),
    hsnCode: data.hsnCode ? data.hsnCode.trim() : null,
    packingPreWeightment: data.packingPreWeightment ?? false,
  });
};

export const getAllWasteMasters = async () => {
  return await WasteMaster.findAll({
    include: [
      { model: PackingType, as: "packingType", attributes: ["id", "code", "name"] },
    ],
    order: [["code", "ASC"]],
  });
};

export const getWasteMasterById = async (id) => {
  const waste = await WasteMaster.findByPk(id, {
    include: [
      { model: PackingType, as: "packingType", attributes: ["id", "code", "name"] },
    ],
  });
  if (!waste) {
    throw new Error("Waste master not found");
  }
  return waste;
};

export const updateWasteMaster = async (id, data) => {
  const waste = await WasteMaster.findByPk(id);
  if (!waste) {
    throw new Error("Waste master not found");
  }

  if (data.code && data.code !== waste.code) {
    const existing = await WasteMaster.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Waste code already in use");
    }
  }

  if (data.packingTypeId && data.packingTypeId !== waste.packingTypeId) {
    const packing = await PackingType.findByPk(data.packingTypeId);
    if (!packing) {
      throw new Error("Selected Packing Type not found");
    }
  }

  return await waste.update({
    code: data.code !== undefined ? data.code : waste.code,
    department: data.department ? data.department.trim() : waste.department,
    waste: data.waste ? data.waste.trim() : waste.waste,
    packingTypeId: data.packingTypeId !== undefined ? data.packingTypeId : waste.packingTypeId,
    wasteKg: data.wasteKg !== undefined ? parseFloat(data.wasteKg) : waste.wasteKg,
    hsnCode: data.hsnCode !== undefined ? (data.hsnCode ? data.hsnCode.trim() : null) : waste.hsnCode,
    packingPreWeightment:
      data.packingPreWeightment !== undefined
        ? data.packingPreWeightment
        : waste.packingPreWeightment,
  });
};

export const deleteWasteMaster = async (id) => {
  const waste = await WasteMaster.findByPk(id);
  if (!waste) {
    throw new Error("Waste master not found");
  }
  await waste.destroy();
};

export const bulkImportWasteMasters = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No data provided for bulk import");
  }

  // Fetch existing PackingTypes and build lookup maps
  const existingPackingTypes = await PackingType.findAll();
  const packingTypeByName = new Map();
  const packingTypeById = new Map();

  existingPackingTypes.forEach((pt) => {
    packingTypeByName.set(pt.name.trim().toUpperCase(), pt.id);
    packingTypeById.set(pt.id, pt.id);
  });

  const resolvePackingTypeId = async (val) => {
    if (!val) return packingTypeByName.get("BALE") || 1;
    const str = String(val).trim().toUpperCase();

    const numId = parseInt(str, 10);
    if (!isNaN(numId) && packingTypeById.has(numId)) {
      return numId;
    }

    if (packingTypeByName.has(str)) {
      return packingTypeByName.get(str);
    }

    if (str === "BAGS" && packingTypeByName.has("BAGS")) {
      return packingTypeByName.get("BAGS");
    }

    const allIds = Array.from(packingTypeById.keys());
    const nextCode = (allIds.length > 0 ? Math.max(...allIds) : 0) + 1;

    const created = await PackingType.create({
      code: nextCode,
      name: str,
      tareWeight: "0.00",
      rate: "0.00",
    });

    packingTypeByName.set(str, created.id);
    packingTypeById.set(created.id, created.id);
    return created.id;
  };

  const existingMasters = await WasteMaster.findAll({ raw: true });
  let maxCode = existingMasters.reduce((max, r) => Math.max(max, Number(r.code) || 0), 0);
  let nextCode = Math.max(maxCode + 1, 12);

  const existingKeys = new Set(
    existingMasters.map((m) => `${m.department.trim().toUpperCase()}__${m.waste.trim().toUpperCase()}`)
  );

  const recordsToInsert = [];
  let skippedCount = 0;

  for (const item of items) {
    const department = String(item.department || "").trim();
    const waste = String(item.waste || item.wasteName || "").trim();
    const rawPacking = item.packingTypeId || item.packingType;
    const wasteKg = parseFloat(item.wasteKg || item.wasteWeight || 0);
    const hsnCode = item.hsnCode ? String(item.hsnCode).trim() : "52021000";

    if (!department || !waste) continue;

    const key = `${department.toUpperCase()}__${waste.toUpperCase()}`;
    if (existingKeys.has(key)) {
      skippedCount++;
      continue;
    }

    const packingTypeId = await resolvePackingTypeId(rawPacking);

    recordsToInsert.push({
      code: nextCode,
      department,
      waste,
      packingTypeId,
      wasteKg,
      hsnCode,
      packingPreWeightment: Boolean(item.packingPreWeightment),
    });

    existingKeys.add(key);
    nextCode++;
  }

  if (recordsToInsert.length > 0) {
    await WasteMaster.bulkCreate(recordsToInsert);
  }

  return {
    importedCount: recordsToInsert.length,
    skippedCount,
  };
};