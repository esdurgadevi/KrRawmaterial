import express from "express";
import {
  createWasteMaster,
  getAllWasteMasters,
  getWasteMasterById,
  updateWasteMaster,
  deleteWasteMaster,
  getNextWasteMasterCodeController,
  bulkImportWasteMasters
} from "../../../controllers/admin1/master/wasteMasterController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.get("/next-code", getNextWasteMasterCodeController);
router.post("/bulk-import", bulkImportWasteMasters);
router.post("/", createWasteMaster);
router.get("/", getAllWasteMasters);
router.get("/:id", getWasteMasterById);
router.put("/:id", updateWasteMaster);
router.delete("/:id", deleteWasteMaster);

export default router;