import * as simplexMachineService from "../../../services/admin2/master/simplexMachineService.js";

export const createSimplexMachine = async (req, res) => {
  try {
    const item = await simplexMachineService.createSimplexMachine(req.body);
    res.status(201).json({
      message: "Simplex machine created successfully",
      simplexMachine: item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSimplexMachines = async (req, res) => {
  try {
    const items = await simplexMachineService.getAllSimplexMachines();
    res.json({
      message: "Simplex machines retrieved successfully",
      simplexMachines: items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSimplexMachineById = async (req, res) => {
  try {
    const item = await simplexMachineService.getSimplexMachineById(req.params.id);
    res.json({
      message: "Simplex machine retrieved successfully",
      simplexMachine: item,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSimplexMachine = async (req, res) => {
  try {
    const item = await simplexMachineService.updateSimplexMachine(req.params.id, req.body);
    res.json({
      message: "Simplex machine updated successfully",
      simplexMachine: item,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSimplexMachine = async (req, res) => {
  try {
    await simplexMachineService.deleteSimplexMachine(req.params.id);
    res.json({ message: "Simplex machine deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};