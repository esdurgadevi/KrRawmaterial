import xlsx from "xlsx";
import path from "path";
import db from "../models/index.js";

const { Supplier, sequelize } = db;

async function updateSupplierCodes() {
  console.log("🚀 Starting Supplier Code Update & Ingestion Script...");

  try {
    await sequelize.authenticate();
    console.log("--------------------------------------------------");
    console.log("✅ MySQL Database Connected Successfully.");

    const excelPath = path.join(process.cwd(), "SUPPLIER IMPORT.xlsx");
    console.log(`📖 Reading Excel file from: ${excelPath}`);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${rows.length} rows in Excel sheet.`);

    const normalize = (name) => {
      if (!name) return "";
      return String(name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/['"“”\-\/\\\.]/g, "");
    };

    const existingSuppliers = await Supplier.findAll();
    console.log(`📦 Found ${existingSuppliers.length} existing suppliers in DB.`);

    const dbMap = new Map();
    existingSuppliers.forEach((s) => {
      if (s.accountName) {
        dbMap.set(normalize(s.accountName), s);
      }
    });

    let updatedCount = 0;
    let insertedCount = 0;

    for (const row of rows) {
      const code = String(row["Account Code"] || "").trim();
      const accountName = String(row["Account Name"] || "").trim();
      const group = String(row["Group"] || "").trim();
      const state = String(row["State"] || "").trim();
      const stateCode = row["State Code"] !== undefined ? String(row["State Code"]).trim() : "";

      if (!accountName || !code) continue;

      const normName = normalize(accountName);
      const existing = dbMap.get(normName);

      if (existing) {
        // Update code to 8-digit Excel code
        await existing.update({
          code: code,
          groupName: group || existing.groupName,
          state: state || existing.state,
          stateCode: stateCode || existing.stateCode,
        });
        updatedCount++;
      } else {
        // Insert new supplier entry
        const created = await Supplier.create({
          code: code,
          accountName: accountName,
          groupName: group || "Sundry Debtors",
          state: state || "Tamil Nadu",
          stateCode: stateCode || "33",
          status: true,
        });
        dbMap.set(normName, created);
        insertedCount++;
      }
    }

    console.log("--------------------------------------------------");
    console.log(`🎉 Supplier Sync Completed!`);
    console.log(`   - Updated Supplier Codes: ${updatedCount}`);
    console.log(`   - Inserted New Debtors/Suppliers: ${insertedCount}`);
    console.log("--------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Supplier Sync Failed:", error);
    process.exit(1);
  }
}

updateSupplierCodes();
