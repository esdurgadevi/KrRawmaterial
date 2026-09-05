import * as departmentKgService from "../../../services/admin1/transaction-process-stock/departmentKgService.js";

export const createDepartmentKg = async (req, res) => {
  try {
    const record = await departmentKgService.createDepartmentKg(req.body);
    res.status(201).json({
      message: "Department KG created successfully",
      record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllDepartmentKgs = async (req, res) => {
  try {
    const records = await departmentKgService.getAllDepartmentKgs();
    res.status(200).json({
      message: "Department KGs retrieved successfully",
      records,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDepartmentKgById = async (req, res) => {
  try {
    const record = await departmentKgService.getDepartmentKgById(req.params.id);
    res.status(200).json({
      message: "Department KG retrieved successfully",
      record,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateDepartmentKg = async (req, res) => {
  try {
    const record = await departmentKgService.updateDepartmentKg(
      req.params.id,
      req.body
    );
    res.status(200).json({
      message: "Department KG updated successfully",
      record,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDepartmentKg = async (req, res) => {
  try {
    const result = await departmentKgService.deleteDepartmentKg(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentKgService.getDepartmentsFromCostMaster();
    res.status(200).json({
      message: "Departments retrieved successfully",
      departments,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDepartmentKgReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Both startDate and endDate query parameters are required (format: YYYY-MM-DD)",
      });
    }
    const report = await departmentKgService.getDepartmentKgReport(startDate, endDate);
    res.status(200).json({
      message: "Department KG report retrieved successfully",
      ...report,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};