import * as fibreService from "../../../services/admin1/master/fibreService.js";
import { getNextFibreCode } from "../../../utils/helpers.js";

// 🔹 GET NEXT FIBRE CODE
export const getNextFibreCodeController = async (req, res) => {
  try {
    const nextCode = await getNextFibreCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate fibre code",
      error: error.message,
    });
  }
};

export const createFibre = async (req, res) => {
  try {
    const fibre = await fibreService.createFibre(req.body);
    res.status(201).json({
      message: "Fibre created successfully",
      fibre,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllFibres = async (req, res) => {
  try {
    const fibres = await fibreService.getAllFibres();
    res.status(200).json({
      message: "Fibres retrieved successfully",
      fibres,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getFibreById = async (req, res) => {
  try {
    const fibre = await fibreService.getFibreById(req.params.id);
    res.status(200).json({
      message: "Fibre retrieved successfully",
      fibre,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateFibre = async (req, res) => {
  try {
    const fibre = await fibreService.updateFibre(req.params.id, req.body);
    res.status(200).json({
      message: "Fibre updated successfully",
      fibre,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFibre = async (req, res) => {
  try {
    await fibreService.deleteFibre(req.params.id);
    res.status(200).json({
      message: "Fibre deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};