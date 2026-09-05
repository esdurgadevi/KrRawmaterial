import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/transports";

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
const transportService = {
  // 🔹 Get all transports
  getAll: async () => {
    const response = await api.get("/");
    return response.data.transports; // { transports }
  },

  // 🔹 Get transport by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.transport; // { transport }
  },
   getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  // 🔹 Create transport
  create: async (data) => {
    const payload = {
      transportCode: Number(data.transportCode), // ensure INTEGER
      transportName: data.transportName,
      place: data.place,
      address: data.address || null,
    };

    const response = await api.post("/", payload);
    return response.data.transport;
  },
  // 🔹 Update transport
  update: async (id, data) => {
    const payload = {
      transportCode: data.transportCode !== undefined ? Number(data.transportCode) : undefined,
      transportName: data.transportName,
      place: data.place,
      address: data.address !== undefined ? data.address : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.transport;
  },

  // 🔹 Delete transport
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default transportService;
