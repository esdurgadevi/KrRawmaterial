import * as transportService from "../../../services/admin1/master/transportService.js";
import { getNextTransportCode } from "../../../utils/helpers.js";

export const getNextTransportCodeController = async (req, res) => {
  try {
    const nextCode = await getNextTransportCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate transport code",
      error: error.message,
    });
  }
};
export const createTransport = async (req, res) => {
  try {
    const transport = await transportService.createTransport(req.body);
    res.status(201).json({
      message: "Transport created successfully",
      transport,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllTransports = async (req, res) => {
  try {
    const transports = await transportService.getAllTransports();
    res.status(200).json({
      message: "Transports retrieved successfully",
      transports,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTransportById = async (req, res) => {
  try {
    const transport = await transportService.getTransportById(req.params.id);
    res.status(200).json({
      message: "Transport retrieved successfully",
      transport,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateTransport = async (req, res) => {
  try {
    const transport = await transportService.updateTransport(req.params.id, req.body);
    res.status(200).json({
      message: "Transport updated successfully",
      transport,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTransport = async (req, res) => {
  try {
    await transportService.deleteTransport(req.params.id);
    res.status(200).json({
      message: "Transport deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};