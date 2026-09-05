import * as wasteRateService from "../../../services/admin1/master/wasteRateService.js";

export const createWasteRate = async (req, res) => {
  try {
    const rate = await wasteRateService.createWasteRate(req.body);
    res.status(201).json({
      message: "Waste rate created successfully",
      wasteRate: rate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteRates = async (req, res) => {
  try {
    const rates = await wasteRateService.getAllWasteRates();
    res.status(200).json({
      message: "Waste rates retrieved successfully",
      wasteRates: rates,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteRateById = async (req, res) => {
  try {
    const rate = await wasteRateService.getWasteRateById(req.params.id);
    res.status(200).json({
      message: "Waste rate retrieved successfully",
      wasteRate: rate,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteRate = async (req, res) => {
  try {
    const rate = await wasteRateService.updateWasteRate(req.params.id, req.body);
    res.status(200).json({
      message: "Waste rate updated successfully",
      wasteRate: rate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteRate = async (req, res) => {
  try {
    await wasteRateService.deleteWasteRate(req.params.id);
    res.status(200).json({
      message: "Waste rate deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};