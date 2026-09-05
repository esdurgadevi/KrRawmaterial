// frontend/src/services/admin1/transaction-waste/wastePackingService.js

import axios from "axios";

// ✅ Backend base URL (adjust if your API prefix is different)
const API_URL = "https://krexports.org/krerm/waste-packings";

// ✅ Axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token from localStorage
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

// ✅ Service methods (matches your backend exactly)
const wastePackingService = {
  // 🔹 Get all waste packings
  getAll: async () => {
    const response = await api.get("/");
    return response.data.packings;
  },

  // 🔹 Get single waste packing by ID (includes details)
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.packing;
  },

  // 🔹 Create new waste packing (header + all details in one go)
  create: async (data) => {
    const payload = {
      wasteType: data.wasteType?.trim(),
      date: data.date,
      lotNo: data.lotNo?.trim(),
      stock: Number(data.stock) || 0,
      packingType: data.packingType?.trim(),
      noOfBales: Number(data.noOfBales),
      totalWeight: Number(data.totalWeight),
      details: (data.details || []).map((item) => ({
        baleNo: item.baleNo?.trim(),
        grossWeight: Number(item.grossWeight) || 0,
        tareWeight: Number(item.tareWeight) || 0,
        netWeight: Number(item.netWeight) || 0,
      })),
    };
    console.log(payload);
    const response = await api.post("/", payload);
    return response.data.packing;
  },

  // 🔹 Update existing waste packing (full replace of details)
  update: async (id, data) => {
    const payload = {
      wasteType: data.wasteType?.trim(),
      date: data.date,
      lotNo: data.lotNo?.trim(),
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      packingType: data.packingType?.trim(),
      noOfBales: data.noOfBales !== undefined ? Number(data.noOfBales) : undefined,
      totalWeight: data.totalWeight !== undefined ? Number(data.totalWeight) : undefined,
      details: (data.details || []).map((item) => ({
        baleNo: item.baleNo?.trim(),
        grossWeight: Number(item.grossWeight) || 0,
        tareWeight: Number(item.tareWeight) || 0,
        netWeight: Number(item.netWeight) || 0,
      })),
    };

    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const response = await api.put(`/${id}`, payload);
    return response.data.packing;
  },

  // 🔹 Delete waste packing (cascades to details)
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // 🔹 Get waste packing details report with date range
  getPackingDetailsReport: async (startDate, endDate) => {
    const response = await api.get("/report/packing-details", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.report;
  },

  // 🔹 Get waste type wise packing report
  getTypeWisePackingReport: async (startDate, endDate) => {
    const response = await api.get("/report/type-wise", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.report;
  },

  // 🔹 Get waste stock abstract report
  getStockAbstractReport: async (startDate, endDate) => {
    const response = await api.get("/report/stock-abstract", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.report;
  },

  // 🔹 Get closing stock value report
  getClosingStockValueReport: async (startDate, endDate) => {
    const response = await api.get("/report/closing-stock-value", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.report;
  },

  getYearlyStockAbstractReport: async (startDate, endDate) => {
    const response = await api.get("/report/yearly-stock-abstract", {
      params: { startDate, endDate },
    });
    return response.data.report;
  },

  getNextId: async () => {
    const response = await api.get("/next-id");
    return response.data.nextId;
  },

  bulkImport: async (payload) => {
    const response = await api.post("/bulk-import", payload);
    return response.data;
  },

};

export default wastePackingService;
