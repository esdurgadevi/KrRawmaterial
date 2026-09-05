import express from "express";
import {
  createPackingType,
  getAllPackingTypes,
  getPackingTypeById,
  updatePackingType,
  deletePackingType,
  getNextPackingTypeCodeController
} from "../../../controllers/admin1/master/packingTypeController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes (authentication required)
router.use(protect);
router.get("/next-code", getNextPackingTypeCodeController);
router.post("/", createPackingType);
router.get("/", getAllPackingTypes);
router.get("/:id", getPackingTypeById);
router.put("/:id", updatePackingType);
router.delete("/:id", deletePackingType);

export default router;