import axios from "axios";

const API_URL = "https://krexports.org/krerm/admin2/transaction-qc/qc-entries";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const qcEntryService = {
  // Get QC entry for a specific inward lot (most common use)
  getByLotId: async (lotId) => {
    const res = await api.get(`/lot/${lotId}`);
    return res.data.qcEntry;
  },

  // Get QC entry by its ID
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.qcEntry;
  },

  // Get all QC entries
  getAll: async () => {
    const res = await api.get(`/`);
    return res.data.qcEntries;  // matches controller response
  },

  // Create new QC entry
  create: async (data) => {
    const res = await api.post("/", data);
    return res.data.qcEntry;
  },

  // Update existing QC entry
  update: async (id, data) => {
    const res = await api.put(`/${id}`, data);
    return res.data.qcEntry;
  },

  // Delete QC entry
  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },
};

export default qcEntryService;
