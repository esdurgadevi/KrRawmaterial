// routes/inwardLotRoutes.js
import express from "express";
import {
  getNextLotNo1,
  createLot,
  getAllLots,
  getLot,
  updateLot,
  deleteLot,
} from "../../../controllers/admin1/transaction-cotton/inwardLotController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/next-lot-no", getNextLotNo1);
router.post("/", createLot);
router.get("/", getAllLots);
router.get("/:lotNo", getLot);
router.put("/:lotNo", updateLot);
router.delete("/:lotNo", deleteLot);

export default router;




