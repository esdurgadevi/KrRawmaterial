import express from "express";
import {
  createTransport,
  getAllTransports,
  getTransportById,
  updateTransport,
  deleteTransport,
  getNextTransportCodeController,
} from "../../../controllers/admin1/master/transportController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected
router.get("/next-code", getNextTransportCodeController);
router.post("/", createTransport);
router.get("/", getAllTransports);
router.get("/:id", getTransportById);
router.put("/:id", updateTransport);
router.delete("/:id", deleteTransport);

export default router;