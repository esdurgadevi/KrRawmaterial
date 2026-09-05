import db from "../../../models/index.js";

const {
  ComberEntry,
  SpinningCount,
  SimplexMachine,
} = db;


// ✅ CREATE
export const create = async (data, userId) => {
  return await ComberEntry.create({
    ...data,
    createdBy: userId,
  });
};


// ✅ GET ALL
export const getAll = async () => {
  return await ComberEntry.findAll({
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "countName", "Noils"] },
      { model: SimplexMachine, as: "simplex", attributes: ["id", "mcNo", "mcId", "feedHank"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};


// ✅ GET BY ID
export const getById = async (id) => {
  const entry = await ComberEntry.findByPk(id, {
    include: [
      { model: SpinningCount, as: "count", attributes: ["id", "countName", "Noils"] },
      { model: SimplexMachine, as: "simplex", attributes: ["id", "mcNo", "mcId", "feedHank"] },
    ],
  });

  if (!entry) throw new Error("Entry not found");
  return entry;
};


// ✅ UPDATE
export const update = async (id, data, userId) => {
  const entry = await ComberEntry.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId,
  });
};


// ✅ DELETE
export const remove = async (id) => {
  const entry = await ComberEntry.findByPk(id);
  if (!entry) throw new Error("Entry not found");

  await entry.destroy();
};
