import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/company-brokers";

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
const companyBrokerService = {
  // 🔹 Get all company brokers
  getAll: async () => {
    const response = await api.get("/");
    return response.data.companyBrokers; // { companyBrokers }
  },

  // 🔹 Get company broker by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.companyBroker; // { companyBroker }
  },
   getNextCode: async () => {
    const response = await api.get("/next-code");
    return response.data.nextCode;
  },

  // 🔹 Create company broker
  create: async (data) => {
    const payload = {
      code: Number(data.code), // ensure INTEGER
      companyName: data.companyName,
      shortDesc: data.shortDesc || null,
      address: data.address || null,
    };

    const response = await api.post("/", payload);
    return response.data.companyBroker;
  },

  // 🔹 Update company broker
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      companyName: data.companyName,
      shortDesc:
        data.shortDesc !== undefined ? data.shortDesc : undefined,
      address:
        data.address !== undefined ? data.address : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.companyBroker;
  },

  // 🔹 Delete company broker
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default companyBrokerService;
