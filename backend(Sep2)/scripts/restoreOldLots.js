import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import db from "../models/index.js";

const { WasteLot, WasteMaster, sequelize } = db;

function normalize(name) {
  let str = String(name || "").trim();
  str = str.replace(/\s+/g, " ").toLowerCase();
  if (str === "lickerin fly") return "lickerinfly";
  if (str === "micro dust 1") return "microdust 1";
  if (str === "micro dust 2") return "microdust 2";
  if (str === "sweeping waste") return "sweepings";

  // Specific spacing/character fixes
  str = str.replace("spls. no.", "spls.no.");
  str = str.replace("spls.m/c.no.", "spls.m/c. no.");
  return str;
}

async function restoreOldLots() {
  console.log("🚀 Starting Waste Lot Restore Script (Node.js)...");

  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected.");

    // 1. Fetch current WasteMasters from DB
    const wasteMasters = await WasteMaster.findAll();
    const nameToId = new Map();

    wasteMasters.forEach((wm) => {
      nameToId.set(wm.waste.trim().toLowerCase(), wm.id);
    });

    console.log(`Loaded ${nameToId.size} waste masters from database.`);

    const possiblePaths = [
      path.join(process.cwd(), "raw waste lot no.xlsx"),
      path.join(process.cwd(), "..", "raw waste lot no.xlsx"),
      "/home/darika-sivakumar/ERP/raw waste lot no.xlsx",
      process.env.EXCEL_LOTS_PATH,
    ].filter(Boolean);

    const excelPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];
    console.log(`📖 Reading lots from: ${excelPath}`);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to rows
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length < 4) {
      console.log("⚠️ No data rows found in Excel sheet.");
      process.exit(0);
    }

    // 3. Clear existing lots table safely
    console.log("🧹 Truncating waste_lots table...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.query("TRUNCATE TABLE `waste_lots`;");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("✅ Truncated waste_lots.");

    const recordsToInsert = [];
    const unmapped = [];

    // Rows start from index 3 (first 3 lines are headers and empty rows)
    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row[0] === undefined || row[1] === undefined) {
        continue;
      }

      const lotNo = String(row[0]).trim();
      const wasteName = String(row[1]).trim();
      const isActive = row[2] === true || row[2] === 1 || row[2] === "TRUE" || row[2] === "true";

      const normName = normalize(wasteName);
      let masterId = null;

      // Match logic
      if (nameToId.has(wasteName.toLowerCase())) {
        masterId = nameToId.get(wasteName.toLowerCase());
      } else if (nameToId.has(normName)) {
        masterId = nameToId.get(normName);
      } else {
        // Fuzzy match
        for (const [kname, kid] of nameToId.entries()) {
          const normKname = normalize(kname);
          if (normName === normKname || normName.includes(normKname) || normKname.includes(normName)) {
            masterId = kid;
            break;
          }
        }
      }

      if (masterId !== null) {
        recordsToInsert.push({
          lotNo: lotNo,
          wasteMasterId: masterId,
          active: isActive,
        });
      } else {
        unmapped.push({ lotNo, wasteName });
      }
    }

    if (unmapped.length > 0) {
      console.error(`\n❌ CRITICAL MAPPING ERROR: ${unmapped.length} lots could not be mapped:`);
      unmapped.forEach((u) => {
        console.error(`  Lot ${u.lotNo} -> '${u.wasteName}'`);
      });
      process.exit(1);
    }

    // 4. Bulk insert into DB
    if (recordsToInsert.length > 0) {
      await WasteLot.bulkCreate(recordsToInsert);
      console.log(`\n🎉 Successfully restored ${recordsToInsert.length} Waste Lots!`);
    } else {
      console.log("⚠️ No records to insert.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Restore failed:", err);
    process.exit(1);
  }
}

restoreOldLots();
