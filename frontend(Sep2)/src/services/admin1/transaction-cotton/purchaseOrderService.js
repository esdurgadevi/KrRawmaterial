import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/purchase-orders";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Service methods (MATCHES BACKEND EXACTLY)
const purchaseOrderService = {
  // 🔹 Get all purchase orders
  getAll: async () => {
    const response = await api.get("/");
    return response.data.purchaseOrders; // { purchaseOrders }
  },

  // 🔹 Get purchase order by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.purchaseOrder; // { purchaseOrder }
  },
  // 🔹 Create purchase order
  create: async (data) => {
    console.log(data);
    const payload = {
      
      orderNo: data.orderNo,
      orderDate: data.orderDate, // YYYY-MM-DD

      supplierId: Number(data.supplierId),
      brokerId: data.brokerId ? Number(data.brokerId) : null,
      varietyId: Number(data.varietyId),
      mixingGroupId: Number(data.mixingGroupId),
      stationId: Number(data.stationId),

      expectedDeliveryDate: data.expectedDeliveryDate || null,

      orderType: data.orderType, // SPOT | F.O.R
      packingType: data.packingType, // Bale | Bora

      quantity: Number(data.quantity),

      candyRate: data.candyRate !== undefined ? Number(data.candyRate) : null,
      quintalRate: data.quintalRate !== undefined ? Number(data.quintalRate) : null,
      ratePerKg: data.ratePerKg !== undefined ? Number(data.ratePerKg) : null,

      selectedRateType: data.selectedRateType, // CANDY | QUINTAL | PER_KG

      approxLotValue:
        data.approxLotValue !== undefined
          ? Number(data.approxLotValue)
          : null,

      paymentMode: data.paymentMode || null,
      currency: data.currency || "RUPEES",

      staple: data.staple !== undefined ? Number(data.staple) : null,
      moist: data.moist !== undefined ? Number(data.moist) : null,
      mic: data.mic !== undefined ? Number(data.mic) : null,
      str: data.str !== undefined ? Number(data.str) : null,
      rd: data.rd !== undefined ? Number(data.rd) : null,

      remarks: data.remarks || null,
    };
    const response = await api.post("/", payload);
    return response.data.purchaseOrder;
  },

  // 🔹 Update purchase order
  update: async (id, data) => {
    const payload = {
      orderNo: data.orderNo,
      orderDate: data.orderDate,

      supplierId: data.supplierId !== undefined ? Number(data.supplierId) : undefined,
      brokerId:
        data.brokerId !== undefined
          ? data.brokerId
            ? Number(data.brokerId)
            : null
          : undefined,
      varietyId: data.varietyId !== undefined ? Number(data.varietyId) : undefined,
      mixingGroupId:
        data.mixingGroupId !== undefined ? Number(data.mixingGroupId) : undefined,
      stationId: data.stationId !== undefined ? Number(data.stationId) : undefined,
      companyBrokerId:
        data.companyBrokerId !== undefined
          ? data.companyBrokerId
            ? Number(data.companyBrokerId)
            : null
          : undefined,

      expectedDeliveryDate:
        data.expectedDeliveryDate !== undefined
          ? data.expectedDeliveryDate
          : undefined,

      orderType: data.orderType,
      packingType: data.packingType,

      quantity:
        data.quantity !== undefined ? Number(data.quantity) : undefined,

      candyRate:
        data.candyRate !== undefined ? Number(data.candyRate) : undefined,
      quintalRate:
        data.quintalRate !== undefined ? Number(data.quintalRate) : undefined,
      ratePerKg:
        data.ratePerKg !== undefined ? Number(data.ratePerKg) : undefined,

      selectedRateType: data.selectedRateType,

      approxLotValue:
        data.approxLotValue !== undefined
          ? Number(data.approxLotValue)
          : undefined,

      paymentMode:
        data.paymentMode !== undefined ? data.paymentMode : undefined,
      currency:
        data.currency !== undefined ? data.currency : undefined,

      staple:
        data.staple !== undefined ? Number(data.staple) : undefined,
      moist:
        data.moist !== undefined ? Number(data.moist) : undefined,
      mic: data.mic !== undefined ? Number(data.mic) : undefined,
      str: data.str !== undefined ? Number(data.str) : undefined,
      rd: data.rd !== undefined ? Number(data.rd) : undefined,

      remarks:
        data.remarks !== undefined ? data.remarks : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.purchaseOrder;
  },

  // 🔹 Delete purchase order
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default purchaseOrderService;
