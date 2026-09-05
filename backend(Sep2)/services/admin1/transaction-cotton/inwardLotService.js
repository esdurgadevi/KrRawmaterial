import db from "../../../models/index.js";
import sequelize from "../../../config/db.js";

const {
  InwardLot,
  InwardLotWeightment,
  InwardEntry,
  PurchaseOrder,
  Supplier,
  Broker,
  Variety,
  MixingGroup,
  Station,
  CompanyBroker,
} = db;

/* =========================
   CREATE (LOT + WEIGHTMENTS)
========================= */
export const createInwardLot = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const { lotHeader, weightments } = data;
    const { inwardId, qty } = lotHeader;

    /* =========================
       1️⃣ GET INWARD ENTRY
    ========================= */
    const inward = await InwardEntry.findByPk(inwardId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!inward) {
      throw new Error("Inward Entry not found");
    }

    const inwardQty = inward.Qty;

    /* =========================
       2️⃣ SUM EXISTING LOT QTY
    ========================= */
    const usedQty = await InwardLot.sum("qty", {
      where: { inwardId },
      transaction,
    });

    const totalUsedQty = usedQty || 0;

    /* =========================
       3️⃣ CALCULATE REMAINING
    ========================= */
    const remainingQty = inwardQty - totalUsedQty;

    /* =========================
       4️⃣ VALIDATION
    ========================= */
    if (qty > remainingQty) {
      throw new Error(
        `Lot qty exceeds remaining inward qty. Remaining qty: ${remainingQty}`
      );
    }

    /* =========================
       5️⃣ CREATE LOT
    ========================= */
    const newLot = await InwardLot.create(lotHeader, { transaction });

    /* =========================
       6️⃣ PREPARE WEIGHTMENTS
    ========================= */
    const weightmentRows = weightments.map((item) => ({
      ...item,
      lotNo: newLot.lotNo,
    }));

    /* =========================
       7️⃣ INSERT WEIGHTMENTS
    ========================= */
    await InwardLotWeightment.bulkCreate(weightmentRows, {
      transaction,
    });

    await transaction.commit();

    return newLot;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAllInwardLots = async () => {
  const lots = await InwardLot.findAll({
    attributes: [
      "id",
      "lotNo",
      "lotDate",
      "qty",
      "freight",
      "nettWeight",
      "candyRate",
      "godownId",
    ],
    include: [
      {
        model: InwardEntry,
        as: "InwardEntry",
        attributes: ["inwardNo"],
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            attributes: ["orderNo"],
            include: [
              {
                model: Supplier,
                as: "supplier",
                attributes: ["accountName"],
              },
              {
                model: Station,
                as: "station",
                attributes: ["station"],
              },
            ],
          },
        ],
      },
    ],
    order: [["lotDate", "DESC"]],
  });

  return lots.map((lot) => {
    const data = lot.toJSON();

    return {
      id: data.id,
      lotNo: data.lotNo,
      lotDate: data.lotDate,
      qty: data.qty,
      freight: data.freight,
      nettWeight: data.nettWeight,
      candyRate: data.candyRate,
      godownId: data.godownId,

      inwardNo: data.InwardEntry?.inwardNo || null,

      purchaseOrderNo:
        data.InwardEntry?.purchaseOrder?.orderNo || null,

      supplier:
        data.InwardEntry?.purchaseOrder?.supplier?.accountName || null,

      station:
        data.InwardEntry?.purchaseOrder?.station?.station || null,
    };
  });
};
/* =========================
   GET ALL (LIST PAGE)
========================= */
// export const getAllInwardLots = async () => {
//   const lots = await InwardLot.findAll({
//     attributes: [
//       "id",
//       "lotNo",
//       "lotDate",
//       "qty",
//       "freight",
//       "nettWeight",
//       "candyRate",
//       "godownId",
//     ],
//     include: [
//       {
//         model: InwardEntry,
//         as: "InwardEntry",
//         attributes: ["inwardNo"],   // get inward number
//         include: [
//           {
//             model: PurchaseOrder,
//             as: "purchaseOrder",
//             attributes: ["orderNo"],  // get purchase order number
//           },
//         ],
//       },
//     ],
//     order: [["lotDate", "DESC"]],
//   });
//   return lots;
// };

/* =========================
   GET BY ID (FULL DETAILS)
========================= */
export const getInwardLotById = async (id) => {
  const lot = await InwardLot.findByPk(id, {
    include: [
      {
        model: InwardEntry,
        as: "InwardEntry",
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [
              { model: Supplier, as: "supplier" },
              { model: Broker, as: "broker" },
              { model: Variety, as: "variety" },
              { model: MixingGroup, as: "mixingGroup" },
              { model: Station, as: "station" },
              { model: CompanyBroker, as: "companyBroker" },
            ],
          },
        ],
      },
      {
        model: InwardLotWeightment,
        as: "weightments",
      },
      {
        model: db.Godown,
        as: "godown",
        attributes: ["godownName"],
      },
    ],
  });

  if (!lot) {
    throw new Error("Inward Lot not found");
  }

  const data = lot.toJSON();

  return {
    // Lot fields
    id: data.id,
    lotNo: data.lotNo,
    lotDate: data.lotDate,
    lcNo: data.lcNo,
    paymentDays: data.paymentDays,
    paymentDate: data.paymentDate,
    setNo: data.setNo,
    cess: data.cess,
    type: data.type,
    freight: data.freight,
    grossWeight: data.grossWeight,
    tareWeight: data.tareWeight,
    nettWeight: data.nettWeight,
    qty: data.qty,
    candyRate: data.candyRate,
    quintalRate: data.quintalRate,
    ratePerKg: data.ratePerKg,
    assessValue: data.assessValue,
    godownId: data.godownId,
    godownName: data.godown?.godownName || null,
    inwardNo: data.InwardEntry?.inwardNo || null,

    // From InwardEntry
    billNo: data.InwardEntry?.billNo || null,
    billDate: data.InwardEntry?.billDate || null,
    inwardLotNo: data.InwardEntry?.lotNo || null,
    inwardDate: data.InwardEntry?.date || null,
    inwardCandyRate: data.InwardEntry?.candyRate || null,
    pMark: data.InwardEntry?.pMark || null,
    pressRunningNo: data.InwardEntry?.pressRunningNo || null,
    Tax: data.InwardEntry?.Tax || null,
    TaxRs: data.InwardEntry?.TaxRs || null,
    gst: data.InwardEntry?.gst || null,
    sgst: data.InwardEntry?.sgst || null,
    cgst: data.InwardEntry?.cgst || null,
    igst: data.InwardEntry?.igst || null,
    sgstAmount: data.InwardEntry?.sgstAmount || null,
    cgstAmount: data.InwardEntry?.cgstAmount || null,
    igstAmount: data.InwardEntry?.igstAmount || null,

    // From Purchase Order
    supplier:
      data.InwardEntry?.purchaseOrder?.supplier?.accountName || null,
    broker:
      data.InwardEntry?.purchaseOrder?.broker?.brokerName || null,
    variety:
      data.InwardEntry?.purchaseOrder?.variety?.variety || null,
    mixingGroup:
      data.InwardEntry?.purchaseOrder?.mixingGroup?.mixingName || null,
    station:
      data.InwardEntry?.purchaseOrder?.station?.station || null,
    companyBroker:
      data.InwardEntry?.purchaseOrder?.companyBroker?.companyName || null,
    rateType:
      data.InwardEntry?.purchaseOrder?.selectedRateType || null,

    // Weightments
    weightments: data.weightments || [],

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/* =========================
   DELETE
========================= */
export const deleteInwardLot = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const lot = await InwardLot.findByPk(id);

    if (!lot) {
      throw new Error("Inward Lot not found");
    }

    // Delete weightments
    await InwardLotWeightment.destroy({
      where: { lotNo: lot.lotNo },
      transaction,
    });

    // Delete lot
    await lot.destroy({ transaction });

    await transaction.commit();

    return { message: "Inward Lot deleted successfully" };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/* =========================
   UPDATE (LOT + WEIGHTMENTS)
========================= */
export const updateInwardLot = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const { lotHeader, weightments } = data;

    const lot = await InwardLot.findByPk(id, { transaction });

    if (!lot) {
      throw new Error("Inward Lot not found");
    }

    // 1️⃣ Update lot header
    await lot.update(lotHeader, { transaction });

    // 2️⃣ Delete existing weightments
    await InwardLotWeightment.destroy({
      where: { lotNo: lot.lotNo },
      transaction,
    });

    // 3️⃣ Re-insert new weightments
    const weightmentRows = weightments.map(({ id, ...item }) => ({
      ...item,
      lotNo: lot.lotNo,
    }));

    await InwardLotWeightment.bulkCreate(weightmentRows, {
      transaction,
    });

    await transaction.commit();

    return { message: "Inward Lot updated successfully" };

  } catch (error) {
    console.log(error);
    await transaction.rollback();
    throw error;
  }
};