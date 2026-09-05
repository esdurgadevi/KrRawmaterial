import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/states";

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

// ✅ Service methods (MATCHES YOUR BACKEND)
const stateService = {
  // 🔹 Get all states
  getAll: async () => {
    const response = await api.get("/");
    return response.data.states; // 👈 backend should send { states }
  },

  // 🔹 Get state by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.state; // 👈 backend should send { state }
  },
   getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  // 🔹 Create state
  create: async (data) => {
    const payload = {
      code: Number(data.code), // ensure INTEGER
      state: data.state,
    };

    const response = await api.post("/", payload);
    return response.data.state;
  },

  // 🔹 Update state
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      state: data.state,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.state;
  },

  // 🔹 Delete state
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default stateService;
