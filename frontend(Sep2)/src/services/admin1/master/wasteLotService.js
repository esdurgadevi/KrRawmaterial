import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/waste-lots";

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
    const token = localStorage.getItem("token"); // saved after login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Waste Lot Service (matches backend exactly)
const wasteLotService = {
  // 🔹 Get all waste lots
  getAll: async () => {
    const response = await api.get("/");
    return response.data.wasteLots; // { wasteLots }
  },

  // 🔹 Get waste lot by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.wasteLot; // { wasteLot }
  },

  // 🔹 Create waste lot
  create: async (data) => {
    const payload = {
      lotNo: data.lotNo?.trim(),
      wasteMasterId: Number(data.wasteMasterId),
      active: data.active ?? true,
    };

    const response = await api.post("/", payload);
    return response.data.wasteLot;
  },

  // 🔹 Update waste lot
  update: async (id, data) => {
    const payload = {
      lotNo:
        data.lotNo !== undefined
          ? data.lotNo.trim()
          : undefined,

      wasteMasterId:
        data.wasteMasterId !== undefined
          ? Number(data.wasteMasterId)
          : undefined,

      active:
        data.active !== undefined
          ? data.active
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.wasteLot;
  },

  // 🔹 Delete waste lot
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
  // 🔹 Get lots by waste name
  getByWasteName: async (wasteName) => {
    const response = await api.get(`/by-waste`, {
      params: { waste: wasteName },
    });
    return response.data.lots; // returns array of lots
  },
};

export default wasteLotService;
