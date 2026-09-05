import axios from "axios";

const api = axios.create({
  baseURL:
    "https://krexports.org/krerm/admin2/transaction-qc/comber-entry",
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const comberEntryService = {

  getAll: async () => {
    const res = await api.get("/");
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post("/", data);
    return res.data.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/${id}`, data);
    return res.data.data;
  },

  delete: async (id) => {
    await api.delete(`/${id}`);
  },
};

export default comberEntryService;
