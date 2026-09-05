import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/inward-entries";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token
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

const inwardEntryService = {
  getNextInwardNo: async () => {
    const response = await api.get("/next-inward-no");
    return response.data.nextNo;
  },

  /* =============================
     GET ALL INWARD ENTRIES
  ============================= */
  getAll: async () => {
    const response = await api.get("/");
    return response.data.inwardEntries;
  },

  /* =============================
     GET BY ID
  ============================= */
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.inwardEntry;
  },

  /* =============================
     CREATE INWARD ENTRY
  ============================= */
 create: async (data) => {
    // Calculate tax amounts if they're not provided but rates are
    let sgstAmount = data.sgstAmount;
    let cgstAmount = data.cgstAmount;
    let igstAmount = data.igstAmount;
    let Tax = data.Tax;
    let TaxRs = data.TaxRs;
    
    // If tax amounts are not provided but rates are, calculate them
    if (data.candyRate && (data.sgst || data.cgst || data.igst)) {
      const candyRate = Number(data.candyRate) || 0;
      const sgst = Number(data.sgst) || 0;
      const cgst = Number(data.cgst) || 0;
      const igst = Number(data.igst) || 0;
      
      // Only calculate if not already provided
      if (!sgstAmount) sgstAmount = candyRate * (sgst / 100);
      if (!cgstAmount) cgstAmount = candyRate * (cgst / 100);
      if (!igstAmount) igstAmount = candyRate * (igst / 100);
      
      const totalTaxPercent = sgst + cgst + igst;
      const totalTaxAmount = (sgstAmount || 0) + (cgstAmount || 0) + (igstAmount || 0);
      
      if (!Tax) Tax = totalTaxPercent;
      if (!TaxRs) TaxRs = totalTaxAmount;
    }

    const payload = {
      // Required fields
      inwardNo: data.inwardNo,
      inwardDate: data.inwardDate,
      
      // Foreign keys
      purchaseOrderId: data.purchaseOrderId !== undefined && data.purchaseOrderId !== null && data.purchaseOrderId !== '' 
        ? Number(data.purchaseOrderId) 
        : null,
      
      godownId: data.godownId !== undefined && data.godownId !== null && data.godownId !== '' 
        ? Number(data.godownId) 
        : null,

      // Optional fields with proper null handling
      orderNo: data.orderNo || null,
      lcNo: data.lcNo || null,
      paymentDays: data.paymentDays !== undefined && data.paymentDays !== null && data.paymentDays !== '' 
        ? Number(data.paymentDays) 
        : null,
      paymentDate: data.paymentDate || null,
      govtForm: data.govtForm || null,
      type: data.type || null,

      // Document details
      billNo: data.billNo || null,
      billDate: data.billDate || null,
      lotNo: data.lotNo || null,
      lorryNo: data.lorryNo || null,
      date: data.date || null,

      // Rate and charges
      candyRate: data.candyRate !== undefined && data.candyRate !== null && data.candyRate !== '' 
        ? Number(data.candyRate) 
        : null,
      pMark: data.pMark || null,
      pressRunningNo: data.pressRunningNo || null,
      commisType: data.commisType || null,
      commisValue: data.commisValue !== undefined && data.commisValue !== null && data.commisValue !== '' 
        ? Number(data.commisValue) 
        : null,

      // Quantity - THIS IS THE IMPORTANT ONE
      Qty: data.Qty !== undefined && data.Qty !== null && data.Qty !== '' 
        ? Number(data.Qty) 
        : null,

      // Weight
      grossWeight: data.grossWeight !== undefined && data.grossWeight !== null && data.grossWeight !== '' 
        ? Number(data.grossWeight) 
        : null,
      tareWeight: data.tareWeight !== undefined && data.tareWeight !== null && data.tareWeight !== '' 
        ? Number(data.tareWeight) 
        : null,
      nettWeight: data.nettWeight !== undefined && data.nettWeight !== null && data.nettWeight !== '' 
        ? Number(data.nettWeight) 
        : null,

      // Freight and charges
      freight: data.freight !== undefined && data.freight !== null && data.freight !== '' 
        ? Number(data.freight) 
        : 0,
      cooly: data.cooly !== undefined && data.cooly !== null && data.cooly !== '' 
        ? Number(data.cooly) 
        : 0,
      bale: data.bale !== undefined && data.bale !== null && data.bale !== '' 
        ? Number(data.bale) 
        : 0,

      // Tax rates - handle null/empty values
      gst: data.gst !== undefined && data.gst !== null && data.gst !== '' 
        ? Number(data.gst) 
        : 0,
      sgst: data.sgst !== undefined && data.sgst !== null && data.sgst !== '' 
        ? Number(data.sgst) 
        : 0,
      cgst: data.cgst !== undefined && data.cgst !== null && data.cgst !== '' 
        ? Number(data.cgst) 
        : 0,
      igst: data.igst !== undefined && data.igst !== null && data.igst !== '' 
        ? Number(data.igst) 
        : 0,

      // Tax amounts - use calculated values if needed
      sgstAmount: sgstAmount !== undefined && sgstAmount !== null && sgstAmount !== '' 
        ? Number(sgstAmount) 
        : 0,
      cgstAmount: cgstAmount !== undefined && cgstAmount !== null && cgstAmount !== '' 
        ? Number(cgstAmount) 
        : 0,
      igstAmount: igstAmount !== undefined && igstAmount !== null && igstAmount !== '' 
        ? Number(igstAmount) 
        : 0,
      
      Tax: Tax !== undefined && Tax !== null && Tax !== '' 
        ? Number(Tax) 
        : 0,
      TaxRs: TaxRs !== undefined && TaxRs !== null && TaxRs !== '' 
        ? Number(TaxRs) 
        : 0,

      // Other
      permitNo: data.permitNo || null,
      comm: data.comm !== undefined && data.comm !== null && data.comm !== '' 
        ? Number(data.comm) 
        : null,
      remarks: data.remarks || null,
    };
    console.log(data);
    // Log the payload to verify
    console.log('Final Payload:', JSON.stringify(payload, null, 2));
    
    const response = await api.post("/", payload);
    return response.data.inwardEntry;
  },
  /* =============================
     UPDATE INWARD ENTRY
  ============================= */
  /* =============================
   UPDATE INWARD ENTRY
============================= */
update: async (id, data) => {
  // Calculate tax amounts if they're not provided but rates are
  let sgstAmount = data.sgstAmount;
  let cgstAmount = data.cgstAmount;
  let igstAmount = data.igstAmount;
  let Tax = data.Tax;
  let TaxRs = data.TaxRs;
  
  // If tax amounts are not provided but rates are, calculate them
  if (data.candyRate && (data.sgst || data.cgst || data.igst)) {
    const candyRate = Number(data.candyRate) || 0;
    const sgst = Number(data.sgst) || 0;
    const cgst = Number(data.cgst) || 0;
    const igst = Number(data.igst) || 0;
    
    // Only calculate if not already provided
    if (!sgstAmount) sgstAmount = candyRate * (sgst / 100);
    if (!cgstAmount) cgstAmount = candyRate * (cgst / 100);
    if (!igstAmount) igstAmount = candyRate * (igst / 100);
    
    const totalTaxPercent = sgst + cgst + igst;
    const totalTaxAmount = (sgstAmount || 0) + (cgstAmount || 0) + (igstAmount || 0);
    
    if (!Tax) Tax = totalTaxPercent;
    if (!TaxRs) TaxRs = totalTaxAmount;
  }

  const payload = {
    // Required fields
    inwardNo: data.inwardNo,
    inwardDate: data.inwardDate,
    
    // Foreign keys
    purchaseOrderId: data.purchaseOrderId !== undefined && data.purchaseOrderId !== null && data.purchaseOrderId !== '' 
      ? Number(data.purchaseOrderId) 
      : null,
    
    godownId: data.godownId !== undefined && data.godownId !== null && data.godownId !== '' 
      ? Number(data.godownId) 
      : null,

    // Optional fields with proper null handling
    orderNo: data.orderNo || null,
    lcNo: data.lcNo || null,
    paymentDays: data.paymentDays !== undefined && data.paymentDays !== null && data.paymentDays !== '' 
      ? Number(data.paymentDays) 
      : null,
    paymentDate: data.paymentDate || null,
    govtForm: data.govtForm || null,
    type: data.type || null,

    // Document details
    billNo: data.billNo || null,
    billDate: data.billDate || null,
    lotNo: data.lotNo || null,
    lorryNo: data.lorryNo || null,
    date: data.date || null,

    // Rate and charges
    candyRate: data.candyRate !== undefined && data.candyRate !== null && data.candyRate !== '' 
      ? Number(data.candyRate) 
      : null,
    pMark: data.pMark || null,
    pressRunningNo: data.pressRunningNo || null,
    commisType: data.commisType || null,
    commisValue: data.commisValue !== undefined && data.commisValue !== null && data.commisValue !== '' 
      ? Number(data.commisValue) 
      : null,

    // Quantity - THIS IS THE IMPORTANT ONE
    Qty: data.Qty !== undefined && data.Qty !== null && data.Qty !== '' 
      ? Number(data.Qty) 
      : null,

    // Weight
    grossWeight: data.grossWeight !== undefined && data.grossWeight !== null && data.grossWeight !== '' 
      ? Number(data.grossWeight) 
      : null,
    tareWeight: data.tareWeight !== undefined && data.tareWeight !== null && data.tareWeight !== '' 
      ? Number(data.tareWeight) 
      : null,
    nettWeight: data.nettWeight !== undefined && data.nettWeight !== null && data.nettWeight !== '' 
      ? Number(data.nettWeight) 
      : null,

    // Freight and charges
    freight: data.freight !== undefined && data.freight !== null && data.freight !== '' 
      ? Number(data.freight) 
      : 0,
    cooly: data.cooly !== undefined && data.cooly !== null && data.cooly !== '' 
      ? Number(data.cooly) 
      : 0,
    bale: data.bale !== undefined && data.bale !== null && data.bale !== '' 
      ? Number(data.bale) 
      : 0,

    // Tax rates - handle null/empty values
    gst: data.gst !== undefined && data.gst !== null && data.gst !== '' 
      ? Number(data.gst) 
      : 0,
    sgst: data.sgst !== undefined && data.sgst !== null && data.sgst !== '' 
      ? Number(data.sgst) 
      : 0,
    cgst: data.cgst !== undefined && data.cgst !== null && data.cgst !== '' 
      ? Number(data.cgst) 
      : 0,
    igst: data.igst !== undefined && data.igst !== null && data.igst !== '' 
      ? Number(data.igst) 
      : 0,

    // Tax amounts - use calculated values if needed
    sgstAmount: sgstAmount !== undefined && sgstAmount !== null && sgstAmount !== '' 
      ? Number(sgstAmount) 
      : 0,
    cgstAmount: cgstAmount !== undefined && cgstAmount !== null && cgstAmount !== '' 
      ? Number(cgstAmount) 
      : 0,
    igstAmount: igstAmount !== undefined && igstAmount !== null && igstAmount !== '' 
      ? Number(igstAmount) 
      : 0,
    
    Tax: Tax !== undefined && Tax !== null && Tax !== '' 
      ? Number(Tax) 
      : 0,
    TaxRs: TaxRs !== undefined && TaxRs !== null && TaxRs !== '' 
      ? Number(TaxRs) 
      : 0,

    // Other
    permitNo: data.permitNo || null,
    comm: data.comm !== undefined && data.comm !== null && data.comm !== '' 
      ? Number(data.comm) 
      : null,
    remarks: data.remarks || null,
  };

  console.log('Update Payload:', JSON.stringify(payload, null, 2));
  
  const response = await api.put(`/${id}`, payload);
  return response.data.inwardEntry;
},
  /* =============================
     DELETE
  ============================= */
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },
};

export default inwardEntryService;
