import express from "express";
import {
  createCommodity,
  getAllCommodities,
  getCommodityById,
  updateCommodity,
  deleteCommodity,
  getNextCommodityCodeController,
} from "../../../controllers/admin1/master/commodityController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected
router.get("/next-code", getNextCommodityCodeController);
router.post("/", createCommodity);
router.get("/", getAllCommodities);
router.get("/:id", getCommodityById);
router.put("/:id", updateCommodity);
router.delete("/:id", deleteCommodity);

export default router;