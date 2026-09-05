import db from "../../../models/index.js";

const { QcBlowRoom } = db;

export const create = async (data, userId) => {
  return await QcBlowRoom.create({
    ...data,
    createdBy: userId,
  });
};

export const getAll = async () => {
  return await QcBlowRoom.findAll({
    order: [["createdAt", "DESC"]],
  });
};

export const getById = async (id) => {
  const entry = await QcBlowRoom.findByPk(id);
  if (!entry) throw new Error("Entry not found");
  return entry;
};

export const update = async (id, data, userId) => {
  const entry = await QcBlowRoom.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId,
  });
};

export const remove = async (id) => {
  const entry = await QcBlowRoom.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  await entry.destroy();
};
