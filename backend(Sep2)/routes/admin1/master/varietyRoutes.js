import express from "express";
import {
  createVariety,
  getAllVarieties,
  getVarietyById,
  updateVariety,
   getNextVarietyCodeController,
  deleteVariety,
} from "../../../controllers/admin1/master/varietyController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.get("/next-code", getNextVarietyCodeController);
router.post("/", createVariety);
router.get("/", getAllVarieties);
router.get("/:id", getVarietyById);
router.put("/:id", updateVariety);
router.delete("/:id", deleteVariety);

export default router;






