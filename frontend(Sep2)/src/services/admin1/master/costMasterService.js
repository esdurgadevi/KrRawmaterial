import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/cost-masters";

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

// ✅ Service methods (MATCHES BACKEND)
const costMasterService = {
  // 🔹 Get all cost masters
  getAll: async () => {
    const response = await api.get("/");
    return response.data.costMasters; // { costMasters }
  },

  // 🔹 Get cost master by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.costMaster; // { costMaster }
  },

  // 🔹 Create cost master
  create: async (data) => {
    const payload = {
      department: data.department,        // STRING
      cost: Number(data.cost),             // DECIMAL
    };

    const response = await api.post("/", payload);
    return response.data.costMaster;
  },

  // 🔹 Update cost master
  update: async (id, data) => {
    const payload = {
      department:
        data.department !== undefined ? data.department : undefined,
      cost:
        data.cost !== undefined ? Number(data.cost) : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.costMaster;
  },

  // 🔹 Delete cost master
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default costMasterService;
