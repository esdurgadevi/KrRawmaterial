import db from "../../../models/index.js";


const { WasteLot, WasteMaster } = db;

export const getLotByWasteName = async (wasteName) => {
  const waste = await WasteMaster.findOne({
    where: { waste: wasteName },
    include: [
      {
        model: WasteLot,
        as: "wasteLots",
        attributes: ["id", "lotNo"],
      },
    ],
  });

  return waste;
};

export const createWasteLot = async (data) => {
  const { lotNo, wasteMasterId, active } = data;

  if (!lotNo || !wasteMasterId) {
    throw new Error("Lot Number and Waste Master are required");
  }

  const existing = await WasteLot.findOne({ where: { lotNo: lotNo.trim() } });
  if (existing) {
    throw new Error("Lot number already exists");
  }

  const waste = await WasteMaster.findByPk(wasteMasterId);
  if (!waste) {
    throw new Error("Selected Waste Master not found");
  }

  return await WasteLot.create({
    lotNo: lotNo.trim(),
    wasteMasterId,
    active: active ?? true,
  });
};

export const getAllWasteLots = async () => {
  return await WasteLot.findAll({
    include: [
      {
        model: WasteMaster,
        as: "wasteMaster",
        attributes: ["id", "code", "waste"],
      },
    ],
    order: [["lotNo", "ASC"]],
  });
};

export const getWasteLotById = async (id) => {
  const lot = await WasteLot.findByPk(id, {
    include: [
      {
        model: WasteMaster,
        as: "wasteMaster",
        attributes: ["id", "code", "waste"],
      },
    ],
  });
  if (!lot) {
    throw new Error("Waste lot not found");
  }
  return lot;
};

export const updateWasteLot = async (id, data) => {
  const lot = await WasteLot.findByPk(id);
  if (!lot) {
    throw new Error("Waste lot not found");
  }

  if (data.lotNo && data.lotNo.trim() !== lot.lotNo) {
    const existing = await WasteLot.findOne({ where: { lotNo: data.lotNo.trim() } });
    if (existing) {
      throw new Error("Lot number already in use");
    }
  }

  if (data.wasteMasterId && data.wasteMasterId !== lot.wasteMasterId) {
    const waste = await WasteMaster.findByPk(data.wasteMasterId);
    if (!waste) {
      throw new Error("Selected Waste Master not found");
    }
  }

  return await lot.update({
    lotNo: data.lotNo ? data.lotNo.trim() : lot.lotNo,
    wasteMasterId: data.wasteMasterId !== undefined ? data.wasteMasterId : lot.wasteMasterId,
    active: data.active !== undefined ? data.active : lot.active,
  });
};

export const deleteWasteLot = async (id) => {
  const lot = await WasteLot.findByPk(id);
  if (!lot) {
    throw new Error("Waste lot not found");
  }
  await lot.destroy();
};