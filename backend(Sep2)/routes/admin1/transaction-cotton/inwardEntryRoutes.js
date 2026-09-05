import express from "express";
import {
  getNextInwardNo1,
  createInwardEntry,
  getAllInwardEntries,
  getInwardEntryById,
  updateInwardEntry,
  deleteInwardEntry,
} from "../../../controllers/admin1/transaction-cotton/inwardEntryController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/next-inward-no",getNextInwardNo1);
router.post("/", createInwardEntry);
router.get("/", getAllInwardEntries);
router.get("/:id", getInwardEntryById);
router.put("/:id", updateInwardEntry);
router.delete("/:id", deleteInwardEntry);

export default router;