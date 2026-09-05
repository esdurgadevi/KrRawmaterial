import * as service from "../../../services/admin2/transaction-qc/comberEntryService.js";


// CREATE
export const create = async (req, res) => {
  try {
    const data = await service.create(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET ALL
export const getAll = async (req, res) => {
  try {
    const data = await service.getAll();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET BY ID
export const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};


// UPDATE
export const update = async (req, res) => {
  try {
    const data = await service.update(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};


// DELETE
export const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};
