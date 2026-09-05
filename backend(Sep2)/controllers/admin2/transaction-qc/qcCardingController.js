import * as service from "../../../services/admin2/transaction-qc/qcCardingService.js";

export const create = async (req, res) => {
  const data = await service.create(req.body, req.user.id);
  res.status(201).json({ success: true, data });
};

export const getAll = async (req, res) => {
  const data = await service.getAll();
  res.json({ success: true, data });
};

export const getById = async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json({ success: true, data });
};

export const update = async (req, res) => {
  const data = await service.update(
    req.params.id,
    req.body,
    req.user.id
  );
  res.json({ success: true, data });
};

export const remove = async (req, res) => {
  await service.remove(req.params.id);
  res.json({ success: true });
};
