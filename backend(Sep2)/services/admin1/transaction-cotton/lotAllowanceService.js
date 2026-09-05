import db from "../../../models/index.js";

const {
  LotAllowance,
  InwardLot,
  InwardEntry,
  PurchaseOrder,
  Supplier,
} = db;


// ================= CREATE =================
export const createLotAllowance = async (data) => {

  if (!data.debitValue && data.allowanceRate && data.netWeight) {
    data.debitValue = (data.allowanceRate * data.netWeight).toFixed(2);
  }

  return await LotAllowance.create(data);
};


// ================= GET ALL =================
export const getAllLotAllowances = async () => {
  return await LotAllowance.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: InwardLot,
        as: "inwardLot",
        attributes: ["id", "lotNo", "nett_weight", "candyRate"],
        include: [
          {
            model: InwardEntry, // ✅ NO alias here
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "orderNo", "candyRate"],
                include: [
                  {
                    model: Supplier,
                    as: "supplier",
                    attributes: ["id", "accountName"],
                  },
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
export const getLotAllowanceById = async (id) => {

  const allowance = await LotAllowance.findByPk(id, {
    include: [
      {
        model: InwardLot,
        as: "inwardLot",
        attributes: ["id", "lotNo", "nett_weight", "candyRate"],
        include: [
          {
            model: InwardEntry,
            include: [
              {
                model: PurchaseOrder,
                as: "purchaseOrder",
                attributes: ["id", "orderNo", "candyRate"],
                include: [
                  {
                    model: Supplier,
                    as: "supplier",
                    attributes: ["id", "accountName"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!allowance) {
    throw new Error("Lot Allowance not found");
  }

  return allowance;
};


// ================= UPDATE =================
export const updateLotAllowance = async (id, data) => {

  const record = await LotAllowance.findByPk(id);
  if (!record) throw new Error("Lot Allowance not found");

  if (data.allowanceRate || data.netWeight) {
    const netWt = data.netWeight || record.netWeight;
    const rate = data.allowanceRate || record.allowanceRate;
    data.debitValue = (rate * netWt).toFixed(2);
  }

  await record.update(data);
  return record;
};


// ================= DELETE =================
export const deleteLotAllowance = async (id) => {

  const record = await LotAllowance.findByPk(id);
  if (!record) throw new Error("Lot Allowance not found");

  await record.destroy();
  return true;
};


// ================= NEXT NUMBER =================
export const getNextAllowanceNo= async () => {

  const last = await LotAllowance.findOne({
    order: [["allowanceNo", "DESC"]],
    attributes: ["allowanceNo"],
  });

  return last ? last.allowanceNo + 1 : 1;
};