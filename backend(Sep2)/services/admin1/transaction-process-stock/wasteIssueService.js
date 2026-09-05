import db from "../../../models/index.js";
import { Op } from "sequelize"; 

const { WasteIssue } = db;

export const create = async (data) => {
  const { date, issued, realised } = data;
  
  if (!date || issued === undefined || realised === undefined) {
    throw new Error("All fields are required");
  }

  const wasteIssue = await WasteIssue.create({
    date,
    issued: parseFloat(issued),
    realised: parseFloat(realised),
  });

  return wasteIssue;
};

export const getAll = async () => {
  const wasteIssues = await WasteIssue.findAll({
    order: [["date", "DESC"]],
  });
  return wasteIssues;
};

export const getById = async (id) => {
  const wasteIssue = await WasteIssue.findByPk(id);
  if (!wasteIssue) {
    throw new Error("Waste issue not found");
  }
  return wasteIssue;
};

export const update = async (id, data) => {
  const wasteIssue = await WasteIssue.findByPk(id);
  if (!wasteIssue) {
    throw new Error("Waste issue not found");
  }

  const updated = await wasteIssue.update({
    date: data.date || wasteIssue.date,
    issued: data.issued !== undefined ? parseFloat(data.issued) : wasteIssue.issued,
    realised: data.realised !== undefined ? parseFloat(data.realised) : wasteIssue.realised,
  });

  return updated;
};

export const remove = async (id) => {
  const wasteIssue = await WasteIssue.findByPk(id);
  if (!wasteIssue) {
    throw new Error("Waste issue not found");
  }
  await wasteIssue.destroy();
};

export const getWasteIssueReport = async (startDate, endDate) => {
  const wasteIssues = await WasteIssue.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [["date", "ASC"]]
  });
  
  return { data: wasteIssues };
};