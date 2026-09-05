import db from "../../../models/index.js";

const {
  PurchaseOrder,
  Supplier,
  Broker,
  Variety,
  MixingGroup,
  Station,
  CompanyBroker,
} = db;

export const createPurchaseOrder = async (data) => {
  const required = [
    "orderNo",
    "orderDate",
    "supplierId",
    "varietyId",
    "mixingGroupId",
    "stationId",
    "orderType",
    "packingType",
    "quantity",
    "selectedRateType",
  ];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Validate foreign keys
  await Promise.all([
    Supplier.findByPk(data.supplierId).then((s) => !s && Promise.reject("Supplier not found")),
    Variety.findByPk(data.varietyId).then((v) => !v && Promise.reject("Variety not found")),
    MixingGroup.findByPk(data.mixingGroupId).then((g) => !g && Promise.reject("Mixing Group not found")),
    Station.findByPk(data.stationId).then((s) => !s && Promise.reject("Station not found")),
  ]);

  if (data.brokerId) {
    const broker = await Broker.findByPk(data.brokerId);
    if (!broker) throw new Error("Broker not found");
  }

  if (data.companyBrokerId) {
    const cb = await CompanyBroker.findByPk(data.companyBrokerId);
    if (!cb) throw new Error("Company Broker not found");
  }
  return await PurchaseOrder.create(data);
};

export const getAllPurchaseOrders = async () => {
  return await PurchaseOrder.findAll({
    include: [
      { model: Supplier, as: "supplier", attributes: ["id", "accountName"] },
      { model: Broker, as: "broker", attributes: ["id", "brokerName"] },
      { model: Variety, as: "variety", attributes: ["id", "variety"] },
      { model: MixingGroup, as: "mixingGroup", attributes: ["id", "mixingName"] },
      { model: Station, as: "station", attributes: ["id", "station"] },
      { model: CompanyBroker, as: "companyBroker", attributes: ["id", "companyName"] },
    ],
    order: [["orderDate", "DESC"]],
  });
};

export const getPurchaseOrderById = async (id) => {
  const order = await PurchaseOrder.findByPk(id, {
    include: [
      { model: Supplier, as: "supplier", attributes: ["accountName"] },
      { model: Broker, as: "broker", attributes: ["brokerName"] },
      { model: Variety, as: "variety", attributes: ["variety"] },
      { model: MixingGroup, as: "mixingGroup", attributes: ["mixingName"] },
      { model: Station, as: "station", attributes: ["station"] },
      { model: CompanyBroker, as: "companyBroker", attributes: ["companyName"] },
    ],
    // Optional: limit fields from main PurchaseOrder table if you want even smaller response
    attributes: [
      "id",
      "orderNo",
      "orderDate",
      "quantity",
      "candyRate",
      "quintalRate",
      "ratePerKg",
      "selectedRateType",
      "approxLotValue",
      "paymentMode",
      "currency",
      "packingType",
      "orderType",
      "staple",
      "moist",
      "mic",
      "str",
      "rd",
      "remarks",
      "lotClosed",
      "createdAt",
      "updatedAt",
      // add/remove fields as needed
    ],
  });

  if (!order) {
    throw new Error("Purchase order not found");
  }

  const data = order.toJSON();

  // Return clean, flat object with only names (no full nested objects)
  return {
    id: data.id,
    orderNo: data.orderNo,
    orderDate: data.orderDate,
    quantity: data.quantity,
    candyRate: data.candyRate,
    quintalRate: data.quintalRate,
    ratePerKg: data.ratePerKg,
    selectedRateType: data.selectedRateType,
    approxLotValue: data.approxLotValue,
    paymentMode: data.paymentMode,
    currency: data.currency,
    packingType: data.packingType,
    orderType: data.orderType,
    staple: data.staple,
    moist: data.moist,
    mic: data.mic,
    str: data.str,
    rd: data.rd,
    remarks: data.remarks,
    lotClosed: data.lotClosed,

    // Flattened names – exactly what you want
    supplier: data.supplier?.accountName || null,
    broker: data.broker?.brokerName || null,
    variety: data.variety?.variety || null,
    mixingGroup: data.mixingGroup?.mixingName || null,
    station: data.station?.station || null,
    companyBroker: data.companyBroker?.companyName || null || "NONE",
  };
};

export const updatePurchaseOrder = async (id, data) => {
  const order = await PurchaseOrder.findByPk(id);
  if (!order) throw new Error("Purchase order not found");

  // Prevent update if lotClosed is true (as per your form note)
  if (order.lotClosed) {
    throw new Error("This purchase order cannot be modified after lot entry");
  }

  return await order.update(data);
};

export const deletePurchaseOrder = async (id) => {
  const order = await PurchaseOrder.findByPk(id);
  if (!order) throw new Error("Purchase order not found");
  await order.destroy();
};