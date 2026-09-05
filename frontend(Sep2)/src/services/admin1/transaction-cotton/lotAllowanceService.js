import axios from "axios";

const API_URL = "http://localhost:5000/api/lot-allowances";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically (same as your other services)
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

const lotAllowanceService = {
  /* =============================
     CREATE LOT ALLOWANCE
     Single API cal
  ============================= */
  create: async (allowanceData) => {
    const payload = {
      allowanceNo: Number(allowanceData.allowanceNo) || null,
      allowanceDate: allowanceData.allowanceDate || null,
      inwardLotId: Number(allowanceData.inwardLotId) || null,

      // Denormalized / snapshot fields (optional - backend can fill if needed)
      lotNo: allowanceData.lotNo || "",
      lotDate: allowanceData.lotDate || null,
      partyName: allowanceData.partyName || "",
      variety: allowanceData.variety || "",

      // Weight snapshot
      grossWeight: Number(allowanceData.grossWeight) || 0,
      tareWeight: Number(allowanceData.tareWeight) || 0,
      netWeight: Number(allowanceData.netWeight) || 0,

      // Rates snapshot
      candyRate: Number(allowanceData.candyRate) || 0,
      quintalRate: Number(allowanceData.quintalRate) || 0,
      ratePerKg: Number(allowanceData.ratePerKg) || 0,
      actualValue: Number(allowanceData.actualValue) || 0,

      // Core allowance fields
      allowanceRate: Number(allowanceData.allowanceRate) || 0,
      debitValue: Number(allowanceData.debitValue) || 0,

      // Optional
      debitLedger: allowanceData.debitLedger || null,
      remarks: allowanceData.remarks || null,
    };

    const res = await api.post("/", payload);
    return res.data;
  },

  /* =============================
     GET ALL LOT ALLOWANCES
  ============================= */
  getAll: async () => {
    const res = await api.get("/");
    return res.data.lotAllowances || res.data || [];
  },

  /* =============================
     GET LOT ALLOWANCE BY ID
  ============================= */
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.lotAllowance || res.data;
  },

  /* =============================
     UPDATE LOT ALLOWANCE
  ============================= */
  update: async (id, allowanceData) => {
    const payload = {
      allowanceNo: Number(allowanceData.allowanceNo) || null,
      allowanceDate: allowanceData.allowanceDate || null,

      grossWeight: Number(allowanceData.grossWeight) || 0,
      tareWeight: Number(allowanceData.tareWeight) || 0,
      netWeight: Number(allowanceData.netWeight) || 0,

      candyRate: Number(allowanceData.candyRate) || 0,
      quintalRate: Number(allowanceData.quintalRate) || 0,
      ratePerKg: Number(allowanceData.ratePerKg) || 0,
      actualValue: Number(allowanceData.actualValue) || 0,

      allowanceRate: Number(allowanceData.allowanceRate) || 0,
      debitValue: Number(allowanceData.debitValue) || 0,

      debitLedger: allowanceData.debitLedger || null,
      remarks: allowanceData.remarks || null,
    };

    const res = await api.put(`/${id}`, payload);
    return res.data;
  },

  /* =============================
     DELETE LOT ALLOWANCE
  ============================= */
  delete: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },

  /* =============================
     GET NEXT ALLOWANCE NUMBER
     (for auto-filling new records)
  ============================= */
  getNextAllowanceNo: async () => {
    const res = await api.get("/next-no");
    return res.data.nextAllowanceNo;
  },
};

export default lotAllowanceService;
