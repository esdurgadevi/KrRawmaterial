import db from "../../../models/index.js";
import { Op } from "sequelize";
const { PackingType } = db;
export const createPackingType = async (data) => {
  const { code, name, tareWeight, rate } = data;

  if (!code || !name) {
    throw new Error("Code and Name are required");
  }

  const existing = await PackingType.findOne({ where: { code } });
  if (existing) {
    throw new Error("Packing type code already exists");
  }

  const existingName = await PackingType.findOne({
    where: { name: name.trim() },
  });
  if (existingName) {
    throw new Error("Packing type name already exists");
  }

  return await PackingType.create({
    code,
    name: name.trim(),
    tareWeight,
    rate,
  });
};


export const getAllPackingTypes = async () => {
  return await PackingType.findAll({
    order: [["code", "ASC"]],
  });
};

export const getPackingTypeById = async (id) => {
  const packing = await PackingType.findByPk(id);
  if (!packing) {
    throw new Error("Packing type not found");
  }
  return packing;
};

export const updatePackingType = async (id, data) => {
  const packing = await PackingType.findByPk(id);

  if (!packing) {
    throw new Error("Packing type not found");
  }

  if (data.code && data.code !== packing.code) {
    const existing = await PackingType.findOne({
      where: {
        code: data.code,
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      throw new Error("Packing type code already in use");
    }
  }

  if (data.name && data.name.trim() !== packing.name) {
    const existingName = await PackingType.findOne({
      where: {
        name: data.name.trim(),
        id: { [Op.ne]: id },
      },
    });

    if (existingName) {
      throw new Error("Packing type name already in use");
    }
  }

  return await packing.update({
    code: data.code !== undefined ? data.code : packing.code,
    name: data.name ? data.name.trim() : packing.name,
  });
};
export const deletePackingType = async (id) => {
  const packing = await PackingType.findByPk(id);
  if (!packing) {
    throw new Error("Packing type not found");
  }
  await packing.destroy();
};