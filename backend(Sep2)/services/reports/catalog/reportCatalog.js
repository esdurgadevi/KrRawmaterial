import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatCurrency, formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

import { purchaseOrderReport } from "../handlers/purchaseOrderReport.js";
import { gateInwardReport } from "../handlers/gateInwardReport.js";
import { inwardLotReport } from "../handlers/inwardLotReport.js";
import { issueReport } from "../handlers/issueReport.js";
import { lotTestResultReport } from "../handlers/lotTestResultReport.js";
import { lotTestResultMoistureReport } from "../handlers/lotTestResultMoistureReport.js";
import { inwardInterstateReport } from "../handlers/inwardInterstateReport.js";
import { locationTransferReport } from "../handlers/locationTransferReport.js";
import { lotAllowanceReport } from "../handlers/lotAllowanceReport.js";
import { lotRejectionReport } from "../handlers/lotRejectionReport.js";
import { finalInvoiceReport, cottonInvoiceNoWiseReport } from "../handlers/finalInvoiceReport.js";
import { dailyStockReport } from "../handlers/dailyStockReport.js";
import { yearlyStockReport } from "../handlers/yearlyStockReport.js";

const { PurchaseOrder, InwardEntry, InwardLot, InwardLotWeightment, Issue, IssueItem, Supplier, Broker, Variety, MixingGroup, Station, Godown, State, LotRejected } = db;

const dateFilters = [
  { key: "fromDate", label: "From Date", type: "date", required: true },
  { key: "toDate", label: "To Date", type: "date", required: true },
];
const optional = (key, label, source, multiple = false) => ({ key, label, type: "select", source, multiple, required: false });
const optionalText = (key, label) => ({ key, label, type: "text", required: false });
const column = (key, label, align = undefined) => ({ key, label, ...(align ? { align } : {}) });

const basePurchaseColumns = [column("orderNo", "Order No."), column("orderDate", "Date", "center"), column("supplier", "Supplier"), column("broker", "Broker"), column("variety", "Variety"), column("mixingGroup", "Mixing Group"), column("station", "Station"), column("quantity", "Qty", "right"), column("ratePerKg", "Rate/Kg", "right"), column("value", "Value", "right")];

const purchaseDefinitions = [
  ["date-wise-order-details", "Date Wise Order Details", "orderDate", [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true)], basePurchaseColumns.filter(({ key }) => key !== "broker" && key !== "mixingGroup" && key !== "station")],
  ["mixing-group-wise-order-details", "Mixing Group Wise Order Details", "mixingGroup", [...dateFilters, optional("mixingGroupIds", "Mixing Group", "mixing-groups", true), optional("supplierIds", "Supplier", "suppliers", true)], basePurchaseColumns.filter(({ key }) => key !== "broker" && key !== "station")],
  ["order-no-wise-order-details", "Order No. Wise Order Details", "orderNo", [...dateFilters, optional("orderNo", "Order No.", "purchase-orders"), optional("supplierIds", "Supplier", "suppliers", true)], basePurchaseColumns],
  ["supplier-wise-order-details", "Supplier Wise Order Details", "supplier", [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true)], basePurchaseColumns.filter(({ key }) => key !== "broker" && key !== "station")],
  ["supplier-wise-po-pending", "Supplier-wise PO Pending", "supplier", [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true)], [column("supplier", "Supplier"), column("orderNo", "Order No."), column("orderDate", "Order Date", "center"), column("expectedDeliveryDate", "Expected Delivery", "center"), column("orderedQty", "Ordered Qty", "right"), column("receivedQty", "Received Qty", "right"), column("pendingQty", "Pending Qty", "right")]],
  ["variety-wise-order-details", "Variety Wise Order Details", "variety", [...dateFilters, optional("varietyIds", "Variety", "varieties", true), optional("supplierIds", "Supplier", "suppliers", true)], basePurchaseColumns.filter(({ key }) => key !== "broker" && key !== "mixingGroup" && key !== "station")],
];

export const reportCatalog = Object.fromEntries([
  ...purchaseDefinitions.map(([id, name, groupBy, parameters, columns]) => [id, { id, name, category: "Purchase", status: "enabled", parameters, columns, groupBy, handler: "purchase" }]),
  ["cotton-inward-details", { id: "cotton-inward-details", name: "Cotton Inward Details", category: "Inward", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true), optional("godownIds", "Godown", "godowns", true)], columns: [column("sNo", "Sl.No", "right"), column("lotDate", "Lot Date", "center"), column("supplier", "Supplier"), column("lotNo", "Lot No"), column("bales", "No. of Bale", "right"), column("weight", "Weight (KG)", "right"), column("value", "Value", "right")], handler: "inward" }],
  ["inward-lot-wise-avg-cost", { id: "inward-lot-wise-avg-cost", name: "Inward Lot Wise Avg Cost", category: "Inward", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true), optional("godownIds", "Godown", "godowns", true)], columns: [column("sNo", "Sl.No", "right"), column("lotNo", "Lot No"), column("supplier", "Supplier"), column("bales", "No. of Bale", "right"), column("weight", "Weight (KG)", "right"), column("value", "Value", "right"), column("avgCost", "Avg Cost", "right")], handler: "inward" }],
  ["inward-party-wise", { id: "inward-party-wise", name: "Inward Party Wise", category: "Inward", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true), optional("godownIds", "Godown", "godowns", true)], columns: [column("sNo", "Sl.No", "right"), column("supplier", "Supplier"), column("bales", "No. of Bale", "right"), column("weight", "Weight (KG)", "right"), column("value", "Value", "right")], handler: "inward" }],
  ["inward-state-wise", { id: "inward-state-wise", name: "Inward State Wise", category: "Inward", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true), optional("godownIds", "Godown", "godowns", true)], columns: [column("sNo", "Sl.No", "right"), column("state", "State"), column("bales", "No. of Bale", "right"), column("weight", "Weight (KG)", "right"), column("value", "Value", "right")], handler: "inward" }],
  ["inward-interstate-report", { id: "inward-interstate-report", name: "Inward Interstate Report", category: "Inward", status: "enabled", parameters: [...dateFilters], handler: inwardInterstateReport }],
  ["lot-wise-testing-results", { id: "lot-wise-testing-results", name: "Lot Wise Testing Results", category: "Inward", status: "enabled", parameters: [...dateFilters], handler: lotTestResultReport }],
  ["lot-test-result-moisture", { id: "lot-test-result-moisture", name: "Lot Test Result Moisture Report", category: "Inward", status: "enabled", parameters: [...dateFilters], handler: lotTestResultMoistureReport }],
  ["cotton-consumption-value", { id: "cotton-consumption-value", name: "Cotton Consumption Value", category: "Issue", status: "enabled", parameters: [...dateFilters, optionalText("lotNo", "Lot No"), optional("godownIds", "Godown", "godowns", true), optional("supplierIds", "Supplier", "suppliers", true)], columns: [column("lotNo", "Lot No"), column("qty", "Qty", "right"), column("weight", "Weight", "right"), column("rate", "Rate", "right"), column("value", "Value", "right"), column("godown", "Godown")], handler: "issue" }],
  ["issue-date-lot-wise-details", { id: "issue-date-lot-wise-details", name: "Cotton Issue Lot No Wise", category: "Issue", status: "enabled", parameters: [...dateFilters], columns: [column("lotNo", "Lot No"), column("issueDate", "Issue Date", "center"), column("qty", "Qty", "right"), column("rate", "Rate/Kg", "right"), column("weight", "Issue Weight", "right"), column("value", "Issue Value", "right")], groupBy: "lotNo", handler: "issue" }],
  ["daily-issue-bale-wise-details", { id: "daily-issue-bale-wise-details", name: "Daily Issue Bale No Wise Details", category: "Issue", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Supplier", "suppliers", true)], columns: [column("sNo", "Sl.No", "right"), column("lotNo", "Lot No"), column("supplier", "Supplier Name"), column("baleNo", "Bale No"), column("qty", "Qty", "right"), column("weight", "Issue Weight", "right"), column("value", "Issue Value", "right")], handler: "issue" }],
  ["issue-party-wise-details", { id: "issue-party-wise-details", name: "Issue Party Wise Details", category: "Issue", status: "enabled", parameters: [...dateFilters, optional("supplierIds", "Party", "suppliers", true), optional("stationIds", "Station", "stations", true)], columns: [column("sNo", "Sl.No", "right"), column("supplier", "Party Name"), column("station", "Station Name"), column("qty", "Qty", "right"), column("percent", "%", "right")], groupBy: "supplier", handler: "issueParty" }],
  ["issue-state-wise-details", { id: "issue-state-wise-details", name: "Issue State Wise Details", category: "Issue", status: "enabled", parameters: [...dateFilters, optional("stateIds", "State", "states", true), optional("godownIds", "Godown", "godowns", true)], columns: [column("lotNo", "Lot No"), column("godown", "Godown"), column("qty", "Qty", "right"), column("weight", "Issue Weight", "right"), column("value", "Issue Value", "right")], groupBy: "state", handler: "issueState" }],
  ["issue-state-wise-with-moisture", { id: "issue-state-wise-with-moisture", name: "Issue State Wise With Moisture", category: "Issue", status: "enabled", parameters: [...dateFilters, optional("stateIds", "State", "states", true)], columns: [column("sNo", "Sl.No", "right"), column("state", "State"), column("lotNo", "Lot No"), column("qty", "Qty", "right"), column("weight", "Weight", "right"), column("moist", "Moisture %", "right")], groupBy: "state", handler: "issue" }],
  ["cotton-state-wise-stock", { id: "cotton-state-wise-stock", name: "Cotton State Wise Stock Report", category: "Stock", status: "enabled", parameters: [optional("stateIds", "State", "states", true)], columns: [column("sNo", "Sl.No", "right"), column("lotNo", "Lot No"), column("qty", "Closing Qty", "right"), column("weight", "Closing Kg", "right"), column("candyRate", "Candy Rate", "right")], groupBy: "state", handler: "stock" }],
  ["cotton-stock-candy-wise", { id: "cotton-stock-candy-wise", name: "Cotton Stock Candy Wise Report", category: "Stock", status: "enabled", parameters: [], columns: [column("sNo", "Sl.No", "right"), column("candyRate", "Candy Rate", "right"), column("qty", "Closing Qty", "right"), column("weight", "Closing Kg", "right")], groupBy: "candyRate", handler: "stockCandy" }],
  ["cotton-stock-party-candy-wise", { id: "cotton-stock-party-candy-wise", name: "Cotton Stock Party Candy Wise Report", category: "Stock", status: "enabled", parameters: [optional("supplierIds", "Party", "suppliers", true)], columns: [column("sNo", "Sl.No", "right"), column("candyRate", "Candy Rate", "right"), column("qty", "Closing Qty", "right"), column("weight", "Closing Kg", "right")], groupBy: "supplier", handler: "stockPartyCandy" }],
  ["cotton-stock-average-candy-wise", { id: "cotton-stock-average-candy-wise", name: "Cotton Stock Average Candy Wise", category: "Stock", status: "enabled", parameters: [], columns: [column("sNo", "Sl.No", "right"), column("candyRate", "Candy Rate", "right"), column("qty", "Total Bales", "right"), column("weight", "Total Kg", "right"), column("avgRate", "Avg Candy Rate", "right")], groupBy: "candyRate", handler: "stockAvgCandy" }],
  ["cotton-stock-party-candy-value", { id: "cotton-stock-party-candy-value", name: "Cotton Stock Party Candy Wise — Value View", category: "Stock", status: "enabled", parameters: [optional("supplierIds", "Party", "suppliers", true)], columns: [column("rate", "Rate/Candy", "right"), column("bales", "No. of Bale", "right"), column("candies", "No. of Candy", "right"), column("value", "Candy Value", "right")], groupBy: "supplier", handler: "stockPartyValue" }],
  ["cotton-stock-location-wise", { id: "cotton-stock-location-wise", name: "Cotton Stock Location Wise", category: "Stock", status: "enabled", parameters: [optional("godownIds", "Location", "godowns", true)], columns: [column("sNo", "Sl.No", "right"), column("lotNo", "Lot No"), column("qty", "Qty", "right"), column("weight", "Kgs", "right"), column("value", "Value", "right")], groupBy: "godown", handler: "stockLocation" }],
  ["cotton-daily-stock", { name: "Cotton Daily Stock Report", category: "Stock", status: "enabled", parameters: dateFilters, columns: [], handler: dailyStockReport }],
  ["cotton-stock-yearly", { name: "Cotton Stock Yearly Report", category: "Stock", status: "enabled", parameters: dateFilters, columns: [], handler: yearlyStockReport }],

  // Legacy Reports Migration
  ["purchase-order", { id: "purchase-order", name: "Purchase Order Report", category: "Purchase", status: "enabled", parameters: [...dateFilters], handler: purchaseOrderReport }],
  ["gate-inward", { id: "gate-inward", name: "Gate Inward Report", category: "Inward", status: "enabled", parameters: [...dateFilters], handler: gateInwardReport }],
  ["inward-lot", { id: "inward-lot", name: "Inward Lot Report", category: "Inward", status: "enabled", parameters: [...dateFilters], handler: inwardLotReport }],
  ["issue", { id: "issue", name: "Issue Report", category: "Issue", status: "enabled", parameters: [...dateFilters], handler: issueReport }],
  ["location-transfer", { id: "location-transfer", name: "Location Transfer Report", category: "Stock", status: "enabled", parameters: [...dateFilters], handler: locationTransferReport }],
  ["final-invoice", { id: "final-invoice", name: "Final Invoice Report", category: "Invoice", status: "enabled", parameters: [...dateFilters], handler: finalInvoiceReport }],
  ["cotton-invoice-no-wise", { id: "cotton-invoice-no-wise", name: "Cotton Invoice No Wise", category: "Invoice", status: "enabled", parameters: [...dateFilters], handler: cottonInvoiceNoWiseReport }],

  ["lot-allowance", { id: "lot-allowance", name: "Lot Allowance Report", category: "Others", status: "enabled", parameters: [...dateFilters], handler: lotAllowanceReport }],
  ["lot-rejection", { id: "lot-rejection", name: "Lot Rejection Report", category: "Others", status: "enabled", parameters: [...dateFilters], handler: lotRejectionReport }],
].map(([id, value]) => [id, { id, ...value }]));

export const publicDefinitions = () => Object.values(reportCatalog).map(({ handler, ...definition }) => definition);
const ids = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(",");
  return list.map((v) => String(v).trim()).filter(Boolean);
};

const filterIds = (where, key, value) => {
  const values = ids(value);
  if (values.length) {
    const numValues = values.map(Number).filter((n) => !isNaN(n));
    where[key] = numValues.length === values.length ? { [Op.in]: numValues } : { [Op.in]: values };
  }
};

const totals = (rows, keys) => Object.fromEntries(keys.map(([label, key, currency = false]) => [label, currency ? formatCurrency(rows.reduce((sum, row) => sum + Math.round(Number(row[key] || 0) * 100), 0) / 100, 2) : formatNumber(rows.reduce((sum, row) => sum + Number(row[key] || 0), 0), 3)]));
const purchaseRows = async (params) => {
  const where = { orderDate: { [Op.gte]: params.fromDate, [Op.lte]: params.toDate } };
  filterIds(where, "supplierId", params.supplierIds); filterIds(where, "varietyId", params.varietyIds); filterIds(where, "mixingGroupId", params.mixingGroupIds);
  if (params.orderNo) where.orderNo = params.orderNo;
  return PurchaseOrder.findAll({ where, include: [{ model: Supplier, as: "supplier" }, { model: Broker, as: "broker" }, { model: Variety, as: "variety" }, { model: MixingGroup, as: "mixingGroup" }, { model: Station, as: "station" }, { model: InwardEntry, as: "inwardEntries", attributes: ["Qty"] }], order: [["orderDate", "ASC"], ["id", "ASC"]] });
};
const buildPurchase = async (definition, params) => {
  const orders = await purchaseRows(params);
  const pending = definition.id === "supplier-wise-po-pending";
  const rows = orders.map((order, index) => {
    const received = (order.inwardEntries || []).reduce((sum, inward) => sum + Number(inward.Qty || 0), 0);
    if (pending) return { supplier: toText(order.supplier?.accountName), orderNo: toText(order.orderNo), orderDate: formatDateDisplay(order.orderDate), expectedDeliveryDate: formatDateDisplay(order.expectedDeliveryDate), orderedQty: Number(order.quantity || 0), receivedQty: received, pendingQty: Math.max(0, Number(order.quantity || 0) - received) };
    return { orderNo: toText(order.orderNo), orderDate: formatDateDisplay(order.orderDate), supplier: toText(order.supplier?.accountName), broker: toText(order.broker?.brokerName), variety: toText(order.variety?.variety), mixingGroup: toText(order.mixingGroup?.mixingName), station: toText(order.station?.station), quantity: Number(order.quantity || 0), ratePerKg: formatCurrency(order.ratePerKg, 4), value: Number(order.approxLotValue || 0) };
  });
  return { rows: rows.map((row) => ({ ...row, ...(row.value !== undefined ? { value: formatCurrency(row.value, 2) } : {}) })), totals: pending ? totals(rows, [["Ordered Qty", "orderedQty"], ["Received Qty", "receivedQty"], ["Pending Qty", "pendingQty"]]) : totals(rows, [["Total Qty", "quantity"], ["Total Value", "value", true]]) };
};

const issueRecords = async (params) => Issue.findAll({ where: { issueDate: { [Op.gte]: params.fromDate, [Op.lte]: params.toDate } }, include: [{ model: IssueItem, include: [{ model: InwardLotWeightment, include: [{ model: InwardLot, as: "inwardLot", include: [{ model: Godown, as: "godown" }, { model: db.LotTestResult, as: "testResult" }, { model: InwardEntry, include: [{ model: PurchaseOrder, as: "purchaseOrder", include: [{ model: Supplier, as: "supplier", include: [{ model: State, as: "state" }] }, { model: Station, as: "station" }, { model: Variety, as: "variety" }] }] }] }] }] }], order: [["issueDate", "ASC"], ["id", "ASC"]] });
const issueRows = async (params) => {
  const records = await issueRecords(params); const rows = [];
  records.forEach((issue) => (issue.IssueItems || []).forEach((item) => { const weightment = item.InwardLotWeightment; const lot = weightment?.inwardLot; const po = lot?.InwardEntry?.purchaseOrder; const rate = Number(lot?.ratePerKg || 0); rows.push({ lotNo: toText(lot?.lotNo), inwardType: toText(lot?.InwardEntry?.type || "Unknown"), variety: toText(po?.variety?.variety), issueDate: formatDateDisplay(issue.issueDate), qty: 1, weight: Number(item.issueWeight || 0), rate, value: Number(item.issueWeight || 0) * rate, godown: toText(lot?.godown?.godownName), supplier: toText(po?.supplier?.accountName), station: toText(po?.station?.station), state: toText(po?.supplier?.state?.state), baleNo: toText(weightment?.baleNo), moist: formatNumber(lot?.testResult?.moist, 2), supplierId: po?.supplier?.id, godownId: lot?.godown?.id, stationId: po?.station?.id, stateId: po?.supplier?.state?.id }); }));
  return rows;
};

const buildIssue = async (definition, params) => {
  let rows = await issueRows(params);
  
  const sIds = ids(params.supplierIds);
  const gIds = ids(params.godownIds);
  const stIds = ids(params.stationIds);
  const stateIds = ids(params.stateIds);
  
  rows = rows.filter(row => 
    (!sIds.length || sIds.includes(row.supplierId)) &&
    (!gIds.length || gIds.includes(row.godownId)) &&
    (!stIds.length || stIds.includes(row.stationId)) &&
    (!stateIds.length || stateIds.includes(row.stateId))
  );

  // UI option IDs are optional. The report remains complete if an association is unavailable.
  if (definition.id === "issue-party-wise-details") { const totalQty = rows.length || 1; const groups = new Map(); rows.forEach((row) => { const key = `${row.supplier}|${row.station}`; const current = groups.get(key) || { supplier: row.supplier, station: row.station, qty: 0 }; current.qty += 1; groups.set(key, current); }); rows = [...groups.values()].map((row, index) => ({ sNo: index + 1, ...row, percent: `${((row.qty / totalQty) * 100).toFixed(2)}%` })); return { rows, totals: { "Total Qty": formatNumber(totalQty, 0) } }; }
  
  if (definition.id === "daily-issue-bale-wise-details") {
    const varietyGroups = new Map();
    rows.forEach(row => {
      const variety = row.variety || "Unknown Variety";
      if (!varietyGroups.has(variety)) varietyGroups.set(variety, new Map());
      const lotGroups = varietyGroups.get(variety);
      
      const lotKey = `${row.lotNo}|${row.supplier}|${row.godown}`;
      if (!lotGroups.has(lotKey)) lotGroups.set(lotKey, { lotNo: row.lotNo, supplier: row.supplier, godown: row.godown, bales: [] });
      
      lotGroups.get(lotKey).bales.push(row);
    });

    const flattenedRows = [];
    let sNo = 1;

    for (const [variety, lotGroups] of varietyGroups.entries()) {
      flattenedRows.push({ isSubHeader: true, subHeaderText: variety });
      for (const lotData of lotGroups.values()) {
        flattenedRows.push({
          sNo: sNo++,
          lotNo: lotData.lotNo,
          supplier: lotData.supplier,
          baleNo: lotData.godown,
          qty: formatNumber(lotData.bales.length, 0),
          weight: "",
          value: ""
        });
        for (const bale of lotData.bales) {
          flattenedRows.push({
            sNo: "",
            lotNo: "",
            supplier: "",
            baleNo: bale.baleNo,
            qty: "",
            weight: formatNumber(bale.weight, 3),
            value: formatCurrency(bale.value, 2)
          });
        }
      }
    }
    
    const totalWeight = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0);
    const totalQty = rows.reduce((sum, row) => sum + 1, 0);
    
    return { 
      rows: flattenedRows, 
      totals: { "Total Qty": formatNumber(totalQty, 0), "Total Issue Weight": formatNumber(totalWeight, 3) } 
    };
  }

  if (definition.id === "cotton-consumption-interstate-wise") {
    const typeGroups = new Map();
    rows.forEach(row => {
      const inwardType = row.inwardType;
      if (!typeGroups.has(inwardType)) {
        typeGroups.set(inwardType, { inwardType, qty: 0, weight: 0, value: 0 });
      }
      const current = typeGroups.get(inwardType);
      current.qty += row.qty;
      current.weight += row.weight;
      current.value += row.value;
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;
    let grandTotalValue = 0;
    
    for (const group of typeGroups.values()) {
      flattenedRows.push({
        inwardType: group.inwardType,
        qty: formatNumber(group.qty, 0),
        weight: formatNumber(group.weight, 3),
        value: formatCurrency(group.value, 2)
      });
      grandTotalQty += group.qty;
      grandTotalWeight += group.weight;
      grandTotalValue += group.value;
    }
    
    return {
      rows: flattenedRows,
      totals: { "Total Qty": formatNumber(grandTotalQty, 0), "Total Weight": formatNumber(grandTotalWeight, 3), "Total Value": formatCurrency(grandTotalValue, 2) }
    };
  }

  if (definition.id === "issue-state-wise-details") {
    const stateGroups = new Map();
    rows.forEach(row => {
      const state = row.state || "Unknown State";
      if (!stateGroups.has(state)) stateGroups.set(state, { state, qty: 0 });
      stateGroups.get(state).qty += row.qty;
    });
    const totalQty = rows.reduce((sum, row) => sum + row.qty, 0) || 1;
    const flattenedRows = [...stateGroups.values()].map((row, index) => ({ sNo: index + 1, ...row, percent: `${((row.qty / totalQty) * 100).toFixed(2)}%` }));
    return { rows: flattenedRows, totals: { "Total Qty": formatNumber(totalQty, 0) } };
  }

  if (definition.id === "issue-state-wise-with-moisture") {
    const stateGroups = new Map();
    rows.forEach(row => {
      const state = row.state || "Unknown State";
      if (!stateGroups.has(state)) stateGroups.set(state, []);
      stateGroups.get(state).push(row);
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;
    
    for (const [state, items] of stateGroups.entries()) {
      flattenedRows.push({ isSubHeader: true, subHeaderText: state });
      
      let sNo = 1;
      let stateQty = 0;
      let stateWeight = 0;

      for (const item of items) {
        flattenedRows.push({
          sNo: sNo++,
          lotNo: item.lotNo,
          qty: formatNumber(item.qty, 0),
          weight: formatNumber(item.weight, 3),
          moist: item.moist
        });
        stateQty += item.qty;
        stateWeight += item.weight;
      }
      
      flattenedRows.push({
        isSubtotal: true,
        sNo: "",
        lotNo: "",
        qty: formatNumber(stateQty, 0),
        weight: formatNumber(stateWeight, 3),
        moist: ""
      });

      grandTotalQty += stateQty;
      grandTotalWeight += stateWeight;
    }
    
    return {
      rows: flattenedRows,
      totals: { "Total Qty": formatNumber(grandTotalQty, 0), "Total Weight": formatNumber(grandTotalWeight, 3) }
    };
  }

  if (definition.id === "issue-date-lot-wise-details") {
    const groups = new Map();
    rows.forEach(row => {
      const key = `${row.lotNo}|${row.issueDate}|${row.rate}`;
      const current = groups.get(key) || { lotNo: row.lotNo, issueDate: row.issueDate, rate: row.rate, qty: 0, weight: 0, value: 0 };
      current.qty += row.qty;
      current.weight += row.weight;
      current.value += row.value;
      groups.set(key, current);
    });
    rows = [...groups.values()];
  }

  if (definition.id === "cotton-consumption-value") {
    const groups = new Map();
    rows.forEach(row => {
      const key = `${row.lotNo}`;
      const current = groups.get(key) || { lotNo: row.lotNo, godown: row.godown, rate: row.rate, qty: 0, weight: 0, value: 0 };
      current.qty += row.qty;
      current.weight += row.weight;
      current.value += row.value;
      groups.set(key, current);
    });
    rows = [...groups.values()];
  }

  const totalWeight = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0);
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);

  rows = rows.map((row, index) => ({ sNo: index + 1, ...row, rate: formatCurrency(row.rate, 4), weight: formatNumber(row.weight, 3), value: formatCurrency(row.value, 2) }));
  
  return { rows, totals: { "Total Qty": formatNumber(totalQty, 0), "Total Issue Weight": formatNumber(totalWeight, 3) } };
};

const buildInward = async (params, definition) => {
  const where = { lotDate: { [Op.gte]: params.fromDate, [Op.lte]: params.toDate } };
  filterIds(where, "godownId", params.godownIds);
  const lots = await InwardLot.findAll({ where, include: [{ model: Godown, as: "godown" }, { model: InwardLotWeightment, as: "weightments" }, { model: InwardEntry, include: [{ model: PurchaseOrder, as: "purchaseOrder", include: [{ model: Supplier, as: "supplier", include: [{ model: State, as: "state" }] }] }] }], order: [["lotDate", "ASC"]] });
  
  let rawRows = lots.map((lot, index) => {
    const rawWeight = Number(lot.nettWeight || 0);
    const rawValue = Number(lot.assessValue || 0);
    const rawRatePerKg = Number(lot.ratePerKg || 0);
    return {
      lotDate: formatDateDisplay(lot.lotDate),
      supplier: toText(lot.InwardEntry?.purchaseOrder?.supplier?.accountName),
      supplierId: lot.InwardEntry?.purchaseOrder?.supplier?.id,
      state: toText(lot.InwardEntry?.purchaseOrder?.supplier?.state?.state),
      lotNo: toText(lot.lotNo),
      bales: Number(lot.weightments?.length || 0),
      rawWeight,
      rawValue,
      weight: rawWeight,
      value: rawValue,
      ratePerKg: rawRatePerKg,
      avgCost: rawWeight > 0 ? (rawValue / rawWeight) : rawRatePerKg,
      godown: toText(lot.godown?.godownName),
      godownId: lot.godown?.id,
    };
  });
  
  const sIds = ids(params.supplierIds);
  if (sIds.length) {
    rawRows = rawRows.filter(row => sIds.includes(row.supplierId));
  }
  
  if (definition.id === "inward-lot-wise-avg-cost") {
    // Group by lot number in case same lot appears multiple times
    const lotGroups = new Map();
    rawRows.forEach(row => {
      const key = row.lotNo || "Unknown";
      if (!lotGroups.has(key)) {
        lotGroups.set(key, { lotNo: key, supplier: row.supplier, bales: 0, weight: 0, value: 0, ratePerKg: row.ratePerKg || 0 });
      }
      const current = lotGroups.get(key);
      current.bales += row.bales;
      current.weight += row.weight;
      current.value += row.value;
      if (!current.ratePerKg && row.ratePerKg) current.ratePerKg = row.ratePerKg;
    });

    const rows = [...lotGroups.values()].map((row, index) => {
      // avgCost = total value / total weight (per kg). Fallback to ratePerKg if value/weight not set
      const avgCostPerKg = row.weight > 0 && row.value > 0
        ? row.value / row.weight
        : row.ratePerKg || 0;
      return {
        sNo: index + 1,
        lotNo: row.lotNo,
        supplier: row.supplier,
        bales: formatNumber(row.bales, 0),
        weight: formatNumber(row.weight, 3),
        value: formatCurrency(row.value, 2),
        avgCost: formatCurrency(avgCostPerKg, 2)
      };
    });
    const totalBales = rawRows.reduce((sum, row) => sum + row.bales, 0);
    const totalWeight = rawRows.reduce((sum, row) => sum + row.weight, 0);
    const totalValue = rawRows.reduce((sum, row) => sum + row.value, 0);
    return { rows, totals: { "Total Bales": formatNumber(totalBales, 0), "Total Weight": formatNumber(totalWeight, 3), "Total Value": formatCurrency(totalValue, 2) } };
  }
  
  if (definition.id === "inward-party-wise") {
    const groups = new Map();
    rawRows.forEach(row => {
      const party = row.supplier || "Unknown Supplier";
      if (!groups.has(party)) groups.set(party, { supplier: party, bales: 0, weight: 0, value: 0 });
      const current = groups.get(party);
      current.bales += row.bales;
      current.weight += row.weight;
      current.value += row.value;
    });
    const rows = [...groups.values()].map((row, index) => ({
      sNo: index + 1,
      supplier: row.supplier,
      bales: formatNumber(row.bales, 0),
      weight: formatNumber(row.weight, 3),
      value: formatCurrency(row.value, 2)
    }));
    return { rows, totals: { "Total Bales": formatNumber(rawRows.reduce((sum, row) => sum + row.bales, 0), 0), "Total Weight": formatNumber(rawRows.reduce((sum, row) => sum + row.weight, 0), 3), "Total Value": formatCurrency(rawRows.reduce((sum, row) => sum + row.value, 0), 2) } };
  }

  if (definition.id === "inward-state-wise") {
    const groups = new Map();
    rawRows.forEach(row => {
      const state = row.state || "Unknown State";
      if (!groups.has(state)) groups.set(state, { state: state, bales: 0, weight: 0, value: 0 });
      const current = groups.get(state);
      current.bales += row.bales;
      current.weight += row.weight;
      current.value += row.value;
    });
    const rows = [...groups.values()].map((row, index) => ({
      sNo: index + 1,
      state: row.state,
      bales: formatNumber(row.bales, 0),
      weight: formatNumber(row.weight, 3),
      value: formatCurrency(row.value, 2)
    }));
    return { rows, totals: { "Total Bales": formatNumber(rawRows.reduce((sum, row) => sum + row.bales, 0), 0), "Total Weight": formatNumber(rawRows.reduce((sum, row) => sum + row.weight, 0), 3), "Total Value": formatCurrency(rawRows.reduce((sum, row) => sum + row.value, 0), 2) } };
  }

  // default logic for cotton-inward-details
  const rows = rawRows.map((row, index) => ({ 
    sNo: index + 1, 
    ...row, 
    weight: formatNumber(row.weight, 3), 
    value: formatCurrency(row.value, 2) 
  }));
  
  return { rows, totals: { "Total Bales": formatNumber(rows.reduce((sum, row) => sum + row.bales, 0), 0) } };
};

const stockRows = async () => { const bales = await InwardLotWeightment.findAll({ where: { isIssued: false }, include: [{ model: InwardLot, as: "inwardLot", include: [{ model: LotRejected, as: "rejection", required: false }, { model: Godown, as: "godown" }, { model: InwardEntry, include: [{ model: PurchaseOrder, as: "purchaseOrder", include: [{ model: Supplier, as: "supplier", include: [{ model: State, as: "state" }] }] }] }] }] }); return bales.filter((bale) => !bale.inwardLot?.rejection?.isRejected).map((bale) => ({ lotNo: toText(bale.inwardLot?.lotNo), qty: 1, weight: Number(bale.baleWeight || 0), candyRate: Number(bale.inwardLot?.candyRate || 0), value: Number(bale.baleWeight || 0) * Number(bale.inwardLot?.ratePerKg || 0), supplier: toText(bale.inwardLot?.InwardEntry?.purchaseOrder?.supplier?.accountName), state: toText(bale.inwardLot?.InwardEntry?.purchaseOrder?.supplier?.state?.state), godown: toText(bale.inwardLot?.godown?.godownName) })); };
const aggregate = (rows, keys) => [...rows.reduce((map, row) => { const key = keys.map((item) => row[item]).join("|"); const current = map.get(key) || Object.fromEntries(keys.map((item) => [item, row[item]])); current.qty = (current.qty || 0) + row.qty; current.weight = (current.weight || 0) + row.weight; current.value = (current.value || 0) + row.value; map.set(key, current); return map; }, new Map()).values()];
const buildStock = async (definition) => {
  let rows = await stockRows();
  if (definition.handler === "stock") {
    const stateGroups = new Map();
    rows.forEach(row => {
      const state = row.state || "Unknown State";
      if (!stateGroups.has(state)) stateGroups.set(state, new Map());
      const lotGroups = stateGroups.get(state);
      
      const lotKey = `${row.lotNo}|${row.candyRate}`;
      if (!lotGroups.has(lotKey)) {
        lotGroups.set(lotKey, { lotNo: row.lotNo, candyRate: row.candyRate, qty: 0, weight: 0 });
      }
      
      const current = lotGroups.get(lotKey);
      current.qty += row.qty;
      current.weight += row.weight;
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;

    for (const [state, lotGroups] of stateGroups.entries()) {
      flattenedRows.push({ isSubHeader: true, subHeaderText: state.toUpperCase() });
      
      let stateQty = 0;
      let stateWeight = 0;
      let sNo = 1;
      
      for (const lotData of lotGroups.values()) {
        flattenedRows.push({
          sNo: sNo++,
          lotNo: lotData.lotNo,
          qty: formatNumber(lotData.qty, 0),
          weight: formatNumber(lotData.weight, 3),
          candyRate: formatCurrency(lotData.candyRate, 2)
        });
        stateQty += lotData.qty;
        stateWeight += lotData.weight;
      }
      
      flattenedRows.push({
        isSubtotal: true,
        sNo: "",
        lotNo: "",
        qty: formatNumber(stateQty, 0),
        weight: formatNumber(stateWeight, 3),
        candyRate: ""
      });
      
      grandTotalQty += stateQty;
      grandTotalWeight += stateWeight;
    }
    
    return {
      rows: flattenedRows,
      totals: { "Total Qty": formatNumber(grandTotalQty, 0), "Total Weight": formatNumber(grandTotalWeight, 3) }
    };
  } else if (definition.handler === "stockPartyCandy") {
    const partyGroups = new Map();
    rows.forEach(row => {
      const party = row.supplier || "Unknown Supplier";
      if (!partyGroups.has(party)) partyGroups.set(party, new Map());
      const lotGroups = partyGroups.get(party);
      
      const lotKey = `${row.candyRate}`;
      if (!lotGroups.has(lotKey)) {
        lotGroups.set(lotKey, { candyRate: row.candyRate, qty: 0, weight: 0 });
      }
      
      const current = lotGroups.get(lotKey);
      current.qty += row.qty;
      current.weight += row.weight;
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;

    for (const [party, lotGroups] of partyGroups.entries()) {
      flattenedRows.push({ isSubHeader: true, subHeaderText: party.toUpperCase() });
      
      let partyQty = 0;
      let partyWeight = 0;
      let sNo = 1;
      
      for (const lotData of lotGroups.values()) {
        flattenedRows.push({
          sNo: sNo++,
          candyRate: formatCurrency(lotData.candyRate, 2),
          qty: formatNumber(lotData.qty, 2), // Matching the format in the user's template for Closing Qty
          weight: formatNumber(lotData.weight, 2) // Matching Closing Kg format
        });
        partyQty += lotData.qty;
        partyWeight += lotData.weight;
      }
      
      flattenedRows.push({
        isSubtotal: true,
        sNo: "",
        candyRate: "",
        qty: formatNumber(partyQty, 2),
        weight: formatNumber(partyWeight, 2)
      });
      
      grandTotalQty += partyQty;
      grandTotalWeight += partyWeight;
    }
    
    return {
      rows: flattenedRows,
      totals: { "Total Qty": formatNumber(grandTotalQty, 2), "Total Weight": formatNumber(grandTotalWeight, 2) }
    };
  } else if (definition.handler === "stockLocation") {
    const godownGroups = new Map();
    rows.forEach(row => {
      const godown = row.godown || "Unknown Location";
      if (!godownGroups.has(godown)) godownGroups.set(godown, new Map());
      const lotGroups = godownGroups.get(godown);
      
      const lotKey = `${row.lotNo}`;
      if (!lotGroups.has(lotKey)) {
        lotGroups.set(lotKey, { lotNo: row.lotNo, qty: 0, weight: 0, value: 0 });
      }
      
      const current = lotGroups.get(lotKey);
      current.qty += row.qty;
      current.weight += row.weight;
      current.value += row.value;
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;
    let grandTotalValue = 0;

    for (const [godown, lotGroups] of godownGroups.entries()) {
      flattenedRows.push({ isSubHeader: true, subHeaderText: godown }); // Usually not uppercase in the image
      
      let sNo = 1;
      let godownQty = 0;
      let godownWeight = 0;
      let godownValue = 0;
      
      for (const lotData of lotGroups.values()) {
        flattenedRows.push({
          sNo: sNo++,
          lotNo: lotData.lotNo,
          qty: formatNumber(lotData.qty, 0),
          weight: formatNumber(lotData.weight, 2),
          value: formatCurrency(lotData.value, 2)
        });
        godownQty += lotData.qty;
        godownWeight += lotData.weight;
        godownValue += lotData.value;
        grandTotalQty += lotData.qty;
        grandTotalWeight += lotData.weight;
        grandTotalValue += lotData.value;
      }
      
      flattenedRows.push({
        isSubtotal: true,
        sNo: "",
        lotNo: "",
        qty: formatNumber(godownQty, 0),
        weight: formatNumber(godownWeight, 2),
        value: formatCurrency(godownValue, 2)
      });
    }
    
    return {
      rows: flattenedRows,
      totals: { "Total Qty": formatNumber(grandTotalQty, 0), "Total Kgs": formatNumber(grandTotalWeight, 2), "Total Value": formatCurrency(grandTotalValue, 2) }
    };
  } else if (definition.handler === "stockAvgCandy") {
    const candyGroups = new Map();
    rows.forEach(row => {
      const rate = row.candyRate || 0;
      if (!candyGroups.has(rate)) candyGroups.set(rate, { candyRate: rate, qty: 0, weight: 0, value: 0 });
      const current = candyGroups.get(rate);
      current.qty += row.qty;
      current.weight += row.weight;
      current.value += row.value;
    });

    const flattenedRows = [];
    let grandTotalQty = 0;
    let grandTotalWeight = 0;
    let grandTotalValue = 0;

    let sNo = 1;
    const sortedRates = [...candyGroups.keys()].sort((a, b) => a - b);
    
    for (const rate of sortedRates) {
      const data = candyGroups.get(rate);
      flattenedRows.push({
        sNo: sNo++,
        candyRate: formatCurrency(data.candyRate, 2),
        qty: formatNumber(data.qty, 0),
        weight: formatNumber(data.weight, 3),
        avgRate: formatCurrency(data.weight > 0 ? (data.value / data.weight) * 356 : 0, 2)
      });
      grandTotalQty += data.qty;
      grandTotalWeight += data.weight;
      grandTotalValue += data.value;
    }
    
    const overallAvg = grandTotalWeight > 0 ? (grandTotalValue / grandTotalWeight) * 356 : 0;
    return {
      rows: flattenedRows,
      totals: { "Total Bales": formatNumber(grandTotalQty, 0), "Total Kg": formatNumber(grandTotalWeight, 3), "Overall Avg Rate": formatCurrency(overallAvg, 2) }
    };
  } else {
    const keys = definition.handler === "stockCandy" ? ["candyRate"] : ["supplier", "candyRate"];
    rows = aggregate(rows, keys).map((row, index) => definition.handler === "stockPartyValue" ? ({ sNo: index + 1, supplier: row.supplier, rate: formatCurrency(row.candyRate, 2), bales: row.qty, candies: formatNumber(row.weight / 355.62, 3), value: formatCurrency((row.weight / 355.62) * row.candyRate, 2) }) : ({ sNo: index + 1, supplier: row.supplier, candyRate: formatCurrency(row.candyRate, 2), qty: row.qty, weight: formatNumber(row.weight, 3) }));
  }
  return { rows, totals: { "Live stock rows": formatNumber(rows.length, 0) } };
};

export const buildCatalogReport = async (reportId, params) => {
  const definition = reportCatalog[reportId]; if (!definition) { const error = new Error("Unsupported report type"); error.statusCode = 404; throw error; }
  if (definition.status !== "enabled") { const error = new Error(definition.reason); error.statusCode = 409; throw error; }
  const requiredDates = definition.parameters?.some((parameter) => parameter.key === "fromDate"); if (requiredDates && (!/^\d{4}-\d{2}-\d{2}$/.test(params.fromDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(params.toDate || "") || params.fromDate > params.toDate)) { const error = new Error("Valid From Date and To Date are required"); error.statusCode = 400; throw error; }

  if (typeof definition.handler === "function") {
    const data = await definition.handler({ fromDate: params.fromDate, toDate: params.toDate, reportType: reportId, title: definition.name });
    return { reportTitle: definition.name, parameters: params, columns: data.columns, rows: data.rows, totals: data.totals, groupBy: definition.groupBy || null, generatedAt: new Date().toISOString(), liveOperationalStock: definition.category === "Stock" };
  }

  const data = definition.handler === "purchase" ? await buildPurchase(definition, params) : definition.handler === "inward" ? await buildInward(params, definition) : definition.handler.startsWith("issue") ? await buildIssue(definition, params) : await buildStock(definition, params);
  return { reportTitle: definition.name, parameters: params, columns: definition.columns, rows: data.rows, totals: data.totals, groupBy: definition.groupBy || null, generatedAt: new Date().toISOString(), liveOperationalStock: definition.category === "Stock" };
};

const optionMaps = { suppliers: [Supplier, "accountName"], "purchase-orders": [PurchaseOrder, "orderNo"], varieties: [Variety, "variety"], "mixing-groups": [MixingGroup, "mixingName"], stations: [Station, "station"], states: [State, "state"], godowns: [Godown, "godownName"] };
export const getOptions = async (source) => { const entry = optionMaps[source]; if (!entry) return []; const [Model, label] = entry; const values = await Model.findAll({ attributes: ["id", label], order: [[label, "ASC"]] }); return values.map((value) => ({ value: value.id, label: value[label] })); };
