import * as spinningCountService from "../../../services/admin2/master/spinningCountService.js";

export const createSpinningCount = async (req, res) => {
  try {
    const item = await spinningCountService.createSpinningCount(req.body);
    res.status(201).json({
      message: "Spinning count created successfully",
      spinningCount: item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSpinningCounts = async (req, res) => {
  try {
    const items = await spinningCountService.getAllSpinningCounts();
    res.json({
      message: "Spinning counts retrieved successfully",
      spinningCounts: items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSpinningCountById = async (req, res) => {
  try {
    const item = await spinningCountService.getSpinningCountById(req.params.id);
    res.json({
      message: "Spinning count retrieved successfully",
      spinningCount: item,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSpinningCount = async (req, res) => {
  try {
    const item = await spinningCountService.updateSpinningCount(req.params.id, req.body);
    res.json({
      message: "Spinning count updated successfully",
      spinningCount: item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSpinningCount = async (req, res) => {
  try {
    await spinningCountService.deleteSpinningCount(req.params.id);
    res.json({ message: "Spinning count deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};