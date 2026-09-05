import axios from "axios";

// ✅ Backend base URL
const API_URL = "https://krexports.org/krerm/stations";

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

// ✅ Service methods (MATCHES YOUR STATION BACKEND)
const stationService = {
  // 🔹 Get all stations
  getAll: async () => {
    const response = await api.get("/");
    return response.data.stations; // { stations }
  },

  // 🔹 Get station by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.station; // { station }
  },
  getNextCode: async () => {
    const res = await api.get("/next-code");
    return res.data.nextCode;
  },

  // 🔹 Create station
  create: async (data) => {
    const payload = {
      code: Number(data.code), // INTEGER
      station: data.station,
      stateId: Number(data.stateId),
    };

    const response = await api.post("/", payload);
    return response.data.station;
  },

  // 🔹 Update station
  update: async (id, data) => {
    const payload = {
      code:
        data.code !== undefined
          ? Number(data.code)
          : undefined,
      station:
        data.station !== undefined
          ? data.station
          : undefined,
      stateId:
        data.stateId !== undefined
          ? Number(data.stateId)
          : undefined,
    };

    const response = await api.put(`/${id}`, payload);
    return response.data.station;
  },

  // 🔹 Delete station
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // { message }
  },
};

export default stationService;
