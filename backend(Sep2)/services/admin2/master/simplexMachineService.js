import db from "../../../models/index.js";

const { SimplexMachine } = db;

export const createSimplexMachine = async (data) => {
  if (!data.mcNo || !data.mcId || data.feedHank == null) {
    throw new Error("M/c No, M/c ID and FeedHank are required");
  }

  const existingById = await SimplexMachine.findOne({
    where: { mcId: data.mcId.trim() },
  });
  if (existingById) {
    throw new Error("Machine ID already exists");
  }

  // Optional: check mcNo uniqueness if your business rule requires it
  const existingByNo = await SimplexMachine.findOne({
    where: { mcNo: data.mcNo.trim() },
  });
  if (existingByNo) {
    throw new Error("Machine Number already in use");
  }

  return await SimplexMachine.create({
    mcNo: data.mcNo.trim(),
    mcId: data.mcId.trim(),
    description: data.description ? data.description.trim() : null,
    feedHank: parseFloat(data.feedHank),
  });
};

export const getAllSimplexMachines = async () => {
  return await SimplexMachine.findAll({
    where: { isActive: true },
    order: [["mcNo", "ASC"]],
  });
};

export const getSimplexMachineById = async (id) => {
  const machine = await SimplexMachine.findByPk(id);
  if (!machine) throw new Error("Simplex machine not found");
  return machine;
};

export const updateSimplexMachine = async (id, data) => {
  const machine = await SimplexMachine.findByPk(id);
  if (!machine) throw new Error("Simplex machine not found");

  if (data.mcId && data.mcId.trim() !== machine.mcId) {
    const existing = await SimplexMachine.findOne({
      where: { mcId: data.mcId.trim(), id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) throw new Error("Machine ID already in use");
  }

  if (data.mcNo && data.mcNo.trim() !== machine.mcNo) {
    const existingNo = await SimplexMachine.findOne({
      where: { mcNo: data.mcNo.trim(), id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existingNo) throw new Error("Machine Number already in use");
  }

  return await machine.update({
    mcNo: data.mcNo ? data.mcNo.trim() : machine.mcNo,
    mcId: data.mcId ? data.mcId.trim() : machine.mcId,
    description: data.description !== undefined ? (data.description ? data.description.trim() : null) : machine.description,
    feedHank: data.feedHank !== undefined ? parseFloat(data.feedHank) : machine.feedHank,
  });
};

export const deleteSimplexMachine = async (id) => {
  const machine = await SimplexMachine.findByPk(id);
  if (!machine) throw new Error("Simplex machine not found");
  await machine.update({ isActive: false }); // soft delete
  return true;
};