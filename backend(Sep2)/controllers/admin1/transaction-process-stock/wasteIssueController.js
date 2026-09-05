import * as wasteIssueService from "../../../services/admin1/transaction-process-stock/wasteIssueService.js";

export const createWasteIssue = async (req, res) => {
  try {
    const wasteIssue = await wasteIssueService.create(req.body);
    res.status(201).json({
      message: "Waste issue created successfully",
      wasteIssue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteIssues = async (req, res) => {
  try {
    const wasteIssues = await wasteIssueService.getAll();
    res.status(200).json({
      message: "Waste issues retrieved successfully",
      wasteIssues,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteIssueById = async (req, res) => {
  try {
    const wasteIssue = await wasteIssueService.getById(req.params.id);
    res.status(200).json({
      message: "Waste issue retrieved successfully",
      wasteIssue,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteIssue = async (req, res) => {
  try {
    const wasteIssue = await wasteIssueService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Waste issue updated successfully",
      wasteIssue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteIssue = async (req, res) => {
  try {
    await wasteIssueService.remove(req.params.id);
    res.status(200).json({
      message: "Waste issue deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getWasteIssueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }
    const report = await wasteIssueService.getWasteIssueReport(startDate, endDate);
    res.status(200).json({
      message: "Waste Issue report retrieved successfully",
      ...report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};