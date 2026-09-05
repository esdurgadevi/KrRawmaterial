import express from "express";
import {
  createWastePacking,
  getAllWastePackings,
  getPackingDetailsReport,
  getTypeWisePackingReport,
  getStockAbstractReport,
  getClosingStockValueReport,
  getYearlyStockAbstractReport,
  getWastePackingById,
  updateWastePacking,
  deleteWastePacking,
  getNextPackingId,
  bulkImportWastePackings,
} from "../../../controllers/admin1/transaction-waste/wastePackingController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/", createWastePacking);
router.get("/", getAllWastePackings);
router.get("/next-id", getNextPackingId);
router.post("/bulk-import", bulkImportWastePackings);
// Report routes 
router.get("/report/packing-details", getPackingDetailsReport);
router.get("/report/type-wise", getTypeWisePackingReport);
router.get("/report/stock-abstract", getStockAbstractReport);
router.get("/report/closing-stock-value", getClosingStockValueReport);
router.get("/report/yearly-stock-abstract", getYearlyStockAbstractReport);
router.get("/:id", getWastePackingById);
router.put("/:id", updateWastePacking);
router.delete("/:id", deleteWastePacking);

export default router;
