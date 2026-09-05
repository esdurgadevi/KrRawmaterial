import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { LotRejected, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety } = db;

export const lotRejectionReport = async ({ fromDate, toDate, title }) => {
  const rows = await LotRejected.findAll({
    where: {
      createdAt: {
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
    order: [["createdAt", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = rows.map((record, index) => ({
    sNo: index + 1,
    lotNo: toText(record.inwardLot?.lotNo),
    lotDate: formatDateDisplay(record.inwardLot?.lotDate),
    supplier: toText(record.inwardLot?.InwardEntry?.purchaseOrder?.supplier?.accountName),
    variety: toText(record.inwardLot?.InwardEntry?.purchaseOrder?.variety?.variety),
    isRejected: record.isRejected ? "Yes" : "No",
  }));

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "lotNo", label: "Lot Number", width: 80 },
      { key: "lotDate", label: "Lot Date", width: 58, align: "center" },
      { key: "supplier", label: "Supplier", width: 116 },
      { key: "variety", label: "Variety", width: 86 },
      { key: "isRejected", label: "Rejected", width: 56, align: "center" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Rejected": formatNumber(normalizedRows.length, 0),
    },
  };
};