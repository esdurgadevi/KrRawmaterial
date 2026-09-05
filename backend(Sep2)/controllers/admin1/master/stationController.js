import * as stationService from "../../../services/admin1/master/stationService.js";
import { getNextStationCode } from "../../../utils/helpers.js";

export const getNextStationCodeController = async (req, res) => {
  try {
    const nextCode = await getNextStationCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate station code",
      error: error.message,
    });
  }
};

export const createStation = async (req, res) => {
  try {
    const station = await stationService.create(req.body);
    res.status(201).json({
      message: "Station created successfully",
      station,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllStations = async (req, res) => {
  try {
    const stations = await stationService.getAll();
    res.status(200).json({
      message: "Stations retrieved successfully",
      stations,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getStationById = async (req, res) => {
  try {
    const station = await stationService.getById(req.params.id);
    res.status(200).json({
      message: "Station retrieved successfully",
      station,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateStation = async (req, res) => {
  try {
    const station = await stationService.update(req.params.id, req.body);
    res.status(200).json({
      message: "Station updated successfully",
      station,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStation = async (req, res) => {
  try {
    await stationService.remove(req.params.id);
    res.status(200).json({
      message: "Station deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};