// routes/lotAllowanceRoutes.js
import express from "express";
import {
  createLotAllowance,
  getAllLotAllowances,
  getLotAllowanceById,
  updateLotAllowance,
  deleteLotAllowance,
  getNextAllowanceNo,
} from "../../../controllers/admin1/transaction-cotton/lotAllowanceController.js";
import { protect } from "../../../middlewares/authMiddleware.js";
// Optional: add role-based middleware if needed (admin, accountant, etc.)

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/", createLotAllowance);
router.get("/", getAllLotAllowances);
router.get("/next-no", getNextAllowanceNo);
router.get("/:id", getLotAllowanceById);
router.put("/:id", updateLotAllowance);
router.delete("/:id", deleteLotAllowance);

export default router;