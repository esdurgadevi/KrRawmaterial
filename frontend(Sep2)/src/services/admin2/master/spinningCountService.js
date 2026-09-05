import axios from "axios";

const API_URL = "https://krexports.org/krerm/admin2/master/spinning-counts";  // adjust port/base if needed

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DEFAULT_COUNTS = [
  { id: 1, countName: '60 COMBED GOLD', ActCount: 60.00, Noils: 16.00 },
  { id: 2, countName: '60COM COMPACT', ActCount: 60.00, Noils: 17.00 },
  { id: 3, countName: '64 COMBED', ActCount: 64.00, Noils: 16.00 },
  { id: 4, countName: '61 COMBED SPECIAL', ActCount: 61.00, Noils: 15.50 },
  { id: 5, countName: '62 COMBED COMPACT', ActCount: 62.00, Noils: 16.50 },
  { id: 6, countName: '63 COM GOLD', ActCount: 63.00, Noils: 16.00 },
  { id: 7, countName: '66 COMBED GOLD', ActCount: 66.00, Noils: 17.00 },
  { id: 8, countName: '66 COMBED STAR', ActCount: 66.00, Noils: 17.00 },
  { id: 9, countName: '65 COMBED STAR', ActCount: 65.00, Noils: 16.50 },
  { id: 10, countName: '60CCT', ActCount: 60.00, Noils: 15.00 },
  { id: 11, countName: 'RECOMBED GOLD', ActCount: 60.00, Noils: 18.00 },
  { id: 12, countName: 'CARDED WEFT', ActCount: 40.00, Noils: 12.00 }
];

const spinningCountService = {
  getAll: async () => {
    try {
      const res = await api.get("/");
      const list = res.data?.spinningCounts || res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      console.warn("Could not fetch counts from API, using default list:", e);
    }
    return DEFAULT_COUNTS;
  },

  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.spinningCount;
  },

  create: async (data) => {
    const payload = {
      countName: data.countName.trim(),
      ActCount: parseFloat(data.ActCount),
      Noils: parseFloat(data.Noils),
    };
    const res = await api.post("/", payload);
    return res.data.spinningCount;
  },

  update: async (id, data) => {
    const payload = {};
    if (data.countName !== undefined) payload.countName = data.countName.trim();
    if (data.ActCount !== undefined) payload.ActCount = parseFloat(data.ActCount);
    if (data.Noils !== undefined) payload.Noils = parseFloat(data.Noils);

    const res = await api.put(`/${id}`, payload);
    return res.data.spinningCount;
  },

  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },
};

export default spinningCountService;
