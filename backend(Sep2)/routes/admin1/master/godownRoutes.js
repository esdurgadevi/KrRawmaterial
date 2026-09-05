import express from "express";
import {
  createGodown,
  getAllGodowns,
  getGodownById,
  updateGodown,
  deleteGodown,
   getNextGodownCodeController
} from "../../../controllers/admin1/master/godownController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/next-code", getNextGodownCodeController);
router.post("/", createGodown);
router.get("/", getAllGodowns);
router.get("/:id", getGodownById);
router.put("/:id", updateGodown);
router.delete("/:id", deleteGodown);

export default router;