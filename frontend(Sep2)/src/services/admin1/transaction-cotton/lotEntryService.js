// services/lotEntryService.js
import axios from "axios";

// ---------------- LOT ENTRY API ----------------
const LOT_ENTRY_API_URL = "https://krexports.org/krerm/lot-entries";

// Axios instance
const lotEntryApi = axios.create({
  baseURL: LOT_ENTRY_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

lotEntryApi.interceptors.request.use(attachToken);

const lotEntryService = {
  /* =============================
     CREATE LOT ENTRY
  ============================= */
  createLotEntry: async (data) => {
    const res = await lotEntryApi.post("/", data);
    return res.data.lotEntry;
  },

  /* =============================
     GET ALL LOT ENTRIES
  ============================= */
  getAllLots: async () => {
    const res = await lotEntryApi.get("/");
    return res.data.lotTestResults;
  },

  /* =============================
     GET LOT ENTRY BY ID
  ============================= */
  getLotEntryById: async (id) => {
    const res = await lotEntryApi.get(`/${id}`);
    console.log(res.data.lotTestResult);
    return res.data.lotTestResult;
  },

  /* =============================
     UPDATE LOT ENTRY BY ID
  ============================= */
  updateLotEntry: async (id, data) => {
    const res = await lotEntryApi.put(`/${id}`, data);
    return res.data.lotEntry;
  },

  /* =============================
     DELETE LOT ENTRY BY ID
  ============================= */
  deleteLotEntry: async (id) => {
    const res = await lotEntryApi.delete(`/${id}`);
    return res.data;
  },

  /* =============================
     GET NEXT LOT ENTRY NO
  ============================= */
  getNextLotEntryNo: async () => {
    const res = await lotEntryApi.get("/next-lot-no");
    return res.data.lotEntryNo;
  },
};

export default lotEntryService;
