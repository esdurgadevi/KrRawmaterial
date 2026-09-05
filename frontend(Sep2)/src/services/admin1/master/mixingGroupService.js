import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/mixing-groups";

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
const mixingGroupService = {
  // 🔹 Get all mixing groups
  getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  getAll: async () => {
    const response = await api.get("/");
    return response.data.mixingGroups; // { mixingGroups }
  },

  // 🔹 Get mixing group by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.mixingGroup; // { mixingGroup }
  },
  // 🔹 Create mixing group
  create: async (data) => {
    const payload = {
      mixingCode: Number(data.mixingCode), // ensure INTEGER
      mixingName: data.mixingName,
    };

    const response = await api.post("/", payload);
    return response.data.mixingGroup;
  },

  // 🔹 Update mixing group
  update: async (id, data) => {
    const payload = {
      mixingCode:
        data.mixingCode !== undefined
          ? Number(data.mixingCode)
          : undefined,
      mixingName: data.mixingName,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.mixingGroup;
  },

  // 🔹 Delete mixing group
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // usually { message }
  },
};

export default mixingGroupService;
