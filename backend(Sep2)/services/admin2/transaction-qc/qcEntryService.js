import { Op } from "sequelize";
import db from "../../../models/index.js";

const { QCEntry, InwardLot } = db;

export const createQCEntry = async (data, userId) => {
  const lot = await InwardLot.findByPk(data.inwardLotId);
  if (!lot) throw new Error("Inward lot not found");

  const existing = await QCEntry.findOne({
    where: { inwardLotId: data.inwardLotId },
  });
  if (existing) {
    return await existing.update({
      ...data,
      updatedBy: userId || existing.updatedBy || 1,
    });
  }

  return await QCEntry.create({
    ...data,
    lotNo: lot.lotNo,
    updatedBy: userId || 1,
    createdBy: userId || 1,
  });
};

export const getQCEntryByLotId = async (inwardLotId) => {
  const entry = await QCEntry.findOne({
    where: { inwardLotId },
    include: [{ model: db.InwardLot, as: "inwardLot", attributes: ["lotNo"] }],
  });
  if (!entry) throw new Error("QC entry not found for this lot");
  return entry;
};

export const updateQCEntry = async (id, data, userId) => {
  const entry = await QCEntry.findByPk(id);
  if (!entry) throw new Error("QC entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId || entry.updatedBy || 1,
  });
};

export const deleteQCEntry = async (id) => {
  const entry = await QCEntry.findByPk(id);
  if (!entry) throw new Error("QC entry not found");
  await entry.destroy();
  return true;
};

export const getAllQCEntries = async (onlyUpdated = true) => {
  const whereClause = {};
  if (onlyUpdated) {
    whereClause[Op.or] = [
      { fqi: { [Op.ne]: null } },
      { updatedBy: { [Op.ne]: null } },
    ];
  }

  const entries = await QCEntry.findAll({
    where: whereClause,
    include: [{ model: db.InwardLot, as: "inwardLot", attributes: ["lotNo"] }],
    order: [["updatedAt", "DESC"]],
  });

  return entries;
};

export const getQCEntryById = async (id) => {
  const entry = await QCEntry.findByPk(id, {
    include: [{ model: db.InwardLot, as: "inwardLot", attributes: ["lotNo"] }],
  });
  if (!entry) throw new Error("QC entry not found");
  return entry;
};