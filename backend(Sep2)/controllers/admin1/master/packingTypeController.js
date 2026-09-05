import * as packingTypeService from "../../../services/admin1/master/packingTypeService.js";
import { getNextPackingTypeCode } from "../../../utils/helpers.js";

export const getNextPackingTypeCodeController = async (req, res) => {
  try {
    const nextCode = await getNextPackingTypeCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate packing type code",
      error: error.message,
    });
  }
};

export const createPackingType = async (req, res) => {
  try {
    const packing = await packingTypeService.createPackingType(req.body);
    res.status(201).json({
      message: "Packing type created successfully",
      packingType: packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPackingTypes = async (req, res) => {
  try {
    const types = await packingTypeService.getAllPackingTypes();
    res.status(200).json({
      message: "Packing types retrieved successfully",
      packingTypes: types,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPackingTypeById = async (req, res) => {
  try {
    const packing = await packingTypeService.getPackingTypeById(req.params.id);
    res.status(200).json({
      message: "Packing type retrieved successfully",
      packingType: packing,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePackingType = async (req, res) => {
  try {
    const packing = await packingTypeService.updatePackingType(req.params.id, req.body);
    res.status(200).json({
      message: "Packing type updated successfully",
      packingType: packing,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePackingType = async (req, res) => {
  try {
    await packingTypeService.deletePackingType(req.params.id);
    res.status(200).json({
      message: "Packing type deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};