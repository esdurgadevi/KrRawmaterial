import xlsx from "xlsx";
import path from "path";
import fileURLToPath from "url";
import db from "../models/index.js";

const { WasteMaster, PackingType, sequelize } = db;

async function importWasteMasters() {
  console.log("🚀 Starting Waste Master Excel Migration Script...");

  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected.");

    // 1. Fetch existing PackingTypes and build lookup maps
    const existingPackingTypes = await PackingType.findAll();
    const packingTypeByName = new Map();
    const packingTypeById = new Map();

    existingPackingTypes.forEach((pt) => {
      packingTypeByName.set(pt.name.trim().toUpperCase(), pt.id);
      packingTypeById.set(pt.id, pt.id);
    });

    // Helper to resolve or auto-create packing types dynamically
    const resolvePackingTypeId = async (val) => {
      if (!val) return packingTypeByName.get("BALE") || 1;
      const str = String(val).trim().toUpperCase();

      const numId = parseInt(str, 10);
      if (!isNaN(numId) && packingTypeById.has(numId)) {
        return numId;
      }

      if (packingTypeByName.has(str)) {
        return packingTypeByName.get(str);
      }

      if (str === "BAGS" && packingTypeByName.has("BAGS")) {
        return packingTypeByName.get("BAGS");
      }

      // Auto-create missing packing type with next available code
      const allIds = Array.from(packingTypeById.keys());
      const nextCode = (allIds.length > 0 ? Math.max(...allIds) : 0) + 1;

      const created = await PackingType.create({
        code: nextCode,
        name: str,
        tareWeight: "0.00",
        rate: "0.00",
      });

      packingTypeByName.set(str, created.id);
      packingTypeById.set(created.id, created.id);
      return created.id;
    };

    // 2. Read spreadsheet file
    const excelPath = "/home/darika-sivakumar/ERP/WASTE IMPORT (2).xlsx";
    console.log(`📖 Reading Excel file from: ${excelPath}`);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON array of objects or rows
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length < 2) {
      console.log("⚠️ No data rows found in Excel sheet.");
      process.exit(0);
    }

    // Header row: ['Department', 'Waste Name', 'Packing Type', 'Waste Weight (Kg)', 'HSN Code']
    const dataRows = rows.slice(1).filter((r) => r && r[0] && r[1]); // Filter valid non-empty rows
    console.log(`Found ${dataRows.length} valid data rows in Excel sheet.`);

    // 3. Check existing WasteMaster rows to start code sequence after maxCode (starting from 12)
    const existingMasters = await WasteMaster.findAll({ raw: true });
    let maxCode = existingMasters.reduce((max, r) => Math.max(max, Number(r.code) || 0), 0);
    let nextCode = Math.max(maxCode + 1, 12);
    console.log(`Starting new auto-generated code sequence at: ${nextCode}`);

    // Map existing composite keys (DEPARTMENT + WASTE) for duplicate prevention
    const existingKeys = new Set(
      existingMasters.map((m) => `${m.department.trim().toUpperCase()}__${m.waste.trim().toUpperCase()}`)
    );

    const recordsToInsert = [];
    let skippedCount = 0;

    for (const row of dataRows) {
      const department = String(row[0] || "").trim();
      const waste = String(row[1] || "").trim();
      const rawPacking = row[2];
      const wasteKg = parseFloat(row[3]) || 0;
      const hsnCode = row[4] ? String(row[4]).trim() : "52021000";

      const key = `${department.toUpperCase()}__${waste.toUpperCase()}`;
      if (existingKeys.has(key)) {
        skippedCount++;
        continue;
      }

      const packingTypeId = await resolvePackingTypeId(rawPacking);

      recordsToInsert.push({
        code: nextCode,
        department,
        waste,
        packingTypeId,
        wasteKg,
        hsnCode,
        packingPreWeightment: false,
      });

      existingKeys.add(key);
      nextCode++;
    }

    console.log(`Records to insert: ${recordsToInsert.length}, Skipped existing duplicates: ${skippedCount}`);

    if (recordsToInsert.length > 0) {
      await WasteMaster.bulkCreate(recordsToInsert);
      console.log(`🎉 Successfully imported ${recordsToInsert.length} WasteMaster records into database!`);
    } else {
      console.log("ℹ️ No new records to insert.");
    }

    // Verify final count in database
    const finalCount = await WasteMaster.count();
    console.log(`✅ Total WasteMaster records in database: ${finalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Waste Master import failed:", err);
    process.exit(1);
  }
}

importWasteMasters();
