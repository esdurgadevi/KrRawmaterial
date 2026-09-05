import * as countwiseClosingService from "../../../services/admin1/transaction-process-stock/countwiseClosingService.js";

export const createCountwiseClosing = async (req, res) => {
  try {
    const record = await countwiseClosingService.createCountwiseClosing(req.body);
    res.status(201).json({
      message: "Countwise Closing created successfully",
      record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCountwiseClosing = async (req, res) => {
  try {
    const records = await countwiseClosingService.getAllCountwiseClosing();
    res.status(200).json({
      message: "Countwise Closing retrieved successfully",
      records,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCountwiseClosingById = async (req, res) => {
  try {
    const record = await countwiseClosingService.getCountwiseClosingById(req.params.id);
    res.status(200).json({
      message: "Countwise Closing retrieved successfully",
      record,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCountwiseClosing = async (req, res) => {
  try {
    const record = await countwiseClosingService.updateCountwiseClosing(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Countwise Closing updated successfully",
      record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCountwiseClosing = async (req, res) => {
  try {
    const result = await countwiseClosingService.deleteCountwiseClosing(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await countwiseClosingService.getProductsFromExternalAPI();
    res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add these methods to countwiseClosingController.js

export const getCountwiseClosingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }
    const report = await countwiseClosingService.getCountwiseClosingReport(startDate, endDate);
    res.status(200).json({
      message: "Countwise Closing report retrieved successfully",
      ...report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductStockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }
    const report = await countwiseClosingService.getProductStockReport(startDate, endDate);
    res.status(200).json({
      message: "Product Stock report retrieved successfully",
      ...report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};