import db from "../../../models/index.js";


const { Godown } = db;

export const createGodown = async (data) => {
  if (
    !data.code ||
    !data.godownName ||
    !data.locationName ||
    !data.type ||
    !data.address
  ) {
    throw new Error(
      "Code, Godown Name, Location Name, Type, and Address are required"
    );
  }

  const existing = await Godown.findOne({ where: { code: data.code } });
  if (existing) {
    throw new Error("Godown code already exists");
  }

  return await Godown.create({
    code: data.code,
    godownName: data.godownName.trim(),
    locationName: data.locationName.trim(),
    type: data.type,
    address: data.address.trim(),
    shortAddress: data.shortAddress ? data.shortAddress.trim() : null,
  });
};

export const getAllGodowns = async () => {
  return await Godown.findAll({
    order: [["code", "ASC"]],
  });
};

export const getGodownById = async (id) => {
  const godown = await Godown.findByPk(id);
  if (!godown) {
    throw new Error("Godown not found");
  }
  return godown;
};

export const updateGodown = async (id, data) => {
  const godown = await Godown.findByPk(id);
  if (!godown) {
    throw new Error("Godown not found");
  }

  if (data.code && data.code !== godown.code) {
    const existing = await Godown.findOne({
      where: { code: data.code, id: { [db.Sequelize.Op.ne]: id } },
    });
    if (existing) {
      throw new Error("Godown code already in use");
    }
  }

  return await godown.update({
    code: data.code !== undefined ? data.code : godown.code,
    godownName: data.godownName ? data.godownName.trim() : godown.godownName,
    locationName: data.locationName
      ? data.locationName.trim()
      : godown.locationName,
    type: data.type !== undefined ? data.type : godown.type,
    address: data.address ? data.address.trim() : godown.address,
    shortAddress:
      data.shortAddress !== undefined
        ? data.shortAddress
          ? data.shortAddress.trim()
          : null
        : godown.shortAddress,
  });
};

export const deleteGodown = async (id) => {
  const godown = await Godown.findByPk(id);
  if (!godown) {
    throw new Error("Godown not found");
  }
  await godown.destroy();
};