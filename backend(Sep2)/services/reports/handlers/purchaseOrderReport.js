import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { PurchaseOrder, Supplier, Broker, Variety, MixingGroup, Station, CompanyBroker } = db;

export const purchaseOrderReport = async ({ fromDate, toDate, title }) => {
  const rows = await PurchaseOrder.findAll({
    where: {
      orderDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    attributes: [
      "orderNo",
      "orderDate",
      "quantity",
      "ratePerKg",
      "approxLotValue",
      "selectedRateType",
    ],
    include: [
      { model: Supplier, as: "supplier", attributes: ["accountName"] },
      { model: Broker, as: "broker", attributes: ["brokerName"] },
      { model: Variety, as: "variety", attributes: ["variety"] },
      { model: MixingGroup, as: "mixingGroup", attributes: ["mixingName"] },
      { model: Station, as: "station", attributes: ["station"] },
      { model: CompanyBroker, as: "companyBroker", attributes: ["companyName"] },
    ],
    order: [["orderDate", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = rows.map((record, index) => ({
    sNo: index + 1,
    orderNo: toText(record.orderNo),
    orderDate: formatDateDisplay(record.orderDate),
    supplier: toText(record.supplier?.accountName),
    broker: toText(record.broker?.brokerName),
    variety: toText(record.variety?.variety),
    mixingGroup: toText(record.mixingGroup?.mixingName),
    station: toText(record.station?.station),
    companyBroker: toText(record.companyBroker?.companyName),
    quantity: formatNumber(record.quantity, 0),
    ratePerKg: formatCurrency(record.ratePerKg, 4),
    approxLotValue: formatCurrency(record.approxLotValue, 2),
    rateType: toText(record.selectedRateType),
  }));

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "orderNo", label: "Purchase Order No", width: 62 },
      { key: "orderDate", label: "Date", width: 55, align: "center" },
      { key: "supplier", label: "Supplier", width: 105 },
      { key: "broker", label: "Broker", width: 90 },
      { key: "variety", label: "Variety", width: 78 },
      { key: "mixingGroup", label: "Mixing Group", width: 92 },
      { key: "station", label: "Station", width: 62 },
      { key: "quantity", label: "Qty", width: 42, align: "right" },
      { key: "ratePerKg", label: "Rate/Kg", width: 56, align: "right" },
      { key: "approxLotValue", label: "Amount", width: 72, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Qty": formatNumber(rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0), 0),
      "Total Amount": formatCurrency(rows.reduce((sum, row) => sum + Number(row.approxLotValue || 0), 0), 2),
    },
  };
};