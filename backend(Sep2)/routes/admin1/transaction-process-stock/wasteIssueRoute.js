import express from "express";
import {
  createWasteIssue,
  getAllWasteIssues,
  getWasteIssueById,
  updateWasteIssue,
  deleteWasteIssue,
  getWasteIssueReport,
} from "../../../controllers/admin1/transaction-process-stock/wasteIssueController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/", createWasteIssue);
router.get("/", getAllWasteIssues);
router.get("/reports/waste-issue", getWasteIssueReport);
router.get("/:id", getWasteIssueById);
router.put("/:id", updateWasteIssue);
router.delete("/:id", deleteWasteIssue);


export default router;