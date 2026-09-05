import db from "../../../models/index.js";
import { Op } from "sequelize";

const { WasteRate, WasteMaster } = db;

export const createWasteRate = async (data) => {
  const { wasteMasterId, rateDate, rate } = data;

  if (!wasteMasterId || !rateDate || rate === undefined) {
    throw new Error("Waste Master, Rate Date, and Rate are required");
  }

  // Validate waste master exists
  const waste = await WasteMaster.findByPk(wasteMasterId);
  if (!waste) {
    throw new Error("Selected Waste Master not found");
  }

  // Prevent duplicate for same waste + same date
  const existing = await WasteRate.findOne({
    where: { wasteMasterId, rateDate },
  });
  if (existing) {
    throw new Error(`Rate already exists for this waste on ${rateDate}`);
  }

  return await WasteRate.create({
    wasteMasterId,
    rateDate,
    rate: parseFloat(rate),
    remarks: data.remarks ? data.remarks.trim() : null,
  });
};

export const getAllWasteRates = async () => {
  return await WasteRate.findAll({
    include: [
      {
        model: WasteMaster,
        as: "wasteMaster",
        attributes: ["id", "code", "waste", "department"],
      },
    ],
    order: [["rateDate", "DESC"], ["wasteMasterId", "ASC"]],
  });
};

export const getWasteRateById = async (id) => {
  const rate = await WasteRate.findByPk(id, {
    include: [
      {
        model: WasteMaster,
        as: "wasteMaster",
        attributes: ["id", "code", "waste", "department"],
      },
    ],
  });
  if (!rate) {
    throw new Error("Waste rate not found");
  }
  return rate;
};

export const updateWasteRate = async (id, data) => {
  const rateEntry = await WasteRate.findByPk(id);
  if (!rateEntry) {
    throw new Error("Waste rate not found");
  }

  if (data.wasteMasterId && data.wasteMasterId !== rateEntry.wasteMasterId) {
    const waste = await WasteMaster.findByPk(data.wasteMasterId);
    if (!waste) throw new Error("Selected Waste Master not found");
  }

  if (data.rateDate || data.wasteMasterId) {
    const newDate = data.rateDate || rateEntry.rateDate;
    const newWasteId = data.wasteMasterId || rateEntry.wasteMasterId;

    const duplicate = await WasteRate.findOne({
      where: {
        wasteMasterId: newWasteId,
        rateDate: newDate,
        id: { [Op.ne]: id },
      },
    });

    if (duplicate) {
      throw new Error(`Rate already exists for this waste on ${newDate}`);
    }
  }

  return await rateEntry.update({
    wasteMasterId:
      data.wasteMasterId !== undefined
        ? data.wasteMasterId
        : rateEntry.wasteMasterId,
    rateDate: data.rateDate || rateEntry.rateDate,
    rate: data.rate !== undefined ? parseFloat(data.rate) : rateEntry.rate,
    remarks:
      data.remarks !== undefined
        ? data.remarks
          ? data.remarks.trim()
          : null
        : rateEntry.remarks,
  });
};

export const deleteWasteRate = async (id) => {
  const rate = await WasteRate.findByPk(id);
  if (!rate) {
    throw new Error("Waste rate not found");
  }
  await rate.destroy();
};