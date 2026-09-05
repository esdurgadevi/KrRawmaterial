import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { InwardEntry, PurchaseOrder, Supplier, Variety, Godown } = db;

export const gateInwardReport = async ({ fromDate, toDate, title }) => {
  const rows = await InwardEntry.findAll({
    where: {
      inwardDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    attributes: ["inwardNo", "inwardDate", "Qty", "grossWeight", "freight", "candyRate"],
    include: [
      {
        model: PurchaseOrder,
        as: "purchaseOrder",
        attributes: ["orderNo"],
        include: [
          { model: Supplier, as: "supplier", attributes: ["accountName"] },
          { model: Variety, as: "variety", attributes: ["variety"] },
        ],
      },
      { model: Godown, as: "godown", attributes: ["godownName"] },
    ],
    order: [["inwardDate", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = rows.map((record, index) => ({
    sNo: index + 1,
    inwardNo: toText(record.inwardNo),
    inwardDate: formatDateDisplay(record.inwardDate),
    purchaseOrderNo: toText(record.purchaseOrder?.orderNo),
    supplier: toText(record.purchaseOrder?.supplier?.accountName),
    variety: toText(record.purchaseOrder?.variety?.variety),
    godown: toText(record.godown?.godownName),
    quantity: formatNumber(record.Qty, 0),
    grossWeight: formatNumber(record.grossWeight, 3),
    freight: formatCurrency(record.freight, 2),
  }));

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "inwardNo", label: "Gate Inward No", width: 80 },
      { key: "inwardDate", label: "Date", width: 58, align: "center" },
      { key: "purchaseOrderNo", label: "Purchase Order No", width: 72 },
      { key: "supplier", label: "Supplier", width: 110 },
      { key: "variety", label: "Variety", width: 78 },
      { key: "godown", label: "Godown", width: 90 },
      { key: "quantity", label: "Qty", width: 44, align: "right" },
      { key: "grossWeight", label: "Gross Wt", width: 66, align: "right" },
      { key: "freight", label: "Freight", width: 58, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Qty": formatNumber(rows.reduce((sum, row) => sum + Number(row.Qty || 0), 0), 0),
      "Total Gross Weight": formatNumber(rows.reduce((sum, row) => sum + Number(row.grossWeight || 0), 0), 3),
      "Total Freight": formatCurrency(rows.reduce((sum, row) => sum + Number(row.freight || 0), 0), 2),
    },
  };
};