import express from "express";
import {
  createFinalInvoice,
  getAllFinalInvoices,
  getFinalInvoiceById,
  updateFinalInvoice,
  deleteFinalInvoice,
   getNextVoucherNo1
} from "../../../controllers/admin1/transaction-cotton/finalInvoiceController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/next-voucher", getNextVoucherNo1);
router.post("/", createFinalInvoice);
router.get("/", getAllFinalInvoices);
router.get("/:id", getFinalInvoiceById);
router.put("/:id", updateFinalInvoice);
router.delete("/:id", deleteFinalInvoice);

export default router;