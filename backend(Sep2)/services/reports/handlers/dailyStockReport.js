import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatNumber } from "../reportHelpers.js";

const { Issue, IssueItem, InwardLot, LotRejected } = db;

const generateDateRange = (startDateStr, endDateStr) => {
  const dates = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (start <= end) {
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, "0");
    const dd = String(start.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    start.setDate(start.getDate() + 1);
  }
  return dates;
};

const formatDate = (dateStr) => {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

export const dailyStockReport = async ({ fromDate, toDate, title }) => {
  // 1. Calculate Initial Opening Stock (Before fromDate)
  const inwardLotsBefore = await InwardLot.findAll({
    where: { lotDate: { [Op.lt]: fromDate } }
  });
  const totalInwardBefore = inwardLotsBefore.reduce((sum, lot) => sum + Number(lot.nettWeight || 0), 0);

  const issuesBefore = await Issue.findAll({
    where: { issueDate: { [Op.lt]: fromDate } },
    include: [{ model: IssueItem }]
  });
  let totalIssueBefore = 0;
  issuesBefore.forEach(i => (i.IssueItems || []).forEach(item => totalIssueBefore += Number(item.issueWeight || 0)));

  const rejectedLotsBefore = await LotRejected.findAll({
    include: [{
      model: InwardLot,
      as: "inwardLot",
      where: { lotDate: { [Op.lt]: fromDate } }
    }]
  });
  const totalRejectedBefore = rejectedLotsBefore.reduce((sum, r) => r.isRejected ? sum + Number(r.inwardLot.nettWeight || 0) : sum, 0);

  let currentOpening = totalInwardBefore - totalIssueBefore - totalRejectedBefore;

  // 2. Fetch all transactions between fromDate and toDate
  const inwardLotsRange = await InwardLot.findAll({
    where: { lotDate: { [Op.between]: [fromDate, toDate] } }
  });
  
  const issuesRange = await Issue.findAll({
    where: { issueDate: { [Op.between]: [fromDate, toDate] } },
    include: [{ model: IssueItem }]
  });

  const rejectedLotsRange = await LotRejected.findAll({
    include: [{
      model: InwardLot,
      as: "inwardLot",
      where: { lotDate: { [Op.between]: [fromDate, toDate] } }
    }]
  });

  // 3. Group by date
  const dateMaps = {};
  const dates = generateDateRange(fromDate, toDate);
  dates.forEach(date => {
    dateMaps[date] = { receipt: 0, issue: 0, rejected: 0 };
  });

  inwardLotsRange.forEach(lot => {
    if (dateMaps[lot.lotDate]) dateMaps[lot.lotDate].receipt += Number(lot.nettWeight || 0);
  });

  issuesRange.forEach(issue => {
    if (dateMaps[issue.issueDate]) {
      (issue.IssueItems || []).forEach(item => {
        dateMaps[issue.issueDate].issue += Number(item.issueWeight || 0);
      });
    }
  });

  rejectedLotsRange.forEach(r => {
    if (r.isRejected && dateMaps[r.inwardLot.lotDate]) {
      dateMaps[r.inwardLot.lotDate].rejected += Number(r.inwardLot.nettWeight || 0);
    }
  });

  // 4. Calculate day by day
  const rows = [];
  let sumReceipt = 0;
  let sumRejected = 0;
  let sumIssue = 0;

  dates.forEach(date => {
    const data = dateMaps[date];
    const opening = currentOpening;
    const receipt = data.receipt;
    const total = opening + receipt;
    const rejected = data.rejected;
    const issue = data.issue;
    const closing = total - rejected - issue;

    rows.push({
      date: formatDate(date),
      opening: formatNumber(opening, 0),
      receipt: formatNumber(receipt, 0),
      total: formatNumber(total, 0),
      rejected: formatNumber(rejected, 0),
      issue: formatNumber(issue, 0),
      closing: formatNumber(closing, 0)
    });

    sumReceipt += receipt;
    sumRejected += rejected;
    sumIssue += issue;
    
    currentOpening = closing;
  });

  return {
    title,
    columns: [
      { key: "date", label: "Date", align: "center", width: 80 },
      { key: "opening", label: "Opening", align: "right", width: 100 },
      { key: "receipt", label: "Receipt", align: "right", width: 100 },
      { key: "total", label: "Total", align: "right", width: 100 },
      { key: "rejected", label: "Rejected / Sales", align: "right", width: 120 },
      { key: "issue", label: "Issue", align: "right", width: 100 },
      { key: "closing", label: "Closing", align: "right", width: 100 },
    ],
    rows,
    totals: {
      "Total Receipt": formatNumber(sumReceipt, 0),
      "Total Rejected": formatNumber(sumRejected, 0),
      "Total Issue": formatNumber(sumIssue, 0)
    }
  };
};
