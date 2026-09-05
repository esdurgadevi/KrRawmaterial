// frontend/src/pages/admin/WasteCottonInvoicePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import invoiceService from "../../services/admin1/transaction-waste/invoiceService";
import salesOrderService from "../../services/admin1/transaction-waste/salesOrderService";
import wcInvoiceTypeService from "../../services/admin1/master/wcInvoiceService";
import wasteLotService from "../../services/admin1/master/wasteLotService";
import supplierService from "../../services/admin1/master/supplierService";
import formulaEvaluator from "../../utils/formulaEvaluator";

// ─── Hardcoded Seller (always same) ────────────────────────────────────────────
const SELLER_DETAILS = {
  Gstin: "33AAACK4468M1ZA",
  LglNm: "KAYAAR EXPORTS PRIVATE LIMITED",
  TrdNm: "KAYAAR EXPORTS PRIVATE LIMITED",
  Addr1: "D.No. 43/5, Railway Feeder Road,K.R.Nagar - 628503",
  Addr2: null,
  Loc: "Kovilpatti -Taluk",
  Pin: 628503,
  Stcd: "33",
  Ph: null,
  Em: null,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toFixed(decimals);
};

const formatDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return dateString.split("T")[0];
};

// Convert "YYYY-MM-DD" → "DD/MM/YYYY" for JSON
const toJsonDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleDateString("en-GB").replace(/\//g, "/");
  const d = (dateStr.split("T")[0]).split("-");
  if (d.length === 3) return `${d[2]}/${d[1]}/${d[0]}`;
  return dateStr;
};

// Derive state code from first 2 chars of GSTIN
const stateCodeFromGstin = (gstin) => {
  if (!gstin || gstin.length < 2) return "33";
  return gstin.substring(0, 2);
};

// ─── JSON Generator ────────────────────────────────────────────────────────────
const generateEInvoiceJSON = (invoice, supplier) => {
  const buyerStcd = supplier?.gstNo
    ? stateCodeFromGstin(supplier.gstNo)
    : "33";

  const buyerAddr1 = supplier?.address || "";
  const buyerAddr2 = supplier?.deliveryAddress || null;
  const buyerPin = parseInt(supplier?.pincode) || 0;

  const totalKgs = (invoice.details || []).reduce(
    (sum, b) => sum + (parseFloat(b.netWt) || 0),
    0
  );

  const assVal = parseFloat(invoice.assessableValue) || 0;

  const igstVal = parseFloat(invoice.igstAmt || invoice.igst) || 0;
  const cgstVal = igstVal > 0
    ? 0.0
    : (parseFloat(invoice.cgstAmt || invoice.cgst) || parseFloat((assVal * 0.025).toFixed(2)));
  const sgstVal = igstVal > 0
    ? 0.0
    : (parseFloat(invoice.sgstAmt || invoice.sgst) || parseFloat((assVal * 0.025).toFixed(2)));

  const othChrg = parseFloat(invoice.tcsRs || invoice.tcs || invoice.otherCharges || invoice.pfCharges) || parseFloat((assVal * 0.01).toFixed(2));
  const totInvVal = parseFloat(invoice.invoiceValue) || 0;

  const gstRt = igstVal > 0
    ? (assVal > 0 ? parseFloat(((igstVal / assVal) * 100).toFixed(2)) : 5.0)
    : (assVal > 0 ? parseFloat((((cgstVal + sgstVal) / assVal) * 100).toFixed(2)) : 5.0);

  const supTyp = "B2B";

  const rawInvoiceNo = (invoice.invoiceNo || "").toString().trim();
  const cleanNo = rawInvoiceNo.replace(/^W-?/i, "").trim();
  const docNo = `W${cleanNo}`;

  const totItemVal = parseFloat(
    (assVal + cgstVal + sgstVal + igstVal + (parseFloat(invoice.cess) || 0) + (parseFloat(invoice.hsCess) || 0)).toFixed(2)
  );

  const json = [
    {
      Version: "1.1",
      TranDtls: {
        TaxSch: "GST",
        SupTyp: supTyp,
        IgstOnIntra: "N",
        RegRev: "N",
        EcmGstin: null,
      },
      DocDtls: {
        Typ: "INV",
        No: docNo,
        Dt: toJsonDate(invoice.date),
      },
      SellerDtls: { ...SELLER_DETAILS },
      BuyerDtls: {
        Gstin: supplier?.gstNo || "",
        LglNm: supplier?.accountName || invoice.partyName || "",
        TrdNm: supplier?.accountName || invoice.partyName || "",
        Pos: buyerStcd,
        Addr1: buyerAddr1,
        Addr2: buyerAddr2,
        Loc: supplier?.place || "",
        Pin: buyerPin,
        Stcd: buyerStcd,
        Ph: supplier?.phoneNo || supplier?.cellNo || null,
        Em: supplier?.email || null,
      },
      ValDtls: {
        AssVal: assVal,
        IgstVal: igstVal,
        CgstVal: cgstVal,
        SgstVal: sgstVal,
        CesVal: parseFloat(invoice.cess) || 0,
        StCesVal: parseFloat(invoice.hsCess) || 0,
        Discount: 0.0,
        OthChrg: othChrg,
        RndOffAmt: parseFloat(invoice.roundOff) || 0,
        TotInvVal: totInvVal,
        TotInvValFc: 0.0,
      },
      ExpDtls: {
        ShipBNo: null,
        ShipBDt: null,
        Port: null,
        RefClm: null,
        ForCur: null,
        CntCode: null,
        ExpDuty: null,
      },
      EwbDtls: {},
      Itemlist: [
        {
          SlNo: "1",
          PrdDesc: invoice.wasteName || invoice.wasteLotName || invoice.productName || "COMBER NOILS",
          IsServc: "N",
          HsnCd: invoice.hsnCode || invoice.hsn || "52021000",
          Barcde: null,
          Qty: parseFloat(totalKgs.toFixed(3)),
          FreeQty: 0.0,
          Unit: "KGS",
          UnitPrice: parseFloat(invoice.ratePerKg) || 0,
          TotAmt: assVal,
          Discount: 0.0,
          PreTaxVal: 0.0,
          AssAmt: assVal,
          GstRt: gstRt,
          IgstAmt: igstVal,
          CgstAmt: cgstVal,
          SgstAmt: sgstVal,
          CesRt: 0.0,
          CesAmt: parseFloat(invoice.cess) || 0,
          CesNonAdvlAmt: 0.0,
          StateCesRt: 0.0,
          StateCesAmt: parseFloat(invoice.hsCess) || 0,
          StateCesNonAdvlAmt: 0.0,
          OthChrg: 0.0,
          TotItemVal: totItemVal,
          BchDtls: null,
        },
      ],
    },
  ];

  return json;
};

// Download JSON file
const downloadJSON = (invoice, supplier) => {
  const json = generateEInvoiceJSON(invoice, supplier);
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanNo = (invoice.invoiceNo || "").toString().replace(/^W-?/, "");
  a.download = `W-${cleanNo}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── InvoiceForm — DEFINED OUTSIDE WasteCottonInvoicePage to prevent remount on every render ───
const InvoiceForm = React.memo(({
  formData,
  handleFormChange,
  onSubmit,
  submitLabel,
  suppliers,
  invoiceTypes,
  handleSupplierChange,
  selectedOrder,
  availableBales,
  checkedBales,
  setCheckedBales,
  handleBaleCheckbox,
  handleAddSelectedBales,
  handleDetailChange,
  removeBaleFromInvoice,
  ratePerKg,
  loadingOrders,
  salesOrders,
  handleOrderSelect,
  totalGross,
  totalTare,
  totalNet,
  setShowCreateModal,
  setShowEditModal,
  resetForm,
  setSelectedInvoice,
  setFormData,
}) => {
  return (
    <form onSubmit={onSubmit}>
      {/* Row 1: Invoice No / Date / Invoice Type */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice No. *</label>
          <input
            type="text"
            name="invoiceNo"
            value={formData.invoiceNo}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleFormChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Type</label>
          <select
            name="invoiceType"
            value={formData.invoiceType}
            onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          >
            {invoiceTypes.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Supplier / Address */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier *</label>
          <select
            value={formData.supplierId}
            onChange={(e) => handleSupplierChange(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.accountName} — {s.place}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
      </div>

      {/* Row 3: Transport fields */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: "Credit Days", name: "creditDays", type: "number" },
          { label: "Transport", name: "transport", type: "text" },
          { label: "LR No.", name: "lrNo", type: "text" },
          { label: "LR Date", name: "lrDate", type: "date" },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onWheel={type === "number" ? (e) => e.target.blur() : undefined}
              onChange={handleFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Row 4: Vehicle / Removal Time / E-Bill */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle No.</label>
          <input
            type="text"
            name="vehicleNo"
            value={formData.vehicleNo}
            onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Removal Time</label>
          <input
            type="text"
            name="removalTime"
            value={formData.removalTime}
            onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">E-Bill No.</label>
          <input
            type="text"
            name="eBill"
            value={formData.eBill}
            onChange={handleFormChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
      </div>

      {/* Row 5: Tax Values (CGST / SGST / IGST) */}
      <div className="grid grid-cols-3 gap-4 mb-6 bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">CGST (%)</label>
          <input
            type="number"
            step="0.01"
            name="cgst"
            value={formData.cgst}
            onChange={handleFormChange}
            onWheel={(e) => e.target.blur()}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SGST (%)</label>
          <input
            type="number"
            step="0.01"
            name="sgst"
            value={formData.sgst}
            onChange={handleFormChange}
            onWheel={(e) => e.target.blur()}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">IGST (%)</label>
          <input
            type="number"
            step="0.01"
            name="igst"
            value={formData.igst}
            onChange={handleFormChange}
            onWheel={(e) => e.target.blur()}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          />
        </div>
      </div>

      {/* Calculated Invoice Values */}
      <div className="grid grid-cols-4 gap-3 mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
        {[
          { label: "Assessable Value", key: "assessableValue", highlight: "text-blue-700 font-semibold" },
          { label: "Charity", key: "charity" },
          { label: "VAT Tax", key: "vatTax" },
          { label: "Cenvat", key: "cenvat" },
          { label: "Duty", key: "duty" },
          { label: "Cess", key: "cess" },
          { label: "H.S. Cess", key: "hsCess" },
          { label: "TCS Amt", key: "tcsRs" },
          { label: "TCS", key: "tcs" },
          { label: "PF / Other Charges", key: "pfCharges" },
          { label: "CGST Amt (2.5%)", key: "cgstAmt", isCalculated: true },
          { label: "SGST Amt (2.5%)", key: "sgstAmt", isCalculated: true },
          { label: "Sub Total", key: "subTotal", highlight: "font-semibold" },
          { label: "Round Off", key: "roundOff" },
          { label: "Invoice Value", key: "invoiceValue", highlight: "text-green-700 font-bold text-lg" },
          { label: "GST (CGST + SGST)", key: "gst", highlight: "text-purple-700 font-semibold" },
          { label: "IGST", key: "igst" },
        ].map(({ label, key, highlight, isCalculated }) => {
          let displayValue = formData[key];
          if (isCalculated) {
            const assVal = parseFloat(formData.assessableValue) || 0;
            displayValue = assVal * 0.025;
          }
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500">{label}</label>
              <div className={`text-base ${highlight || "text-gray-800"}`}>
                ₹{formatNumber(displayValue)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Sales Order</label>
        <select
          value={formData.salesOrderId}
          onChange={(e) => handleOrderSelect(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          disabled={loadingOrders}
        >
          <option value="">Select an order…</option>
          {salesOrders.map((o) => (
            <option key={o.id} value={o.id}>{o.orderNo} — {o.party}</option>
          ))}
        </select>
      </div>

      {/* Order Detail Table */}
      {selectedOrder && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Order Details</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Order No", "Product", "Pack", "Ord Qty", "Ord Kgs", "Stock Qty", "Stock Kgs", "Despatch Qty"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedOrder.details?.map((d, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{selectedOrder.orderNo}</td>
                    <td className="px-4 py-2">{d.product}</td>
                    <td className="px-4 py-2">BALE</td>
                    <td className="px-4 py-2">{d.qty}</td>
                    <td className="px-4 py-2">{d.totalWt}</td>
                    <td className="px-4 py-2">{d.qty}</td>
                    <td className="px-4 py-2">{d.totalWt}</td>
                    <td className="px-4 py-2">{d.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Bales */}
      {availableBales.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Available Bales</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    <input
                      type="checkbox"
                      checked={checkedBales.size === availableBales.length && availableBales.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckedBales(new Set(availableBales.map((b) => b.id)));
                        } else {
                          setCheckedBales(new Set());
                        }
                      }}
                    />
                  </th>
                  {["Bale No.", "Waste Name", "Lot No", "Gross Wt."].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableBales.map((bale, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={checkedBales.has(bale.id)}
                        onChange={() => handleBaleCheckbox(bale.id)}
                      />
                    </td>
                    <td className="px-4 py-2">{bale.baleNo}</td>
                    <td className="px-4 py-2">{bale.wasteName}</td>
                    <td className="px-4 py-2">{bale.lotNo}</td>
                    <td className="px-4 py-2">{formatNumber(bale.grossWt, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {checkedBales.size > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleAddSelectedBales}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm"
              >
                Add Selected ({checkedBales.size})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bale Details */}
      {formData.details.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Bale Details</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Waste Name", "LOT No", "Bale No", "Gross Wt", "Tare Wt", "Net Wt", "Action"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.details.map((bale, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{bale.wasteName}</td>
                    <td className="px-4 py-2">{bale.lotNo}</td>
                    <td className="px-4 py-2">{bale.baleNo}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={bale.grossWt}
                        step="0.001"
                        onChange={(e) => handleDetailChange(index, "grossWt", e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={bale.tareWt}
                        step="0.001"
                        onChange={(e) => handleDetailChange(index, "tareWt", e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{formatNumber(bale.netWt, 3)}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeBaleFromInvoice(index)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold text-sm">
                <tr>
                  <td colSpan="3" className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2">{formatNumber(totalGross, 3)}</td>
                  <td className="px-4 py-2">{formatNumber(totalTare, 3)}</td>
                  <td className="px-4 py-2">{formatNumber(totalNet, 3)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Rate Per Kg */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate Per Kg (₹)</label>
        <input
          type="number"
          name="ratePerKg"
          value={ratePerKg}
          step="0.01"
          onChange={handleFormChange}
          onWheel={(e) => e.target.blur()}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Footer actions */}
      <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-200">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="approve"
            checked={formData.approve}
            onChange={handleFormChange}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Approval</span>
        </label>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedInvoice(null);
          }}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────────
const WasteCottonInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoiceTypes, setInvoiceTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showJsonPreviewModal, setShowJsonPreviewModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [jsonPreviewData, setJsonPreviewData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableBales, setAvailableBales] = useState([]);
  const [checkedBales, setCheckedBales] = useState(new Set());
  const [selectedInvoiceType, setSelectedInvoiceType] = useState(null);
  const [ratePerKg, setRatePerKg] = useState(null);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const emptyForm = () => ({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    invoiceType: "GST WASTE SALE INVOICE",
    partyName: "",
    supplierId: "",
    address: "",
    creditDays: 0,
    transport: "OWN VEHICLE",
    lrNo: "",
    lrDate: new Date().toISOString().split("T")[0],
    vehicleNo: "",
    removalTime: "",
    eBill: "",
    exportTo: "",
    assessableValue: 0,
    charity: 0,
    vatTax: 0,
    cenvat: 0,
    duty: 0,
    cess: 0,
    hsCess: 0,
    tcs: 0,
    tcsRs: 0,
    pfCharges: 0,
    subTotal: 0,
    roundOff: 0,
    invoiceValue: 0,
    gst: 0,
    cgst: 2.5,
    sgst: 2.5,
    igst: 0,
    approve: false,
    salesOrderId: "",
    details: [],
  });

  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
    fetchInvoiceTypes();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (selectedInvoiceType && formData.details.length > 0) {
      calculateInvoiceValues();
    }
  }, [formData.details, ratePerKg, selectedInvoiceType]);

  // ── Fetchers ──────────────────────────────────────────────────────────────────
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await salesOrderService.getAll();
      setSalesOrders(Array.isArray(data) ? data : []);
    } catch {
      console.error("Error fetching sales orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchInvoiceTypes = async () => {
    try {
      const data = await wcInvoiceTypeService.getAll();
      setInvoiceTypes(Array.isArray(data) ? data : []);
      const def = data.find((t) => t.name === "GST WASTE SALE INVOICE");
      if (def) {
        setSelectedInvoiceType(def);
        setFormData((prev) => ({ ...prev, invoiceType: def.name }));
      }
    } catch {
      toast.error("Failed to load invoice types");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load suppliers");
    }
  };

  // ── Calculations ──────────────────────────────────────────────────────────────
  const calculateInvoiceValues = () => {
    if (!selectedInvoiceType?.details) return;

    const totalKgs = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.netWt) || 0),
      0
    );

    // First pass: Calculate Assess Value to use it for GST calculations
    const tempVariables = {
      totalKgs,
      ratePerKg,
      ratePer: 1,
      charityRs: 0,
      chessRs: 0,
      tcsRs: 0,
      gstAmt: 0,
      igstAmt: 0,
    };

    const tempCalculated = formulaEvaluator.calculateAllFields(
      selectedInvoiceType.details,
      tempVariables
    );

    const assessValue = tempCalculated["Assess Value"] || tempCalculated["X"] || 0;
    const cgstRate = parseFloat(formData.cgst) || 0;
    const sgstRate = parseFloat(formData.sgst) || 0;
    const igstRate = parseFloat(formData.igst) || 0;

    // Calculate actual GST amounts
    const cgstAmount = parseFloat((assessValue * (cgstRate / 100)).toFixed(2));
    const sgstAmount = parseFloat((assessValue * (sgstRate / 100)).toFixed(2));
    const igstAmount = parseFloat((assessValue * (igstRate / 100)).toFixed(2));
    const gstAmount = cgstAmount + sgstAmount; // Total GST (CGST + SGST)

    // Second pass with calculated GST values
    const baseVariables = {
      totalKgs,
      ratePerKg,
      ratePer: 1,
      charityRs: 0,
      chessRs: 0,
      tcsRs: 0,
      gstAmt: gstAmount,
      igstAmt: igstAmount,
    };

    const calculated = formulaEvaluator.calculateAllFields(
      selectedInvoiceType.details,
      baseVariables
    );

    console.log('All Calculated Values:', calculated);
    console.log('TCSRs:', calculated['TCSRs'] || calculated['TCSRS'] || 0);
    console.log('TCS:', calculated['TCS'] || calculated['F'] || 0);

    setFormData((prev) => ({
      ...prev,
      assessableValue: calculated["Assess Value"] || calculated["X"] || 0,
      charity: calculated["Charity"] || calculated["A"] || 0,
      vatTax: calculated["Tax [VAT]"] || calculated["B"] || 0,
      duty: calculated["Duty"] || calculated["C"] || 0,
      cess: calculated["Chess"] || calculated["D"] || 0,
      hsCess: calculated["H.S.Cess"] || calculated["E"] || 0,
      tcs: calculated["TCS"] || calculated["F"] || 0,
      tcsRs: calculated["TCSRs"] || calculated["TCSRS"] || calculated["F"] || 0,
      pfCharges: calculated["Others"] || calculated["G"] || 0,
      cgstAmt: cgstAmount,
      sgstAmt: sgstAmount,
      subTotal: calculated["Sub Total"] || calculated["H"] || 0,
      cenvat: calculated["Cenvat"] || calculated["J"] || 0,
      invoiceValue: calculated["Total Value"] || calculated["I"] || 0,
    }));
  };

  const calculateTotals = () => {
    const totalGross = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.grossWt) || 0),
      0
    );
    const totalTare = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.tareWt) || 0),
      0
    );
    const totalNet = formData.details.reduce(
      (sum, b) => sum + (parseFloat(b.netWt) || 0),
      0
    );
    return { totalGross, totalTare, totalNet };
  };

  // ── Supplier helper ───────────────────────────────────────────────────────────
  const getSupplierById = (supplierId) =>
    suppliers.find((s) => String(s.id) === String(supplierId)) || null;

  const getSupplierName = (supplierId) => {
    if (!supplierId) return "N/A";
    const s = getSupplierById(supplierId);
    return s ? s.accountName : String(supplierId);
  };

  const handleSupplierChange = useCallback((supplierId) => {
    const s = suppliers.find((sup) => String(sup.id) === String(supplierId));
    if (s) {
      setFormData((prev) => ({
        ...prev,
        supplierId,
        partyName: s.accountName,
        address: s.address || s.place || "",
      }));
    }
  }, [suppliers]);

  // ── Order / Bale helpers ──────────────────────────────────────────────────────
  const handleOrderSelect = useCallback(async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setAvailableBales([]);
      setCheckedBales(new Set());
      setFormData((prev) => ({ ...prev, details: [], salesOrderId: "" }));
      return;
    }

    try {
      const order = await salesOrderService.getById(orderId);
      setSelectedOrder(order);

      if (order.supplierId) {
        const s = suppliers.find((sup) => String(sup.id) === String(order.supplierId));
        if (s) {
          setFormData((prev) => ({
            ...prev,
            supplierId: order.supplierId,
            partyName: s.accountName,
            address: s.address || s.place || "",
          }));
        }
      }

      setFormData((prev) => ({ ...prev, salesOrderId: orderId }));

      // ── Fetch REAL bales from waste packing details via packingId ──────────
      try {
        const realBales = await salesOrderService.getAvailableBales(orderId);
        setAvailableBales(Array.isArray(realBales) ? realBales : []);
      } catch (baleErr) {
        console.error("Failed to load real bales:", baleErr);
        setAvailableBales([]);
        toast.error("Could not load available bales for this order");
      }

      if (order.details?.[0]?.rate) {
        setRatePerKg(parseFloat(order.details[0].rate));
      }

      setCheckedBales(new Set());
    } catch {
      toast.error("Failed to load order details");
    }
  }, [suppliers]);

  const handleBaleCheckbox = useCallback((baleId) => {
    setCheckedBales((prev) => {
      const next = new Set(prev);
      if (next.has(baleId)) {
        next.delete(baleId);
      } else {
        next.add(baleId);
      }
      return next;
    });
  }, []);

  const handleAddSelectedBales = useCallback(() => {
    if (checkedBales.size === 0) {
      toast.warning("Please select at least one bale");
      return;
    }

    setFormData((prev) => {
      const selectedBalesArray = availableBales.filter((bale) =>
        checkedBales.has(bale.id)
      );
      const failedBales = [];
      const updatedDetails = [...prev.details];

      for (const bale of selectedBalesArray) {
        if (prev.details.some((b) => b.baleNo === bale.baleNo)) {
          failedBales.push(bale.baleNo);
        } else {
          updatedDetails.push({ ...bale });
        }
      }

      if (failedBales.length > 0) {
        toast.warning(`${failedBales.length} bale(s) already added: ${failedBales.join(", ")}`);
      } else {
        toast.success(`${selectedBalesArray.length} bale(s) added successfully`);
      }

      return { ...prev, details: updatedDetails };
    });

    setAvailableBales((prev) => prev.filter((bale) => !checkedBales.has(bale.id)));
    setCheckedBales(new Set());
  }, [checkedBales, availableBales]);

  const removeBaleFromInvoice = useCallback((index) => {
    setFormData((prev) => {
      const removed = prev.details[index];
      const updated = prev.details.filter((_, i) => i !== index);
      setAvailableBales((bales) => [...bales, removed]);
      toast.info("Bale removed from invoice");
      return { ...prev, details: updated };
    });
  }, []);

  const handleDetailChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.details];
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
      if (field === "grossWt" || field === "tareWt") {
        updated[index].netWt = parseFloat(
          ((updated[index].grossWt || 0) - (updated[index].tareWt || 0)).toFixed(3)
        );
      }
      return { ...prev, details: updated };
    });
  }, []);

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      let updated = { ...prev, [name]: newValue };

      if (name === "cgst" || name === "sgst") {
        const cgst = parseFloat(name === "cgst" ? newValue : prev.cgst) || 0;
        const sgst = parseFloat(name === "sgst" ? newValue : prev.sgst) || 0;
        updated.gst = cgst + sgst;
      }

      return updated;
    });

    if (name === "ratePerKg") setRatePerKg(parseFloat(value) || 0);

    if (name === "invoiceType") {
      const sel = invoiceTypes.find((t) => t.name === value);
      setSelectedInvoiceType(sel || null);
    }
  }, [invoiceTypes]);

  const validateForm = () => {
    if (!formData.invoiceNo.trim()) { toast.error("Invoice No. is required"); return false; }
    if (!formData.date) { toast.error("Date is required"); return false; }
    if (!formData.supplierId) { toast.error("Supplier is required"); return false; }
    if (formData.details.length === 0) { toast.error("At least one bale detail is required"); return false; }
    return true;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const { totalNet } = calculateTotals();
      await invoiceService.create({ ...formData, totalNetWeight: totalNet.toFixed(3), ratePerKg });
      toast.success("Invoice created successfully!");
      resetForm();
      fetchInvoices();
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedInvoice) return;
    try {
      const { totalNet } = calculateTotals();
      await invoiceService.update(selectedInvoice.id, { ...formData, totalNetWeight: totalNet.toFixed(3), ratePerKg });
      toast.success("Invoice updated successfully!");
      resetForm();
      fetchInvoices();
      setShowEditModal(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update invoice");
    }
  };

  const handleDelete = async (id) => {
    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted successfully!");
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    const sel = invoiceTypes.find((t) => t.name === invoice.invoiceType);
    setSelectedInvoiceType(sel || null);
    setFormData({
      invoiceNo: invoice.invoiceNo || "",
      date: invoice.date ? invoice.date.split("T")[0] : new Date().toISOString().split("T")[0],
      invoiceType: invoice.invoiceType || "GST WASTE SALE INVOICE",
      partyName: invoice.partyName || "",
      supplierId: invoice.supplierId || "",
      address: invoice.address || "",
      creditDays: invoice.creditDays || 0,
      transport: invoice.transport || "OWN VEHICLE",
      lrNo: invoice.lrNo || "",
      lrDate: invoice.lrDate ? invoice.lrDate.split("T")[0] : new Date().toISOString().split("T")[0],
      vehicleNo: invoice.vehicleNo || "",
      removalTime: invoice.removalTime || "",
      eBill: invoice.eBill || "",
      exportTo: invoice.exportTo || "",
      assessableValue: invoice.assessableValue || 0,
      charity: invoice.charity || 0,
      vatTax: invoice.vatTax || 0,
      cenvat: invoice.cenvat || 0,
      duty: invoice.duty || 0,
      cess: invoice.cess || 0,
      hsCess: invoice.hsCess || 0,
      tcs: invoice.tcs || 0,
      tcsRs: invoice.tcsRs || 0,
      pfCharges: invoice.pfCharges || 0,
      subTotal: invoice.subTotal || 0,
      roundOff: invoice.roundOff || 0,
      invoiceValue: invoice.invoiceValue || 0,
      gst: invoice.gst || 0,
      cgst: invoice.cgst || 2.5,
      sgst: invoice.sgst || 2.5,
      igst: invoice.igst || 0,
      approve: invoice.approve || false,
      salesOrderId: invoice.salesOrderId || "",
      details: invoice.details || [],
    });
    if (invoice.ratePerKg) setRatePerKg(parseFloat(invoice.ratePerKg));
    setShowEditModal(true);
  };

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const loadNextInvoiceNo = useCallback(async () => {
    try {
      const nextNo = await invoiceService.getNextInvoiceNo();
      setFormData((prev) => {
        // only set the auto-generated number when the field is currently empty
        if (prev.invoiceNo && String(prev.invoiceNo).trim() !== "") return prev;
        return { ...prev, invoiceNo: String(nextNo) };
      });
    } catch (err) {
      // fallback to 1 if API fails
      setFormData((prev) => {
        if (prev.invoiceNo && String(prev.invoiceNo).trim() !== "") return prev;
        return { ...prev, invoiceNo: "1" };
      });
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(emptyForm());
    setSelectedOrder(null);
    setAvailableBales([]);
    setCheckedBales(new Set());
    setRatePerKg(null);
    const def = invoiceTypes.find((t) => t.name === "GST WASTE SALE INVOICE");
    setSelectedInvoiceType(def || null);
    // fetch next invoice no into the cleared form
    loadNextInvoiceNo();
  }, [invoiceTypes, loadNextInvoiceNo]);

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const headSheetName = wb.SheetNames.find(n => n === "Head");
        const detailSheetName = wb.SheetNames.find(n => n === "Detail");
        const packingDetailSheetName = wb.SheetNames.find(n => n === "waste packing details");
        const invoiceTypesSheetName = wb.SheetNames.find(n => n === "Invoice Types");

        if (!headSheetName || !detailSheetName || !packingDetailSheetName || !invoiceTypesSheetName) {
          toast.error("Invalid Excel file: Must contain 'Head', 'Detail', 'waste packing details', and 'Invoice Types' sheets.");
          return;
        }

        const headers = XLSX.utils.sheet_to_json(wb.Sheets[headSheetName]);
        const details = XLSX.utils.sheet_to_json(wb.Sheets[detailSheetName]);
        const packingDetails = XLSX.utils.sheet_to_json(wb.Sheets[packingDetailSheetName]);
        const invoiceTypes = XLSX.utils.sheet_to_json(wb.Sheets[invoiceTypesSheetName]);

        if (headers.length === 0 || details.length === 0 || packingDetails.length === 0 || invoiceTypes.length === 0) {
          toast.error("Empty sheets found.");
          return;
        }

        setLoading(true);
        const res = await invoiceService.bulkImport({ headers, details, packingDetails, invoiceTypes });
        toast.success(`Successfully imported ${res.importedCount} invoices!`);
        fetchInvoices();
      } catch (err) {
        console.error("Import error:", err);
        toast.error(err.response?.data?.message || "Failed to parse and import Excel file");
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleOpenCreate = useCallback(async () => {
    // clear existing form values first
    setFormData(emptyForm());
    await loadNextInvoiceNo();
    setShowCreateModal(true);
  }, [loadNextInvoiceNo]);

  // ── JSON preview / download ───────────────────────────────────────────────────
  const handleShowJson = (invoice) => {
    const supplier = getSupplierById(invoice.supplierId);
    const json = generateEInvoiceJSON(invoice, supplier);
    setJsonPreviewData({ json, invoice });
    setShowJsonPreviewModal(true);
  };

  const handleDownloadJson = (invoice) => {
    const supplier = getSupplierById(invoice.supplierId);
    downloadJSON(invoice, supplier);
    toast.success(`JSON downloaded: W-${invoice.invoiceNo}.json`);
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const { totalGross, totalTare, totalNet } = calculateTotals();

  // Shared props for InvoiceForm
  const sharedFormProps = {
    formData,
    handleFormChange,
    suppliers,
    invoiceTypes,
    handleSupplierChange,
    selectedOrder,
    availableBales,
    checkedBales,
    setCheckedBales,
    handleBaleCheckbox,
    handleAddSelectedBales,
    handleDetailChange,
    removeBaleFromInvoice,
    ratePerKg,
    loadingOrders,
    salesOrders,
    handleOrderSelect,
    totalGross,
    totalTare,
    totalNet,
    setShowCreateModal,
    setShowEditModal,
    resetForm,
    setSelectedInvoice,
    setFormData,
  };

  // Reset page on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    const invNo = (inv.invoiceNo || '').toString().toLowerCase();
    const supplier = (getSupplierName(inv.supplierId) || '').toLowerCase();
    return invNo.includes(s) || supplier.includes(s);
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Waste Cotton Sales Invoice</h1>
          <p className="text-gray-500 text-sm">Add, modify or export cotton invoice details.</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
          </label>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + Create New Invoice
          </button>
        </div>
      </div>

      {/* Invoice List Table Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Invoices ({filteredInvoices.length})</h2>
            <span className="text-xs text-gray-500">
              Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} entries
            </span>
          </div>
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search by invoice no, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >×</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs text-left divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5 whitespace-nowrap">Invoice No</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Date</th>
                <th className="px-3 py-2.5">Supplier</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Bales</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Invoice Value</th>
                <th className="px-3 py-2.5 whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-8 text-center text-gray-400">No invoices found.</td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id || inv._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-gray-900">{inv.invoiceNo}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{formatDate(inv.date)}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-gray-900 max-w-[180px] truncate font-medium" title={getSupplierName(inv.supplierId)}>
                        {getSupplierName(inv.supplierId)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-gray-900">{inv.details?.length || 0}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-blue-600">₹{formatNumber(inv.invoiceValue)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        inv.approve
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {inv.approve ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleView(inv)}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[11px] font-medium"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(inv)}
                          className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-[11px] font-medium"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(inv)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-[11px] font-medium"
                          title="Delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleDownloadJson(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-medium"
                          title="Download JSON"
                        >
                          ↓ JSON
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-white gap-4 mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-4">
                Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} entries
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >«</button>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >‹ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...'
                    ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                    : <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-2.5 py-1 text-xs rounded border ${
                          currentPage === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >{p}</button>
                )
              }
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >Next ›</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >»</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create Waste Cotton Sales Invoice</h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InvoiceForm
              {...sharedFormProps}
              onSubmit={handleCreateInvoice}
              submitLabel="Create Invoice"
            />
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      {showEditModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Waste Cotton Sales Invoice</h2>
              <button
                onClick={() => { setShowEditModal(false); resetForm(); setSelectedInvoice(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <InvoiceForm
              {...sharedFormProps}
              onSubmit={handleUpdateInvoice}
              submitLabel="Update Invoice"
            />
          </div>
        </div>
      )}

      {/* ── View Modal ─────────────────────────────────────────────────────────── */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Invoice — {selectedInvoice.invoiceNo}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadJson(selectedInvoice)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium"
                >
                  ↓ Download JSON
                </button>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Invoice No.", val: selectedInvoice.invoiceNo },
                { label: "Date", val: formatDate(selectedInvoice.date) },
                { label: "Invoice Type", val: selectedInvoice.invoiceType },
                { label: "Supplier", val: getSupplierName(selectedInvoice.supplierId) },
                { label: "Address", val: selectedInvoice.address || "N/A" },
                { label: "Transport", val: selectedInvoice.transport },
                { label: "LR No.", val: selectedInvoice.lrNo },
                { label: "LR Date", val: formatDate(selectedInvoice.lrDate) },
                { label: "Vehicle No.", val: selectedInvoice.vehicleNo },
                { label: "Removal Time", val: selectedInvoice.removalTime },
                { label: "E-Bill No.", val: selectedInvoice.eBill || "—" },
                { label: "Status", val: selectedInvoice.approve ? "Approved" : "Pending" },
              ].map(({ label, val }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-gray-500">{label}</label>
                  <p className="text-sm font-medium text-gray-800">{val}</p>
                </div>
              ))}
            </div>

            {/* Invoice values */}
            <div className="border-t pt-4 mb-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Invoice Values</h3>
              <div className="grid grid-cols-4 gap-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                {[
                  { label: "Assessable Value", key: "assessableValue", cls: "text-blue-700 font-semibold" },
                  { label: "Charity", key: "charity" },
                  { label: "VAT Tax", key: "vatTax" },
                  { label: "Cenvat", key: "cenvat" },
                  { label: "Duty", key: "duty" },
                  { label: "Cess", key: "cess" },
                  { label: "H.S. Cess", key: "hsCess" },
                  { label: "TCS", key: "tcs" },
                  { label: "PF / Other Charges", key: "pfCharges" },
                  { label: "CGST Amt (2.5%)", key: "cgstAmt", isCalculated: true },
                  { label: "SGST Amt (2.5%)", key: "sgstAmt", isCalculated: true },
                  { label: "Sub Total", key: "subTotal", cls: "font-semibold" },
                  { label: "Round Off", key: "roundOff" },
                  { label: "Invoice Value", key: "invoiceValue", cls: "text-green-700 font-bold text-base" },
                  { label: "GST", key: "gst" },
                  { label: "IGST", key: "igst" },
                ].map(({ label, key, cls, isCalculated }) => {
                  let displayValue = selectedInvoice[key];
                  if (isCalculated) {
                    const assVal = parseFloat(selectedInvoice.assessableValue) || 0;
                    displayValue = assVal * 0.025;
                  }
                  return (
                    <div key={key}>
                      <label className="text-xs font-medium text-gray-500">{label}</label>
                      <p className={`text-sm ${cls || "text-gray-800"}`}>₹{formatNumber(displayValue)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bale table */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                Bale Details ({selectedInvoice.details?.length || 0} bales)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Waste Name", "Lot No", "Bale No", "Gross Wt", "Tare Wt", "Net Wt"].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedInvoice.details?.map((bale, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{bale.wasteName}</td>
                        <td className="px-4 py-2">{bale.lotNo}</td>
                        <td className="px-4 py-2">{bale.baleNo}</td>
                        <td className="px-4 py-2">{formatNumber(bale.grossWt, 3)}</td>
                        <td className="px-4 py-2">{formatNumber(bale.tareWt, 3)}</td>
                        <td className="px-4 py-2 font-medium">{formatNumber(bale.netWt, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JSON Preview Modal ─────────────────────────────────────────────────── */}
      {showJsonPreviewModal && jsonPreviewData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-xl rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">e-Invoice JSON</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Invoice No: {jsonPreviewData.invoice.invoiceNo} — ready for GST portal upload
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(jsonPreviewData.json, null, 2));
                    toast.success("JSON copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleDownloadJson(jsonPreviewData.invoice)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium"
                >
                  ↓ Download
                </button>
                <button
                  onClick={() => { setShowJsonPreviewModal(false); setJsonPreviewData(null); }}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {(() => {
              const j = jsonPreviewData.json[0];
              const Section = ({ title, color, children }) => (
                <div className={`mb-4 border rounded-lg overflow-hidden border-${color}-200`}>
                  <div className={`px-4 py-2 text-xs font-semibold bg-${color}-50 text-${color}-700 border-b border-${color}-200`}>
                    {title}
                  </div>
                  <div className="px-4 py-3 bg-white">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">{children}</div>
                  </div>
                </div>
              );
              const Row = ({ label, value }) => (
                <div>
                  <span className="text-xs text-gray-500">{label}</span>
                  <p className="text-xs font-mono font-medium text-gray-800 truncate">
                    {value === null ? <span className="text-gray-300 italic">null</span> : String(value)}
                  </p>
                </div>
              );

              return (
                <>
                  <Section title="Version & Transaction Details (TranDtls)" color="gray">
                    <Row label="Version" value={j.Version} />
                    <Row label="TaxSch" value={j.TranDtls.TaxSch} />
                    <Row label="SupTyp" value={j.TranDtls.SupTyp} />
                    <Row label="IgstOnIntra" value={j.TranDtls.IgstOnIntra} />
                    <Row label="RegRev" value={j.TranDtls.RegRev} />
                    <Row label="EcmGstin" value={j.TranDtls.EcmGstin} />
                  </Section>

                  <Section title="Document Details (DocDtls)" color="blue">
                    <Row label="Typ" value={j.DocDtls.Typ} />
                    <Row label="No" value={j.DocDtls.No} />
                    <Row label="Dt" value={j.DocDtls.Dt} />
                  </Section>

                  <Section title="Seller Details (SellerDtls) — Fixed" color="teal">
                    {Object.entries(j.SellerDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  <Section title="Buyer Details (BuyerDtls)" color="purple">
                    {Object.entries(j.BuyerDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  <Section title="Value Details (ValDtls)" color="amber">
                    {Object.entries(j.ValDtls).map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  <Section title="Item List (Itemlist[0]) — Grouped" color="green">
                    {Object.entries(j.Itemlist[0])
                      .filter(([k]) => k !== "BchDtls")
                      .map(([k, v]) => <Row key={k} label={k} value={v} />)}
                  </Section>

                  <div className="mb-4">
                    <div className="px-4 py-2 text-xs font-semibold bg-gray-800 text-gray-200 rounded-t-lg">
                      Raw JSON
                    </div>
                    <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-b-lg overflow-x-auto max-h-64 font-mono">
                      {JSON.stringify(jsonPreviewData.json, null, 2)}
                    </pre>
                  </div>
                </>
              );
            })()}

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => { setShowJsonPreviewModal(false); setJsonPreviewData(null); }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Invoice</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete invoice <strong>{invoiceToDelete.invoiceNo}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => { setShowDeleteModal(false); setInvoiceToDelete(null); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(invoiceToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteCottonInvoicePage;