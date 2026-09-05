import * as wcInvoiceService from "../../../services/admin1/master/wcInvoiceService.js";

export const createWCInvoice = async (req, res) => {
  try {
    const invoice = await wcInvoiceService.createWCInvoice(req.body);
    res.status(201).json({
      message: "WC Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWCInvoices = async (req, res) => {
  try {
    const invoices = await wcInvoiceService.getAllWCInvoices();
    res.status(200).json({ invoices });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWCInvoiceById = async (req, res) => {
  try {
    const invoice = await wcInvoiceService.getWCInvoiceById(req.params.id);
    res.status(200).json({ invoice });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWCInvoice = async (req, res) => {
  try {
    const invoice = await wcInvoiceService.updateWCInvoice(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "WC Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWCInvoice = async (req, res) => {
  try {
    await wcInvoiceService.deleteWCInvoice(req.params.id);
    res.status(200).json({
      message: "WC Invoice deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};