import express from "express";
import {
  createMixingGroup,
  getAllMixingGroups,
  getMixingGroupById,
  updateMixingGroup,
  deleteMixingGroup,
  getNextMixingCodeController,
} from "../../../controllers/admin1/master/mixingGroupController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// All routes protected (you can later add role-based middleware e.g. admin only)
router.use(protect);
router.get("/next-code", getNextMixingCodeController);
router.post("/", createMixingGroup);
router.get("/", getAllMixingGroups);
router.get("/:id", getMixingGroupById);
router.put("/:id", updateMixingGroup);
router.delete("/:id", deleteMixingGroup);

export default router;