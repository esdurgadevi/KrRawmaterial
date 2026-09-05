

import * as locationTransferService from "../../../services/admin1/transaction-cotton/locationTransferService.js";
import { getNextLocationTransferNo } from "../../../utils/helpers.js";

export const getNextLocationNo = async (req, res) => {
  try {
    const nextNo = await getNextLocationTransferNo();
    res.status(200).json({
      message: "Next location transfer number generated",
      nextNo,
    });
  } catch (error) {
    console.error("Error generating next location transfer no:", error);
    res.status(500).json({ message: "Failed to generate next location transfer no" });
  }
};
export const getAvailableBalesByLot = async (req, res) => {
  try {

    // ✅ get from query
    const { lotNo } = req.query;

    const bales = await locationTransferService.getAvailableBalesByLot(lotNo);

    res.status(200).json(bales);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
export const createLocationTransfer = async (req, res) => {
  try {
    const data = await locationTransferService.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllLocationTransfers = async (req, res) => {
  try {
    const data = await locationTransferService.getAll();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationTransferById = async (req, res) => {
  try {
    const data = await locationTransferService.getById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateLocationTransfer = async (req, res) => {
  try {
    const data = await locationTransferService.update(
      req.params.id,
      req.body
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLocationTransfer = async (req, res) => {
  try {
    await locationTransferService.remove(req.params.id);
    res.status(200).json({ message: "Location Transfer Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

