// routes/admin1/master/lotTestResultRoutes.js
import express from "express";
import {
  createLotTestResult,
  getAllLotTestResults,
  getLotTestResultById,
  updateLotTestResult,
  deleteLotTestResult,
} from "../../../controllers/admin1/transaction-cotton/lotTestResultController.js";

import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// ================= ROUTES =================

// Create a new Lot Test Result
router.post("/", protect, createLotTestResult);

// Get all Lot Test Results
router.get("/", protect, getAllLotTestResults);

// Get a Lot Test Result by ID
router.get("/:id", protect, getLotTestResultById);

// Update a Lot Test Result by ID
router.put("/:id", protect, updateLotTestResult);

// Delete a Lot Test Result by ID
router.delete("/:id", protect, deleteLotTestResult);

export default router;