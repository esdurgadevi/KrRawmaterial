import db from "../../../models/index.js";


const { Fibre, Commodity } = db;

export const createFibre = async (data) => {
  const { code, name, commodityId } = data;

  if (!code || !name || !commodityId) {
    throw new Error("Code, Name, and Commodity are required");
  }

  // Check unique code
  const existingCode = await Fibre.findOne({ where: { code } });
  if (existingCode) {
    throw new Error("Fibre code already exists");
  }

  // Validate commodity exists
  const commodity = await Commodity.findByPk(commodityId);
  if (!commodity) {
    throw new Error("Selected commodity not found");
  }

  return await Fibre.create({
    code,
    name: name.trim(),
    commodityId,
  });
};

export const getAllFibres = async () => {
  return await Fibre.findAll({
    include: [
      { model: Commodity, as: "commodity", attributes: ["id", "commodityCode", "commodityName"] },
    ],
    order: [["code", "ASC"]],
  });
};

export const getFibreById = async (id) => {
  const fibre = await Fibre.findByPk(id, {
    include: [
      { model: Commodity, as: "commodity", attributes: ["id", "commodityCode", "commodityName"] },
    ],
  });
  if (!fibre) {
    throw new Error("Fibre not found");
  }
  return fibre;
};

export const updateFibre = async (id, data) => {
  const fibre = await Fibre.findByPk(id);
  if (!fibre) {
    throw new Error("Fibre not found");
  }

  if (data.code && data.code !== fibre.code) {
    const existing = await Fibre.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Fibre code already in use");
    }
  }

  if (data.commodityId && data.commodityId !== fibre.commodityId) {
    const commodity = await Commodity.findByPk(data.commodityId);
    if (!commodity) {
      throw new Error("Selected commodity not found");
    }
  }

  return await fibre.update({
    code: data.code !== undefined ? data.code : fibre.code,
    name: data.name ? data.name.trim() : fibre.name,
    commodityId: data.commodityId !== undefined ? data.commodityId : fibre.commodityId,
  });
};

export const deleteFibre = async (id) => {
  const fibre = await Fibre.findByPk(id);
  if (!fibre) {
    throw new Error("Fibre not found");
  }
  await fibre.destroy();
};