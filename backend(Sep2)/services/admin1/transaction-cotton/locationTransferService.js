
import db from "../../../models/index.js";

const {
  LocationTransfer,
  LocationTransferDetail,
  LocationTransferBale,
  Transport,
  InwardLot,
  InwardLotWeightment,
} = db;

export const getAvailableBalesByLot = async (lotNo) => {
  try {

    const bales = await InwardLotWeightment.findAll({
      where: {
        lot_no: lotNo
      },
      include: [
        {
          model: LocationTransferBale,
          as: "transferBales",
          required: false
        }
      ]
    });

    const availableBales = bales.filter(b => b.transferBales.length === 0);

    return availableBales;

  } catch (err) {
    throw err;
  }
};

// CREATE
export const create = async (data) => {
  const t = await db.sequelize.transaction();

  try {
    const transfer = await LocationTransfer.create(
      {
        transferNo: data.transferNo,
        transferDate: data.transferDate,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        transportId: data.transportId,
        transMode: data.transMode,
        lorryNo: data.lorryNo,
        driverName: data.driverName,
        ownerMobile: data.ownerMobile,
        driverMobile: data.driverMobile,
        itemName: data.itemName,
        qty: data.qty,
        kgs: data.kgs,
        value: data.value,
      },
      { transaction: t }
    );

    for (const d of data.details) {
      const detail = await LocationTransferDetail.create(
        {
          transferId: transfer.id,
          lotId: d.lotId,
          stockQty: d.stockQty,
          transferQty: d.transferQty,
        },
        { transaction: t }
      );

      for (const baleId of d.weightmentIds) {
        await LocationTransferBale.create(
          {
            transferDetailId: detail.id,
            weightmentId: baleId,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return transfer;

  } catch (err) {
    await t.rollback();
    throw err;
  }
};


// GET ALL (RETURN FULL REFERENCES)
export const getAll = async () => {
  return await LocationTransfer.findAll({
    include: [
      { model: Transport, as: "transport" },
      {
        model: LocationTransferDetail,
        as: "details",
        include: [
          {
            model: InwardLot,
            as: "lot",
          },
          {
            model: LocationTransferBale,
            as: "bales",
            include: [
              {
                model: InwardLotWeightment,
                as: "weightment",
              },
            ],
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });
};


// GET BY ID
export const getById = async (id) => {
  const transfer = await LocationTransfer.findByPk(id, {
    include: [
      { model: Transport, as: "transport" },
      {
        model: LocationTransferDetail,
        as: "details",
        include: [
          { model: InwardLot, as: "lot" },
          {
            model: LocationTransferBale,
            as: "bales",
            include: [{ model: InwardLotWeightment, as: "weightment" }],
          },
        ],
      },
    ],
  });

  if (!transfer) throw new Error("Transfer not found");
  return transfer;
};


// UPDATE (HEADER ONLY)
export const update = async (id, data) => {
  const transfer = await LocationTransfer.findByPk(id);
  if (!transfer) throw new Error("Transfer not found");

  return await transfer.update(data);
};


// DELETE
export const remove = async (id) => {
  const transfer = await LocationTransfer.findByPk(id);
  if (!transfer) throw new Error("Transfer not found");

  await transfer.destroy();
};



