import * as wasteLotService from "../../../services/admin1/master/wasteLotService.js";

export const getLotByWasteName = async (req, res) => {
  try {
    const { waste } = req.query;

    if (!waste) {
      return res.status(400).json({
        message: "Waste name is required",
      });
    }

    const data = await wasteLotService.getLotByWasteName(waste);

    res.status(200).json({
      message: "Waste lots retrieved successfully",
      waste: data.waste,
      lots: data.wasteLots,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createWasteLot = async (req, res) => {
  try {
    const lot = await wasteLotService.createWasteLot(req.body);
    res.status(201).json({
      message: "Waste lot created successfully",
      wasteLot: lot,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllWasteLots = async (req, res) => {
  try {
    const lots = await wasteLotService.getAllWasteLots();
    res.status(200).json({
      message: "Waste lots retrieved successfully",
      wasteLots: lots,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWasteLotById = async (req, res) => {
  try {
    const lot = await wasteLotService.getWasteLotById(req.params.id);
    res.status(200).json({
      message: "Waste lot retrieved successfully",
      wasteLot: lot,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateWasteLot = async (req, res) => {
  try {
    const lot = await wasteLotService.updateWasteLot(req.params.id, req.body);
    res.status(200).json({
      message: "Waste lot updated successfully",
      wasteLot: lot,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWasteLot = async (req, res) => {
  try {
    await wasteLotService.deleteWasteLot(req.params.id);
    res.status(200).json({
      message: "Waste lot deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};