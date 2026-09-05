import express from "express";
import {
  createCostMaster,
  getAllCostMasters,
  getCostMasterById,
  updateCostMaster,
  deleteCostMaster,
} from "../../../controllers/admin1/master/costMasterController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes (authentication required)
router.use(protect);

router.post("/", createCostMaster);
router.get("/", getAllCostMasters);
router.get("/:id", getCostMasterById);
router.put("/:id", updateCostMaster);
router.delete("/:id", deleteCostMaster);

export default router;