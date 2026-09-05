import db from "../../../models/index.js";
import { Op } from "sequelize"; 

const { DepartmentKg } = db;

export const createDepartmentKg = async (data) => {
  if (!data.date || !data.department || data.kgs === undefined) {
    throw new Error("Date, department name, and kgs are required");
  }

  return await DepartmentKg.create({
    date: data.date,
    department: data.department.trim(),
    kgs: parseFloat(data.kgs),
  });
};

export const getAllDepartmentKgs = async () => {
  return await DepartmentKg.findAll({
    order: [["date", "DESC"]],
  });
};

export const getDepartmentKgById = async (id) => {
  const record = await DepartmentKg.findByPk(id);
  if (!record) {
    throw new Error("Department KG record not found");
  }
  return record;
};

export const updateDepartmentKg = async (id, data) => {
  const record = await DepartmentKg.findByPk(id);
  if (!record) {
    throw new Error("Department KG record not found");
  }

  const updateData = {};
  if (data.date) updateData.date = data.date;
  if (data.department) updateData.department = data.department.trim();
  if (data.kgs !== undefined) updateData.kgs = parseFloat(data.kgs);

  return await record.update(updateData);
};

export const deleteDepartmentKg = async (id) => {
  const record = await DepartmentKg.findByPk(id);
  if (!record) {
    throw new Error("Department KG record not found");
  }
  await record.destroy();
  return { message: "Department KG record deleted successfully" };
};

export const getDepartmentsFromCostMaster = async () => {
  const costMasters = await db.CostMaster.findAll({
    attributes: ['department'],
    order: [["department", "ASC"]],
    raw: true,
  });
  
  return costMasters.map(item => item.department);
};

export const getDepartmentKgReport = async (startDate, endDate) => {
  const records = await DepartmentKg.findAll({
    where: {
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [["date", "ASC"], ["id", "ASC"]],
  });
  
  // Detailed rows: id, date, department (Deptname), kgs
  const data = records.map(record => ({
    id: record.id,
    date: record.date,
    departmentName: record.department,
    kgs: record.kgs,
  }));
  
  // Also build department-wise summary
  const groupedData = {};
  let totalKg = 0;
  records.forEach(record => {
    if (!groupedData[record.department]) {
      groupedData[record.department] = { totalKg: 0, count: 0 };
    }
    groupedData[record.department].totalKg += parseFloat(record.kgs);
    groupedData[record.department].count += 1;
    totalKg += parseFloat(record.kgs);
  });
  const summary = Object.entries(groupedData).map(([department, info]) => ({
    departmentName: department,
    totalKg: info.totalKg,
    percentage: totalKg > 0 ? (info.totalKg / totalKg * 100) : 0,
    transactionCount: info.count
  }));
  
  return { data, summary };
};