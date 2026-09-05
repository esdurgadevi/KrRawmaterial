import db from "../../../models/index.js";

const { FinisherDrawing, SpinningCount } = db;

export const create = async (data, userId) => {
  return await FinisherDrawing.create({
    ...data,
    createdBy: userId,
  });
};

export const getAll = async () => {
  return await FinisherDrawing.findAll({
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "countName", "Noils"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getById = async (id) => {
  const entry = await FinisherDrawing.findByPk(id, {
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "countName", "Noils"] },
    ],
  });

  if (!entry) throw new Error("Entry not found");
  return entry;
};

export const update = async (id, data, userId) => {
  const entry = await FinisherDrawing.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId,
  });
};

export const remove = async (id) => {
  const entry = await FinisherDrawing.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  await entry.destroy();
};
