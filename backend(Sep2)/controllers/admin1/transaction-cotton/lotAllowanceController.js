// controllers/lotAllowanceController.js
import * as lotAllowanceService from "../../../services/admin1/transaction-cotton/lotAllowanceService.js";

export const createLotAllowance = async (req, res) => {
  try {
    const allowance = await lotAllowanceService.createLotAllowance(req.body);
    res.status(201).json({
      message: "Lot allowance created successfully",
      lotAllowance: allowance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllLotAllowances = async (req, res) => {
  try {
    const allowances = await lotAllowanceService.getAllLotAllowances(req.query);
    res.status(200).json({
      message: "Lot allowances retrieved successfully",
      lotAllowances: allowances,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getLotAllowanceById = async (req, res) => {
  try {
    const allowance = await lotAllowanceService.getLotAllowanceById(req.params.id);
    res.status(200).json({
      message: "Lot allowance retrieved successfully",
      lotAllowance: allowance,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateLotAllowance = async (req, res) => {
  try {
    const allowance = await lotAllowanceService.updateLotAllowance(req.params.id, req.body);
    res.status(200).json({
      message: "Lot allowance updated successfully",
      lotAllowance: allowance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLotAllowance = async (req, res) => {
  try {
    await lotAllowanceService.deleteLotAllowance(req.params.id);
    res.status(200).json({ message: "Lot allowance deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getNextAllowanceNo = async (req, res) => {
  try {
    const nextNo = await lotAllowanceService.getNextAllowanceNo();
    res.status(200).json({ nextAllowanceNo: nextNo });
  } catch (error) {
    res.status(500).json({ message: "Failed to get next allowance number" });
  }
};