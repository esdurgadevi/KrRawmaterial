import db from "../../../models/index.js";
import {
  deleteQCEntryForLot,
  syncLotTestResultToQC,
} from "../../admin2/transaction-qc/lotTestResultSyncService.js";

const { LotTestResult, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety, Station } = db;

// ================= CREATE =================
export const createLotTestResultService = async (data) => {
  return db.sequelize.transaction(async (transaction) => {
    const lot = await InwardLot.findByPk(data.lotId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!lot) throw new Error("Inward lot not found");

    const existing = await LotTestResult.findOne({
      where: { lotId: data.lotId },
      transaction,
    });
    if (existing) throw new Error("Lot Test Result already exists for this inward lot");

    const lotTestResult = await LotTestResult.create(data, { transaction });
    await syncLotTestResultToQC(lotTestResult, lot, transaction);
    return lotTestResult;
  });
};

// ================= GET ALL =================
export const getAllLotTestResultsService = async () => {
  return await LotTestResult.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: InwardLot,
        as: "lot",
        attributes: ["id", "lotNo", "gross_weight"],
        include: [
          {
            model: InwardEntry,
            attributes: ["id", "bill_no", "bill_date"],
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "candy_rate"],
                include: [
                  { model: Supplier, as: "supplier", attributes: ["id", "accountName"] },
                  { model: Variety, as: "variety", attributes: ["id", "variety"] },
                  { model: Station, as: "station", attributes: ["id", "station"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
};

// ================= GET BY ID =================
export const getLotTestResultByIdService = async (id) => {
  return await LotTestResult.findByPk(id, {
    include: [
      {
        model: InwardLot,
        as: "lot",
        attributes: ["id", "lotNo", "gross_weight"],
        include: [
          {
            model: InwardEntry,
            attributes: ["id", "bill_no", "bill_date"],
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "candy_rate"],
                include: [
                  { model: Supplier, as: "supplier", attributes: ["id", "accountName"] },
                  { model: Variety, as: "variety", attributes: ["id", "variety"] },
                  { model: Station, as: "station", attributes: ["id", "station"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
};

// ================= UPDATE =================
export const updateLotTestResultService = async (id, data) => {
  return db.sequelize.transaction(async (transaction) => {
    const record = await LotTestResult.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record) throw new Error("Lot Test Result not found");

    // A lot test cannot be silently moved to a different lot: that would
    // orphan the old QC row and potentially overwrite another lot's result.
    if (data.lotId !== undefined && Number(data.lotId) !== Number(record.lotId)) {
      throw new Error("Changing the lot for an existing test result is not allowed");
    }

    const lot = await InwardLot.findByPk(record.lotId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!lot) throw new Error("Inward lot not found");

    await record.update(data, { transaction });
    await syncLotTestResultToQC(record, lot, transaction);
    return record;
  });
};

// ================= DELETE =================
export const deleteLotTestResultService = async (id) => {
  return db.sequelize.transaction(async (transaction) => {
    const record = await LotTestResult.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!record) throw new Error("Lot Test Result not found");

    await deleteQCEntryForLot(record.lotId, transaction);
    await record.destroy({ transaction });
    return true;
  });
};
