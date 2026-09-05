// services/locationTransferService.js
import axios from "axios";

// ---------------- LOCATION TRANSFER API ----------------
const LOCATION_TRANSFER_API_URL =
  "https://krexports.org/krerm/location-transfer";

const locationTransferApi = axios.create({
  baseURL: LOCATION_TRANSFER_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

locationTransferApi.interceptors.request.use(attachToken);

const locationTransferService = {

  /* =============================
     GET NEXT TRANSFER NUMBER
  ============================= */
  getNextTransferNo: async () => {
    const res = await locationTransferApi.get("/next-no");
    console.log(res);
    return res.data.nextNo;
  },

  /* =============================
     GET WEIGHTMENTS BY LOT
  ============================= */
  getWeightmentsByLot: async (lotNo) => {
    const res = await locationTransferApi.get(`/available-bales?lotNo=${lotNo}`);
    return res.data;
  },


  /* =============================
     CREATE LOCATION TRANSFER
  ============================= */
  createLocationTransfer: async (data) => {
    const res = await locationTransferApi.post("/", data);
    return res.data;
  },

  /* =============================
     GET ALL LOCATION TRANSFERS
  ============================= */
  getAllLocationTransfers: async () => {
    const res = await locationTransferApi.get("/");
    return res.data;
  },

  /* =============================
     GET LOCATION TRANSFER BY ID
  ============================= */
  getLocationTransferById: async (id) => {
    const res = await locationTransferApi.get(`/${id}`);
    return res.data;
  },

  /* =============================
     UPDATE LOCATION TRANSFER
  ============================= */
  updateLocationTransfer: async (id, data) => {
    const res = await locationTransferApi.put(`/${id}`, data);
    return res.data;
  },

  /* =============================
     DELETE LOCATION TRANSFER
  ============================= */
  deleteLocationTransfer: async (id) => {
    const res = await locationTransferApi.delete(`/${id}`);
    return res.data;
  },
};

export default locationTransferService;
