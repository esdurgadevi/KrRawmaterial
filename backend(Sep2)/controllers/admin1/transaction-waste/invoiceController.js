// controllers/invoiceController.js
import * as invoiceService from "../../../services/admin1/transaction-waste/invoiceService.js";
import { getNextInvoiceNo } from "../../../utils/helpers.js";

export const getNextInvoiceNoController = async (req, res) => {
  try {
    const nextInvoiceNo = await getNextInvoiceNo();
    res.status(200).json({
      message: "Next invoice number generated",
      nextInvoiceNo,
    });
  } catch (error) {
    console.error("Error generating invoice no:", error);
    res.status(500).json({
      message: "Failed to generate next invoice number",
    });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.create(req.body);
    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getAll();
    res.status(200).json({
      message: "Invoices retrieved successfully",
      invoices,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    res.status(200).json({
      message: "Invoice retrieved successfully",
      invoice,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    await invoiceService.remove(req.params.id);
    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getInvoiceNoWiseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await invoiceService.getInvoiceNoWiseReport(startDate, endDate);
    res.status(200).json({
      message: "Invoice No Wise report generated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportInvoices = async (req, res) => {
  try {
    const result = await invoiceService.bulkImport(req.body);
    res.status(200).json({
      message: "Invoices bulk imported successfully",
      importedCount: result.importedCount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
