import express from "express";
import {
  createSimplexMachine,
  getAllSimplexMachines,
  getSimplexMachineById,
  updateSimplexMachine,
  deleteSimplexMachine,
} from "../../../controllers/admin2/master/simplexMachineController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createSimplexMachine);
router.get("/", getAllSimplexMachines);
router.get("/:id", getSimplexMachineById);
router.put("/:id", updateSimplexMachine);
router.delete("/:id", deleteSimplexMachine);

export default router;