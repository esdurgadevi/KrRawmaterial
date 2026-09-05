import express from "express";
import {
  createSpinningCount,
  getAllSpinningCounts,
  getSpinningCountById,
  updateSpinningCount,
  deleteSpinningCount,
} from "../../../controllers/admin2/master/spinningCountController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createSpinningCount);
router.get("/", getAllSpinningCounts);
router.get("/:id", getSpinningCountById);
router.put("/:id", updateSpinningCount);
router.delete("/:id", deleteSpinningCount);

export default router;