import db from "../../../models/index.js";

import { Op } from "sequelize";

const { CostMaster } = db;

export const createCostMaster = async (data) => {
  const { department, cost } = data;

  if (!department || cost === undefined) {
    throw new Error("Department and Cost are required");
  }

  // Check if department already exists (unique constraint)
  const existing = await CostMaster.findOne({ where: { department: department.trim() } });
  if (existing) {
    throw new Error("Cost for this department already exists");
  }

  return await CostMaster.create({
    department: department.trim(),
    cost: parseFloat(cost),
  });
};

export const getAllCostMasters = async () => {
  return await CostMaster.findAll({
    order: [["department", "ASC"]],
  });
};

export const getCostMasterById = async (id) => {
  const cost = await CostMaster.findByPk(id);
  if (!cost) {
    throw new Error("Cost master not found");
  }
  return cost;
};

export const updateCostMaster = async (id, data) => {
  const cost = await CostMaster.findByPk(id);

  if (!cost) {
    throw new Error("Cost master not found");
  }

  if (data.department && data.department.trim() !== cost.department) {
    const existing = await CostMaster.findOne({
      where: {
        department: data.department.trim(),
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      throw new Error("Cost for this department already exists");
    }
  }

  return await cost.update({
    department: data.department ? data.department.trim() : cost.department,
    cost: data.cost !== undefined ? parseFloat(data.cost) : cost.cost,
  });
};

export const deleteCostMaster = async (id) => {
  const cost = await CostMaster.findByPk(id);
  if (!cost) {
    throw new Error("Cost master not found");
  }
  await cost.destroy();
};