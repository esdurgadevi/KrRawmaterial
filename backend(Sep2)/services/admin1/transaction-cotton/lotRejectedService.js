import db from "../../../models/index.js";
const { LotRejected, InwardLot } = db;

// ================= MARK / UNMARK REJECTED (UPSERT) =================
export const toggleLotRejectedService = async (inwardLotId, isRejected = true) => {
  if (!inwardLotId) throw new Error("Inward lot ID is required");

  // Check lot exists
  const lot = await InwardLot.findByPk(inwardLotId);
  if (!lot) throw new Error("Inward lot not found");

  // Upsert: create or update
  const [record, created] = await LotRejected.findOrCreate({
    where: { inwardLotId },
    defaults: { inwardLotId, isRejected },
  });

  if (!created) {
    await record.update({ isRejected });
  }

  return record;
};

// ================= CHECK IF LOT IS REJECTED =================
export const getLotRejectedStatusService = async (inwardLotId) => {
  const record = await LotRejected.findOne({
    where: { inwardLotId },
    attributes: ["id", "isRejected", "createdAt", "updatedAt"],
  });

  return record || { isRejected: false };
};

// ================= GET ALL REJECTED LOTS =================
export const getAllRejectedLotsService = async () => {
  return await LotRejected.findAll({
    where: { isRejected: true },
    include: [
      {
        model: InwardLot,
        as: "inwardLot",
        attributes: ["id", "lotNo", "lotDate", "nettWeight"],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });
};