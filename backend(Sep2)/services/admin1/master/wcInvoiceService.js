import db from "../../../models/index.js";

const { WCInvoiceHead, WCInvoiceDetail, sequelize } = db;

// ================= CREATE =================
export const createWCInvoice = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const { details, ...headData } = data;

    const head = await WCInvoiceHead.create(headData, { transaction });

    if (details && details.length > 0) {
      const detailData = details.map((item) => ({
        ...item,
        wcInvoiceId: head.id,
      }));

      await WCInvoiceDetail.bulkCreate(detailData, { transaction });
    }

    await transaction.commit();
    return head;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ================= GET ALL =================
export const getAllWCInvoices = async () => {
  return await WCInvoiceHead.findAll({
    include: [
      {
        model: WCInvoiceDetail,
        as: "details",
      },
    ],
    order: [["id", "DESC"]],
  });
};

// ================= GET BY ID =================
export const getWCInvoiceById = async (id) => {
  const invoice = await WCInvoiceHead.findByPk(id, {
    include: [
      {
        model: WCInvoiceDetail,
        as: "details",
      },
    ],
  });

  if (!invoice) throw new Error("WC Invoice not found");

  return invoice;
};

// ================= UPDATE =================
export const updateWCInvoice = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const invoice = await WCInvoiceHead.findByPk(id);
    if (!invoice) throw new Error("WC Invoice not found");

    const { details, ...headData } = data;

    await invoice.update(headData, { transaction });

    if (details) {
      await WCInvoiceDetail.destroy({
        where: { wcInvoiceId: id },
        transaction,
      });

      const detailData = details.map((item) => ({
        ...item,
        wcInvoiceId: id,
      }));

      await WCInvoiceDetail.bulkCreate(detailData, { transaction });
    }

    await transaction.commit();
    return invoice;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ================= DELETE =================
export const deleteWCInvoice = async (id) => {
  const invoice = await WCInvoiceHead.findByPk(id);
  if (!invoice) throw new Error("WC Invoice not found");

  await invoice.destroy();
  return true;
};