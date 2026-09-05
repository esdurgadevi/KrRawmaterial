import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { LotTestResult, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety } = db;

export const lotTestResultReport = async ({ fromDate, toDate, title }) => {
  const rows = await LotTestResult.findAll({
    include: [
      {
        model: InwardLot,
        as: "lot",
        where: {
          lotDate: {
            [Op.between]: [fromDate, toDate],
          },
        },
        attributes: ["lotNo", "lotDate"],
        include: [
          {
            model: InwardEntry,
            attributes: ["inwardNo"],
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
    lotNo: toText(record.lot?.lotNo),
    lotDate: formatDateDisplay(record.lot?.lotDate),
    inwardNo: toText(record.lot?.InwardEntry?.inwardNo),
    purchaseOrderNo: toText(record.lot?.InwardEntry?.purchaseOrder?.orderNo),
    supplier: toText(record.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName),
    variety: toText(record.lot?.InwardEntry?.purchaseOrder?.variety?.variety),
    permitNo: toText(record.permitNo),
    grade: toText(record.grade),
    rd: formatNumber(record.rd, 2),
    staple: formatNumber(record.staple, 2),
    strength: formatNumber(record.strength, 2),
  }));

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "lotDate", label: "Lot Date", width: 58, align: "center" },
      { key: "inwardNo", label: "Inward No", width: 70 },
      { key: "purchaseOrderNo", label: "Purchase Order No", width: 72 },
      { key: "supplier", label: "Supplier", width: 108 },
      { key: "variety", label: "Variety", width: 78 },
      { key: "permitNo", label: "Permit No", width: 60 },
      { key: "grade", label: "Grade", width: 56 },
      { key: "rd", label: "RD", width: 44, align: "right" },
      { key: "strength", label: "Strength", width: 54, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Reports": formatNumber(normalizedRows.length, 0),
    },
  };
};