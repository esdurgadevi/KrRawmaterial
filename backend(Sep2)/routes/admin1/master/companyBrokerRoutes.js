import express from "express";
import {
  createCompanyBroker,
  getAllCompanyBrokers,
  getCompanyBrokerById,
  updateCompanyBroker,
  deleteCompanyBroker,
  getNextCompanyBrokerCodeController
} from "../../../controllers/admin1/master/companyBrokerController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.get("/next-code", getNextCompanyBrokerCodeController);
router.post("/", createCompanyBroker);
router.get("/", getAllCompanyBrokers);
router.get("/:id", getCompanyBrokerById);
router.put("/:id", updateCompanyBroker);
router.delete("/:id", deleteCompanyBroker);

export default router;