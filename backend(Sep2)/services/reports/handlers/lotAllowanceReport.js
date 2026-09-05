import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { LotAllowance, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety } = db;

export const lotAllowanceReport = async ({ fromDate, toDate, title }) => {
  const rows = await LotAllowance.findAll({
    where: {
      allowanceDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      {
        model: InwardLot,
        as: "inwardLot",
        include: [
          {
            model: InwardEntry,
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
        ],
      },
    ],
    order: [["allowanceDate", "ASC"], ["id", "ASC"]],
  });

  let totalDebit = 0;
  let totalAllowance = 0;
  const normalizedRows = rows.map((record, index) => {
    totalDebit += Number(record.debitValue || 0);
    totalAllowance += Number(record.allowanceRate || 0);

    return {
    sNo: index + 1,
    allowanceNo: toText(record.allowanceNo),
    allowanceDate: formatDateDisplay(record.allowanceDate),
    lotNo: toText(record.inwardLot?.lotNo),
    supplier: toText(record.inwardLot?.InwardEntry?.purchaseOrder?.supplier?.accountName),
    variety: toText(record.inwardLot?.InwardEntry?.purchaseOrder?.variety?.variety),
    grossWeight: formatNumber(record.grossWeight, 3),
    netWeight: formatNumber(record.netWeight, 3),
    allowanceRate: formatCurrency(record.allowanceRate, 2),
    debitValue: formatCurrency(record.debitValue, 2),
    };
  });

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "allowanceNo", label: "Allowance No", width: 72 },
      { key: "allowanceDate", label: "Date", width: 58, align: "center" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "supplier", label: "Supplier", width: 108 },
      { key: "variety", label: "Variety", width: 78 },
      { key: "grossWeight", label: "Gross Wt", width: 64, align: "right" },
      { key: "netWeight", label: "Net Wt", width: 64, align: "right" },
      { key: "allowanceRate", label: "Allowance", width: 64, align: "right" },
      { key: "debitValue", label: "Debit", width: 64, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Debit": formatCurrency(totalDebit, 2),
      "Total Allowance": formatCurrency(totalAllowance, 2),
    },
  };
};
