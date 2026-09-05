import * as lotRejectedService from "../../../services/admin1/transaction-cotton/lotRejectedService.js";

// Mark or unmark a lot as rejected
export const toggleLotRejected = async (req, res) => {
  try {
    const { inwardLotId, isRejected = true } = req.body;

    const record = await lotRejectedService.toggleLotRejectedService(
      inwardLotId,
      isRejected
    );

    res.status(200).json({
      message: isRejected ? "Lot marked as rejected" : "Lot un-rejected",
      lotRejected: record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get rejection status for a specific lot
export const getLotRejectedStatus = async (req, res) => {
  try {
    const status = await lotRejectedService.getLotRejectedStatusService(req.params.lotId);
    res.status(200).json({
      message: "Rejection status retrieved",
      lotRejected: status,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get list of all rejected lots
export const getAllRejectedLots = async (req, res) => {
  try {
    const rejected = await lotRejectedService.getAllRejectedLotsService();
    res.status(200).json({
      message: "Rejected lots retrieved",
      lotRejecteds: rejected,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};