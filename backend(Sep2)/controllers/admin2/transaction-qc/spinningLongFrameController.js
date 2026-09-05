import * as service from "../../../services/admin2/transaction-qc/spinningLongFrameService.js";

export const create = async (req, res) => {
  try {
    const data = await service.create(req.body, req.user?.id);
    res.status(201).json({ message: "Created", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await service.update(
      req.params.id,
      req.body,
      req.user?.id
    );
    res.json({ message: "Updated", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
