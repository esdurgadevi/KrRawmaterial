// controllers/inwardLotController.js
import * as service from "../../../services/admin1/transaction-cotton/inwardLotService.js";
import { getNextLotNo } from "../../../utils/helpers.js";

export const getNextLotNo1 = async (req, res) => {
  try {
    const lotNo = await getNextLotNo();
    res.status(200).json({
      message: "Next inward number generated",
      lotNo,
    });
  } catch (error) {
    console.error("Error generating next lot no:", error);
    res.status(500).json({ message: "Failed to generate next order number" });
  }
};

export const createLot = async (req, res) => {
  try {
    const lot = await service.createInwardLot(req.body);
    res.status(201).json({ message: "Lot created", lot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getAllLots = async (req, res) => {
  try {
    const lots = await service.getAllInwardLots();
    res.json(lots);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const getLot = async (req, res) => {
  try {
    const lot = await service.getInwardLotById(req.params.lotNo);
    res.json(lot);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

export const updateLot = async (req, res) => {
  try {
    const lot = await service.updateInwardLot(req.params.lotNo, req.body);
    res.json({ message: "Lot updated", lot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const deleteLot = async (req, res) => {
  try {
    await service.deleteInwardLot(req.params.lotNo);
    res.json({ message: "Lot deleted" });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};
