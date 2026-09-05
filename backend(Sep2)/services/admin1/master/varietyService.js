import db from "../../../models/index.js";


const { Variety, Fibre } = db;

export const createVariety = async (data) => {
  const { code, variety, fibreId } = data;

  if (!code || !variety || !fibreId) {
    throw new Error("Code, Variety name, and Fibre are required");
  }

  // Check unique code
  const existingCode = await Variety.findOne({ where: { code } });
  if (existingCode) {
    throw new Error("Variety code already exists");
  }

  // Validate fibre exists
  const fibre = await Fibre.findByPk(fibreId);
  if (!fibre) {
    throw new Error("Selected Fibre not found");
  }

  return await Variety.create({
    code,
    variety: variety.trim(),
    fibreId,
  });
};

export const getAllVarieties = async () => {
  return await Variety.findAll({
    include: [
      { model: Fibre, as: "fibre", attributes: ["id", "code", "name"] },
    ],
    order: [["code", "ASC"]],
  });
};

export const getVarietyById = async (id) => {
  const variety = await Variety.findByPk(id, {
    include: [
      { model: Fibre, as: "fibre", attributes: ["id", "code", "name"] },
    ],
  });
  if (!variety) {
    throw new Error("Variety not found");
  }
  return variety;
};

export const updateVariety = async (id, data) => {
  const variety = await Variety.findByPk(id);
  if (!variety) {
    throw new Error("Variety not found");
  }

  if (data.code && data.code !== variety.code) {
    const existing = await Variety.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Variety code already in use");
    }
  }

  if (data.fibreId && data.fibreId !== variety.fibreId) {
    const fibre = await Fibre.findByPk(data.fibreId);
    if (!fibre) {
      throw new Error("Selected Fibre not found");
    }
  }

  return await variety.update({
    code: data.code !== undefined ? data.code : variety.code,
    variety: data.variety ? data.variety.trim() : variety.variety,
    fibreId: data.fibreId !== undefined ? data.fibreId : variety.fibreId,
  });
};

export const deleteVariety = async (id) => {
  const variety = await Variety.findByPk(id);
  if (!variety) {
    throw new Error("Variety not found");
  }
  await variety.destroy();
};