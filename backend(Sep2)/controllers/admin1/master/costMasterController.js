import * as costMasterService from "../../../services/admin1/master/costMasterService.js";

export const createCostMaster = async (req, res) => {
  try {
    const cost = await costMasterService.createCostMaster(req.body);
    res.status(201).json({
      message: "Cost master created successfully",
      costMaster: cost,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCostMasters = async (req, res) => {
  try {
    const costs = await costMasterService.getAllCostMasters();
    res.status(200).json({
      message: "Cost masters retrieved successfully",
      costMasters: costs,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCostMasterById = async (req, res) => {
  try {
    const cost = await costMasterService.getCostMasterById(req.params.id);
    res.status(200).json({
      message: "Cost master retrieved successfully",
      costMaster: cost,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateCostMaster = async (req, res) => {
  try {
    const cost = await costMasterService.updateCostMaster(req.params.id, req.body);
    res.status(200).json({
      message: "Cost master updated successfully",
      costMaster: cost,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCostMaster = async (req, res) => {
  try {
    await costMasterService.deleteCostMaster(req.params.id);
    res.status(200).json({
      message: "Cost master deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};