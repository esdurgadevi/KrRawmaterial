import db from "../../../models/index.js";
import { Op } from "sequelize";

const { Station, State } = db;

export const create = async (data) => {
  // Validation
  if (!data.code || !data.station || !data.stateId) {
    throw new Error("Missing required fields");
  }

  // FK validation
  const state = await State.findByPk(data.stateId);
  if (!state) {
    throw new Error("Invalid stateId");
  }

  // Unique station code check
  const existing = await Station.findOne({ where: { code: data.code } });
  if (existing) {
    throw new Error("Station code already exists");
  }

  return await Station.create(data);
};

export const getAll = async () => {
  const response = await Station.findAll({
    include: {
      model: State,
      attributes: ["id", "state", "code"],
    },
    order: [["code", "ASC"]],
  });
  return response;
};


export const getById = async (id) => {
  const station = await Station.findByPk(id, {
    include: {
      model: State,
      attributes: ["id", "state", "code"],
    },
  });

  if (!station) {
    throw new Error("Station not found");
  }

  return station;
};

export const update = async (id, data) => {
  const station = await Station.findByPk(id);
  if (!station) {
    throw new Error("Station not found");
  }

  // Validate stateId if updating
  if (data.stateId) {
    const state = await State.findByPk(data.stateId);
    if (!state) {
      throw new Error("Invalid stateId");
    }
  }

  // Unique code check
  if (data.code) {
    const existing = await Station.findOne({
      where: {
        code: data.code,
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      throw new Error("Station code already exists");
    }
  }

  return await station.update(data);
};

export const remove = async (id) => {
  const station = await Station.findByPk(id);
  if (!station) {
    throw new Error("Station not found");
  }

  await station.destroy();
};
