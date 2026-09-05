import { Op } from "sequelize";
import db from "../../../models/index.js";
import { formatDateDisplay, formatNumber, toText } from "../reportHelpers.js";

const { LocationTransfer, LocationTransferDetail, LocationTransferBale, Transport, InwardLot, InwardLotWeightment, Godown } = db;

export const locationTransferReport = async ({ fromDate, toDate, title }) => {
  const rows = await LocationTransfer.findAll({
    where: {
      transferDate: {
        [Op.between]: [fromDate, toDate],
      },
    },
    include: [
      { model: Transport, as: "transport", attributes: ["transportName"] },
      {
        model: LocationTransferDetail,
        as: "details",
        include: [
          { model: InwardLot, as: "lot", attributes: ["lotNo", "lotDate", "qty"] },
          {
            model: LocationTransferBale,
            as: "bales",
            include: [
              {
                model: InwardLotWeightment,
                as: "weightment",
                attributes: ["baleNo", "baleWeight"],
              },
            ],
          },
        ],
      },
    ],
    order: [["transferDate", "ASC"], ["id", "ASC"]],
  });

  const locationIds = [...new Set(rows.flatMap((transfer) => [transfer.fromLocationId, transfer.toLocationId]).filter(Boolean))];
  const locations = locationIds.length
    ? await Godown.findAll({
        where: { id: locationIds },
        attributes: ["id", "godownName"],
      })
    : [];
  const locationNameMap = new Map(locations.map((location) => [location.id, location.godownName]));

  const normalizedRows = [];
  let totalBaleWeight = 0;

  rows.forEach((transfer) => {
    (transfer.details || []).forEach((detail) => {
      (detail.bales || []).forEach((bale) => {
        totalBaleWeight += Number(bale.weightment?.baleWeight || 0);
        normalizedRows.push({
          sNo: normalizedRows.length + 1,
          transferNo: toText(transfer.transferNo),
          transferDate: formatDateDisplay(transfer.transferDate),
          fromLocation: toText(locationNameMap.get(transfer.fromLocationId) || transfer.fromLocationId),
          toLocation: toText(locationNameMap.get(transfer.toLocationId) || transfer.toLocationId),
          lotNo: toText(detail.lot?.lotNo),
          baleNo: toText(bale.weightment?.baleNo),
          transport: toText(transfer.transport?.transportName),
          baleWeight: formatNumber(bale.weightment?.baleWeight, 3),
          lotQty: formatNumber(detail.lot?.qty, 0),
        });
      });
    });
  });

  return {
    title,
    columns: [
      { key: "sNo", label: "S.No", width: 30, align: "right" },
      { key: "transferNo", label: "Transfer No", width: 72 },
      { key: "transferDate", label: "Date", width: 58, align: "center" },
      { key: "fromLocation", label: "From", width: 64 },
      { key: "toLocation", label: "To", width: 64 },
      { key: "lotNo", label: "Lot Number", width: 78 },
      { key: "baleNo", label: "Bale No", width: 72 },
      { key: "transport", label: "Transport", width: 84 },
      { key: "baleWeight", label: "Bale Wt", width: 56, align: "right" },
    ],
    rows: normalizedRows,
    totals: {
      "Total Bale Weight": formatNumber(totalBaleWeight, 3),
      "Total Rows": formatNumber(normalizedRows.length, 0),
    },
  };
};