import express from "express";
import {
  createBroker,
  getAllBrokers,
  getBrokerById,
  updateBroker,
  deleteBroker,
  getNextBrokerCodeController
} from "../../../controllers/admin1/master/brokerController.js"
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/next-code", getNextBrokerCodeController);
router.post("/", createBroker);
router.get("/", getAllBrokers);
router.get("/:id", getBrokerById);
router.put("/:id", updateBroker);
router.delete("/:id", deleteBroker);


export default router;