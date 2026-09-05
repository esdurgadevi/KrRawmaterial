import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/godowns";

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
const godownService = {
  // 🔹 Get all godowns
  getAll: async () => {
    const response = await api.get("/");
    return response.data.godowns; // { godowns }
  },

  // 🔹 Get godown by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.godown; // { godown }
  },

 getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },
  // 🔹 Create godown
  create: async (data) => {
    const payload = {
      code: Number(data.code), // ensure INTEGER
      godownName: data.godownName,
      locationName: data.locationName,
      type: data.type,
      address: data.address,
      shortAddress: data.shortAddress || null,
    };

    const response = await api.post("/", payload);
    return response.data.godown;
  },

  // 🔹 Update godown
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      godownName: data.godownName,
      locationName: data.locationName,
      type: data.type,
      address: data.address,
      shortAddress:
        data.shortAddress !== undefined ? data.shortAddress : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.godown;
  },

  // 🔹 Delete godown
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default godownService;
