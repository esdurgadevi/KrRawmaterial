import express from "express";
import { protect } from "../../../middlewares/authMiddleware.js";
import { generateCatalogReport, getDefinitions, getReportOptions } from "../../../controllers/admin1/transaction-cotton/cottonReportCatalogController.js";

const router = express.Router();
router.use(protect);
router.get("/definitions", getDefinitions);
router.get("/options/:source", getReportOptions);
router.get("/:reportId", generateCatalogReport);
export default router;
