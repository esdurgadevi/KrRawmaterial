// services/finalInvoiceService.js
import db from "../../../models/index.js";

const { FinalInvoiceHead, FinalInvoiceDetail, sequelize } = db;

// ================= CREATE =================
export const createFinalInvoice = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const { details, ...headData } = data;

    if (!details || !Array.isArray(details) || details.length === 0) {
      throw new Error("At least one invoice detail is required");
    }

    // Create Head
    const head = await FinalInvoiceHead.create(headData, { transaction });

    // Prepare details – use the correct property name (finalInvoiceId)
    const detailData = details.map((item) => ({
      ...item,
      finalInvoiceId: head.id,           // ← this matches the model property
    }));

    // Bulk create details
    await FinalInvoiceDetail.bulkCreate(detailData, { transaction });

    await transaction.commit();

    // Return with include using the correct as: "details"
    return await FinalInvoiceHead.findByPk(head.id, {
      include: [{ model: FinalInvoiceDetail, as: "details" }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ================= GET ALL =================
export const getAllFinalInvoices = async () => {
  return await FinalInvoiceHead.findAll({
    include: [{ model: FinalInvoiceDetail, as: "details" }],
    order: [["id", "DESC"]],
  });
};

// ================= GET BY ID =================
export const getFinalInvoiceById = async (id) => {
  const invoice = await FinalInvoiceHead.findByPk(id, {
    include: [{ model: FinalInvoiceDetail, as: "details" }],
  });

  if (!invoice) {
    throw new Error("Final Invoice not found");
  }

  return invoice;
};

// ================= UPDATE =================
export const updateFinalInvoice = async (id, data) => {
  const transaction = await sequelize.transaction();

  try {
    const invoice = await FinalInvoiceHead.findByPk(id, { transaction });

    if (!invoice) {
      throw new Error("Final Invoice not found");
    }

    const { details, ...headData } = data;

    // Update head
    await invoice.update(headData, { transaction });

    if (details && Array.isArray(details)) {
      // Delete old details
      await FinalInvoiceDetail.destroy({
        where: { finalInvoiceId: id },    // ← property name
        transaction,
      });

      // Recreate details
      const newDetails = details.map((item) => ({
        ...item,
        finalInvoiceId: id,               // ← property name
      }));

      await FinalInvoiceDetail.bulkCreate(newDetails, { transaction });
    }

    await transaction.commit();

    return await getFinalInvoiceById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ================= DELETE =================
export const deleteFinalInvoice = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const invoice = await FinalInvoiceHead.findByPk(id, { transaction });

    if (!invoice) {
      throw new Error("Final Invoice not found");
    }

    // Delete details first
    await FinalInvoiceDetail.destroy({
      where: { finalInvoiceId: id },      // ← property name
      transaction,
    });

    // Delete head
    await invoice.destroy({ transaction });

    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};