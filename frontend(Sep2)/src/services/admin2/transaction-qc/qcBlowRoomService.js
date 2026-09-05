import axios from "axios";

const api = axios.create({
  baseURL:
    "https://krexports.org/krerm/admin2/transaction-qc/qc-blowroom",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const qcBlowRoomService = {
  getAll: async () => (await api.get("/")).data.data,
  getById: async (id) => (await api.get(`/${id}`)).data.data,
  create: async (data) => (await api.post("/", data)).data.data,
  update: async (id, data) =>
    (await api.put(`/${id}`, data)).data.data,
  delete: async (id) => await api.delete(`/${id}`),
};

export default qcBlowRoomService;
