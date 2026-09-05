import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/brokers";

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

// ✅ Service methods (MATCHES YOUR BACKEND EXACTLY)
const brokerService = {
  // 🔹 Get all brokers
  getAll: async () => {
    const response = await api.get("/");
    return response.data.brokers; // { brokers }
  },

  // 🔹 Get broker by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.broker; // { broker }
  },

  // 🔹 Create broker
  create: async (data) => {
    const payload = {
      brokerCode: Number(data.brokerCode), // ✅ MUST match backend
      brokerName: data.brokerName,
      shortDesc: data.shortDesc || null,
      address: data.address || null,
    };

    const response = await api.post("/", payload);
    return response.data.broker;
  },

  // 🔹 Update broker
  update: async (id, data) => {
    const payload = {
      brokerCode:
        data.brokerCode !== undefined
          ? Number(data.brokerCode)
          : undefined,
      brokerName: data.brokerName,
      shortDesc:
        data.shortDesc !== undefined ? data.shortDesc : undefined,
      address:
        data.address !== undefined ? data.address : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.broker;
  },

  // 🔹 Delete broker
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
   getNextBrokerCode: async () => {
    const response = await api.get("/next-code");
    return response.data.brokerCode; // { brokerCode }
  },
};

export default brokerService;
