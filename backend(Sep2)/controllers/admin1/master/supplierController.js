import * as supplierService from "../../../services/admin1/master/supplierService.js";
import { getNextSupplierCode } from "../../../utils/helpers.js";

export const getNextSupplierCodeController = async (req, res) => {
  try {
    const nextCode = await getNextSupplierCode();
    res.status(200).json({ nextCode });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate supplier code",
      error: error.message,
    });
  }
};
export const createSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.status(200).json({
      message: "Suppliers retrieved successfully",
      suppliers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    res.status(200).json({
      message: "Supplier retrieved successfully",
      supplier,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json({
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    await supplierService.deleteSupplier(req.params.id);
    res.status(200).json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const bulkImportSuppliersController = async (req, res) => {
  try {
    const items = req.body.items || req.body;
    const result = await supplierService.bulkImportSuppliers(items);
    res.status(200).json({
      message: `Successfully imported ${result.importedCount} suppliers (${result.skippedCount} skipped as duplicates)`,
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};