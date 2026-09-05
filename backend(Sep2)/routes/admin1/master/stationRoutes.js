import express from "express";
import {
  createStation,
  getAllStations,
  getStationById,
  updateStation,
  deleteStation,
  getNextStationCodeController,
} from "../../../controllers/admin1/master/stationController.js";
import { protect } from "../../../middlewares/authMiddleware.js"; // Assuming this is the file name based on your structure

const router = express.Router();

// Protect all routes for security (authentication required)
// Can be extended with role-based access (e.g., admin only) for better scalability
router.use(protect);
router.get("/next-code", getNextStationCodeController);
router.post("/", createStation);
router.get("/", getAllStations);
router.get("/:id", getStationById);
router.put("/:id", updateStation);
router.delete("/:id", deleteStation);

export default router;