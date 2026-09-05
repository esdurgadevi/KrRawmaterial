import axios from "axios";

const API_URL = "http://localhost:5000/api/lot-rejecteds";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const lotRejectedService = {
  /* =============================
     MARK / UPDATE REJECTION STATUS
     (Create or update for a lot)
  ============================= */
  toggleRejection: async (data) => {
    const payload = {
      inwardLotId: Number(data.inwardLotId),
      isRejected: !!data.isRejected,
      // Optional fields if you later add them
      // billNo: data.billNo || null,
      // billDate: data.billDate || null,
      // remarks: data.remarks || null,
    };

    const res = await api.post("/", payload);
    return res.data;
  },

  /* =============================
     GET REJECTION STATUS FOR A SPECIFIC LOT
  ============================= */
  getByLotId: async (lotId) => {
    const res = await api.get(`/lot/${lotId}`);
    return res.data.lotRejected || null;
  },

  /* =============================
     GET ALL REJECTED LOTS
  ============================= */
  getAll: async () => {
    const res = await api.get("/");
    return res.data.lotRejecteds || [];
  },

  /* =============================
     UN-REJECT (DELETE) A LOT'S REJECTION RECORD
  ============================= */
  unReject: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },
};

export default lotRejectedService;
