// services/invoiceService.js
import db from "../../../models/index.js";
import { Op } from "sequelize";
import { getNextInvoiceNo } from "../../../utils/helpers.js";

const { Invoice, InvoiceDetail, SalesOrder, Supplier, WastePacking } = db;

export const create = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    if (!data.invoiceNo) {
      data.invoiceNo = await getNextInvoiceNo();
    }

    // Validation
    if (
      !data.date ||
      !data.invoiceType ||
      !data.supplierId ||
      !data.assessableValue ||
      !data.subTotal ||
      !data.invoiceValue ||
      !data.details ||
      !Array.isArray(data.details) ||
      data.details.length === 0
    ) {
      throw new Error("Missing required fields or details array is empty");
    }

    // Unique invoice number
    const existing = await Invoice.findOne({
      where: { invoiceNo: data.invoiceNo },
    });

    if (existing) {
      throw new Error("Invoice number already exists");
    }

    // Validate Supplier
    const supplier = await Supplier.findByPk(data.supplierId);
    if (!supplier) {
      throw new Error("Invalid supplierId");
    }

    // Validate Sales Order (optional)
    if (data.salesOrderId) {
      const order = await SalesOrder.findByPk(data.salesOrderId);
      if (!order) {
        throw new Error("Invalid salesOrderId");
      }
    }

    // Check if any of the bales are already invoiced in another invoice
    const baleNos = data.details.map((d) => d.baleNo);
    const alreadyInvoiced = await InvoiceDetail.findOne({
      where: {
        baleNo: baleNos,
      },
    });
    if (alreadyInvoiced) {
      throw new Error(`Bale ${alreadyInvoiced.baleNo} has already been invoiced in another invoice`);
    }

    // Prepare details
    const detailsToCreate = data.details.map((detail) => ({
      wasteName: detail.wasteName,
      lotNo: detail.lotNo,
      baleNo: detail.baleNo,
      grossWt: parseFloat(detail.grossWt) || 0,
      tareWt: parseFloat(detail.tareWt) || 0,
      netWt: parseFloat(detail.netWt) || 0,
    }));

    // Create Invoice Header
    const invoice = await Invoice.create(
      {
        invoiceNo: data.invoiceNo,
        date: data.date,
        invoiceType: data.invoiceType,
        supplierId: data.supplierId,
        address: data.address,

        assessableValue: parseFloat(data.assessableValue),
        charity: parseFloat(data.charity) || 0,
        vatTax: parseFloat(data.vatTax) || 0,
        cenvat: parseFloat(data.cenvat) || 0,
        duty: parseFloat(data.duty) || 0,
        cess: parseFloat(data.cess) || 0,
        hsCess: parseFloat(data.hsCess) || 0,
        tcs: parseFloat(data.tcs) || 0,
        tcsRs: parseFloat(data.tcsRs) || 0,
        pfCharges: parseFloat(data.pfCharges) || 0,

        subTotal: parseFloat(data.subTotal),
        roundOff: parseFloat(data.roundOff) || 0,
        invoiceValue: parseFloat(data.invoiceValue),

        gst: parseFloat(data.gst) || 0,
        igst: parseFloat(data.igst) || 0,

        creditDays: data.creditDays || 0,
        interestPercent: parseFloat(data.interestPercent) || 0,

        transport: data.transport,
        lrNo: data.lrNo,
        lrDate: data.lrDate,
        vehicleNo: data.vehicleNo,
        removalTime: data.removalTime,
        eBill: data.eBill,
        exportTo: data.exportTo,
        approve: data.approve || false,

        salesOrderId: data.salesOrderId,
      },
      { transaction }
    );

    // Create Invoice Details
    await InvoiceDetail.bulkCreate(
      detailsToCreate.map((d) => ({
        ...d,
        invoiceId: invoice.id,
      })),
      { transaction }
    );

    await transaction.commit();

    return await Invoice.findByPk(invoice.id, {
      include: [
        { model: InvoiceDetail, as: "details" },
        { model: SalesOrder, as: "salesOrder" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAll = async () => {
  return await Invoice.findAll({
    include: [
      { model: InvoiceDetail, as: "details" },
      { model: SalesOrder, as: "salesOrder" },
      { model: Supplier, as: "supplier" },
    ],
    order: [["date", "DESC"], ["id", "DESC"]],
  });
};

export const getById = async (id) => {
  const invoice = await Invoice.findByPk(id, {
    include: [
      { model: InvoiceDetail, as: "details" },
      { model: SalesOrder, as: "salesOrder" },
      { model: Supplier, as: "supplier" },
    ],
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
};

export const update = async (id, data) => {
  const transaction = await db.sequelize.transaction();

  try {
    const invoice = await Invoice.findByPk(id, { transaction });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Unique invoice number check
    if (data.invoiceNo && data.invoiceNo !== invoice.invoiceNo) {
      const existing = await Invoice.findOne({
        where: { invoiceNo: data.invoiceNo, id: { [Op.ne]: id } },
      });

      if (existing) {
        throw new Error("Invoice number already exists");
      }
    }

    // Validate supplier
    if (data.supplierId) {
      const supplier = await Supplier.findByPk(data.supplierId);
      if (!supplier) {
        throw new Error("Invalid supplierId");
      }
    }

    // Validate sales order
    if (data.salesOrderId) {
      const order = await SalesOrder.findByPk(data.salesOrderId);
      if (!order) {
        throw new Error("Invalid salesOrderId");
      }
    }

    if (data.details && Array.isArray(data.details)) {
      const baleNos = data.details.map((d) => d.baleNo);
      const alreadyInvoiced = await InvoiceDetail.findOne({
        where: {
          baleNo: baleNos,
          invoiceId: { [Op.ne]: id }, // exclude current invoice
        },
      });
      if (alreadyInvoiced) {
        throw new Error(`Bale ${alreadyInvoiced.baleNo} has already been invoiced in another invoice`);
      }
    }

    await invoice.update(
      {
        invoiceNo: data.invoiceNo ?? invoice.invoiceNo,
        date: data.date ?? invoice.date,
        invoiceType: data.invoiceType ?? invoice.invoiceType,
        supplierId: data.supplierId ?? invoice.supplierId,
        address: data.address ?? invoice.address,

        assessableValue:
          data.assessableValue !== undefined
            ? parseFloat(data.assessableValue)
            : invoice.assessableValue,

        charity:
          data.charity !== undefined
            ? parseFloat(data.charity)
            : invoice.charity,

        vatTax:
          data.vatTax !== undefined
            ? parseFloat(data.vatTax)
            : invoice.vatTax,

        cenvat:
          data.cenvat !== undefined
            ? parseFloat(data.cenvat)
            : invoice.cenvat,

        duty:
          data.duty !== undefined
            ? parseFloat(data.duty)
            : invoice.duty,

        cess:
          data.cess !== undefined
            ? parseFloat(data.cess)
            : invoice.cess,

        hsCess:
          data.hsCess !== undefined
            ? parseFloat(data.hsCess)
            : invoice.hsCess,

        tcs:
          data.tcs !== undefined
            ? parseFloat(data.tcs)
            : invoice.tcs,

        tcsRs:
          data.tcsRs !== undefined
            ? parseFloat(data.tcsRs)
            : invoice.tcsRs,

        pfCharges:
          data.pfCharges !== undefined
            ? parseFloat(data.pfCharges)
            : invoice.pfCharges,

        subTotal:
          data.subTotal !== undefined
            ? parseFloat(data.subTotal)
            : invoice.subTotal,

        roundOff:
          data.roundOff !== undefined
            ? parseFloat(data.roundOff)
            : invoice.roundOff,

        invoiceValue:
          data.invoiceValue !== undefined
            ? parseFloat(data.invoiceValue)
            : invoice.invoiceValue,

        gst:
          data.gst !== undefined
            ? parseFloat(data.gst)
            : invoice.gst,

        igst:
          data.igst !== undefined
            ? parseFloat(data.igst)
            : invoice.igst,

        creditDays: data.creditDays ?? invoice.creditDays,
        interestPercent:
          data.interestPercent !== undefined
            ? parseFloat(data.interestPercent)
            : invoice.interestPercent,

        transport: data.transport ?? invoice.transport,
        lrNo: data.lrNo ?? invoice.lrNo,
        lrDate: data.lrDate ?? invoice.lrDate,
        vehicleNo: data.vehicleNo ?? invoice.vehicleNo,
        removalTime: data.removalTime ?? invoice.removalTime,
        eBill: data.eBill ?? invoice.eBill,
        exportTo: data.exportTo ?? invoice.exportTo,
        approve: data.approve ?? invoice.approve,

        salesOrderId: data.salesOrderId ?? invoice.salesOrderId,
      },
      { transaction }
    );

    if (data.details && Array.isArray(data.details)) {
      await InvoiceDetail.destroy({
        where: { invoiceId: id },
        transaction,
      });

      const newDetails = data.details.map((d) => ({
        invoiceId: id,
        wasteName: d.wasteName,
        lotNo: d.lotNo,
        baleNo: d.baleNo,
        grossWt: parseFloat(d.grossWt) || 0,
        tareWt: parseFloat(d.tareWt) || 0,
        netWt: parseFloat(d.netWt) || 0,
      }));

      await InvoiceDetail.bulkCreate(newDetails, { transaction });
    }

    await transaction.commit();

    return await Invoice.findByPk(id, {
      include: [
        { model: InvoiceDetail, as: "details" },
        { model: SalesOrder, as: "salesOrder" },
        { model: Supplier, as: "supplier" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const remove = async (id) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await invoice.destroy();
};

export const getInvoiceNoWiseReport = async (startDate, endDate) => {
  const whereClause = {};
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate],
    };
  }

  const invoices = await Invoice.findAll({
    where: whereClause,
    include: [
      { model: InvoiceDetail, as: "details" },
      { model: Supplier, as: "supplier" },
    ],
    order: [["date", "ASC"], ["invoiceNo", "ASC"]],
  });

  const groupedMap = new Map();

  invoices.forEach((inv) => {
    const invNo = inv.invoiceNo || "Unknown";
    if (!groupedMap.has(invNo)) {
      groupedMap.set(invNo, {
        invoiceNo: invNo,
        date: inv.date,
        partyName: inv.supplier?.accountName || inv.address || "Unknown",
        invoiceType: inv.invoiceType || "-",
        totalBales: 0,
        totalWeight: 0,
        assessableValue: 0,
        invoiceValue: 0,
      });
    }

    const group = groupedMap.get(invNo);
    const balesCount = inv.details?.length || 0;
    const netWeightSum = (inv.details || []).reduce((s, d) => s + (parseFloat(d.netWt) || 0), 0);
    const assVal = parseFloat(inv.assessableValue) || 0;
    const invVal = parseFloat(inv.invoiceValue) || 0;

    group.totalBales += balesCount;
    group.totalWeight += netWeightSum;
    group.assessableValue += assVal;
    group.invoiceValue += invVal;
  });

  const data = Array.from(groupedMap.values());

  const summary = {
    totalInvoices: data.length,
    totalBales: data.reduce((s, r) => s + r.totalBales, 0),
    totalWeight: data.reduce((s, r) => s + r.totalWeight, 0),
    totalAssessableValue: data.reduce((s, r) => s + r.assessableValue, 0),
    totalInvoiceValue: data.reduce((s, r) => s + r.invoiceValue, 0),
  };

  return { data, summary };
};

export const bulkImport = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { headers, details, packingDetails, invoiceTypes } = data;

    if (!headers || !details || !packingDetails || !invoiceTypes) {
      throw new Error("Invalid import payload: headers, details, packingDetails and invoiceTypes are required");
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

    // 1. Prepare helper structures
    const typeMap = new Map();
    invoiceTypes.forEach(t => {
      const code = Number(getVal(t, "Code ", "Code", "code"));
      const name = String(getVal(t, "Invoice Type", "invoiceType", "type") || "").trim();
      if (code && name) {
        typeMap.set(code, name);
      }
    });

    const invoiceNoToOrderNo = new Map();
    details.forEach(d => {
      const invNo = String(getVal(d, "Invoice No", "Invoice no", "invoiceNo") || "").trim();
      const orderNo = Number(getVal(d, "Order No", "Order no", "orderNo"));
      if (invNo && orderNo) {
        invoiceNoToOrderNo.set(invNo, orderNo);
      }
    });

    const invoiceNoToLinkNo = new Map();
    details.forEach(d => {
      const invNo = String(getVal(d, "Invoice No", "Invoice no", "invoiceNo") || "").trim();
      const lNo = Number(getVal(d, "Link no", "Link No", "linkNo"));
      if (invNo && lNo) {
        invoiceNoToLinkNo.set(invNo, lNo);
      }
    });

    const invoiceNoToLotNo = new Map();
    details.forEach(d => {
      const invNo = String(getVal(d, "Invoice No", "Invoice no", "invoiceNo") || "").trim();
      const lot = String(getVal(d, "Lot No", "Lot no", "lotNo") || "").trim();
      if (invNo && lot) {
        invoiceNoToLotNo.set(invNo, lot);
      }
    });

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

    const invoiceNoToWasteName = new Map();
    details.forEach(d => {
      const invNo = String(getVal(d, "Invoice No", "Invoice no", "invoiceNo") || "").trim();
      const wasteCode = Number(getVal(d, "P Code (WM ID)", "P Code", "pCode", "wasteCode"));
      if (invNo && wasteCode) {
        const oldName = legacyWasteCodeToName[wasteCode];
        const wasteName = oldName ? (wasteMasterByName.get(normalizeName(oldName)) || oldName) : "Unknown Waste";
        invoiceNoToWasteName.set(invNo, wasteName);
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

    // 3. Resolve Sales Orders from database
    const salesOrders = await SalesOrder.findAll({ transaction });
    const salesOrderByOrderNo = new Map();
    salesOrders.forEach(so => {
      salesOrderByOrderNo.set(String(so.orderNo).trim(), so);
    });

    // 3.5 Resolve Waste Packing lot numbers
    const packings = await WastePacking.findAll({ raw: true, transaction });
    const packingIdToLotNo = new Map();
    packings.forEach(p => {
      packingIdToLotNo.set(Number(p.id), String(p.lotNo).trim());
    });

    // 4. Truncate Invoice Details and Invoices safely
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;", { transaction });
    await db.sequelize.query("TRUNCATE TABLE `invoice_details`;", { transaction });
    await db.sequelize.query("TRUNCATE TABLE `invoices`;", { transaction });
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;", { transaction });

    // 5. Parse and insert Headers
    const headersToInsert = [];
    const invoiceNoToId = new Map();

    headers.forEach((h) => {
      const invoiceNo = String(getVal(h, "Invoice No", "Invoice no", "invoiceNo") || "").trim();
      if (!invoiceNo || isNaN(Number(invoiceNo)) || invoiceNo.toUpperCase() === 'NULL') return;

      const dateStr = getVal(h, "Invoice Date", "Invoice date", "date");
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

      const typeCode = Number(getVal(h, "Invoice Type Code", "Invoice Type code", "typeCode") || 0);
      const invoiceType = typeMap.get(typeCode) || "GST WASTE SALE INVOICE";

      const rawAccCode = String(getVal(h, "Account Code", "Account code", "accountCode") || "").trim();
      const partyName = String(getVal(h, "party", "Party", "accountName", "Account Name", "supplier") || "").trim();

      const supplier = supplierByCode.get(rawAccCode) ||
                       supplierByCode.get(rawAccCode.padStart(8, "0")) ||
                       supplierByCode.get(rawAccCode.replace(/^0+/, "")) ||
                       supplierByName.get(normalizeSupplierName(partyName));

      const supplierId = supplier ? supplier.id : 1;

      const assessableValue = parseFloat(getVal(h, "Assesable Value", "assessableValue") || 0);
      const charity = parseFloat(getVal(h, "Charity", "charity") || 0);
      const cenvat = parseFloat(getVal(h, "CENVAT", "cenvat") || 0);
      const duty = parseFloat(getVal(h, "Duty", "duty") || 0);
      const cess = parseFloat(getVal(h, "Chess", "cess") || 0);
      const hsCess = parseFloat(getVal(h, "HSChess", "hsCess") || 0);
      const tcs = parseFloat(getVal(h, "TCS", "tcs") || 0);
      const subTotal = parseFloat(getVal(h, "Sub Total", "subTotal") || 0);
      const roundOff = parseFloat(getVal(h, "Roundoff", "roundOff") || 0);
      const invoiceValue = parseFloat(getVal(h, "Total Value", "invoiceValue") || 0);

      const gst = parseFloat(getVal(h, "GST Amount", "gst") || 0);
      const igst = parseFloat(getVal(h, "IGST Amount", "igst") || 0);

      const creditDays = Number(getVal(h, "Credit Days", "creditDays") || 0);
      const interestPercent = parseFloat(getVal(h, "Interest Per", "interestPercent") || 0);

      const transport = String(getVal(h, "TransCode", "transport") || "-").trim();
      const lrNo = String(getVal(h, "LR No", "lrNo") || "-").trim();
      const vehicleNo = String(getVal(h, "Vehicle No", "vehicleNo") || "-").trim();
      const eBill = String(getVal(h, "Eway Billno", "eBill") || "").trim();
      const exportTo = String(getVal(h, "Export To", "exportTo") || "").trim();
      const approve = Boolean(getVal(h, "Approval", "approve"));

      const lrDateStr = getVal(h, "LR Date", "LR date", "lrDate");
      let lrDateVal = dateVal;
      if (lrDateStr && String(lrDateStr).trim().toUpperCase() !== 'NULL') {
        const s = String(lrDateStr).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
          lrDateVal = s.substring(0, 10);
        } else if (typeof lrDateStr === 'number' || (!isNaN(Number(s)) && !s.includes('-') && !s.includes('/'))) {
          const dateObj = new Date((Number(s) - 25569) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) {
            lrDateVal = dateObj.toISOString().split('T')[0];
          }
        } else {
          const parsed = new Date(s);
          if (!isNaN(parsed.getTime())) {
            lrDateVal = parsed.toISOString().split('T')[0];
          }
        }
      }

      // Link to salesOrderId
      const orderNo = invoiceNoToOrderNo.get(invoiceNo);
      const salesOrder = orderNo ? salesOrderByOrderNo.get(String(orderNo)) : null;
      const salesOrderId = salesOrder ? salesOrder.id : null;

      headersToInsert.push({
        id: Number(invoiceNo),
        invoiceNo,
        date: dateVal,
        invoiceType,
        supplierId,
        address: exportTo || "Unknown",
        assessableValue,
        charity,
        cenvat,
        duty,
        cess,
        hsCess,
        tcs,
        pfCharges: 0,
        subTotal,
        roundOff,
        invoiceValue,
        gst,
        igst,
        creditDays,
        interestPercent,
        transport,
        lrNo,
        lrDate: lrDateVal,
        vehicleNo,
        removalTime: "12:00 PM",
        eBill,
        exportTo,
        approve,
        salesOrderId
      });

      invoiceNoToId.set(invoiceNo, Number(invoiceNo));
    });

    await Invoice.bulkCreate(headersToInsert, { transaction });

    // 6. Parse and insert Details
    const packingDetailsByLinkNo = new Map();
    packingDetails.forEach(pDet => {
      const lNo = Number(getVal(pDet, "link no", "Link no", "Link No", "linkNo"));
      if (lNo) {
        if (!packingDetailsByLinkNo.has(lNo)) {
          packingDetailsByLinkNo.set(lNo, []);
        }
        packingDetailsByLinkNo.get(lNo).push(pDet);
      }
    });

    const detailsToInsert = [];
    
    for (const [invoiceNo, linkNo] of invoiceNoToLinkNo.entries()) {
      const invoiceId = invoiceNoToId.get(invoiceNo);
      if (!invoiceId) continue;

      const wasteName = invoiceNoToWasteName.get(invoiceNo) || "COMBER NOILS";
      const lotNo = invoiceNoToLotNo.get(invoiceNo) || "";

      // Find matching packing bales
      const matchingBales = packingDetailsByLinkNo.get(linkNo) || [];

      matchingBales.forEach(bale => {
        const packingId = Number(getVal(bale, "Code", "code"));
        const resolvedLotNo = packingIdToLotNo.get(packingId) || lotNo;
        const grossWeight = parseFloat(getVal(bale, "Gross Wgt", "Gross wgt", "grossWeight") || 0);
        const tareWeight = parseFloat(getVal(bale, "Tare Wgt", "tare wgt", "tareWeight") || 0);
        const netWeight = parseFloat(getVal(bale, "Net Wgt", "Net wgt", "netWeight") || 0);

        // Use the spreadsheet's Bale no directly since it is already formatted as WC-x-y-zzz
        const baleNo = String(getVal(bale, "Bale no", "Bale No", "baleNo") || "").trim();

        detailsToInsert.push({
          invoiceId,
          wasteName,
          lotNo: resolvedLotNo,
          baleNo,
          grossWt: grossWeight,
          tareWt: tareWeight,
          netWt: netWeight
        });
      });
    }

    await InvoiceDetail.bulkCreate(detailsToInsert, { transaction });

    await transaction.commit();
    return {
      importedCount: headersToInsert.length
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};