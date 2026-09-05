import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { FinalInvoiceHead, FinalInvoiceDetail, PurchaseOrder, Supplier } = db;

export const finalInvoiceReport = async ({ fromDate, toDate, title }) => {
  const rows = await FinalInvoiceHead.findAll({
    where: {
      invoiceDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      {
        model: FinalInvoiceDetail,
        as: "details",
        include: [
          {
            model: db.InwardLot,
            as: "lot",
            include: [
              {
                model: db.InwardEntry,
                include: [
                  {
                    model: PurchaseOrder,
                    as: "purchaseOrder",
                    include: [{ model: Supplier, as: "supplier", attributes: ["accountName"] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [["invoiceDate", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = [];
  let totalQty = 0;
  let totalWeight = 0;
  let totalAmount = 0;

  rows.forEach((invoice) => {
    (invoice.details || []).forEach((detail) => {
      totalQty += Number(detail.quantity || 0);
      totalWeight += Number(detail.weight || 0);
      totalAmount += Number(detail.assessValue || 0);
      normalizedRows.push({
        sNo: normalizedRows.length + 1,
        voucherNo: toText(invoice.voucherNo),
        invoiceDate: formatDateDisplay(invoice.invoiceDate),
        lotNo: toText(detail.lotNo || detail.lot?.lotNo),
        supplier: toText(detail.partyName || detail.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName),
        quantity: formatNumber(detail.quantity, 0),
        weight: formatNumber(detail.weight, 3),
        rateKg: formatCurrency(detail.rateKg, 4),
        assessValue: formatCurrency(detail.assessValue, 2),
      });
    });
  });

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "voucherNo", label: "Invoice No", width: 74 },
      { key: "invoiceDate", label: "Date", width: 58, align: "center" },
      { key: "lotNo", label: "Lot Number", width: 80 },
      { key: "supplier", label: "Supplier", width: 120 },
      { key: "quantity", label: "Qty", width: 46, align: "right" },
      { key: "weight", label: "Weight", width: 60, align: "right" },
      { key: "rateKg", label: "Rate/Kg", width: 60, align: "right" },
      { key: "assessValue", label: "Amount", width: 72, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Qty": formatNumber(totalQty, 0),
      "Total Weight": formatNumber(totalWeight, 3),
      "Total Amount": formatCurrency(totalAmount, 2),
    },
  };
};

export const cottonInvoiceNoWiseReport = async ({ fromDate, toDate, title }) => {
  const rows = await FinalInvoiceHead.findAll({
    where: {
      invoiceDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      {
        model: FinalInvoiceDetail,
        as: "details",
        include: [
          {
            model: db.InwardLot,
            as: "lot",
            include: [
              {
                model: db.InwardEntry,
                include: [
                  {
                    model: PurchaseOrder,
                    as: "purchaseOrder",
                    include: [{ model: Supplier, as: "supplier", attributes: ["accountName"] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    order: [["invoiceDate", "ASC"], ["voucherNo", "ASC"]],
  });

  const invoiceGroups = new Map();

  rows.forEach((invoice) => {
    const invNo = toText(invoice.voucherNo) || "Unknown";
    if (!invoiceGroups.has(invNo)) {
      const supplierName = toText(
        invoice.details?.[0]?.partyName ||
        invoice.details?.[0]?.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName
      );
      invoiceGroups.set(invNo, {
        voucherNo: invNo,
        invoiceDate: formatDateDisplay(invoice.invoiceDate),
        supplier: supplierName,
        quantity: 0,
        weight: 0,
        assessValue: 0,
      });
    }

    const group = invoiceGroups.get(invNo);
    (invoice.details || []).forEach((detail) => {
      const q = Number(detail.quantity || 0);
      const w = Number(detail.weight || 0);
      const val = Number(detail.assessValue || 0);

      group.quantity += q;
      group.weight += w;
      group.assessValue += val;
    });
  });

  const resultRows = [];
  let sNo = 1;
  let overallQty = 0;
  let overallWeight = 0;
  let overallAmount = 0;

  for (const [invNo, group] of invoiceGroups.entries()) {
    overallQty += group.quantity;
    overallWeight += group.weight;
    overallAmount += group.assessValue;

    resultRows.push({
      sNo: sNo++,
      voucherNo: group.voucherNo,
      invoiceDate: group.invoiceDate,
      supplier: group.supplier,
      quantity: formatNumber(group.quantity, 0),
      weight: formatNumber(group.weight, 3),
      assessValue: formatCurrency(group.assessValue, 2),
    });
  }

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "voucherNo", label: "Invoice No", width: 80 },
      { key: "invoiceDate", label: "Invoice Date", width: 65, align: "center" },
      { key: "supplier", label: "Supplier", width: 140 },
      { key: "quantity", label: "Total Qty (Bales)", width: 70, align: "right" },
      { key: "weight", label: "Total Weight (Kg)", width: 80, align: "right" },
      { key: "assessValue", label: "Total Amount", width: 90, align: "right" },
    ],
    rows: resultRows,
    totals: {
      "Total Invoices": formatNumber(invoiceGroups.size, 0),
      "Total Qty": formatNumber(overallQty, 0),
      "Total Weight": formatNumber(overallWeight, 3),
      "Total Amount": formatCurrency(overallAmount, 2),
    },
  };
};