import express from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getNextSupplierCodeController,
  bulkImportSuppliersController
} from "../../../controllers/admin1/master/supplierController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all supplier routes
router.use(protect);
router.get("/next-code", getNextSupplierCodeController);
router.post("/bulk-import", bulkImportSuppliersController);
router.post("/", createSupplier);
router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;