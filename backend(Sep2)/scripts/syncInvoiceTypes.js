import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import db from "../models/index.js";

const { WCInvoiceHead, WCInvoiceDetail, sequelize } = db;

async function syncInvoiceTypes() {
  console.log("🚀 Syncing Invoice Types Master from Excel to DB...");

  const transaction = await sequelize.transaction();
  try {
    const possiblePaths = [
      path.join(process.cwd(), "WCHead.xlsx"),
    ];

    const excelPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];
    console.log(`📖 Reading Excel file from: ${excelPath}`);
    const workbook = xlsx.readFile(excelPath);

    if (!workbook.Sheets["Invoice Types"]) {
      throw new Error("Sheet 'Invoice Types' not found in WCHead.xlsx");
    }

    const rows = xlsx.utils.sheet_to_json(workbook.Sheets["Invoice Types"]);
    console.log(`Found ${rows.length} rows in Invoice Types sheet.`);

    // 1. Safe truncate invoice type master tables
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;", { transaction });
    await sequelize.query("TRUNCATE TABLE `wc_invoice_details`;", { transaction });
    await sequelize.query("TRUNCATE TABLE `wc_invoice_heads`;", { transaction });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;", { transaction });

    // 2. Group formula rules by Invoice Type Name
    let count = 0;
    for (const row of rows) {
      const typeName = String(row["Invoice Type"] || "").trim();
      if (!typeName || typeName.toUpperCase() === "NULL") continue;

      const code = "INV-" + (count + 1).toString().padStart(3, "0");
      const head = await WCInvoiceHead.create(
        {
          name: typeName,
          code: code,
          status: true,
        },
        { transaction }
      );

      const detailRecords = [
        {
          wcInvoiceId: head.id,
          fieldName: "Assess Value",
          shortCode: "X",
          displayKey: "[X]",
          formula: String(row["Assess Formula"] || "-").trim(),
          sequence: 1,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Charity",
          shortCode: "A",
          displayKey: "[A]",
          formula: String(row["Charity Formula "] || "-").trim(),
          sequence: 2,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Tax [VAT]",
          shortCode: "B",
          displayKey: "[B]",
          formula: String(row["Tax Formula"] || row["GST Formula"] || "-").trim(),
          sequence: 3,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Duty",
          shortCode: "C",
          displayKey: "[C]",
          formula: String(row["Duty Formula"] || "-").trim(),
          sequence: 4,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Chess",
          shortCode: "D",
          displayKey: "[D]",
          formula: String(row["__EMPTY_4"] || "-").trim(),
          sequence: 5,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "H.S.Cess",
          shortCode: "E",
          displayKey: "[E]",
          formula: String(row["__EMPTY_1"] || "-").trim(),
          sequence: 6,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "TCS",
          shortCode: "F",
          displayKey: "[F]",
          formula: String(row["__EMPTY_7"] || "-").trim(),
          sequence: 7,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Others",
          shortCode: "G",
          displayKey: "[G]",
          formula: String(row["__EMPTY_10"] || "-").trim(),
          sequence: 8,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Sub Total",
          shortCode: "H",
          displayKey: "[H]",
          formula: String(row["Sub Total Forumla"] || "-").trim(),
          sequence: 9,
        },
        {
          wcInvoiceId: head.id,
          fieldName: "Total Value",
          shortCode: "I",
          displayKey: "[I]",
          formula: String(row["Total Value Formula"] || "-").trim(),
          sequence: 10,
        },
      ];

      await WCInvoiceDetail.bulkCreate(detailRecords, { transaction });
      count++;
    }

    await transaction.commit();
    console.log(`🎉 Successfully synced ${count} Waste Cotton Invoice Types to the database!`);
    process.exit(0);
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Sync failed:", err);
    process.exit(1);
  }
}

syncInvoiceTypes();
