import * as mixingService from "../../../services/admin1/master/mixingService.js";
import { getNextMixingCode } from "../../../utils/helpers.js";

export const getNextMixingCodeController = async (req, res) => {
  try {
    const nextCode = await getNextMixingCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate mixing code",
      error: error.message,
    });
  }
};
export const createMixing = async (req, res) => {
  try {
    const mixing = await mixingService.createMixing(req.body);
    res.status(201).json({
      message: "Mixing created successfully",
      mixing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllMixings = async (req, res) => {
  try {
    const mixings = await mixingService.getAllMixings();
    res.status(200).json({
      message: "Mixings retrieved successfully",
      mixings,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMixingById = async (req, res) => {
  try {
    const mixing = await mixingService.getMixingById(req.params.id);
    res.status(200).json({
      message: "Mixing retrieved successfully",
      mixing,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateMixing = async (req, res) => {
  try {
    const mixing = await mixingService.updateMixing(req.params.id, req.body);
    res.status(200).json({
      message: "Mixing updated successfully",
      mixing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMixing = async (req, res) => {
  try {
    await mixingService.deleteMixing(req.params.id);
    res.status(200).json({
      message: "Mixing deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};