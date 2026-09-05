import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { Issue, IssueItem, InwardLotWeightment, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety, MixingGroup } = db;

export const issueReport = async ({ fromDate, toDate, title }) => {
  const issues = await Issue.findAll({
    where: {
      issueDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      {
        model: IssueItem,
        include: [
          {
            model: InwardLotWeightment,
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
                          { model: MixingGroup, as: "mixingGroup", attributes: ["mixingName"] },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { model: MixingGroup, as: "mixingGroup", attributes: ["mixingName"] },
      { model: MixingGroup, as: "toMixingGroup", attributes: ["mixingName"] },
    ],
    order: [["issueDate", "ASC"], ["id", "ASC"]],
  });

  const normalizedRows = [];
  let totalIssueWeight = 0;

  issues.forEach((issue, issueIndex) => {
    (issue.IssueItems || []).forEach((item, itemIndex) => {
      const weightment = item.InwardLotWeightment;
      const inwardLot = weightment?.inwardLot;
      const inwardEntry = inwardLot?.InwardEntry || inwardLot?.inwardEntry;
      const purchaseOrder = inwardEntry?.purchaseOrder;
      totalIssueWeight += Number(item.issueWeight || 0);

      normalizedRows.push({
        sNo: normalizedRows.length + 1,
        issueNumber: issueIndex === 0 && itemIndex === 0 ? toText(issue.issueNumber) : toText(issue.issueNumber),
        issueDate: formatDateDisplay(issue.issueDate),
        lotNo: toText(inwardLot?.lotNo),
        baleNo: toText(weightment?.baleNo),
        supplier: toText(purchaseOrder?.supplier?.accountName),
        variety: toText(purchaseOrder?.variety?.variety),
        mixingGroup: toText(purchaseOrder?.mixingGroup?.mixingName || issue.mixingGroup?.mixingName),
        issueWeight: formatNumber(item.issueWeight, 3),
      });
    });
  });

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "issueNumber", label: "Issue Number", width: 74 },
      { key: "issueDate", label: "Date", width: 58, align: "center" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "baleNo", label: "Bale Number", width: 74 },
      { key: "supplier", label: "Supplier", width: 108 },
      { key: "variety", label: "Variety", width: 78 },
      { key: "mixingGroup", label: "Mixing Group", width: 92 },
      { key: "issueWeight", label: "Issue Wt", width: 68, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Issue Wt": formatNumber(totalIssueWeight, 3),
      "Total Rows": formatNumber(normalizedRows.length, 0),
    },
  };
};