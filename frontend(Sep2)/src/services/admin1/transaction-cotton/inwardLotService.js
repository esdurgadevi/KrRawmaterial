import axios from "axios";

const API_URL = "http://localhost:5000/api/inward-lots";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const inwardLotService = {

  /* =============================
     CREATE LOT + WEIGHTMENTS
     Single API
  ============================= */
  getNextLotNo: async () => {
    const response = await api.get("/next-lot-no");
    console.log(response);
    return response.data.lotNo;
  },

  create: async (lotHeader, weightments = []) => {
    const payload = {
      lotHeader: {
        inwardId: lotHeader.inwardId,
        lotNo: lotHeader.lotNo,
        lotDate: lotHeader.lotDate,
        qty: Number(lotHeader.qty) || 0,
        freight: Number(lotHeader.freight) || 0,
        grossWeight: Number(lotHeader.grossWeight) || 0,
        tareWeight: Number(lotHeader.tareWeight) || 0,
        nettWeight: Number(lotHeader.nettWeight) || 0,
        candyRate: Number(lotHeader.candyRate) || 0,
        quintalRate: Number(lotHeader.quintalRate) || 0,
        ratePerKg: Number(lotHeader.ratePerKg) || 0,
        assessValue: Number(lotHeader.assessValue) || 0,
        godownId : Number(lotHeader.godownId) || 0, 
      },
      weightments: weightments.map((w) => ({
        baleNo: w.baleNo,
        grossWeight: Number(w.grossWeight) || 0,
        tareWeight: Number(w.tareWeight) || 0,
        baleWeight: Number(w.baleWeight) || 0,
        baleValue: Number(w.baleValue) || 0,
      })),
    };
    console.log(payload);

    const res = await api.post("/", payload);
    console.log(res);
    return res.data;
  },

  /* =============================
     GET ALL LOTS
  ============================= */
  getAll: async () => {
    const res = await api.get("/");
    return res.data;
  },

  /* =============================
     GET LOT BY ID
  ============================= */
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  /* =============================
     UPDATE LOT + WEIGHTMENTS
  ============================= */
  update: async (id, lotHeader, weightments = []) => {
    const payload = {
      lotHeader,
      weightments,
    };

    const res = await api.put(`/${id}`, payload);
    return res.data;
  },

  /* =============================
     DELETE LOT (Cascade delete weightments)
  ============================= */
  delete: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },
};

export default inwardLotService;
