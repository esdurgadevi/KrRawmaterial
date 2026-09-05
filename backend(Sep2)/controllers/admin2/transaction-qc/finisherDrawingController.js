import * as service from "../../../services/admin2/transaction-qc/finisherDrawingService.js";

export const create = async (req, res) => {
  const data = await service.create(req.body, req.user.id);
  res.status(201).json({ data });
};

export const getAll = async (req, res) => {
  const data = await service.getAll();
  res.json({ data });
};

export const getById = async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json({ data });
};

export const update = async (req, res) => {
  const data = await service.update(
    req.params.id,
    req.body,
    req.user.id
  );
  res.json({ data });
};

export const remove = async (req, res) => {
  await service.remove(req.params.id);
  res.json({ message: "Deleted successfully" });
};
