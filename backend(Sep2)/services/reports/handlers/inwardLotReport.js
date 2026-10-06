import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { InwardLot, InwardLotWeightment, IssueItem, Issue, InwardEntry, PurchaseOrder, Supplier, Variety } = db;

/**
 * Inward Lot Report
 * - All lots from lots table (with their qty)
 * - For each lot: how many bales issued + total weight issued in the date range
 */
export const inwardLotReport = async ({ fromDate, toDate, title }) => {

  // Step 1: All lots with their weightments
  const lots = await InwardLot.findAll({
    attributes: ["id", "lotNo", "lotDate", "qty", "nettWeight"],
    include: [
      {
        model: InwardLotWeightment,
        as: "weightments",
        attributes: ["id", "baleWeight"],
      },
      {
        model: InwardEntry,
        as: "InwardEntry",
        attributes: ["inwardNo"],
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
        ],
      },
    ],
    order: [["lotNo", "ASC"]],
  });

  // Step 2: All issue items whose issue date is in range
  const issueItemsInRange = await IssueItem.findAll({
    attributes: ["id", "weightmentId", "issueWeight"],
    include: [
      {
        model: Issue,
        attributes: ["issueDate"],
        where: { issueDate: { [Op.between]: [fromDate, toDate] } },
        required: true,
      },
    ],
  });

  // Map: weightmentId → total issued weight in range
  const issueMap = new Map();
  issueItemsInRange.forEach((item) => {
    const prev = issueMap.get(item.weightmentId) || 0;
    issueMap.set(item.weightmentId, prev + Number(item.issueWeight || 0));
  });

  // Step 3: Build rows
  const rows = [];
  let grandQty = 0, grandIssuedBales = 0, grandIssuedWeight = 0;

  lots.forEach((lot, i) => {
    const d = lot.toJSON();
    const weightments = d.weightments || [];

    let issuedBales = 0;
    let issuedWeight = 0;
    weightments.forEach((w) => {
      if (issueMap.has(w.id)) {
        issuedBales += 1;
        issuedWeight += issueMap.get(w.id);
      }
    });

    const totalQty = d.qty || weightments.length;
    grandQty += totalQty;
    grandIssuedBales += issuedBales;
    grandIssuedWeight += issuedWeight;

    rows.push({
      sNo: i + 1,
      lotNo: toText(d.lotNo),
      lotDate: formatDateDisplay(d.lotDate),
      supplier: toText(d.InwardEntry?.purchaseOrder?.supplier?.accountName),
      variety: toText(d.InwardEntry?.purchaseOrder?.variety?.variety),
      totalQty: formatNumber(totalQty, 0),
      issuedBales: issuedBales > 0 ? formatNumber(issuedBales, 0) : "-",
      issuedWeight: issuedWeight > 0 ? formatNumber(issuedWeight, 3) : "-",
    });
  });

  return {
    reportTitle: title,
    columns: [
      { key: "sNo",          label: "S.No",         align: "right" },
      { key: "lotNo",        label: "Lot No" },
      { key: "lotDate",      label: "Lot Date",      align: "center" },
      { key: "supplier",     label: "Supplier" },
      { key: "variety",      label: "Variety" },
      { key: "totalQty",     label: "Inward Qty",    align: "right" },
      { key: "issuedBales",  label: "Issued Qty",    align: "right" },
      { key: "issuedWeight", label: "Issued Wt (Kg)",align: "right" },
    ],
    rows,
    totals: {
      totalQty:     formatNumber(grandQty, 0),
      issuedBales:  formatNumber(grandIssuedBales, 0),
      issuedWeight: formatNumber(grandIssuedWeight, 3),
    },
  };
};