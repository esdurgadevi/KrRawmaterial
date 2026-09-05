// frontend/src/services/wasteEntryService.js

import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/waste-entries";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT automatically
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

// ✅ Helper → format details safely
const formatDetails = (details = []) =>
  details.map((item) => ({
    department: item.department?.trim() || null, // ✅ NEW FIELD
    wasteMasterId: Number(item.wasteMasterId),
    packingTypeId: Number(item.packingTypeId),
    godownId: Number(item.godownId),
    netWeight: Number(item.netWeight) || 0,
  }));

// ✅ Waste Entry Service
const wasteEntryService = {
  //--------------------------------------------------
  // 🔹 Get all waste entries
  //--------------------------------------------------
  getAll: async () => {
    const { data } = await api.get("/");
    return data.entries;
  },

  //--------------------------------------------------
  // 🔹 Get by ID
  //--------------------------------------------------
  getById: async (id) => {
    const { data } = await api.get(`/${id}`);
    return data.entry;
  },

  //--------------------------------------------------
  // 🔹 Create
  //--------------------------------------------------
  create: async (data) => {
    const payload = {
      date: data.date,
      shift: data.shift?.trim() || "ALL",
      remarks: data.remarks?.trim() || null,
      details: formatDetails(data.details),
    };

    const { data: res } = await api.post("/", payload);
    return res.entry;
  },

  //--------------------------------------------------
  // 🔹 Update
  //--------------------------------------------------
  update: async (id, data) => {
    const payload = {
      date: data.date ?? undefined,
      shift:
        data.shift !== undefined
          ? data.shift?.trim()
          : undefined,
      remarks:
        data.remarks !== undefined
          ? data.remarks?.trim()
          : undefined,
      details:
        data.details !== undefined
          ? formatDetails(data.details)
          : undefined,
    };

    const { data: res } = await api.put(`/${id}`, payload);
    return res.entry;
  },

  //--------------------------------------------------
  // 🔹 Delete
  //--------------------------------------------------
  delete: async (id) => {
    const { data } = await api.delete(`/${id}`);
    return data;
  },

  //--------------------------------------------------
  // 🔹 Bulk Import
  //--------------------------------------------------
  bulkImport: async (payload) => {
    const { data } = await api.post("/bulk-import", payload);
    return data;
  },
};

export default wasteEntryService;
