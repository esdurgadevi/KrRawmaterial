import express from "express";
import {
  createMixing,
  getAllMixings,
  getMixingById,
  updateMixing,
   getNextMixingCodeController,
  deleteMixing,
} from "../../../controllers/admin1/master/mixingController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.get("/next-code", getNextMixingCodeController);
router.post("/", createMixing);
router.get("/", getAllMixings);
router.get("/:id", getMixingById);
router.put("/:id", updateMixing);
router.delete("/:id", deleteMixing);

export default router;