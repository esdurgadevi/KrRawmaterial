import express from "express";
import {
  createWasteEntry,
  getAllWasteEntries,
  getWasteEntryById,
  updateWasteEntry,
  deleteWasteEntry,
  bulkImportWasteEntries,
} from "../../../controllers/admin1/transaction-waste/wasteEntryController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/bulk-import", bulkImportWasteEntries);
router.post("/", createWasteEntry);
router.get("/", getAllWasteEntries);
router.get("/:id", getWasteEntryById);
router.put("/:id", updateWasteEntry);
router.delete("/:id", deleteWasteEntry);

export default router;