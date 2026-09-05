// utils/helpers.js
import { Op } from "sequelize";
import db from "../models/index.js";

const { PurchaseOrder } = db;
const { InwardEntry } = db;
const { InwardLot } = db;

/**
 * Returns the NEXT auto-generated Purchase Order number
 * Format: PO/YY-YY/XXXX
 * - Resets every financial year (April 1 - March 31)
 * - Does NOT save to database — just calculates
 */
export const getNextPurchaseOrderNo = async () => {

  const now = new Date();
  let year = now.getFullYear();

  // Financial year: April – March
  if (now.getMonth() < 3) { 
    year = year - 1;
  }

  const nextYear = year + 1;

  const fyPrefix = `${year.toString().slice(-2)}-${nextYear
    .toString()
    .slice(-2)}`;

  const prefix = `PO/${fyPrefix}/`;

  const lastOrder = await PurchaseOrder.findOne({
    where: {
      orderNo: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["orderNo", "DESC"]],
  });

  let nextSeq = 1;

  if (lastOrder) {
    const parts = lastOrder.orderNo.split("/");
    const lastNum = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const padded = String(nextSeq).padStart(4, "0");

  return `${prefix}${padded}`;
};

export const getNextInwardNo = async () => {
  const now = new Date();
  let year = now.getFullYear();

  // Financial year: April to March
  if (now.getMonth() < 3) {
    year -= 1; // Jan–Mar belong to previous FY
  }

  const nextYear = year + 1;
  const fyPrefix = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  const prefix = `GI/${fyPrefix}/`;

  const lastEntry = await InwardEntry.findOne({
    where: {
      inwardNo: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["inwardNo", "DESC"]],
  });

  let nextSeq = 1;

  if (lastEntry) {
    const parts = lastEntry.inwardNo.split("/");
    const lastNum = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const padded = String(nextSeq).padStart(4, "0");

  return `${prefix}${padded}`;
};

export const getNextLotNo = async () => {
  try {
    const now = new Date();
    let year = now.getFullYear();

    // Financial year logic (Apr–Mar)
    if (now.getMonth() < 3) {
      year -= 1; // Jan–Mar belongs to previous FY
    }

    const nextYear = year + 1;

    const financialYear = `${year.toString().slice(-2)}-${nextYear
      .toString()
      .slice(-2)}`;

    const prefix = `UC/${financialYear}/`;

    const lastLot = await InwardLot.findOne({
      where: {
        lotNo: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["lotNo", "DESC"]],
    });

    let nextSeq = 1;

    if (lastLot && lastLot.lotNo) {
      const lastNumber = lastLot.lotNo.split("/").pop();
      const parsed = parseInt(lastNumber, 10);

      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating next lot no:", error);
    throw error;
  }
};

const { Issue } = db;

export const getNextIssueNumber = async () => {
  try {
    const now = new Date();
    let year = now.getFullYear();

    // Financial year: April–March
    if (now.getMonth() < 3) {
      year -= 1; // Jan–Mar belong to previous FY
    }

    const nextYear = year + 1;

    const financialYear = `${year.toString().slice(-2)}-${nextYear
      .toString()
      .slice(-2)}`;

    const prefix = `ISSUE/${financialYear}/`;

    const lastIssue = await Issue.findOne({
      where: {
        issueNumber: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["issueNumber", "DESC"]],
    });

    let nextSeq = 1;

    if (lastIssue && lastIssue.issueNumber) {
      const lastNumber = lastIssue.issueNumber.split("/").pop();
      const parsed = parseInt(lastNumber, 10);

      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating next issue number:", error);
    throw error;
  }
};

const { LocationTransfer } = db;
export const getNextLocationTransferNo = async () => {
  const now = new Date();
  let year = now.getFullYear();

  // Financial year: April 1 – March 31
  if (now.getMonth() < 3) {
    year = year - 1;
  }

  const nextYear = year + 1;
  const fyPrefix = `${year.toString().slice(-2)}-${nextYear.toString().slice(-2)}`;

  const prefix = `LT/${fyPrefix}/`;

  const lastTransfer = await LocationTransfer.findOne({
    where: {
      transferNo: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["transferNo", "DESC"]],
  });

  let nextSeq = 1;

  if (lastTransfer && lastTransfer.transferNo) {
    const parts = lastTransfer.transferNo.split("/");
    const lastNum = parseInt(parts[parts.length - 1], 10);

    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const padded = String(nextSeq).padStart(4, "0");

  return `${prefix}${padded}`;
};

// transaction-waste waste cotton sales order 
const { SalesOrder } = db;

export const getNextSalesOrderNo = async () => {
  try {
    const result = await SalesOrder.findOne({
      attributes: [
        [
          SalesOrder.sequelize.fn(
            "MAX",
            SalesOrder.sequelize.cast(
              SalesOrder.sequelize.col("orderNo"),
              "INTEGER"
            )
          ),
          "maxOrderNo",
        ],
      ],
      raw: true,
    });

    const maxOrderNo = result?.maxOrderNo || 0;

    return (parseInt(maxOrderNo, 10) + 1).toString();
  } catch (error) {
    console.error("Error generating sales order number:", error);
    throw error;
  }
};

const { Invoice } = db;

export const getNextInvoiceNo = async () => {
  try {
    const result = await Invoice.findOne({
      attributes: [
        [
          Invoice.sequelize.fn(
            "MAX",
            Invoice.sequelize.cast(
              Invoice.sequelize.col("invoiceNo"),
              "INTEGER"
            )
          ),
          "maxInvoiceNo",
        ],
      ],
      raw: true,
    });

    const maxInvoiceNo = result?.maxInvoiceNo || 0;

    return (parseInt(maxInvoiceNo, 10) + 1).toString();
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw error;
  }
};


//masters Auto Code generation function

const { Broker } = db;

export const getNextBrokerCode = async () => {
  try {
    const result = await Broker.findOne({
      attributes: [
        [Broker.sequelize.fn("MAX", Broker.sequelize.col("brokerCode")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating broker code:", error);
    throw error;
  }
};

const { Commodity } = db;

export const getNextCommodityCode = async () => {
  try {
    const result = await Commodity.findOne({
      attributes: [
        [
          Commodity.sequelize.fn(
            "MAX",
            Commodity.sequelize.col("commodityCode")
          ),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating commodity code:", error);
    throw error;
  }
};

const { CompanyBroker } = db;

export const getNextCompanyBrokerCode = async () => {
  try {
    const result = await CompanyBroker.findOne({
      attributes: [
        [
          CompanyBroker.sequelize.fn(
            "MAX",
            CompanyBroker.sequelize.col("code")
          ),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating company broker code:", error);
    throw error;
  }
};

const { Fibre } = db;

export const getNextFibreCode = async () => {
  try {
    const result = await Fibre.findOne({
      attributes: [
        [Fibre.sequelize.fn("MAX", Fibre.sequelize.col("code")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating fibre code:", error);
    throw error;
  }
};

const { Godown } = db;

export const getNextGodownCode = async () => {
  try {
    const result = await Godown.findOne({
      attributes: [
        [Godown.sequelize.fn("MAX", Godown.sequelize.col("code")), "maxCode"],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating godown code:", error);
    throw error;
  }
};

const { Mixing } = db;

export const getNextMixingCode = async () => {
  try {
    const result = await Mixing.findOne({
      attributes: [
        [
          Mixing.sequelize.fn("MAX", Mixing.sequelize.col("mixing_code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating mixing code:", error);
    throw error;
  }
};

const { MixingGroup } = db;

export const getNextMixingCode1 = async () => {
  try {
    const result = await MixingGroup.findOne({
      attributes: [
        [
          MixingGroup.sequelize.fn("MAX", MixingGroup.sequelize.col("mixingCode")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating mixing code:", error);
    throw error;
  }
};
// export const getNextMixingCode1 = async () => {
//   try {
//     const result = await MixingGroup.findOne({
//       attributes: [
//         [
//           MixingGroup.sequelize.fn(
//             "MAX",
//             MixingGroup.sequelize.col("mixingCode")
//           ),
//           "maxCode",
//         ],
//       ],
//       raw: true,
//     });

//     const maxCode = result?.maxCode || 0;
//     return Number(maxCode) + 1;
//   } catch (error) {
//     console.error("Error generating mixing group code:", error);
//     throw error;
//   }
// };

const { PackingType } = db;

export const getNextPackingTypeCode = async () => {
  try {
    const result = await PackingType.findOne({
      attributes: [
        [
          PackingType.sequelize.fn("MAX", PackingType.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating packing type code:", error);
    throw error;
  }
};

const { State } = db;

export const getNextStateCode = async () => {
  try {
    const result = await State.findOne({
      attributes: [
        [
          State.sequelize.fn("MAX", State.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating state code:", error);
    throw error;
  }
};

const { Station } = db;

export const getNextStationCode = async () => {
  try {
    const result = await Station.findOne({
      attributes: [
        [
          Station.sequelize.fn("MAX", Station.sequelize.col("code")),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode || 0;
    return maxCode + 1;
  } catch (error) {
    console.error("Error generating station code:", error);
    throw error;
  }
};
const { Supplier } = db;

export const getNextSupplierCode = async () => {
  try {
    const result = await Supplier.findOne({
      attributes: [
        [
          Supplier.sequelize.fn(
            "MAX",
            Supplier.sequelize.cast(
              Supplier.sequelize.col("code"),
              "INTEGER"
            )
          ),
          "maxCode",
        ],
      ],
      raw: true,
    });

    const maxCode = result?.maxCode;

    if (!maxCode) return "1";

    const nextCode = (parseInt(maxCode, 10) + 1).toString();
    return nextCode;

  } catch (error) {
    console.error("Error generating supplier code:", error);
    throw error;
  }
};

const { Transport } = db;

export const getNextTransportCode = async () => {
  const result = await Transport.findOne({
    attributes: [
      [
        Transport.sequelize.fn(
          "MAX",
          Transport.sequelize.col("transportCode")
        ),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};

const { Variety } = db;

export const getNextVarietyCode = async () => {
  const result = await Variety.findOne({
    attributes: [
      [
        Variety.sequelize.fn("MAX", Variety.sequelize.col("code")),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};
const { WasteMaster } = db;

export const getNextWasteMasterCode = async () => {
  const result = await WasteMaster.findOne({
    attributes: [
      [
        WasteMaster.sequelize.fn("MAX", WasteMaster.sequelize.col("code")),
        "maxCode",
      ],
    ],
    raw: true,
  });

  const maxCode = result?.maxCode || 0;
  return maxCode + 1;
};

const { FinalInvoiceHead } = db;

export const getNextVoucherNo = async (tcType) => {

  // const prefix = tcType.toUpperCase(); 
  // Map tcType to prefix
  tcType = tcType.toUpperCase();
  const prefix = tcType === "UPCOUNTRY" ? "U" : "L";

  const result = await FinalInvoiceHead.findOne({
    attributes: [
      [
        FinalInvoiceHead.sequelize.fn(
          "MAX",
          FinalInvoiceHead.sequelize.literal(
            `CAST(SUBSTRING(voucherNo, 2) AS UNSIGNED)`
          )
        ),
        "maxVoucher",
      ],
    ],
    where: {
      voucherNo: {
        [Op.like]: `${prefix}%`,
      },
    },
    raw: true,
  });

  const maxVoucher = result?.maxVoucher || 0;

  return `${prefix}${maxVoucher + 1}`;
};


