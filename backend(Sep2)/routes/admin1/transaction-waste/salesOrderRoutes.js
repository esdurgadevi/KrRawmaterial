// routes/salesOrderRoutes.js
import express from "express";
import {
  createSalesOrder,
  getAllSalesOrders,
  getAvailableBales,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder,
  getNextSalesOrderNoController,
  bulkImportSalesOrders
} from "../../../controllers/admin1/transaction-waste/salesOrderController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/next-order-no", getNextSalesOrderNoController);
router.post("/bulk-import", bulkImportSalesOrders);
router.get("/:id/available-bales", getAvailableBales);
router.post("/", createSalesOrder);
router.get("/", getAllSalesOrders);
router.get("/:id", getSalesOrderById);
router.put("/:id", updateSalesOrder);
router.delete("/:id", deleteSalesOrder);

export default router;
