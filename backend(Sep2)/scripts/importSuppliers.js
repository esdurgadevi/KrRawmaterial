import xlsx from "xlsx";
import path from "path";
import db from "../models/index.js";

const { Supplier, sequelize } = db;

async function importSuppliers() {
  console.log("🚀 Starting Supplier Excel Migration Script...");

  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected.");

    // 1. Read spreadsheet file
    const excelPath = "/home/darika-sivakumar/ERP/SUPPLIER IMPORT.xlsx";
    console.log(`📖 Reading Excel file from: ${excelPath}`);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0]; // Sheet1
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to array of rows
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows || rows.length < 3) {
      console.log("⚠️ No valid data rows found in Excel sheet.");
      process.exit(0);
    }

    // Row 1 is header: [None, 'Party Name', 'Place', 'Phone No.', 'Email Id', 'Fax No.']
    const dataRows = rows.slice(2).filter((r) => {
      if (!r || !Array.isArray(r)) return false;
      const partyName = r[1] ? String(r[1]).trim() : "";
      return partyName !== "" && partyName.toLowerCase() !== "party name";
    });

    console.log(`Found ${dataRows.length} valid supplier data rows in Excel sheet.`);

    // 2. Check existing Supplier rows to start code sequence after maxCode (starting from 33)
    const existingSuppliers = await Supplier.findAll({ raw: true });
    let maxCode = existingSuppliers.reduce((max, r) => {
      const num = parseInt(r.code, 10);
      return !isNaN(num) ? Math.max(max, num) : max;
    }, 0);

    let nextCodeNum = Math.max(maxCode + 1, 33);
    console.log(`Starting new auto-generated supplier code sequence at: ${nextCodeNum}`);

    // Map existing account names for duplicate prevention
    const existingNames = new Set(
      existingSuppliers.map((s) => s.accountName.trim().toUpperCase())
    );

    const recordsToInsert = [];
    let skippedCount = 0;

    for (const row of dataRows) {
      const partyName = String(row[1] || "").trim().slice(0, 150);
      const place = String(row[2] || "").trim().slice(0, 100) || "N/A";
      
      let rawPhone = row[3] ? String(row[3]).trim() : "";
      let rawEmail = row[4] ? String(row[4]).trim() : "";
      let rawFax = row[5] ? String(row[5]).trim() : "";

      // Smart detect if email was placed in phone column
      let phoneNo = rawPhone !== "-" ? rawPhone : "";
      let email = rawEmail !== "-" ? rawEmail : null;
      let fax = rawFax !== "-" ? rawFax : "";

      if (phoneNo.includes("@") && !email) {
        email = phoneNo;
        phoneNo = "";
      }

      if (email && (!email.includes("@") || email === "-")) {
        email = null;
      }

      const key = partyName.toUpperCase();
      if (existingNames.has(key)) {
        skippedCount++;
        continue;
      }

      recordsToInsert.push({
        code: String(nextCodeNum),
        accountGroup: "Creditars_cotton",
        accountName: partyName,
        place: place,
        address: null,
        deliveryAddress: null,
        pincode: "0",
        stateId: null,
        tinNo: null,
        cstNo: null,
        gstNo: null,
        phoneNo: phoneNo ? phoneNo.slice(0, 20) : null,
        cellNo: null,
        email: email ? email.slice(0, 150) : null,
        website: null,
        contactPerson: null,
        fax: fax ? fax.slice(0, 50) : null,
        accountNo: null,
        openingCredit: 0.00,
        openingDebit: 0.00,
      });

      existingNames.add(key);
      nextCodeNum++;
    }

    console.log(`Records to insert: ${recordsToInsert.length}, Skipped existing duplicates: ${skippedCount}`);

    if (recordsToInsert.length > 0) {
      await Supplier.bulkCreate(recordsToInsert);
      console.log(`🎉 Successfully imported ${recordsToInsert.length} Supplier records into database!`);
    } else {
      console.log("ℹ️ No new records to insert.");
    }

    // Verify final count in database
    const finalCount = await Supplier.count();
    console.log(`✅ Total Supplier records in database: ${finalCount}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Supplier import failed:", err);
    process.exit(1);
  }
}

importSuppliers();
