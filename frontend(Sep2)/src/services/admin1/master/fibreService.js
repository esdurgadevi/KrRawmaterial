import axios from "axios";

// Backend base URL
const API_URL = "http://localhost:5000/api/fibres";

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
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

// Fibre service
const fibreService = {
  // Get all fibres
  getAll: async () => {
    const res = await api.get("/");
    return res.data.fibres; // 🔥 IMPORTANT
  },

  // Get fibre by ID
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.fibre;
  },

  // Create fibre
  create: async (data) => {
    const payload = {
      code: Number(data.code),
      name: data.name,
      commodityId: Number(data.commodityId),
    };

    const res = await api.post("/", payload);
    return res.data.fibre;
  },
  // 🔹 Get next fibre code (AUTO CODE)
  getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },

  // Update fibre
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      name: data.name,
      commodityId:
        data.commodityId !== undefined ? Number(data.commodityId) : undefined,
    };

    const res = await api.put(`/${id}`, payload);
    return res.data.fibre;
  },

  // Delete fibre
  delete: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },
};

export default fibreService;
