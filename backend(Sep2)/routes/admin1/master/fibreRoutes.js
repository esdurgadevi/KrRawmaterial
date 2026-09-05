import express from "express";
import {
  createFibre,
  getAllFibres,
  getFibreById,
  updateFibre,
  deleteFibre,
  getNextFibreCodeController
} from "../../../controllers/admin1/master/fibreController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.get("/next-code", getNextFibreCodeController);
router.post("/", createFibre);
router.get("/", getAllFibres);
router.get("/:id", getFibreById);
router.put("/:id", updateFibre);
router.delete("/:id", deleteFibre);

export default router;