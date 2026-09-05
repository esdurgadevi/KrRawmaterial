import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety, Godown, LotTestResult } = db;

export const inwardInterstateReport = async ({ fromDate, toDate, title }) => {
  const rows = await InwardLot.findAll({
    where: {
      lotDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      {
        model: InwardEntry,
        attributes: ["inwardNo", "type"], // "type" is Upcountry/Local
        include: [
          {
            model: PurchaseOrder,
            as: "purchaseOrder",
            include: [
              { model: Supplier, as: "supplier", attributes: ["accountName"] },
              { model: Variety, as: "variety", attributes: ["variety"] },
            ],
          },
        ],
      },
      { model: Godown, as: "godown", attributes: ["godownName"] },
      { model: LotTestResult, as: "testResult" } // To get testing data
    ],
    order: [["lotDate", "ASC"], ["id", "ASC"]],
  });

  const typeGroups = new Map();
  
  rows.forEach(record => {
    const typeVal = record.InwardEntry?.type || "Unknown Type";
    if (!typeGroups.has(typeVal)) {
      typeGroups.set(typeVal, []);
    }
    typeGroups.get(typeVal).push(record);
  });

  const flattenedRows = [];
  let grandTotalWeight = 0;
  
  for (const [typeVal, lotGroup] of typeGroups.entries()) {
    flattenedRows.push({
      isSubHeader: true,
      subHeaderText: typeVal // e.g. "UPCOUNTRY", "LOCAL"
    });

    let sNo = 1;
    let typeTotalWeight = 0;

    for (const record of lotGroup) {
      const weight = Number(record.nettWeight || 0);
      flattenedRows.push({
        sNo: sNo++,
        lotNo: toText(record.lotNo),
        lotDate: formatDateDisplay(record.lotDate),
        supplier: toText(record.InwardEntry?.purchaseOrder?.supplier?.accountName),
        variety: toText(record.InwardEntry?.purchaseOrder?.variety?.variety),
        weight: formatNumber(weight, 3),
        moist: formatNumber(record.testResult?.moist, 2),
        rd: formatNumber(record.testResult?.rd, 2),
        staple: formatNumber(record.testResult?.staple, 2),
      });
      typeTotalWeight += weight;
    }
    
    flattenedRows.push({
      isSubtotal: true,
      sNo: "",
      lotNo: "",
      lotDate: "",
      supplier: "",
      variety: "",
      weight: formatNumber(typeTotalWeight, 3),
      moist: "",
      rd: "",
      staple: ""
    });
    
    grandTotalWeight += typeTotalWeight;
  }

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "lotDate", label: "Lot Date", width: 60, align: "center" },
      { key: "supplier", label: "Supplier", width: 110 },
      { key: "variety", label: "Variety", width: 80 },
      { key: "weight", label: "Nett Weight", width: 60, align: "right" },
      { key: "moist", label: "Moist %", width: 50, align: "right" },
      { key: "rd", label: "RD", width: 44, align: "right" },
      { key: "staple", label: "Staple", width: 50, align: "right" },
    ],
    rows: flattenedRows,
    totals: {
      "Total Weight": formatNumber(grandTotalWeight, 3),
    },
  };
};
