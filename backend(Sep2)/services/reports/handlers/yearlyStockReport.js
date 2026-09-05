import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatNumber } from "../reportHelpers.js";

const { Issue, IssueItem, InwardLot, LotRejected } = db;

const generateMonthRange = (startDateStr, endDateStr) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  start.setDate(1); // Set to start of month to avoid skipping months on 31st
  while (start <= end) {
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, "0");
    dates.push(`${yyyy}-${mm}`);
    start.setMonth(start.getMonth() + 1);
  }
  return dates;
};

const formatMonth = (yyyy_mm) => {
  const [yyyy, mm] = yyyy_mm.split("-");
  const date = new Date(yyyy, mm - 1, 1);
  return date.toLocaleString("default", { month: "short", year: "2-digit" }).replace(" ", "-");
};

export const yearlyStockReport = async ({ fromDate, toDate, title }) => {
  // 1. Calculate Initial Opening Stock (Before fromDate)
  const inwardLotsBefore = await InwardLot.findAll({
    where: { lotDate: { [Op.lt]: fromDate } },
    include: [{ model: db.InwardEntry, attributes: ["type"] }]
  });
  
  const issuesBefore = await Issue.findAll({
    where: { issueDate: { [Op.lt]: fromDate } },
    include: [{ 
      model: IssueItem,
      include: [{
        model: db.InwardLotWeightment,
        include: [{
          model: InwardLot,
          as: "inwardLot",
          include: [{ model: db.InwardEntry, attributes: ["type"] }]
        }]
      }]
    }]
  });
  
  const rejectedLotsBefore = await LotRejected.findAll({
    include: [{
      model: InwardLot,
      as: "inwardLot",
      where: { lotDate: { [Op.lt]: fromDate } },
      include: [{ model: db.InwardEntry, attributes: ["type"] }]
    }]
  });

  const openingByCountry = {};
  inwardLotsBefore.forEach(lot => {
    const country = lot.InwardEntry?.type || "Unknown";
    openingByCountry[country] = (openingByCountry[country] || 0) + Number(lot.nettWeight || 0);
  });
  issuesBefore.forEach(i => {
    (i.IssueItems || []).forEach(item => {
      const country = item.InwardLotWeightment?.inwardLot?.InwardEntry?.type || "Unknown";
      openingByCountry[country] = (openingByCountry[country] || 0) - Number(item.issueWeight || 0);
    });
  });
  rejectedLotsBefore.forEach(r => {
    if (r.isRejected) {
      const country = r.inwardLot?.InwardEntry?.type || "Unknown";
      openingByCountry[country] = (openingByCountry[country] || 0) - Number(r.inwardLot.nettWeight || 0);
    }
  });

  // 2. Fetch all transactions between fromDate and toDate
  const inwardLotsRange = await InwardLot.findAll({
    where: { lotDate: { [Op.between]: [fromDate, toDate] } },
    include: [{ model: db.InwardEntry, attributes: ["type"] }]
  });
  
  const issuesRange = await Issue.findAll({
    where: { issueDate: { [Op.between]: [fromDate, toDate] } },
    include: [{ 
      model: IssueItem,
      include: [{
        model: db.InwardLotWeightment,
        include: [{
          model: InwardLot,
          as: "inwardLot",
          include: [{ model: db.InwardEntry, attributes: ["type"] }]
        }]
      }]
    }]
  });

  const rejectedLotsRange = await LotRejected.findAll({
    include: [{
      model: InwardLot,
      as: "inwardLot",
      where: { lotDate: { [Op.between]: [fromDate, toDate] } },
      include: [{ model: db.InwardEntry, attributes: ["type"] }]
    }]
  });

  // 3. Group by country and month
  const countryMaps = {};
  const months = generateMonthRange(fromDate, toDate);
  
  const getCountryMap = (country) => {
    if (!countryMaps[country]) {
      countryMaps[country] = {};
      months.forEach(month => {
        countryMaps[country][month] = { receipt: 0, issue: 0, rejected: 0 };
      });
    }
    return countryMaps[country];
  };

  inwardLotsRange.forEach(lot => {
    const month = lot.lotDate.substring(0, 7);
    const country = lot.InwardEntry?.type || "Unknown";
    const cmap = getCountryMap(country);
    if (cmap[month]) cmap[month].receipt += Number(lot.nettWeight || 0);
  });

  issuesRange.forEach(issue => {
    const month = issue.issueDate.substring(0, 7);
    (issue.IssueItems || []).forEach(item => {
      const country = item.InwardLotWeightment?.inwardLot?.InwardEntry?.type || "Unknown";
      const cmap = getCountryMap(country);
      if (cmap[month]) cmap[month].issue += Number(item.issueWeight || 0);
    });
  });

  rejectedLotsRange.forEach(r => {
    if (r.isRejected) {
      const month = r.inwardLot.lotDate.substring(0, 7);
      const country = r.inwardLot?.InwardEntry?.type || "Unknown";
      const cmap = getCountryMap(country);
      if (cmap[month]) cmap[month].rejected += Number(r.inwardLot.nettWeight || 0);
    }
  });

  // 4. Calculate month by month for each country
  const rows = [];
  
  for (const [country, monthMaps] of Object.entries(countryMaps)) {
    rows.push({ isSubHeader: true, subHeaderText: country });
    
    let sumReceipt = 0;
    let sumRejected = 0;
    let sumIssue = 0;
    let currentOpening = openingByCountry[country] || 0;
    
    let firstMonthOpening = currentOpening;

    months.forEach(month => {
      const data = monthMaps[month];
      const opening = currentOpening;
      const receipt = data.receipt;
      const total = opening + receipt;
      const rejected = data.rejected;
      const issue = data.issue;
      const closing = total - rejected - issue;

      rows.push({
        country: "", 
        month: formatMonth(month),
        opening: formatNumber(opening, 0),
        receipt: formatNumber(receipt, 0),
        total: formatNumber(total, 0),
        issue: formatNumber(issue, 0),
        rejected: formatNumber(rejected, 0),
        closing: formatNumber(closing, 0)
      });

      sumReceipt += receipt;
      sumRejected += rejected;
      sumIssue += issue;
      currentOpening = closing;
    });

    // 5. Add Subtotal Row per country
    rows.push({
      isSubtotal: true,
      country: "",
      month: "",
      opening: formatNumber(firstMonthOpening, 0), 
      receipt: formatNumber(sumReceipt, 0),
      total: formatNumber(firstMonthOpening + sumReceipt, 0),
      issue: formatNumber(sumIssue, 0),
      rejected: formatNumber(sumRejected, 0),
      closing: formatNumber(currentOpening, 0) 
    });
  }

  return {
    title,
    columns: [
      { key: "country", label: "Country", width: 100 },
      { key: "month", label: "Month", align: "center", width: 80 },
      { key: "opening", label: "OPenKg", align: "right", width: 100 },
      { key: "receipt", label: "RecKg", align: "right", width: 100 },
      { key: "total", label: "TotalKg", align: "right", width: 100 },
      { key: "issue", label: "IssueKg", align: "right", width: 100 },
      { key: "rejected", label: "RejKgs", align: "right", width: 100 },
      { key: "closing", label: "ClgKg", align: "right", width: 100 },
    ],
    rows,
    totals: {} // Empty because we injected a custom subtotal row
  };
};
