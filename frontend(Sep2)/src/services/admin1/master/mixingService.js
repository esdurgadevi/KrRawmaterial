import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/mixings";

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

// ✅ Service methods (MATCHES YOUR MIXING BACKEND)
const mixingService = {
  // 🔹 Get all mixings
  getAll: async () => {
    const response = await api.get("/");
    return response.data.mixings; // { mixings }
  },

  // 🔹 Get mixing by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.mixing; // { mixing }
  },
  
 getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  // 🔹 Create mixing
  create: async (data) => {
    const payload = {
      mixingCode: Number(data.mixingCode),
      mixingName: data.mixingName,
      fibreId: Number(data.fibreId),
      mixingGroupId: Number(data.mixingGroupId),
    };

    const response = await api.post("/", payload);
    return response.data.mixing;
  },

  // 🔹 Update mixing
  update: async (id, data) => {
    const payload = {
      mixingCode:
        data.mixingCode !== undefined
          ? Number(data.mixingCode)
          : undefined,

      mixingName:
        data.mixingName !== undefined
          ? data.mixingName
          : undefined,

      fibreId:
        data.fibreId !== undefined
          ? Number(data.fibreId)
          : undefined,

      mixingGroupId:
        data.mixingGroupId !== undefined
          ? Number(data.mixingGroupId)
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.mixing;
  },

  // 🔹 Delete mixing
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default mixingService;
