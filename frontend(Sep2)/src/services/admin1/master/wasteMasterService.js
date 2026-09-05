import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/waste-masters";

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
const wasteMasterService = {
  // 🔹 Get all waste masters
  getAll: async () => {
    const response = await api.get("/");
    return response.data.wasteMasters; // { wasteMasters }
  },

  // 🔹 Get waste master by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.wasteMaster; // { wasteMaster }
  },

  // 🔹 Create waste master
  create: async (data) => {
    const payload = {
      code: Number(data.code),
      department: data.department,
      waste: data.waste,
      packingTypeId: Number(data.packingTypeId),
      wasteKg: Number(data.wasteKg),
      hsnCode: data.hsnCode || null,
      packingPreWeightment: data.packingPreWeightment ?? false,
    };

    const response = await api.post("/", payload);
    return response.data.wasteMaster;
  },
   getNextCode: async () => {
    const res = await api.get("/next-code");
    console.log(res.data.nextCode);
    return res.data.nextCode;
  },

  // 🔹 Update waste master
  update: async (id, data) => {
    const payload = {
      code: data.code !== undefined ? Number(data.code) : undefined,
      department:
        data.department !== undefined ? data.department : undefined,
      waste: data.waste !== undefined ? data.waste : undefined,
      packingTypeId:
        data.packingTypeId !== undefined
          ? Number(data.packingTypeId)
          : undefined,
      wasteKg:
        data.wasteKg !== undefined ? Number(data.wasteKg) : undefined,
      hsnCode:
        data.hsnCode !== undefined ? data.hsnCode : undefined,
      packingPreWeightment:
        data.packingPreWeightment !== undefined
          ? data.packingPreWeightment
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.wasteMaster;
  },

  // 🔹 Delete waste master
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },

  // 🔹 Bulk import waste masters
  bulkImport: async (items) => {
    const response = await api.post("/bulk-import", { items });
    return response.data;
  },
};

export default wasteMasterService;
