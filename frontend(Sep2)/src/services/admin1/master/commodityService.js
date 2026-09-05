import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/commodities";

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

// ✅ Service methods (MATCHES YOUR BACKEND)
const commodityService = {
  // 🔹 Get all commodities
  getAll: async () => {
    const response = await api.get("/");
    return response.data.commodities; // { commodities }
  },

  // 🔹 Get commodity by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.commodity; // { commodity }
  },

  // 🔹 Create commodity
  create: async (data) => {
    const payload = {
      commodityCode: Number(data.commodityCode), // ensure INTEGER
      commodityName: data.commodityName,
    };

    const response = await api.post("/", payload);
    return response.data.commodity;
  },
   getNextCode: async () => {
    const response = await api.get("/next-code");
    return response.data.nextCommodityCode;
  },

  // 🔹 Update commodity
  update: async (id, data) => {
    const payload = {
      commodityCode: data.commodityCode !== undefined ? Number(data.commodityCode) : undefined,
      commodityName: data.commodityName,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.commodity;
  },

  // 🔹 Delete commodity
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default commodityService;
