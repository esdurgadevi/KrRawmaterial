// services/finalInvoiceService.js

import axios from "axios";

// ================= FINAL INVOICE API =================
const FINAL_INVOICE_API_URL =
  "http://localhost:5000/api/final-invoices";

// Axios instance
const finalInvoiceApi = axios.create({
  baseURL: FINAL_INVOICE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ================= Attach Token =================
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

finalInvoiceApi.interceptors.request.use(attachToken);

// ================= SERVICE OBJECT =================
const finalInvoiceService = {
  /* =============================
     CREATE FINAL INVOICE
     (Head + Multiple Details)
  ============================= */
  createFinalInvoice: async (data) => {
    const res = await finalInvoiceApi.post("/", data);
    console.log(data);
    console.log(res);
    return res.data.finalInvoice; 
    // backend should return { finalInvoice }
  },
  getNextVoucherNo: async (tcType) => {
  const response = await finalInvoiceApi.get(`/next-voucher?tcType=${tcType}`);
  console.log(response);
  return response.data.nextNo;
},

  /* =============================
     GET ALL FINAL INVOICES
  ============================= */
  getAllFinalInvoices: async () => {
    const res = await finalInvoiceApi.get("/");
    return res.data.finalInvoices; 
    // backend should return { finalInvoices }
  },

  /* =============================
     GET FINAL INVOICE BY ID
     (Includes Head + Details)
  ============================= */
  getFinalInvoiceById: async (id) => {
    const res = await finalInvoiceApi.get(`/${id}`);
    return res.data.finalInvoice; 
  },

  /* =============================
     UPDATE FINAL INVOICE
     (Head + Replace Details)
  ============================= */
  updateFinalInvoice: async (id, data) => {
    const res = await finalInvoiceApi.put(`/${id}`, data);
    return res.data.finalInvoice;
  },

  /* =============================
     DELETE FINAL INVOICE
     (Deletes Head + All Details)
  ============================= */
  deleteFinalInvoice: async (id) => {
    const res = await finalInvoiceApi.delete(`/${id}`);
    return res.data;
  },

  /* =============================
     GET NEXT CODE (Optional)
     If backend provides it
  ============================= */
  getNextFinalInvoiceCode: async () => {
    const res = await finalInvoiceApi.get("/next-code");
    return res.data.code;
  },
};

export default finalInvoiceService;
