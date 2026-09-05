import db from "../../../models/index.js";

const { SpinningCount } = db;

export const createSpinningCount = async (data) => {
  if (!data.countName || data.ActCount == null || data.Noils == null) {
    throw new Error("countName, ActCount and Noils% are required");
  }

  const existing = await SpinningCount.findOne({
    where: { countName: data.countName.trim() },
  });
  if (existing) {
    throw new Error("Spinning count name already exists");
  }

  return await SpinningCount.create({
    countName: data.countName.trim(),
    ActCount: parseFloat(data.ActCount),
    Noils: parseFloat(data.Noils),
  });
};

export const getAllSpinningCounts = async () => {
  return await SpinningCount.findAll({
    where: { isActive: true },
    order: [["countName", "ASC"]],
  });
};

export const getSpinningCountById = async (id) => {
  const item = await SpinningCount.findByPk(id);
  if (!item) throw new Error("Spinning count not found");
  return item;
};

export const updateSpinningCount = async (id, data) => {
  const item = await SpinningCount.findByPk(id);
  if (!item) throw new Error("Spinning count not found");

  if (data.countName && data.countName.trim() !== item.countName) {
    const existing = await SpinningCount.findOne({
      where: {
        countName: data.countName.trim(),
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) throw new Error("Spinning count name already in use");
  }

  return await item.update({
    countName: data.countName ? data.countName.trim() : item.countName,
    ActCount: data.ActCount !== undefined ? parseFloat(data.ActCount) : item.ActCount,
    Noils: data.Noils !== undefined ? parseFloat(data.Noils) : item.Noils,
  });
};

export const deleteSpinningCount = async (id) => {
  const item = await SpinningCount.findByPk(id);
  if (!item) throw new Error("Spinning count not found");

  // Soft delete (recommended for master data)
  await item.update({ isActive: false });
  // If you prefer hard delete: await item.destroy();

  return true;
};