import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { LotTestResult, InwardLot, InwardEntry, PurchaseOrder, Supplier, Variety } = db;

export const lotTestResultMoistureReport = async ({ fromDate, toDate, title }) => {
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
  });

  // Group by moisture value. Records with null/0 moist go into "No Moisture Data" group
  const moistureGroups = new Map();
  const NO_MOISTURE_KEY = "__NO_MOISTURE__";

  rows.forEach(record => {
    const moistVal = record.moist;
    const hasValidMoist =
      moistVal !== null &&
      moistVal !== undefined &&
      Number(moistVal) !== 0;

    const key = hasValidMoist ? Number(moistVal) : NO_MOISTURE_KEY;
    if (!moistureGroups.has(key)) {
      moistureGroups.set(key, []);
    }
    moistureGroups.get(key).push(record);
  });

  // Sort numeric keys ascending; put NO_MOISTURE at end
  const sortedKeys = [...moistureGroups.keys()].sort((a, b) => {
    if (a === NO_MOISTURE_KEY) return 1;
    if (b === NO_MOISTURE_KEY) return -1;
    return a - b;
  });

  const flattenedRows = [];

  for (const key of sortedKeys) {
    const lotGroup = moistureGroups.get(key);
    const headerText =
      key === NO_MOISTURE_KEY
        ? "No Moisture Data"
        : `Moisture: ${key}%`;

    flattenedRows.push({
      isSubHeader: true,
      subHeaderText: headerText,
    });

    let sNo = 1;
    for (const record of lotGroup) {
      const moistDisplay =
        record.moist !== null && record.moist !== undefined && Number(record.moist) !== 0
          ? formatNumber(record.moist, 2)
          : "-";

      flattenedRows.push({
        sNo: sNo++,
        lotNo: toText(record.lot?.lotNo),
        lotDate: formatDateDisplay(record.lot?.lotDate),
        inwardNo: toText(record.lot?.InwardEntry?.inwardNo),
        supplier: toText(record.lot?.InwardEntry?.purchaseOrder?.supplier?.accountName),
        variety: toText(record.lot?.InwardEntry?.purchaseOrder?.variety?.variety),
        moist: moistDisplay,
        rd: record.rd !== null && record.rd !== undefined ? formatNumber(record.rd, 2) : "-",
        staple: record.staple !== null && record.staple !== undefined ? formatNumber(record.staple, 2) : "-",
        strength: record.strength !== null && record.strength !== undefined ? formatNumber(record.strength, 2) : "-",
      });
    }
  }

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "lotDate", label: "Lot Date", width: 60, align: "center" },
      { key: "inwardNo", label: "Inward No", width: 70 },
      { key: "supplier", label: "Supplier", width: 110 },
      { key: "variety", label: "Variety", width: 80 },
      { key: "moist", label: "Moist %", width: 50, align: "right" },
      { key: "rd", label: "RD", width: 44, align: "right" },
      { key: "staple", label: "Staple", width: 50, align: "right" },
      { key: "strength", label: "Strength", width: 54, align: "right" },
    ],
    rows: flattenedRows,
    totals: {
      "Total Records": formatNumber(rows.length, 0),
    },
  };
};
