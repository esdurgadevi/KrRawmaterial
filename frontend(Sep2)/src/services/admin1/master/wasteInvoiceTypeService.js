import axios from "axios";

// ✅ Backend base URL (adjust port if your backend runs on different one, e.g. 3000)
const API_URL = "http://localhost:5000/api/waste-invoice-types";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token automatically (from login)
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

// ✅ Service methods (MATCHES YOUR BACKEND ROUTES)
const wasteInvoiceTypeService = {
  // 🔹 Get all waste invoice types
  getAll: async () => {
    const response = await api.get("/");
    return response.data.wasteInvoiceTypes; // { wasteInvoiceTypes: [...] }
  },

  // 🔹 Get single waste invoice type by ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.wasteInvoiceType; // { wasteInvoiceType: {...} }
  },

  // 🔹 Optional: Get next available code (if you added /next-code route)
  // getNextCode: async () => {
  //   const res = await api.get("/next-code");
  //   return res.data.nextCode;
  // },

  // 🔹 Create new waste invoice type
  create: async (data) => {
    const payload = {
      code: Number(data.code), // ensure it's integer
      invoiceType: data.invoiceType?.trim(),
      roundOffDigits: Number(data.roundOffDigits || 0),
      assessValueFormula: data.assessValueFormula,
      charityBale: Number(data.charityBale || 0),
      charityFormula: data.charityFormula,
      taxVat: Number(data.taxVat || 0),
      taxVatFormula: data.taxVatFormula,
      gst: Number(data.gst || 5),
      cgstFormula: data.cgstFormula,
      sgstFormula: data.sgstFormula,
      igst: Number(data.igst || 0),
      igstFormula: data.igstFormula,
      duty: Number(data.duty || 0),
      dutyFormula: data.dutyFormula,
      cess: Number(data.cess || 1),
      cessFormula: data.cessFormula,
      hrSecCess: Number(data.hrSecCess || 0),
      hrSecCessFormula: data.hrSecCessFormula,
      tcs: Number(data.tcs || 0.75),
      tcsFormula: data.tcsFormula,
      cst: Number(data.cst || 0),
      cstFormula: data.cstFormula,
      cenvat: Number(data.cenvat || 0),
      cenvatFormula: data.cenvatFormula,
      subTotalFormula: data.subTotalFormula,
      totalValueFormula: data.totalValueFormula,
      roundOffFormula: data.roundOffFormula,
      packingForwardingFormula: data.packingForwardingFormula,
      accPosting: data.accPosting ?? true,
    };

    const response = await api.post("/", payload);
    return response.data.wasteInvoiceType;
  },

  // 🔹 Update existing waste invoice type
  update: async (id, data) => {
    const payload = {};

    // Only include fields that are sent (partial update)
    if (data.code !== undefined) payload.code = Number(data.code);
    if (data.invoiceType) payload.invoiceType = data.invoiceType.trim();
    if (data.roundOffDigits !== undefined) payload.roundOffDigits = Number(data.roundOffDigits);
    if (data.assessValueFormula !== undefined) payload.assessValueFormula = data.assessValueFormula;
    if (data.charityBale !== undefined) payload.charityBale = Number(data.charityBale);
    if (data.charityFormula !== undefined) payload.charityFormula = data.charityFormula;
    // ... add other fields the same way
    if (data.gst !== undefined) payload.gst = Number(data.gst);
    if (data.cgstFormula !== undefined) payload.cgstFormula = data.cgstFormula;
    if (data.sgstFormula !== undefined) payload.sgstFormula = data.sgstFormula;
    if (data.tcs !== undefined) payload.tcs = Number(data.tcs);
    if (data.tcsFormula !== undefined) payload.tcsFormula = data.tcsFormula;
    if (data.subTotalFormula !== undefined) payload.subTotalFormula = data.subTotalFormula;
    if (data.totalValueFormula !== undefined) payload.totalValueFormula = data.totalValueFormula;
    if (data.accPosting !== undefined) payload.accPosting = data.accPosting;

    const response = await api.put(`/${id}`, payload);
    return response.data.wasteInvoiceType;
  },

  // 🔹 Delete waste invoice type
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data; // usually { message: "Waste invoice type deleted successfully" }
  },
};

export default wasteInvoiceTypeService;
