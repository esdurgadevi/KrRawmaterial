import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { InwardLot, InwardEntry, PurchaseOrder, InwardLotWeightment, Supplier, Variety, Godown } = db;

export const inwardLotReport = async ({ fromDate, toDate, title }) => {
  const rows = await InwardLot.findAll({
    where: {
      lotDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    attributes: ["lotNo", "lotDate", "qty", "grossWeight", "nettWeight", "tareWeight"],
    include: [
      {
        model: InwardEntry,
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
      { model: Godown, as: "godown", attributes: ["godownName"] },
      {
        model: InwardLotWeightment,
        as: "weightments",
        attributes: ["id"],
      },
    ],
    order: [["lotDate", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = rows.map((record, index) => ({
    sNo: index + 1,
    lotNo: toText(record.lotNo),
    lotDate: formatDateDisplay(record.lotDate),
    inwardNo: toText(record.InwardEntry?.inwardNo),
    purchaseOrderNo: toText(record.InwardEntry?.purchaseOrder?.orderNo),
    supplier: toText(record.InwardEntry?.purchaseOrder?.supplier?.accountName),
    variety: toText(record.InwardEntry?.purchaseOrder?.variety?.variety),
    godown: toText(record.godown?.godownName),
    qty: formatNumber(record.qty, 0),
    grossWeight: formatNumber(record.grossWeight, 3),
    nettWeight: formatNumber(record.nettWeight, 3),
    tareWeight: formatNumber(record.tareWeight, 3),
    baleCount: formatNumber(record.weightments?.length || 0, 0),
  }));

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "lotDate", label: "Date", width: 58, align: "center" },
      { key: "inwardNo", label: "Inward No", width: 70 },
      { key: "purchaseOrderNo", label: "Purchase Order No", width: 72 },
      { key: "supplier", label: "Supplier", width: 108 },
      { key: "variety", label: "Variety", width: 76 },
      { key: "godown", label: "Godown", width: 86 },
      { key: "baleCount", label: "Bales", width: 42, align: "right" },
      { key: "grossWeight", label: "Gross Wt", width: 64, align: "right" },
      { key: "nettWeight", label: "Net Wt", width: 64, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Bales": formatNumber(rows.reduce((sum, row) => sum + Number(row.weightments?.length || 0), 0), 0),
      "Total Gross Weight": formatNumber(rows.reduce((sum, row) => sum + Number(row.grossWeight || 0), 0), 3),
      "Total Net Weight": formatNumber(rows.reduce((sum, row) => sum + Number(row.nettWeight || 0), 0), 3),
    },
  };
};