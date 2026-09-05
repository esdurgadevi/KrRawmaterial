import db from "../../../models/index.js";


const { State } = db;

export const createState = async (data) => {
  if (!data.code || !data.state) {
    throw new Error("Code and state name are required");
  }

  const existing = await State.findOne({ where: { code: data.code } });
  if (existing) {
    throw new Error("State code already exists");
  }

  return await State.create({
    code: data.code,
    state: data.state.trim(),
  });
};

export const getAllStates = async () => {
  return await State.findAll({
    order: [["code", "ASC"]],
  });
};

export const getStateById = async (id) => {
  const state = await State.findByPk(id);
  if (!state) {
    throw new Error("State not found");
  }
  return state;
};

export const updateState = async (id, data) => {
  const state = await State.findByPk(id);
  if (!state) {
    throw new Error("State not found");
  }

  if (data.code && data.code !== state.code) {
    const existing = await State.findOne({
      where: {
        code: data.code,
        id: { [db.Sequelize.Op.ne]: id },
      },
    });
    if (existing) {
      throw new Error("State code already in use");
    }
  }

  return await state.update({
    code: data.code !== undefined ? data.code : state.code,
    state: data.state ? data.state.trim() : state.state,
  });
};

export const deleteState = async (id) => {
  const state = await State.findByPk(id);
  if (!state) {
    throw new Error("State not found");
  }
  await state.destroy();
};