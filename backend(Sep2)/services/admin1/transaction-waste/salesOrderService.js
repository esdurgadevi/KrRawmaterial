// services/salesOrderService.js
import db from "../../../models/index.js";
import { Op } from "sequelize";

const { SalesOrder, SalesOrderDetail, Supplier, WastePackingDetail, WastePacking, InvoiceDetail } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Validation
    if (
      !data.orderNo ||
      !data.date ||
      !data.supplierId ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    // Unique orderNo
    const existing = await SalesOrder.findOne({
      where: { orderNo: data.orderNo },
    });

    if (existing) {
      throw new Error("Order number already exists");
    }

    // Validate detail rows
    data.details.forEach((detail) => {
      if (
        !detail.product ||
        !detail.packingId ||
        !detail.qty ||
        !detail.totalWt ||
        !detail.rate ||
        !detail.value
      ) {
        throw new Error("Missing required fields in details");
      }
    });

    // Create Sales Order
    const order = await SalesOrder.create(
      {
        orderNo: data.orderNo,
        date: data.date,
        supplierId: data.supplierId,
        broker: data.broker,
        broker1: data.broker1,
        payTerms: data.payTerms,
        payMode: data.payMode,
        creditDays: data.creditDays,
        bank: data.bank,
        despatchTo: data.despatchTo,
      },
      { transaction }
    );

    // Insert details
    await SalesOrderDetail.bulkCreate(
      data.details.map((d) => ({
        salesOrderId: order.id,
        product: d.product,
        packingId: d.packingId,
        qty: d.qty,
        totalWt: d.totalWt,
        rate: d.rate,
        ratePer: d.ratePer,
        value: d.value,
      })),
      { transaction }
    );

    await transaction.commit();

    return await SalesOrder.findByPk(order.id, {
      include: [
        { model: SalesOrderDetail, as: "details" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await SalesOrder.findAll({
    include: [
      {
        model: SalesOrderDetail,
        as: "details",
        include: [{ model: WastePacking, as: "packing" }],
      },
      { model: Supplier, as: "supplier" },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const order = await SalesOrder.findByPk(id, {
    include: [
      {
        model: SalesOrderDetail,
        as: "details",
        include: [{ model: WastePacking, as: "packing" }],
      },
      { model: Supplier, as: "supplier" },
    ],
  });

  if (!order) {
    throw new Error("Sales order not found");
  }

  return order;
};

export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const order = await SalesOrder.findByPk(id, { transaction });

    if (!order) {
      throw new Error("Sales order not found");
    }

    // orderNo uniqueness check
    if (data.orderNo && data.orderNo !== order.orderNo) {
      const existing = await SalesOrder.findOne({
        where: { orderNo: data.orderNo, id: { [Op.ne]: id } },
      });

      if (existing) {
        throw new Error("Order number already exists");
      }
    }

    // Update header
    await order.update(
      {
        orderNo: data.orderNo ?? order.orderNo,
        date: data.date ?? order.date,
        supplierId: data.supplierId ?? order.supplierId,
        broker: data.broker ?? order.broker,
        broker1: data.broker1 ?? order.broker1,
        payTerms: data.payTerms ?? order.payTerms,
        payMode: data.payMode ?? order.payMode,
        creditDays: data.creditDays ?? order.creditDays,
        bank: data.bank ?? order.bank,
        despatchTo: data.despatchTo ?? order.despatchTo,
      },
      { transaction }
    );

    // Replace details if provided
    if (data.details && Array.isArray(data.details) && data.details.length > 0) {

      data.details.forEach((detail) => {
        if (
          !detail.product ||
          !detail.packingId ||
          !detail.qty ||
          !detail.totalWt ||
          !detail.rate ||
          !detail.value
        ) {
          throw new Error("Missing required fields in details");
        }
      });

      // Delete old details
      await SalesOrderDetail.destroy({
        where: { salesOrderId: id },
        transaction,
      });

      // Insert new details
      await SalesOrderDetail.bulkCreate(
        data.details.map((d) => ({
          salesOrderId: id,
          product: d.product,
          packingId: d.packingId,
          qty: d.qty,
          totalWt: d.totalWt,
          rate: d.rate,
          ratePer: d.ratePer,
          value: d.value,
        })),
        { transaction }
      );
    }

    await transaction.commit();

    return await SalesOrder.findByPk(id, {
      include: [
        { model: SalesOrderDetail, as: "details" },
        { model: Supplier, as: "supplier" },
      ],
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const order = await SalesOrder.findByPk(id);

  if (!order) {
    throw new Error("Sales order not found");
  }

  await order.destroy();
};

export const getAvailableBales = async (salesOrderId, excludeInvoiceId) => {
  const order = await SalesOrder.findByPk(salesOrderId, {
    include: [{ model: SalesOrderDetail, as: "details" }],
  });

  if (!order) {
    throw new Error("Sales order not found");
  }

  const packingIds = order.details.map((d) => d.packingId).filter(Boolean);

  if (packingIds.length === 0) {
    return [];
  }

  const allBales = await WastePackingDetail.findAll({
    where: { wastePackingId: packingIds },
    include: [
      {
        model: WastePacking,
        as: "packing",
      },
    ],
  });

  const invoiceWhereClause = {};
  if (excludeInvoiceId) {
    invoiceWhereClause.invoiceId = { [Op.ne]: excludeInvoiceId };
  }
  const invoicedDetails = await InvoiceDetail.findAll({
    where: invoiceWhereClause,
    attributes: ["baleNo"],
  });

  const invoicedBaleNos = new Set(invoicedDetails.map((id) => id.baleNo));

  const availableBales = allBales.filter((bale) => !invoicedBaleNos.has(bale.baleNo));

  return availableBales.map((bale) => ({
    id: bale.id,
    baleNo: bale.baleNo,
    wasteName: bale.packing?.wasteType || "COMBER NOILS",
    lotNo: bale.packing?.lotNo || "",
    grossWt: parseFloat(bale.grossWeight),
    tareWt: parseFloat(bale.tareWeight) || 0,
    netWt: parseFloat(bale.netWeight),
    packingId: bale.wastePackingId,
  }));
};

export const bulkImport = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { headers, details, invoiceDetails, packingDetails } = data;

    if (!headers || !details || !invoiceDetails || !packingDetails) {
      throw new Error("Invalid import payload: headers, details, invoiceDetails and packingDetails are required");
    }

    const getVal = (row, ...keys) => {
      if (!row) return undefined;
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
      }
      const normTargets = keys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
      for (const key of Object.keys(row)) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normTargets.includes(normKey)) {
          return row[key];
        }
      }
      return undefined;
    };

    // 1. Prepare helper structures for mapping
    const orderToLinkNo = new Map();
    invoiceDetails.forEach(invDet => {
      const oNo = Number(getVal(invDet, "Order No", "Order no", "orderNo"));
      const lNo = Number(getVal(invDet, "Link no", "Link No", "linkNo"));
      if (oNo && lNo) {
        orderToLinkNo.set(oNo, lNo);
      }
    });

    const linkToPackingId = new Map();
    packingDetails.forEach(pDet => {
      const pCode = Number(getVal(pDet, "Code", "code"));
      const lNo = Number(getVal(pDet, "link no", "Link no", "Link No", "linkNo"));
      if (pCode && lNo) {
        linkToPackingId.set(lNo, pCode);
      }
    });

    // 2. Resolve Suppliers from database
    const suppliers = await Supplier.findAll({ transaction });
    const supplierByCode = new Map();
    const supplierByName = new Map();

    const normalizeSupplierName = (name) => {
      if (!name) return "";
      return String(name).trim().toLowerCase().replace(/\s+/g, "").replace(/['"“”\-\/\\\.]/g, "");
    };

    suppliers.forEach(s => {
      const codeStr = String(s.code || "").trim();
      if (codeStr) {
        supplierByCode.set(codeStr, s);
        supplierByCode.set(codeStr.padStart(8, "0"), s);
        supplierByCode.set(codeStr.replace(/^0+/, ""), s);
      }
      if (s.accountName) {
        supplierByName.set(normalizeSupplierName(s.accountName), s);
      }
    });

    // 3. Resolve Waste Masters name mapping
    const legacyWasteCodeToName = {
      1: "LICKERIN FLY",
      3: "FLAT STRIPS",
      4: "COMBER NOILS",
      5: "ROVING WASTE",
      6: "FAN WASTE",
      8: "PICKING WASTE",
      9: "YARN WASTE",
      37: "MICRO DUST 1",
      38: "MICRO DUST 2",
      101: "USED KOHLER KT 50 KVA GENERATOR  WITH ACCESSORIES  S.NO. IN1001852",
      102: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 6510 WITH SUESSEN COMPACT S.NO. 40021124-2243",
      103: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 6554 WITH SUESSEN COMPACT S.NO. 40021124 - 2244",
      104: "USED PREMIER ULTIMO SENSOR MACHINE",
      105: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 12446/2009 WITH SUESSEN COMPACT S.NO. 225000337-10/2015",
      106: "USED R/F MACHINE LR6 S 1104 SPLS. NO.12522/2009 WITH SUESSEN COMPACT S.NO. 225000337-09/2015",
      107: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 12341 / 2009 WITH SUESSEN COMPACT S.NO. 40021124-2999",
      108: "USED R/F MACHINE LR6 S 1104 SPLS. NO. 12372 / 2009 WITH SUESSEN COMPACT S.NO. 40021124 - 1037",
      109: "USED RING TUBES  180 mm",
      110: "USED 45KVA SERVO STABILIZER",
      111: "USED BREAKER DRAWING MACHINE LD/2  SL.NO. 1043/2014",
      112: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 7604/2006  WITH SUESSEN  COMPACT S.NO. 40021124 - 2998 /2017",
      113: "USED R/F MACHINE LR6 S 1104 SPLS.NO. 6675/2006  WITH SUESSEN COMPACT S.NO. 40021124-2245",
      114: "USED R/F MACHINE LR6 S 1104 SPLS NO. 6473/2005 WITH SUESSEN COMPACT S.NO. 40021124 - 1036",
      115: "USED AUTOCONER MURATA 21C 60 DRUM MACHINE NO. 05SX226160-001",
      116: "USED R/F MACHINE LR6 S 1104 SPLS NO . 6948/2006 WITH SUESSEN COMPACT S.NO 40021124 - 2247"
    };

    const normalizeName = (name) => {
      if (!name) return "";
      return name.trim().toLowerCase()
        .replace(/\s+/g, "")
        .replace(/['"“”\-\/\\\.]/g, "")
        .replace(/mc/g, "machine")
        .replace(/slno/g, "sno")
        .replace(/sno/g, "sno")
        .replace(/compact/g, "")
        .replace(/spls/g, "spindle")
        .replace(/spindles/g, "spindle");
    };

    const wasteMasters = await db.WasteMaster.findAll({ raw: true, transaction });
    const wasteMasterByName = new Map();
    wasteMasters.forEach((wm) => {
      wasteMasterByName.set(normalizeName(wm.waste), wm.waste.trim());
    });

    // 4. Truncate Sales Orders and Details safely
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;", { transaction });
    await db.sequelize.query("TRUNCATE TABLE `sales_order_details`;", { transaction });
    await db.sequelize.query("TRUNCATE TABLE `sales_orders`;", { transaction });
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;", { transaction });

    // 5. Parse and insert Headers
    const headersToInsert = [];
    const salesOrderNoToId = new Map();

    headers.forEach((h) => {
      const orderNo = String(getVal(h, "Order no", "Order No", "orderNo") || "").trim();
      if (!orderNo || isNaN(Number(orderNo)) || orderNo.toUpperCase() === 'NULL') return;

      const dateStr = getVal(h, "order date", "Order Date", "date");
      let dateVal = new Date().toISOString().split('T')[0];
      if (dateStr && String(dateStr).trim().toUpperCase() !== 'NULL') {
        const s = String(dateStr).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          dateVal = s.substring(0, 10);
        } else if (typeof dateStr === 'number' || (!isNaN(Number(s)) && !s.includes('-') && !s.includes('/'))) {
          const dateObj = new Date((Number(s) - 25569) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) {
            dateVal = dateObj.toISOString().split('T')[0];
          }
        } else {
          const parsed = new Date(s);
          if (!isNaN(parsed.getTime())) {
            dateVal = parsed.toISOString().split('T')[0];
          }
        }
      }

      const rawAccCode = String(getVal(h, "account code", "Account Code", "accountCode") || "").trim();
      const partyName = String(getVal(h, "party", "Party", "accountName", "Account Name", "supplier") || "").trim();
      const broker = String(getVal(h, "broker code", "Broker Code", "broker") || "-").trim();
      const broker1 = String(getVal(h, "broker code 1", "Broker Code 1", "broker1") || "-").trim();
      const payTerms = String(getVal(h, "pay terms", "Pay Terms", "payTerms") || "-").trim();
      const payMode = String(getVal(h, "payment mode", "Payment Mode", "payMode") || "CASH").trim();
      const creditDays = Number(getVal(h, "credit days", "Credit Days", "creditDays") || 0);
      const bank = String(getVal(h, "bank code", "Bank Code", "bank") || "-").trim();
      const despatchTo = String(getVal(h, "despatch", "Despatch", "despatchTo") || "").trim();

      const supplier = supplierByCode.get(rawAccCode) ||
                       supplierByCode.get(rawAccCode.padStart(8, "0")) ||
                       supplierByCode.get(rawAccCode.replace(/^0+/, "")) ||
                       supplierByName.get(normalizeSupplierName(partyName));

      const supplierId = supplier ? supplier.id : 1;

      headersToInsert.push({
        id: Number(orderNo),
        orderNo: orderNo,
        date: dateVal,
        supplierId: supplierId || 1, // Fallback supplier
        broker,
        broker1,
        payTerms,
        payMode,
        creditDays,
        bank,
        despatchTo
      });
      
      salesOrderNoToId.set(Number(orderNo), Number(orderNo));
    });

    await SalesOrder.bulkCreate(headersToInsert, { transaction });

    // 6. Parse and insert Details
    const detailsToInsert = [];
    details.forEach((d) => {
      const orderNo = Number(getVal(d, "Order no", "Order No", "orderNo"));
      if (!orderNo || isNaN(orderNo)) return;

      const salesOrderId = salesOrderNoToId.get(orderNo);
      if (!salesOrderId) return;

      const wasteCode = Number(getVal(d, "waste code", "Waste Code", "wasteCode"));
      const qty = Number(getVal(d, "Quantity", "qty", "quantity") || 0);
      const totalWt = parseFloat(getVal(d, "total wgt", "Total Wgt", "totalWt", "total_wgt") || 0);
      const rate = parseFloat(getVal(d, "rate", "Rate") || 0);
      const ratePer = String(getVal(d, "rate per", "Rate Per", "ratePer") || "1").trim();
      const value = parseFloat(getVal(d, "value", "Value") || 0);

      // Resolve waste product name
      const oldName = legacyWasteCodeToName[wasteCode];
      const product = oldName ? (wasteMasterByName.get(normalizeName(oldName)) || oldName) : "Unknown Waste";

      // Resolve packingId using link chain
      const linkNo = orderToLinkNo.get(orderNo);
      const packingId = linkNo ? (linkToPackingId.get(linkNo) || null) : null;

      detailsToInsert.push({
        salesOrderId,
        product,
        packingId: packingId || 1, // Fallback to safe packing ID (1 exists)
        qty,
        totalWt,
        rate,
        ratePer,
        value
      });
    });

    await SalesOrderDetail.bulkCreate(detailsToInsert, { transaction });

    await transaction.commit();
    return {
      importedCount: headersToInsert.length
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
