import express from "express";
import { protect } from "../../../middlewares/authMiddleware.js";
import { generateQCCatalogReport, getQCDefinitions, getQCReportOptions } from "../../../controllers/admin2/transaction-qc/qcReportCatalogController.js";

const router = express.Router();

router.use(protect);
router.get("/definitions", getQCDefinitions);
router.get("/options/:source", getQCReportOptions);
router.get("/:reportId", generateQCCatalogReport);

export default router;
