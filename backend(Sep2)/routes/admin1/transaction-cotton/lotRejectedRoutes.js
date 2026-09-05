import express from "express";
import {
  toggleLotRejected,
  getLotRejectedStatus,
  getAllRejectedLots,
} from "../../../controllers/admin1/transaction-cotton/lotRejectedController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Toggle rejection status (create/update)
router.post("/", toggleLotRejected);

// Get rejection status for one lot
router.get("/lot/:lotId", getLotRejectedStatus);

// Get all rejected lots
router.get("/", getAllRejectedLots);

export default router;