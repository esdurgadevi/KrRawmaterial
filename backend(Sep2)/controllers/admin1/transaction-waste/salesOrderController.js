// controllers/salesOrderController.js
import * as salesOrderService from "../../../services/admin1/transaction-waste/salesOrderService.js";
import { getNextSalesOrderNo } from "../../../utils/helpers.js";
export const getNextSalesOrderNoController = async (req, res) => {
  try {
    const nextOrderNo = await getNextSalesOrderNo();

    res.status(200).json({
      message: "Next sales order number generated",
      nextOrderNo,
    });
  } catch (error) {
    console.error("Error generating sales order no:", error);
    res.status(500).json({
      message: "Failed to generate next sales order number",
    });
  }
};
export const createSalesOrder = async (req, res) => {
  try {
    const order = await salesOrderService.create(req.body);
    res.status(201).json({
      message: "Sales order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSalesOrders = async (req, res) => {
  try {
    const orders = await salesOrderService.getAll();
    res.status(200).json({
      message: "Sales orders retrieved successfully",
      orders,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSalesOrderById = async (req, res) => {
  try {
    const order = await salesOrderService.getById(req.params.id);
    res.status(200).json({
      message: "Sales order retrieved successfully",
      order,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSalesOrder = async (req, res) => {
  try {
    const order = await salesOrderService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Sales order updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSalesOrder = async (req, res) => {
  try {
    await salesOrderService.remove(req.params.id);
    res.status(200).json({
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAvailableBales = async (req, res) => {
  try {
    const { id } = req.params;
    const { excludeInvoiceId } = req.query;
    const bales = await salesOrderService.getAvailableBales(id, excludeInvoiceId);
    res.status(200).json({
      message: "Available bales retrieved successfully",
      bales,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const bulkImportSalesOrders = async (req, res) => {
  try {
    const result = await salesOrderService.bulkImport(req.body);
    res.status(200).json({
      message: "Sales orders bulk imported successfully",
      importedCount: result.importedCount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

