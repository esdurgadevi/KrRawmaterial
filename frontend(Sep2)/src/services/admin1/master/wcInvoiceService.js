import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/wc-invoices";

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

const wcInvoiceService = {


  create: async (data) => {
    const payload = {
      code: data.code,
      name: data.name,
      roundOffDigits: Number(data.roundOffDigits) || 0,
      packingForwardingCharges:
        Number(data.packingForwardingCharges) || 0,

      details: data.details.map((item, index) => ({
        fieldName: item.fieldName,
        shortCode: item.shortCode,
        displayKey: item.displayKey,
        formula: item.formula,
        sequence: index + 1,
      })),
    };

    const response = await api.post("/", payload);
    return response.data.invoice;
  },

  // ================= GET ALL =================
  getAll: async () => {
    const response = await api.get("/");
    return response.data.invoices;
  },

  // ================= GET BY ID =================
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.invoice;
  },

  // ================= UPDATE =================
  update: async (id, data) => {
    const payload = {
      code: data.code,
      name: data.name,
      roundOffDigits: Number(data.roundOffDigits) || 0,
      packingForwardingCharges:
        Number(data.packingForwardingCharges) || 0,

      details: data.details.map((item, index) => ({
        fieldName: item.fieldName,
        shortCode: item.shortCode,
        displayKey: item.displayKey,
        formula: item.formula,
        sequence: index + 1,
      })),
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.invoice;
  },

  // ================= DELETE =================
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default wcInvoiceService;
