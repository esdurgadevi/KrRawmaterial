import express from "express";
import {
  createDepartmentKg,
  getAllDepartmentKgs,
  getDepartmentKgById,
  updateDepartmentKg,
  deleteDepartmentKg,
  getDepartments,
  getDepartmentKgReport,
} from "../../../controllers/admin1/transaction-process-stock/departmentKgController.js";
import { protect } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/departments/list", getDepartments);
router.post("/", createDepartmentKg);
router.get("/", getAllDepartmentKgs);
router.get("/reports/department-kg", getDepartmentKgReport);  
router.get("/:id", getDepartmentKgById);
router.put("/:id", updateDepartmentKg);
router.delete("/:id", deleteDepartmentKg);

export default router;