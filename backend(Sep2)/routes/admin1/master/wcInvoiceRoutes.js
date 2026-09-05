import express from "express";
import {
  createWCInvoice,
  getAllWCInvoices,
  getWCInvoiceById,
  updateWCInvoice,
  deleteWCInvoice,
} from "../../../controllers/admin1/master/wcInvoiceController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createWCInvoice);
router.get("/", getAllWCInvoices);
router.get("/:id", getWCInvoiceById);
router.put("/:id", updateWCInvoice);
router.delete("/:id", deleteWCInvoice);

export default router;