

import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
import express from "express";
import {
  createLocationTransfer,
  getAllLocationTransfers,
  getLocationTransferById,
  updateLocationTransfer,
  deleteLocationTransfer,
  getNextLocationNo,
  getAvailableBalesByLot
} from "../../../controllers/admin1/transaction-cotton/locationTransferController.js";



// CRUD
router.get("/next-no",getNextLocationNo);
router.get("/available-bales", getAvailableBalesByLot);
router.post("/", createLocationTransfer);
router.get("/", getAllLocationTransfers);
router.get("/:id", getLocationTransferById);
router.put("/:id", updateLocationTransfer);
router.delete("/:id", deleteLocationTransfer);

export default router;



