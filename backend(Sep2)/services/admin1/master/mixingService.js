import db from "../../../models/index.js";


const { Mixing, Fibre, MixingGroup } = db;

export const createMixing = async (data) => {
  const { mixingCode, mixingName, fibreId, mixingGroupId } = data;

  if (!mixingCode || !mixingName || !fibreId || !mixingGroupId) {
    throw new Error("Mixing Code, Name, Fibre, and Mixing Group are required");
  }

  // Check unique code
  const existingCode = await Mixing.findOne({ where: { mixingCode } });
  if (existingCode) {
    throw new Error("Mixing code already exists");
  }

  // Validate foreign keys
  const fibre = await Fibre.findByPk(fibreId);
  if (!fibre) throw new Error("Selected Fibre not found");

  const group = await MixingGroup.findByPk(mixingGroupId);
  if (!group) throw new Error("Selected Mixing Group not found");

  return await Mixing.create({
    mixingCode,
    mixingName: mixingName.trim(),
    fibreId,
    mixingGroupId,
  });
};

export const getAllMixings = async () => {
  return await Mixing.findAll({
    include: [
      { model: Fibre, as: "fibre", attributes: ["id", "code", "name"] },
      { model: MixingGroup, as: "mixingGroup", attributes: ["id", "mixingCode", "mixingName"] },
    ],
    order: [["mixingCode", "ASC"]],
  });
};

export const getMixingById = async (id) => {
  const mixing = await Mixing.findByPk(id, {
    include: [
      { model: Fibre, as: "fibre", attributes: ["id", "code", "name"] },
      { model: MixingGroup, as: "mixingGroup", attributes: ["id", "mixingCode", "mixingName"] },
    ],
  });
  if (!mixing) {
    throw new Error("Mixing not found");
  }
  return mixing;
};

export const updateMixing = async (id, data) => {
  const mixing = await Mixing.findByPk(id);
  if (!mixing) {
    throw new Error("Mixing not found");
  }

  if (data.mixingCode && data.mixingCode !== mixing.mixingCode) {
    const existing = await Mixing.findOne({
      where: { mixingCode: data.mixingCode, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Mixing code already in use");
    }
  }

  if (data.fibreId && data.fibreId !== mixing.fibreId) {
    const fibre = await Fibre.findByPk(data.fibreId);
    if (!fibre) throw new Error("Selected Fibre not found");
  }

  if (data.mixingGroupId && data.mixingGroupId !== mixing.mixingGroupId) {
    const group = await MixingGroup.findByPk(data.mixingGroupId);
    if (!group) throw new Error("Selected Mixing Group not found");
  }

  return await mixing.update({
    mixingCode: data.mixingCode !== undefined ? data.mixingCode : mixing.mixingCode,
    mixingName: data.mixingName ? data.mixingName.trim() : mixing.mixingName,
    fibreId: data.fibreId !== undefined ? data.fibreId : mixing.fibreId,
    mixingGroupId: data.mixingGroupId !== undefined ? data.mixingGroupId : mixing.mixingGroupId,
  });
};

export const deleteMixing = async (id) => {
  const mixing = await Mixing.findByPk(id);
  if (!mixing) {
    throw new Error("Mixing not found");
  }
  await mixing.destroy();
};