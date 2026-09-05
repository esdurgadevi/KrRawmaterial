import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/waste-rates";

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

// ✅ Waste Rate Service (STRICTLY matches backend)
const wasteRateService = {
  // 🔹 Get all waste rates
  getAll: async () => {
    const response = await api.get("/");
    return response.data.wasteRates; // { wasteRates }
  },

  // 🔹 Get waste rate by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.wasteRate; // { wasteRate }
  },

  // 🔹 Create waste rate
  create: async (data) => {
    const payload = {
      wasteMasterId: Number(data.wasteMasterId),
      rateDate: data.rateDate, // YYYY-MM-DD
      rate: Number(data.rate),
      remarks: data.remarks ? data.remarks.trim() : null,
    };

    const response = await api.post("/", payload);
    return response.data.wasteRate;
  },

  // 🔹 Update waste rate
  update: async (id, data) => {
    const payload = {
      wasteMasterId:
        data.wasteMasterId !== undefined
          ? Number(data.wasteMasterId)
          : undefined,

      rateDate:
        data.rateDate !== undefined
          ? data.rateDate
          : undefined,

      rate:
        data.rate !== undefined
          ? Number(data.rate)
          : undefined,

      remarks:
        data.remarks !== undefined
          ? (data.remarks ? data.remarks.trim() : null)
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.wasteRate;
  },

  // 🔹 Delete waste rate
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default wasteRateService;
