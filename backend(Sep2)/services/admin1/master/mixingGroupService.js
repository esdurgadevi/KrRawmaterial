import db from "../../../models/index.js";


const { MixingGroup } = db;

export const createMixingGroup = async (data) => {
  if (!data.mixingCode || !data.mixingName) {
    throw new Error("Mixing code and name are required");
  }

  const existing = await MixingGroup.findOne({
    where: { mixingCode: data.mixingCode },
  });

  if (existing) {
    throw new Error("Mixing code already exists");
  }

  return await MixingGroup.create({
    mixingCode: data.mixingCode,
    mixingName: data.mixingName.trim(),
  });
};

export const getAllMixingGroups = async () => {
  return await MixingGroup.findAll({
    order: [["mixingCode", "ASC"]], // sorted by code - most logical for mixing groups
  });
};

export const getMixingGroupById = async (id) => {
  const group = await MixingGroup.findByPk(id);
  if (!group) {
    throw new Error("Mixing group not found");
  }
  return group;
};

export const updateMixingGroup = async (id, data) => {
  const group = await MixingGroup.findByPk(id);
  if (!group) {
    throw new Error("Mixing group not found");
  }

  // Check unique constraint only if code is being updated
  if (data.mixingCode && data.mixingCode !== group.mixingCode) {
    const existing = await MixingGroup.findOne({
      where: {
        mixingCode: data.mixingCode,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("Mixing code already in use");
    }
  }

  return await group.update({
    mixingCode: data.mixingCode !== undefined ? data.mixingCode : group.mixingCode,
    mixingName: data.mixingName ? data.mixingName.trim() : group.mixingName,
  });
};

export const deleteMixingGroup = async (id) => {
  const group = await MixingGroup.findByPk(id);
  if (!group) {
    throw new Error("Mixing group not found");
  }
  await group.destroy();
  return true;
};