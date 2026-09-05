// controllers/lotTestResultController.js
import * as lotTestResultService from "../../../services/admin1/transaction-cotton/lotTestResultService.js";

// ================= CREATE =================
export const createLotTestResult = async (req, res) => {
  try {
    const lotTestResult = await lotTestResultService.createLotTestResultService(req.body);
    res.status(201).json({
      message: "Lot Test Result created successfully",
      lotTestResult,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= GET ALL =================
export const getAllLotTestResults = async (req, res) => {
  try {
    const lotTestResults = await lotTestResultService.getAllLotTestResultsService();
    res.status(200).json({
      message: "Lot Test Results retrieved successfully",
      lotTestResults,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= GET BY ID =================
export const getLotTestResultById = async (req, res) => {
  try {
    const lotTestResult = await lotTestResultService.getLotTestResultByIdService(req.params.id);
    if (!lotTestResult) {
      return res.status(404).json({ message: "Lot Test Result not found" });
    }
    res.status(200).json({
      message: "Lot Test Result retrieved successfully",
      lotTestResult,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= UPDATE =================
export const updateLotTestResult = async (req, res) => {
  try {
    const updatedLotTestResult = await lotTestResultService.updateLotTestResultService(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Lot Test Result updated successfully",
      lotTestResult: updatedLotTestResult,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ================= DELETE =================
export const deleteLotTestResult = async (req, res) => {
  try {
    await lotTestResultService.deleteLotTestResultService(req.params.id);
    res.status(200).json({
      message: "Lot Test Result deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};