import express from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  deleteIssue,
  getNextIssueNo,
  updateIssue,
  getDailyIssueReport
} from "../../../controllers/admin1/transaction-cotton/issueController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/report/daily", getDailyIssueReport);
router.get("/next-issue-no", getNextIssueNo);
router.post("/", createIssue);
router.get("/", getAllIssues);
router.get("/:id", getIssueById);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);
export default router;
