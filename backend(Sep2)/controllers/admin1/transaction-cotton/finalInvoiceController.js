// controllers/finalInvoiceController.js
import * as finalInvoiceService from "../../../services/admin1/transaction-cotton/finalInvoiceService.js";

import { getNextVoucherNo } from "../../../utils/helpers.js";

export const getNextVoucherNo1 = async (req, res) => {
  try {
    const { tcType } = req.query; // U or L

    const nextNo = await getNextVoucherNo(tcType);

    res.status(200).json({
      message: "Next voucher number generated",
      nextNo,
    });
  } catch (error) {
    console.error("Error generating next voucher number:", error);
    res.status(500).json({
      message: "Failed to generate next voucher number",
    });
  }
};

export const createFinalInvoice = async (req, res) => {
  try {
    const invoice = await finalInvoiceService.createFinalInvoice(req.body);

    res.status(201).json({
      message: "Final Invoice created successfully",
      finalInvoice: invoice,           // ← consistent singular key
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create final invoice",
      error: error.message,
    });
  }
};

export const getAllFinalInvoices = async (req, res) => {
  try {
    const invoices = await finalInvoiceService.getAllFinalInvoices();

    res.status(200).json({
      message: "Final Invoices retrieved successfully",
      finalInvoices: invoices,         // ← plural key for array
      count: invoices.length,          // ← helpful for frontend pagination/debug
    });
  } catch (error) {
    res.status(500).json({             // 500 more appropriate for unexpected errors
      message: "Failed to retrieve final invoices",
      error: error.message,
    });
  }
};

export const getFinalInvoiceById = async (req, res) => {
  try {
    const invoice = await finalInvoiceService.getFinalInvoiceById(req.params.id);

    res.status(200).json({
      message: "Final Invoice retrieved successfully",
      finalInvoice: invoice,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({
      message: "Failed to retrieve final invoice",
      error: error.message,
    });
  }
};

export const updateFinalInvoice = async (req, res) => {
  try {
    const invoice = await finalInvoiceService.updateFinalInvoice(
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Final Invoice updated successfully",
      finalInvoice: invoice,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      message: "Failed to update final invoice",
      error: error.message,
    });
  }
};

export const deleteFinalInvoice = async (req, res) => {
  try {
    await finalInvoiceService.deleteFinalInvoice(req.params.id);

    res.status(200).json({
      message: "Final Invoice deleted successfully",
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({
      message: "Failed to delete final invoice",
      error: error.message,
    });
  }
};