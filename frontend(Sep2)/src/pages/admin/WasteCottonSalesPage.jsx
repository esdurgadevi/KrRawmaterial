// frontend/src/pages/admin/WasteCottonSalesPage.jsx
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import salesOrderService from "../../services/admin1/transaction-waste/salesOrderService";
import packingTypeService from "../../services/admin1/master/packingTypeService";
import wasteMasterService from "../../services/admin1/master/wasteMasterService";
import supplierService from "../../services/admin1/master/supplierService";
import wastePackingService from "../../services/admin1/transaction-waste/wastePackingService";

// Helper function to format numbers
const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "0.00";
  return num.toFixed(decimals);
};

// Helper function to calculate value
const calculateValue = (totalWt, rate, ratePer) => {
  const wt = parseFloat(totalWt) || 0;
  const r = parseFloat(rate) || 0;
  const per = parseFloat(ratePer) || 1;
  return (wt * r) / per;
};

const WasteCottonSalesPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Master data states
  const [packingTypes, setPackingTypes] = useState([]);
  const [wasteProducts, setWasteProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [wastePackings, setWastePackings] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    orderNo: "",
    date: new Date().toISOString().split("T")[0],
    supplierId: "",
    broker: "",
    broker1: "",
    payTerms: "",
    payMode: "CASH",
    creditDays: 0,
    bank: "",
    despatchTo: "",
    details: [{
      product: "",
      packingId: "",
      qty: 0,
      totalWt: 0,
      rate: 0,
      ratePer: "1",
      value: 0
    }]
  });

  useEffect(() => {
    fetchMasterData();
    fetchSalesOrders();
  }, []);

  // Fetch next order number when create modal is opened
  useEffect(() => {
    if (showCreateModal && !selectedOrder) {
      const fetchNextOrderNo = async () => {
        try {
          const nextOrderNo = await salesOrderService.getNextSalesOrderNo();
          setFormData(prev => ({
            ...prev,
            orderNo: nextOrderNo
          }));
        } catch (error) {
          console.error("Error fetching next order no:", error);
          toast.error("Failed to fetch next order number");
        }
      };
      fetchNextOrderNo();
    }
  }, [showCreateModal]);

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const salesHeadSheetName = wb.SheetNames.find(n => n === "WC Sales Head");
        const salesDetailSheetName = wb.SheetNames.find(n => n === "WC Sales order details");
        const invDetailSheetName = wb.SheetNames.find(n => n === "Detail");
        const packingDetailSheetName = wb.SheetNames.find(n => n === "waste packing details");

        if (!salesHeadSheetName || !salesDetailSheetName || !invDetailSheetName || !packingDetailSheetName) {
          toast.error("Invalid Excel file: Must contain 'WC Sales Head', 'WC Sales order details', 'Detail', and 'waste packing details' sheets.");
          return;
        }

        const headers = XLSX.utils.sheet_to_json(wb.Sheets[salesHeadSheetName]);
        const details = XLSX.utils.sheet_to_json(wb.Sheets[salesDetailSheetName]);
        const invoiceDetails = XLSX.utils.sheet_to_json(wb.Sheets[invDetailSheetName]);
        const packingDetails = XLSX.utils.sheet_to_json(wb.Sheets[packingDetailSheetName]);

        if (headers.length === 0 || details.length === 0 || invoiceDetails.length === 0 || packingDetails.length === 0) {
          toast.error("Empty sheets found.");
          return;
        }

        setLoading(true);
        const res = await salesOrderService.bulkImport({ headers, details, invoiceDetails, packingDetails });
        toast.success(`Successfully imported ${res.importedCount} sales orders!`);
        fetchSalesOrders();
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

  const fetchMasterData = async () => {
    try {
      setLoadingMasters(true);

      // Fetch packing types
      const packingData = await packingTypeService.getAll();
      setPackingTypes(Array.isArray(packingData) ? packingData : []);

      // Fetch waste products from waste master service
      const wasteData = await wasteMasterService.getAll();
      console.log("Waste Products:", wasteData);
      setWasteProducts(Array.isArray(wasteData) ? wasteData : []);

      // Fetch suppliers
      const suppliersData = await supplierService.getAll();
      console.log("Suppliers:", suppliersData);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);

      // Fetch waste packings
      const packingsData = await wastePackingService.getAll();
      console.log("Waste Packings:", packingsData);
      setWastePackings(Array.isArray(packingsData) ? packingsData : []);

    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to fetch master data");
    } finally {
      setLoadingMasters(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const data = await salesOrderService.getAll();
      console.log("Sales Orders:", data);
      const processedData = Array.isArray(data) ? data.map(order => ({
        ...order,
        creditDays: order.creditDays !== undefined && order.creditDays !== null
          ? parseInt(order.creditDays)
          : 0,
        details: Array.isArray(order.details) ? order.details.map(detail => ({
          ...detail,
          qty: parseInt(detail.qty) || 0,
          totalWt: parseFloat(detail.totalWt) || 0,
          rate: parseFloat(detail.rate) || 0,
          value: parseFloat(detail.value) || 0
        })) : []
      })) : [];
      setSalesOrders(processedData);
    } catch (error) {
      toast.error("Failed to fetch sales orders");
      console.error("Error fetching sales orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Handle creditDays as number but allow empty string temporarily
    if (name === "creditDays") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];

    // Handle numeric fields
    if (["qty", "totalWt", "rate"].includes(field)) {
      updatedDetails[index][field] = value === "" ? "" : parseFloat(value) || 0;
    } else {
      updatedDetails[index][field] = value;
    }

    // Auto-calculate value when totalWt, rate, or ratePer changes
    if (field === "totalWt" || field === "rate" || field === "ratePer") {
      const totalWt = parseFloat(updatedDetails[index].totalWt) || 0;
      const rate = parseFloat(updatedDetails[index].rate) || 0;
      const ratePer = parseFloat(updatedDetails[index].ratePer) || 1;
      updatedDetails[index].value = (totalWt * rate) / ratePer;
    }

    setFormData(prev => ({
      ...prev,
      details: updatedDetails
    }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          product: "",
          packingId: "",
          qty: 0,
          totalWt: 0,
          rate: 0,
          ratePer: "1",
          value: 0
        }
      ]
    }));
  };

  const handleDetailPackingChange = (index, packingId) => {
    const updatedDetails = [...formData.details];
    if (!packingId) {
      updatedDetails[index] = {
        ...updatedDetails[index],
        packingId: "",
        product: "",
        qty: 0,
        totalWt: 0,
        value: 0
      };
    } else {
      const selectedPacking = wastePackings.find(wp => String(wp.id) === String(packingId) || String(wp._id) === String(packingId));
      if (selectedPacking) {
        updatedDetails[index] = {
          ...updatedDetails[index],
          packingId: selectedPacking.id || selectedPacking._id,
          product: selectedPacking.wasteType,
          qty: selectedPacking.totalBales || selectedPacking.noOfBales || 0,
          totalWt: parseFloat(selectedPacking.totalWeight) || 0,
        };
        // Auto-calculate value
        const totalWt = parseFloat(selectedPacking.totalWeight) || 0;
        const rate = parseFloat(updatedDetails[index].rate) || 0;
        const ratePer = parseFloat(updatedDetails[index].ratePer) || 1;
        updatedDetails[index].value = (totalWt * rate) / ratePer;
      }
    }
    setFormData(prev => ({
      ...prev,
      details: updatedDetails
    }));
  };

  const removeDetailRow = (index) => {
    if (formData.details.length > 1) {
      const updatedDetails = [...formData.details];
      updatedDetails.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        details: updatedDetails
      }));
    }
  };

  const validateForm = () => {
    if (!formData.orderNo?.trim()) {
      toast.error("Order No. is required");
      return false;
    }
    if (!formData.date) {
      toast.error("Date is required");
      return false;
    }
    if (!formData.supplierId) {
      toast.error("Supplier is required");
      return false;
    }

    // Ensure creditDays is a number (convert empty string to 0)
    if (formData.creditDays === "") {
      setFormData(prev => ({ ...prev, creditDays: 0 }));
    }

    if (formData.details.length === 0) {
      toast.error("At least one product detail is required");
      return false;
    }

    // Validate each detail row
    for (let i = 0; i < formData.details.length; i++) {
      const detail = formData.details[i];
      if (!detail.product) {
        toast.error(`Product is required for row ${i + 1}`);
        return false;
      }
      if (!detail.packingId) {
        toast.error(`Packing Lot is required for row ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = {
      orderNo: formData.orderNo,
      date: formData.date,
      supplierId: formData.supplierId, // This will be the ID string
      broker: formData.broker,
      broker1: formData.broker1,
      payTerms: formData.payTerms,
      payMode: formData.payMode,
      creditDays: formData.creditDays === "" ? 0 : parseInt(formData.creditDays) || 0,
      bank: formData.bank,
      despatchTo: formData.despatchTo,
      details: formData.details.map(detail => ({
        product: detail.product,
        packingId: detail.packingId,
        qty: parseInt(detail.qty) || 0,
        totalWt: parseFloat(detail.totalWt) || 0,
        rate: parseFloat(detail.rate) || 0,
        ratePer: detail.ratePer,
        value: parseFloat(detail.value) || 0
      }))
    };

    console.log("Submitting create data:", submitData);

    if (!validateForm()) return;

    try {
      await salesOrderService.create(submitData);
      toast.success("Sales order created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchSalesOrders();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error.response?.data?.message || "Failed to create sales order");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = {
      orderNo: formData.orderNo,
      date: formData.date,
      supplierId: formData.supplierId, // This will be the ID string
      broker: formData.broker,
      broker1: formData.broker1,
      payTerms: formData.payTerms,
      payMode: formData.payMode,
      creditDays: formData.creditDays === "" ? 0 : parseInt(formData.creditDays) || 0,
      bank: formData.bank,
      despatchTo: formData.despatchTo,
      details: formData.details.map(detail => ({
        product: detail.product,
        packingId: detail.packingId,
        qty: parseInt(detail.qty) || 0,
        totalWt: parseFloat(detail.totalWt) || 0,
        rate: parseFloat(detail.rate) || 0,
        ratePer: detail.ratePer,
        value: parseFloat(detail.value) || 0
      }))
    };

    console.log("Submitting update data:", submitData);

    if (!validateForm() || !selectedOrder) return;

    try {
      await salesOrderService.update(selectedOrder._id || selectedOrder.id, submitData);
      toast.success("Sales order updated successfully!");
      setShowEditModal(false);
      resetForm();
      fetchSalesOrders();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update sales order");
    }
  };

  const handleDelete = async (id) => {
    try {
      await salesOrderService.delete(id);
      toast.success("Sales order deleted successfully!");
      setShowDeleteModal(false);
      setOrderToDelete(null);
      fetchSalesOrders();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete sales order");
    }
  };

  const resetForm = () => {
    setFormData({
      orderNo: "",
      date: new Date().toISOString().split("T")[0],
      supplierId: "",
      broker: "",
      broker1: "",
      payTerms: "",
      payMode: "CASH",
      creditDays: 0,
      bank: "",
      despatchTo: "",
      details: [{
        product: "",
        packingId: "",
        qty: 0,
        totalWt: 0,
        rate: 0,
        ratePer: "1",
        value: 0
      }]
    });
    setSelectedOrder(null);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEdit = (order) => {
    console.log("Editing order:", order);
    setSelectedOrder(order);
    setFormData({
      orderNo: order.orderNo || "",
      date: order.date ? order.date.split('T')[0] : new Date().toISOString().split("T")[0],
      supplierId: order.supplierId || "", // This should be the ID
      broker: order.broker || "",
      broker1: order.broker1 || "",
      payTerms: order.payTerms || "",
      payMode: order.payMode || "CASH",
      creditDays: order.creditDays !== undefined && order.creditDays !== null ? order.creditDays : 0,
      bank: order.bank || "",
      despatchTo: order.despatchTo || "",
      details: order.details && order.details.length > 0 ? order.details.map(d => ({
        product: d.product || "",
        packingId: d.packingId || "",
        qty: d.qty || 0,
        totalWt: d.totalWt || 0,
        rate: d.rate || 0,
        ratePer: d.ratePer || "1",
        value: d.value || 0
      })) : [{
        product: "",
        packingId: "",
        qty: 0,
        totalWt: 0,
        rate: 0,
        ratePer: "1",
        value: 0
      }]
    });
    setShowEditModal(true);
  };

  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const totalValue = formData.details.reduce((sum, detail) => {
    const value = parseFloat(detail.value);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Get packing type name by ID
  const getPackingTypeName = (packingTypeId) => {
    if (!packingTypeId) return '';
    const packingType = packingTypes.find(pt => pt._id === packingTypeId || pt.code === packingTypeId);
    return packingType ? packingType.name : packingTypeId;
  };

  // Get product name by ID
  const getProductName = (productId) => {
    if (!productId) return '';
    const product = wasteProducts.find(p => p._id === productId || p.code === productId);
    return product ? product.waste : productId;
  };

  // Get supplier name by ID
  const getSupplierName = (supplierId) => {
    if (!supplierId) return 'N/A';
    const supplier = suppliers.find(s => s._id === supplierId || s.id === supplierId);
    return supplier ? supplier.accountName : supplierId;
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredOrders = salesOrders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    const orderNo = (order.orderNo || '').toLowerCase();
    const party = (getSupplierName(order.supplierId) || '').toLowerCase();
    const despatchTo = (order.despatchTo || '').toLowerCase();
    return orderNo.includes(s) || party.includes(s) || despatchTo.includes(s);
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Cotton Sales</h1>
        <p className="text-gray-600 mt-2">To Add, Modify Order Confirmation details.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          {/* <div>
            <h2 className="text-xl font-semibold text-gray-800">Sales Orders</h2>
            <p className="text-gray-600 text-sm">Manage waste cotton sales orders</p>
          </div> */}
          <div className="flex gap-20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by order no, party..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
            </div>
            {/* <button
              onClick={fetchSalesOrders}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button> */}
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
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
               onClick={() => setShowCreateModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
               disabled={loadingMasters}
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
               {loadingMasters ? 'Loading...' : 'Create Order'}
            </button>
          </div>
        </div>

        {/* Sales Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales orders</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new sales order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-left divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 whitespace-nowrap">
                    Order Details
                  </th>
                  <th className="px-3 py-2.5 whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-3 py-2.5">
                    Party
                  </th>
                  <th className="px-3 py-2.5 whitespace-nowrap">
                    Items
                  </th>
                  <th className="px-3 py-2.5 whitespace-nowrap">
                    Total Value
                  </th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-gray-900">
                          Order No: {order.orderNo}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          Mode: {order.payMode || 'N/A'}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          Credit: {order.creditDays || 0} days
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">
                      {order.date ? new Date(order.date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs font-medium text-gray-900 max-w-[160px] truncate" title={getSupplierName(order.supplierId)}>
                        {getSupplierName(order.supplierId)}
                      </div>
                      <div className="text-[11px] text-gray-500 max-w-[160px] truncate" title={order.despatchTo || 'N/A'}>
                        {order.despatchTo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">
                      {(order.details || []).length} item(s)
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-blue-600">
                      ₹{formatNumber((order.details || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0))}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleView(order)}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[11px] font-medium"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-[11px] font-medium"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(order)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-[11px] font-medium"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary & Pagination Footer */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} sales orders
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >«</button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                      ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400">…</span>
                      : <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1 text-sm rounded border ${currentPage === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                      >{p}</button>
                  )
                }
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >Next ›</button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >»</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create Waste Cotton Sales Order</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* Header Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order No. *
                    </label>
                    <input
                      type="text"
                      name="orderNo"
                      value={formData.orderNo}
                      onChange={handleFormChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                          {supplier.accountName} - {supplier.place}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent / Broker
                    </label>
                    <input
                      type="text"
                      name="broker"
                      value={formData.broker}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DIRECT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent / Broker 2
                    </label>
                    <input
                      type="text"
                      name="broker1"
                      value={formData.broker1}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="DIRECT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Terms
                    </label>
                    <input
                      type="text"
                      name="payTerms"
                      value={formData.payTerms}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Mode
                    </label>
                    <select
                      name="payMode"
                      value={formData.payMode}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">CASH</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="ONLINE">ONLINE</option>
                      <option value="CREDIT">CREDIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Days
                    </label>
                    <input
                      type="number"
                      name="creditDays"
                      value={formData.creditDays}
                      onChange={handleFormChange}
                      onWheel={(e) => e.target.blur()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank
                    </label>
                    <input
                      type="text"
                      name="bank"
                      value={formData.bank}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="IOB K.R.NAGAR A/C NO.603"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Despatch To
                    </label>
                    <input
                      type="text"
                      name="despatchTo"
                      value={formData.despatchTo}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="KRISHNANKOVIL"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-700">Product Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Packing Lot *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Wt.</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate Per</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.details.map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={detail.packingId || ""}
                              onChange={(e) => handleDetailPackingChange(index, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm animate-none"
                              required
                            >
                              <option value="">Select Packing Lot</option>
                              {wastePackings.map((packing) => (
                                <option key={packing.id || packing._id} value={packing.id || packing._id}>
                                  Lot: {packing.lotNo} ({packing.wasteType})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={detail.product || ""}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                              placeholder="Auto-populated"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.qty || 0}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.totalWt || 0}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed animate-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.rate}
                              onChange={(e) => handleDetailChange(index, "rate", e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              step="0.01"
                              min="0"
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={detail.ratePer}
                              onChange={(e) => handleDetailChange(index, "ratePer", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="1">1</option>
                              <option value="100">100</option>
                              <option value="1000">1000</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            ₹{formatNumber(detail.value)}
                          </td>
                          <td className="px-3 py-2">
                            {formData.details.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDetailRow(index)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td colSpan="6" className="px-3 py-2 text-sm text-gray-900 text-right">Total Value:</td>
                        <td className="px-3 py-2 text-sm text-gray-900">₹{formatNumber(totalValue)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loadingMasters}
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Waste Cotton Sales Order Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Header Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order No.</label>
                  <p className="text-lg font-semibold">{selectedOrder.orderNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg">{selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString('en-IN') : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="text-lg">{getSupplierName(selectedOrder.supplierId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Agent / Broker</label>
                  <p className="text-lg">{selectedOrder.broker || 'DIRECT'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Agent / Broker 2</label>
                  <p className="text-lg">{selectedOrder.broker1 || 'DIRECT'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pay Terms</label>
                  <p className="text-lg">{selectedOrder.payTerms || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Pay Mode</label>
                  <p className="text-lg">{selectedOrder.payMode || 'CASH'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credit Days</label>
                  <p className="text-lg">{selectedOrder.creditDays || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank</label>
                  <p className="text-lg">{selectedOrder.bank || 'IOB K.R.NAGAR A/C NO.603'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Despatch To</label>
                  <p className="text-lg">{selectedOrder.despatchTo || 'KRISHNANKOVIL'}</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Product Details</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packing / Lot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Wt.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate Per</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedOrder.details || []).map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {detail.product}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {detail.packing?.packingType || detail.packingType || "N/A"} {detail.packing?.lotNo ? `(Lot: ${detail.packing.lotNo})` : ""}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{detail.qty}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.totalWt, 3)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.rate)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{detail.ratePer}</td>
                        <td className="px-6 py-3 text-sm font-medium text-blue-600">₹{formatNumber(detail.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="6" className="px-6 py-3 text-sm text-gray-900 text-right">Total Value:</td>
                      <td className="px-6 py-3 text-sm text-gray-900">₹{formatNumber((selectedOrder.details || []).reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Sales Order</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              {/* Order Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order No. *
                    </label>
                    <input
                      type="text"
                      name="orderNo"
                      value={formData.orderNo}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>
                          {supplier.accountName} - {supplier.place}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent / Broker
                    </label>
                    <input
                      type="text"
                      name="broker"
                      value={formData.broker}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent / Broker 2
                    </label>
                    <input
                      type="text"
                      name="broker1"
                      value={formData.broker1}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Terms
                    </label>
                    <input
                      type="text"
                      name="payTerms"
                      value={formData.payTerms}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pay Mode
                    </label>
                    <select
                      name="payMode"
                      value={formData.payMode}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">CASH</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="ONLINE">ONLINE</option>
                      <option value="CREDIT">CREDIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Days
                    </label>
                    <input
                      type="number"
                      name="creditDays"
                      value={formData.creditDays}
                      onChange={handleFormChange}
                      onWheel={(e) => e.target.blur()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank
                    </label>
                    <input
                      type="text"
                      name="bank"
                      value={formData.bank}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Despatch To
                    </label>
                    <input
                      type="text"
                      name="despatchTo"
                      value={formData.despatchTo}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details for Edit */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-700">Product Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Packing Lot *</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Wt.</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate Per</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.details.map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={detail.packingId || ""}
                              onChange={(e) => handleDetailPackingChange(index, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm animate-none"
                              required
                            >
                              <option value="">Select Packing Lot</option>
                              {wastePackings.map((packing) => (
                                <option key={packing.id || packing._id} value={packing.id || packing._id}>
                                  Lot: {packing.lotNo} ({packing.wasteType})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={detail.product || ""}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                              placeholder="Auto-populated"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.qty || 0}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.totalWt || 0}
                              readOnly
                              disabled
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed animate-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={detail.rate}
                              onChange={(e) => handleDetailChange(index, "rate", e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              step="0.01"
                              min="0"
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={detail.ratePer}
                              onChange={(e) => handleDetailChange(index, "ratePer", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="1">1</option>
                              <option value="100">100</option>
                              <option value="1000">1000</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            ₹{formatNumber(detail.value)}
                          </td>
                          <td className="px-3 py-2">
                            {formData.details.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDetailRow(index)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td colSpan="6" className="px-3 py-2 text-sm text-gray-900 text-right">Total Value:</td>
                        <td className="px-3 py-2 text-sm text-gray-900">₹{formatNumber(totalValue)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loadingMasters}
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Sales Order</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete this sales order?
                </p>
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Order No: {orderToDelete.orderNo} - {getSupplierName(orderToDelete.supplierId)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(orderToDelete.id || orderToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

export default WasteCottonSalesPage;
