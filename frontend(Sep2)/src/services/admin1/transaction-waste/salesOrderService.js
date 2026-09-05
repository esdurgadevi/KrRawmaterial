// frontend/src/services/salesOrderService.js

import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/waste-sales";

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

// ✅ Service methods
const salesOrderService = {
  getNextSalesOrderNo: async () => {
  const response = await api.get("/next-order-no");
  return response.data.nextOrderNo;
},
  // 🔹 Get all sales orders
  getAll: async () => {
    const response = await api.get("/");
    return response.data.orders;
  },

  // 🔹 Get sales order by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.order;
  },

  // 🔹 Create sales order
  create: async (data) => {
    console.log(data);
    const payload = {
      orderNo: data.orderNo?.trim(),
      date: data.date,

      // ✅ changed from party → supplierId
      supplierId: Number(data.supplierId),

      broker: data.broker?.trim() || null,
      broker1: data.broker1?.trim() || null,
      payTerms: data.payTerms?.trim() || null,
      payMode: data.payMode?.trim() || null,
      creditDays: Number(data.creditDays) || 0,
      bank: data.bank?.trim() || null,
      despatchTo: data.despatchTo?.trim() || null,

      details: (data.details || []).map((item) => ({
        product: item.product?.trim(),
        packingId: Number(item.packingId),
        qty: Number(item.qty),
        totalWt: Number(item.totalWt),
        rate: Number(item.rate),
        ratePer: item.ratePer?.trim() || null,
        value: Number(item.value),
      })),
    };
    console.log(payload);
    const response = await api.post("/", payload);
    return response.data.order;
  },

  // 🔹 Update sales order
  update: async (id, data) => {
    const payload = {
      orderNo:
        data.orderNo !== undefined ? data.orderNo?.trim() : undefined,

      date:
        data.date !== undefined ? data.date : undefined,

      // ✅ changed from party → supplierId
      supplierId:
        data.supplierId !== undefined
          ? Number(data.supplierId)
          : undefined,

      broker:
        data.broker !== undefined ? data.broker?.trim() : undefined,

      broker1:
        data.broker1 !== undefined ? data.broker1?.trim() : undefined,

      payTerms:
        data.payTerms !== undefined ? data.payTerms?.trim() : undefined,

      payMode:
        data.payMode !== undefined ? data.payMode?.trim() : undefined,

      creditDays:
        data.creditDays !== undefined
          ? Number(data.creditDays)
          : undefined,

      bank:
        data.bank !== undefined ? data.bank?.trim() : undefined,

      despatchTo:
        data.despatchTo !== undefined
          ? data.despatchTo?.trim()
          : undefined,

      details:
        data.details !== undefined
          ? (data.details || []).map((item) => ({
              product: item.product?.trim(),
              packingId: Number(item.packingId),
              qty: Number(item.qty),
              totalWt: Number(item.totalWt),
              rate: Number(item.rate),
              ratePer: item.ratePer?.trim() || null,
              value: Number(item.value),
            }))
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.order;
  },

  // 🔹 Delete sales order
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // 🔹 Get available bales for sales order
  getAvailableBales: async (orderId, excludeInvoiceId) => {
    const params = excludeInvoiceId ? { excludeInvoiceId } : {};
    const response = await api.get(`/${orderId}/available-bales`, { params });
    return response.data.bales;
  },

  // 🔹 Bulk import sales orders
  bulkImport: async (payload) => {
    const response = await api.post("/bulk-import", payload);
    return response.data;
  },
};

export default salesOrderService;
