import axios from "axios";

const api = axios.create({
  baseURL:
    "https://krexports.org/krerm/admin2/transaction-qc/breaker-drawing",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const breakerDrawingService = {
  // ✅ GET ALL
  getAll: async () => {
    const res = await api.get("/");
    return res.data.data;
  },

  // ✅ GET BY ID
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.data;
  },

  // ✅ CREATE
  create: async (data) => {
    const res = await api.post("/", data);
    return res.data.data;
  },

  // ✅ UPDATE
  update: async (id, data) => {
    const res = await api.put(`/${id}`, data);
    return res.data.data;
  },

  // ✅ DELETE
  delete: async (id) => {
    await api.delete(`/${id}`);
  },
};

export default breakerDrawingService;
