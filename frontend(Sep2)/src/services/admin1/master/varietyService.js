import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/varieties";

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

// ✅ Variety service (MATCHES YOUR BACKEND)
const varietyService = {
  // 🔹 Get all varieties
  getAll: async () => {
    const response = await api.get("/");
    return response.data.varieties; // { varieties }
  },
  getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  // 🔹 Get variety by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.variety; // { variety }
  },

  // 🔹 Create variety
  create: async (data) => {
    const payload = {
      code: Number(data.code),        // INTEGER
      variety: data.variety,          // STRING
      fibreId: Number(data.fibreId),  // INTEGER (FK)
    };

    const response = await api.post("/", payload);
    return response.data.variety;
  },

  // 🔹 Update variety
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      variety: data.variety !== undefined ? data.variety : undefined,
      fibreId: data.fibreId !== undefined ? Number(data.fibreId) : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.variety;
  },

  // 🔹 Delete variety
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default varietyService;
