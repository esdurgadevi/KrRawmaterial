import * as qcEntryService from "../../../services/admin2/transaction-qc/qcEntryService.js";
export const getAllQCEntries = async (req, res) => {
  try {
    const onlyUpdated = req.query.all === "true" ? false : true;
    const entries = await qcEntryService.getAllQCEntries(onlyUpdated);
    res.json({
      message: "All QC entries retrieved successfully",
      qcEntries: entries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const createQCEntry = async (req, res) => {
  try {
    const entry = await qcEntryService.createQCEntry(req.body, req.user?.id);
    res.status(201).json({
      message: "QC entry created successfully",
      qcEntry: entry,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getQCEntryByLot = async (req, res) => {
  try {
    const entry = await qcEntryService.getQCEntryByLotId(req.params.lotId);
    res.json({
      message: "QC entry retrieved",
      qcEntry: entry,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateQCEntry = async (req, res) => {
  try {
    const entry = await qcEntryService.updateQCEntry(req.params.id, req.body, req.user?.id);
    res.json({
      message: "QC entry updated successfully",
      qcEntry: entry,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteQCEntry = async (req, res) => {
  try {
    await qcEntryService.deleteQCEntry(req.params.id);
    res.json({ message: "QC entry deleted successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getQCEntryById = async (req, res) => {
  try {
    const entry = await qcEntryService.getQCEntryById(req.params.id);
    res.json({
      message: "QC entry retrieved by ID",
      qcEntry: entry,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};