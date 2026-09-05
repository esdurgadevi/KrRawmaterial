import db from "../../../models/index.js";


const { Commodity } = db;

export const createCommodity = async (data) => {
  if (!data.commodityCode || !data.commodityName) {
    throw new Error("Commodity code and name are required");
  }

  const existing = await Commodity.findOne({ 
    where: { commodityCode: data.commodityCode } 
  });
  if (existing) {
    throw new Error("Commodity code already exists");
  }

  return await Commodity.create({
    commodityCode: data.commodityCode,
    commodityName: data.commodityName.trim(),
  });
};

export const getAllCommodities = async () => {
  return await Commodity.findAll({
    order: [["commodityCode", "ASC"]],
  });
};

export const getCommodityById = async (id) => {
  const commodity = await Commodity.findByPk(id);
  if (!commodity) {
    throw new Error("Commodity not found");
  }
  return commodity;
};

export const updateCommodity = async (id, data) => {
  const commodity = await Commodity.findByPk(id);
  if (!commodity) {
    throw new Error("Commodity not found");
  }

  if (data.commodityCode && data.commodityCode !== commodity.commodityCode) {
    const existing = await Commodity.findOne({
      where: {
        commodityCode: data.commodityCode,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("Commodity code already in use");
    }
  }

  return await commodity.update({
    commodityCode: data.commodityCode !== undefined ? data.commodityCode : commodity.commodityCode,
    commodityName: data.commodityName ? data.commodityName.trim() : commodity.commodityName,
  });
};

export const deleteCommodity = async (id) => {
  const commodity = await Commodity.findByPk(id);
  if (!commodity) {
    throw new Error("Commodity not found");
  }
  await commodity.destroy();
};