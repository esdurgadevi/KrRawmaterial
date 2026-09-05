import express from "express";
import {
  createQCEntry,
  getQCEntryByLot,
  updateQCEntry,
  deleteQCEntry,
  getAllQCEntries,
  getQCEntryById, // <-- import the new controller
} from "../../../controllers/admin2/transaction-qc/qcEntryController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createQCEntry);
router.get("/lot/:lotId", getQCEntryByLot);        // get QC by specific lot
router.get("/", getAllQCEntries);                  // get all QC entries
router.get("/:id", getQCEntryById);               // <-- new route to get QC entry by ID
router.put("/:id", updateQCEntry);
router.delete("/:id", deleteQCEntry);

export default router;
