import express from "express";
import {
  createWasteRate,
  getAllWasteRates,
  getWasteRateById,
  updateWasteRate,
  deleteWasteRate,
} from "../../../controllers/admin1/master/wasteRateController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createWasteRate);
router.get("/", getAllWasteRates);
router.get("/:id", getWasteRateById);
router.put("/:id", updateWasteRate);
router.delete("/:id", deleteWasteRate);

export default router;