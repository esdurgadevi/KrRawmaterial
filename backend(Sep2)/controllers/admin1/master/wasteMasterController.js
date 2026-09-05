import * as wasteMasterService from "../../../services/admin1/master/wasteMasterService.js";
import { getNextWasteMasterCode } from "../../../utils/helpers.js";

export const getNextWasteMasterCodeController = async (req, res) => {
  try {
    const nextCode = await getNextWasteMasterCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate waste master code",
      error: error.message,
    });
  }
};
export const createWasteMaster = async (req, res) => {
  try {
    const waste = await wasteMasterService.createWasteMaster(req.body);
    res.status(201).json({
      message: "Waste master created successfully",
      wasteMaster: waste,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteMasters = async (req, res) => {
  try {
    const wastes = await wasteMasterService.getAllWasteMasters();
    res.status(200).json({
      message: "Waste masters retrieved successfully",
      wasteMasters: wastes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteMasterById = async (req, res) => {
  try {
    const waste = await wasteMasterService.getWasteMasterById(req.params.id);
    res.status(200).json({
      message: "Waste master retrieved successfully",
      wasteMaster: waste,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteMaster = async (req, res) => {
  try {
    const waste = await wasteMasterService.updateWasteMaster(req.params.id, req.body);
    res.status(200).json({
      message: "Waste master updated successfully",
      wasteMaster: waste,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteMaster = async (req, res) => {
  try {
    await wasteMasterService.deleteWasteMaster(req.params.id);
    res.status(200).json({
      message: "Waste master deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const bulkImportWasteMasters = async (req, res) => {
  try {
    const items = req.body.items || req.body;
    const result = await wasteMasterService.bulkImportWasteMasters(items);
    res.status(200).json({
      message: `Successfully imported ${result.importedCount} waste masters (${result.skippedCount} skipped as duplicates)`,
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};