import express from "express";
import {
  createCountwiseClosing,
  getAllCountwiseClosing,
  getCountwiseClosingById,
  updateCountwiseClosing,
  deleteCountwiseClosing,
  getProducts,
  getCountwiseClosingReport,        // ← ADD THIS
  getProductStockReport,  
} from "../../../controllers/admin1/transaction-process-stock/countwiseClosingController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/products/list", getProducts);
router.get("/reports/countwise-closing", getCountwiseClosingReport);
router.get("/reports/product-stock", getProductStockReport);
router.post("/", createCountwiseClosing);
router.get("/", getAllCountwiseClosing);
router.get("/:id", getCountwiseClosingById);
router.put("/:id", updateCountwiseClosing);
router.delete("/:id", deleteCountwiseClosing);

export default router;