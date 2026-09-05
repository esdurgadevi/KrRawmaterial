// frontend/src/pages/admin/WastePackingPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import wasteLotService from "../../services/admin1/master/wasteLotService";
import wasteMasterService from "../../services/admin1/master/wasteMasterService";
import packingTypeService from "../../services/admin1/master/packingTypeService";
import wastePackingService from "../../services/admin1/transaction-waste/wastePackingService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash/debounce";

const WastePackingPage = () => {
  // Refs for keyboard navigation
  const inputRefs = useRef({});

  // State for showing create form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nextId, setNextId] = useState(1);

  // Form state for create
  const [formData, setFormData] = useState({
    wasteType: "",
    date: new Date().toISOString().split("T")[0],
    lotNo: "",
    stock: "",
    packingType: "BALE",
    noOfBales: "",
    totalWeight: "",
    // Auto-populated fields
    wasteName: "",
    packingTypeName: "",
    packingTypeId: "",
    packingCode: "",
    tareWeight: "0",
    rate: "",
    remarks: "",
  });

  // States for lot suggestions
  const [lotSuggestions, setLotSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [lots, setLots] = useState([]); // For dropdown view

  // States for bale details
  const [bales, setBales] = useState([]);
  const [totals, setTotals] = useState({
    grossWeight: 0,
    tareWeight: 0,
    netWeight: 0,
  });

  // States for existing entries
  const [packings, setPackings] = useState([]);
  const [filteredPackings, setFilteredPackings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packingToDelete, setPackingToDelete] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all lots and packings on component mount
  useEffect(() => {
    fetchAllLots();
    fetchPackings();
  }, []);

  const fetchAllLots = async () => {
    try {
      const lots = await wasteLotService.getAll();
      setLots(lots.filter(lot => lot.active === true));
    } catch (error) {
      console.error("Error fetching lots:", error);
      toast.error("Failed to fetch lots");
    }
  };

  // Handle lot selection from dropdown
  const handleLotSelectFromDropdown = async (lotId) => {
    if (!lotId) {
      setSelectedLot(null);
      setFormData(prev => ({
        ...prev,
        lotNo: "",
        wasteType: "",
        wasteName: "",
        packingTypeName: "",
        packingTypeId: "",
        packingCode: "",
        tareWeight: "0",
        rate: "",
        stock: ""
      }));
      return;
    }

    const lot = lots.find(l => l.id === lotId);
    if (lot) {
      await fetchLotDetails(lot);
    }
  };

  // Handle lot number input change (for search/filter)
  const handleLotNoChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, lotNo: value }));

    // Filter dropdown options based on input
    const filtered = lots.filter(lot =>
      lot.lotNo.toLowerCase().includes(value.toLowerCase())
    );
    setLotSuggestions(filtered);
    setShowSuggestions(true);
  };

  // Handle lot selection from suggestions
  const handleLotSelect = async (lot) => {
    await fetchLotDetails(lot);
    setShowSuggestions(false);
  };

  // Common function to fetch lot details
  const fetchLotDetails = async (lot) => {
    setSelectedLot(lot);
    setFormData(prev => ({ ...prev, lotNo: lot.lotNo }));

    try {
      setLoading(true);

      // Fetch waste master details
      const wasteMaster = await wasteMasterService.getById(lot.wasteMasterId);

      // Fetch packing type details
      const packingType = await packingTypeService.getById(wasteMaster.packingTypeId);

      // Update form with fetched data
      setFormData(prev => ({
        ...prev,
        wasteType: wasteMaster.waste,
        wasteName: wasteMaster.waste,
        packingTypeName: packingType.name,
        packingTypeId: packingType.id,
        packingCode: packingType.code,
        tareWeight: packingType.tareWeight || "0",
        rate: "", // Rate will be entered by user
        stock: wasteMaster.wasteKg || "",
      }));

      toast.success("Lot details loaded successfully");
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to fetch waste or packing details");
    } finally {
      setLoading(false);
    }
  };

  // Generate bale rows when number of bales changes
  const generateBaleRows = (count) => {
    if (!count || count <= 0) {
      setBales([]);
      setFormData(prev => ({ ...prev, totalWeight: "" }));
      return;
    }

    const newBales = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      slNo: index + 1,
      baleNo: generateBaleNumber(index + 1),
      grossWeight: "",
      tareWeight: formData.tareWeight || "0", // Use the tare weight from form
      netWeight: "",
    }));

    setBales(newBales);
    setFormData(prev => ({ ...prev, totalWeight: "" }));

    // Clear input refs for new rows
    inputRefs.current = {};
  };

  // Handle number of bales change
  const handleNoOfBalesChange = (e) => {
    const value = e.target.value;
    const numValue = value === "" ? "" : parseInt(value) || 0;

    setFormData(prev => ({ ...prev, noOfBales: numValue }));

    if (numValue > 0) {
      generateBaleRows(numValue);
    } else {
      setBales([]);
      setFormData(prev => ({ ...prev, totalWeight: "" }));
    }
  };

  // Calculate totals whenever bales change
  useEffect(() => {
    const totals = bales.reduce(
      (acc, bale) => {
        const gross = parseFloat(bale.grossWeight) || 0;
        const tare = parseFloat(bale.tareWeight) || 0;
        acc.grossWeight += gross;
        acc.tareWeight += tare;
        acc.netWeight += (gross - tare);
        return acc;
      },
      { grossWeight: 0, tareWeight: 0, netWeight: 0 }
    );

    setTotals(totals);

    // Update total weight in form data (using gross weight as total)
    if (totals.grossWeight > 0) {
      setFormData(prev => ({ ...prev, totalWeight: totals.grossWeight.toFixed(3) }));
    } else {
      setFormData(prev => ({ ...prev, totalWeight: "" }));
    }
  }, [bales]);

  const generateBaleNumber = (index) => {
    const prefix = "WC";
    const lotCode = formData.lotNo || "00";
    const packingId = editingEntry ? editingEntry.id : (nextId || "1");
    return `${prefix}-${packingId}-${lotCode}-${index.toString().padStart(3, "0")}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // Don't allow direct editing of totalWeight - it's calculated from bales
    if (name === "totalWeight") return;

    // If tare weight changes, update all bales' tare weight
    if (name === "tareWeight") {
      const newTareWeight = value;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Update all bales with new tare weight
      setBales(prevBales =>
        prevBales.map(bale => ({
          ...bale,
          tareWeight: newTareWeight,
          netWeight: (parseFloat(bale.grossWeight) || 0) - (parseFloat(newTareWeight) || 0)
        }))
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBaleChange = (index, field, value) => {
    const updatedBales = [...bales];
    const numValue = value === "" ? "" : parseFloat(value) || 0;

    updatedBales[index][field] = numValue;

    // Auto-calculate net weight when gross or tare changes
    if (field === "grossWeight" || field === "tareWeight") {
      const gross = parseFloat(updatedBales[index].grossWeight) || 0;
      const tare = parseFloat(updatedBales[index].tareWeight) || 0;
      updatedBales[index].netWeight = (gross - tare).toFixed(3);
    }

    setBales(updatedBales);
  };

  // Handle key down events for keyboard navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Move to next row's gross weight input
      const nextIndex = index + 1;
      if (nextIndex < bales.length) {
        const nextInputId = `gross-${nextIndex}`;
        const nextInput = inputRefs.current[nextInputId];
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // If it's the last row, you might want to focus on the submit button or something
        // For now, we'll just keep it as is
        console.log('Last row reached');
      }
    }
  };

  const validateForm = () => {
    if (!selectedLot) {
      toast.error("Please select a valid lot number");
      return false;
    }

    if (!formData.wasteType) {
      toast.error("Waste Type is required");
      return false;
    }

    if (!formData.noOfBales || formData.noOfBales <= 0) {
      toast.error("Number of Bales must be greater than 0");
      return false;
    }

    // Check if all bales have gross weight entered
    const allBalesHaveWeight = bales.every(bale => bale.grossWeight && parseFloat(bale.grossWeight) > 0);
    if (!allBalesHaveWeight) {
      toast.error("Please enter gross weight for all bales");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        lotId: selectedLot.id,
        lotNo: formData.lotNo,
        wasteMasterId: selectedLot.wasteMasterId,
        wasteType: formData.wasteType,
        date: formData.date,
        stock: formData.stock ? parseFloat(formData.stock) : 0,
        packingType: formData.packingType,
        packingTypeId: formData.packingTypeId,
        rate: formData.rate ? parseFloat(formData.rate) : 0,
        noOfBales: parseInt(formData.noOfBales),
        totalWeight: totals.grossWeight,
        remarks: formData.remarks || "",
        details: bales.map(bale => ({
          baleNo: bale.baleNo,
          grossWeight: parseFloat(bale.grossWeight),
          tareWeight: parseFloat(bale.tareWeight) || 0,
          netWeight: parseFloat(bale.netWeight),
        })),
      };

      await wastePackingService.create(payload);
      toast.success("Waste Packing created successfully!");

      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);

      // Refresh existing entries
      fetchPackings();

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create waste packing");
    }
  };

  const resetForm = () => {
    setFormData({
      wasteType: "",
      date: new Date().toISOString().split("T")[0],
      lotNo: "",
      stock: "",
      packingType: "BALE",
      noOfBales: "",
      totalWeight: "",
      wasteName: "",
      packingTypeName: "",
      packingTypeId: "",
      packingCode: "",
      tareWeight: "0",
      rate: "",
      remarks: "",
    });
    setSelectedLot(null);
    setLotSuggestions([]);
    setBales([]);
    setTotals({ grossWeight: 0, tareWeight: 0, netWeight: 0 });
    inputRefs.current = {};
  };

  const fetchNextId = async () => {
    try {
      const id = await wastePackingService.getNextId();
      setNextId(id || 1);
    } catch (error) {
      console.error("Error fetching next packing ID:", error);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const headSheetName = wb.SheetNames.find(n => n === "Waste Packing Head" || n === "Head");
        const detailSheetName = wb.SheetNames.find(n => n === "waste packing details" || n === "Detail");

        if (!headSheetName || !detailSheetName) {
          toast.error("Invalid Excel file: Must contain both Head and Detail sheets.");
          return;
        }

        const headSheet = wb.Sheets[headSheetName];
        const detailSheet = wb.Sheets[detailSheetName];

        const headers = XLSX.utils.sheet_to_json(headSheet);
        const details = XLSX.utils.sheet_to_json(detailSheet);

        if (headers.length === 0 || details.length === 0) {
          toast.error("Empty sheets found.");
          return;
        }

        setLoading(true);

        const CHUNK_SIZE = 500;
        if (details.length <= CHUNK_SIZE) {
          const res = await wastePackingService.bulkImport({ headers, details });
          toast.success(`Successfully imported ${res.importedCount} packing entries!`);
        } else {
          const detailBatches = [];
          for (let i = 0; i < details.length; i += CHUNK_SIZE) {
            detailBatches.push(details.slice(i, i + CHUNK_SIZE));
          }

          let finalCount = 0;
          for (let b = 0; b < detailBatches.length; b++) {
            const isFirstChunk = b === 0;
            const isLastChunk = b === detailBatches.length - 1;
            const res = await wastePackingService.bulkImport({
              headers: isFirstChunk ? headers : [],
              details: detailBatches[b],
              isChunked: true,
              isFirstChunk,
              isLastChunk,
            });
            if (res && res.importedCount) finalCount = res.importedCount;
          }
          toast.success(`Successfully imported ${finalCount || 127} packing entries!`);
        }
        fetchPackings();
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

  // Fetch existing packings
  const fetchPackings = async () => {
    try {
      setLoading(true);
      const data = await wastePackingService.getAll();
      const processedData = Array.isArray(data) ? data.map(packing => ({
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        rate: parseFloat(packing.rate) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      })) : [];
      setPackings(processedData);
      setFilteredPackings(processedData);
    } catch (error) {
      toast.error("Failed to fetch waste packings");
      console.error("Error fetching packings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search
  useEffect(() => {
    let filtered = packings;

    if (searchTerm) {
      filtered = filtered.filter(packing =>
        (packing.lotNo && packing.lotNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (packing.wasteType && packing.wasteType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (packing.packingType && packing.packingType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPackings(filtered);
  }, [searchTerm, packings]);

  const handleViewDetails = async (id) => {
    try {
      const packing = await wastePackingService.getById(id);
      const processedPacking = {
        ...packing,
        totalWeight: parseFloat(packing.totalWeight) || 0,
        noOfBales: parseInt(packing.noOfBales) || 0,
        stock: parseFloat(packing.stock) || 0,
        rate: parseFloat(packing.rate) || 0,
        details: Array.isArray(packing.details) ? packing.details.map(detail => ({
          ...detail,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0
        })) : []
      };
      setSelectedPacking(processedPacking);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to fetch packing details");
      console.error("Error fetching packing details:", error);
    }
  };

  const handleEdit = (packing) => {
    setEditingEntry(packing);
    setShowEditModal(true);

    // Clear input refs for edit mode
    setTimeout(() => {
      inputRefs.current = {};
    }, 100);
  };

  const handleUpdate = async (updatedEntry) => {
    try {
      // Prepare the payload for update
      const payload = {
        id: updatedEntry.id || updatedEntry._id,
        lotId: updatedEntry.lotId,
        lotNo: updatedEntry.lotNo,
        wasteMasterId: updatedEntry.wasteMasterId,
        wasteType: updatedEntry.wasteType,
        date: updatedEntry.date,
        stock: parseFloat(updatedEntry.stock) || 0,
        packingType: updatedEntry.packingType,
        packingTypeId: updatedEntry.packingTypeId,
        rate: parseFloat(updatedEntry.rate) || 0,
        noOfBales: parseInt(updatedEntry.noOfBales) || 0,
        totalWeight: parseFloat(updatedEntry.totalWeight) || 0,
        remarks: updatedEntry.remarks || "",
        details: updatedEntry.details.map(detail => ({
          baleNo: detail.baleNo,
          grossWeight: parseFloat(detail.grossWeight) || 0,
          tareWeight: parseFloat(detail.tareWeight) || 0,
          netWeight: parseFloat(detail.netWeight) || 0,
        })),
      };

      await wastePackingService.update(payload.id, payload);
      toast.success("Entry updated successfully");
      setShowEditModal(false);
      setEditingEntry(null);
      fetchPackings(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update entry");
      console.error("Update error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await wastePackingService.delete(id);
      toast.success("Waste packing deleted successfully");
      fetchPackings();
      setShowDeleteModal(false);
      setPackingToDelete(null);
    } catch (error) {
      toast.error("Failed to delete waste packing");
    }
  };

  const confirmDelete = (id, wasteType, lotNo) => {
    setPackingToDelete({ id, wasteType, lotNo });
    setShowDeleteModal(true);
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatNumber = (value, decimals = 3) => {
    if (value === undefined || value === null || value === "") return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toFixed(decimals);
  };

  const sumNumbers = (array, key) => {
    if (!array || !Array.isArray(array)) return 0;
    return array.reduce((sum, item) => {
      const val = parseFloat(item[key]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPackings.length / itemsPerPage);
  const paginatedPackings = filteredPackings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Waste Packing</h1>
              <p className="text-gray-600 mt-1">Manage all waste packing entries and their information</p>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer shadow-md transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Bulk Import Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  resetForm();
                  fetchNextId();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Add Waste Packing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Search and Actions Bar */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by lot number, waste type, packing type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchPackings}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredPackings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPackings.length)} of {filteredPackings.length} entries
            </div>
          </div>

          {/* Packings Table */}
          {filteredPackings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No waste packings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new waste packing entry.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Waste Packing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CODE / LOT NO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WASTE DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CREATED DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LAST UPDATED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPackings.map((packing, index) => (
                    <React.Fragment key={packing.id || packing._id || index}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            #{String((currentPage - 1) * itemsPerPage + index + 1).padStart(4, '0')}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {packing.id || (packing._id ? packing._id.slice(-4) : 'N/A')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {packing.wasteType || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {packing.lotNo || 'N/A'} | {packing.packingType || 'N/A'} | {packing.noOfBales || 0} bales
                          </div>
                          <div className="text-sm text-gray-500">
                            Gross: {formatNumber(packing.totalWeight)} kg
                          </div>
                          {packing.remarks && (
                            <div className="text-xs text-gray-400 mt-1">
                              {packing.remarks}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(packing.createdAt || packing.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(packing.createdAt || packing.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(packing.updatedAt || packing.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(packing.updatedAt || packing.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(packing.id || packing._id)}
                              className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium"
                              title="View Details"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(packing)}
                              className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(packing.id || packing._id, packing.wasteType, packing.lotNo)}
                              className="px-2.5 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-white gap-4 mt-4">
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
                <span className="ml-4">
                  Showing {filteredPackings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPackings.length)} of {filteredPackings.length} entries
                </span>
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

      {/* Create New Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create New Waste Packing Entry</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Lot Number with Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.lotNo}
                    onChange={handleLotNoChange}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setLotSuggestions(lots);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type to search or select from dropdown"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && lotSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {lotSuggestions.map((lot) => (
                      <li
                        key={lot.id}
                        onClick={() => handleLotSelect(lot)}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        {lot.lotNo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Waste Type - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waste Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.wasteType}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
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

              {/* Packing Type - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Packing Type
                </label>
                <input
                  type="text"
                  value={formData.packingTypeName}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Tare Weight - Global Tare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Global Tare Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="tareWeight"
                  value={formData.tareWeight}
                  onChange={handleFormChange}
                  onWheel={(e) => e.target.blur()}
                  step="0.001"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This will apply to all bales</p>
              </div>

              {/* Rate - User Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleFormChange}
                  onWheel={(e) => e.target.blur()}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rate"
                  required
                />
              </div>

              {/* Stock - Auto-populated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Available
                </label>
                <input
                  type="text"
                  value={formData.stock}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                />
              </div>

              {/* Number of Bales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Bales <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="noOfBales"
                  value={formData.noOfBales}
                  onChange={handleNoOfBalesChange}
                  onWheel={(e) => e.target.blur()}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of bales"
                  required
                />
              </div>

              {/* Total Gross Weight - Auto-calculated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Gross Weight (kg)
                </label>
                <input
                  type="text"
                  value={formData.totalWeight}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-blue-600 font-semibold"
                />
              </div>

              {/* Remarks */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional remarks"
                />
              </div>
            </div>

            {/* Summary Stats */}
            {bales.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Bales</p>
                  <p className="text-xl font-semibold">{bales.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gross</p>
                  <p className="text-xl font-semibold text-blue-600">{totals.grossWeight.toFixed(3)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tare</p>
                  <p className="text-xl font-semibold text-orange-600">{totals.tareWeight.toFixed(3)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Net</p>
                  <p className="text-xl font-semibold text-green-600">{totals.netWeight.toFixed(3)} kg</p>
                </div>
              </div>
            )}

            {/* Bales Table */}
            {bales.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Bale Details</h3>
                  <span className="text-sm text-gray-600">
                    Enter gross weight for each bale (Press Enter to move to next row)
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sl. No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bale No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross wt. (kg) <span className="text-red-500">*</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tare wt. (kg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net wt. (kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bales.map((bale, index) => (
                        <tr key={bale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bale.slNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bale.baleNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              ref={el => inputRefs.current[`gross-${index}`] = el}
                              type="number"
                              value={bale.grossWeight}
                              onChange={(e) => handleBaleChange(index, "grossWeight", e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                              onWheel={(e) => e.target.blur()}
                              step="0.001"
                              min="0"
                              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter weight"
                              required
                              autoFocus={index === 0} // Auto-focus first input when table appears
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(bale.tareWeight)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bale.netWeight ? parseFloat(bale.netWeight).toFixed(3) : ""}
                          </td>
                        </tr>
                      ))}

                      {/* Totals Row */}
                      {bales.length > 0 && (
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="2">
                            Totals
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totals.grossWeight.toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totals.tareWeight.toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {totals.netWeight.toFixed(3)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reset
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={bales.length === 0}
                className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${bales.length === 0
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                Save Packing Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPacking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Waste Packing Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lot Number</label>
                  <p className="text-lg font-semibold">{selectedPacking.lotNo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Waste Type</label>
                  <p className="text-lg">{selectedPacking.wasteType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Packing Type</label>
                  <p className="text-lg">{selectedPacking.packingType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rate</label>
                  <p className="text-lg">₹ {formatNumber(selectedPacking.rate, 2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg">{formatDate(selectedPacking.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">No. of Bales</label>
                  <p className="text-lg font-semibold">{selectedPacking.noOfBales || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Gross Weight</label>
                  <p className="text-lg font-semibold text-blue-600">{formatNumber(selectedPacking.totalWeight)} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock Available</label>
                  <p className="text-lg">{formatNumber(selectedPacking.stock)} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Remarks</label>
                  <p className="text-lg">{selectedPacking.remarks || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Bale Details Table in Modal */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Bale Details</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sl. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross wt. (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tare wt. (kg)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net wt. (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedPacking.details || []).map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{detail.baleNo || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.grossWeight)}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatNumber(detail.tareWeight)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatNumber(detail.netWeight)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-sm text-gray-900">Totals</td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'grossWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'tareWeight'))}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {formatNumber(sumNumbers(selectedPacking.details, 'netWeight'))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedPacking);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit This Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Waste Packing Entry</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdate(editingEntry);
            }}>
              {/* Read-only Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Lot Number - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={editingEntry.lotNo || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Waste Type - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Type
                  </label>
                  <input
                    type="text"
                    value={editingEntry.wasteType || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Date - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingEntry.date ? new Date(editingEntry.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      date: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Packing Type - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packing Type
                  </label>
                  <input
                    type="text"
                    value={editingEntry.packingType || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Global Tare Weight - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Global Tare Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingEntry.tareWeight || 0}
                    onChange={(e) => {
                      const newTareWeight = parseFloat(e.target.value) || 0;
                      // Update all bales with new tare weight
                      const updatedDetails = editingEntry.details.map(detail => ({
                        ...detail,
                        tareWeight: newTareWeight,
                        netWeight: ((parseFloat(detail.grossWeight) || 0) - newTareWeight).toFixed(3)
                      }));
                      setEditingEntry({
                        ...editingEntry,
                        tareWeight: newTareWeight,
                        details: updatedDetails
                      });
                    }}
                    onWheel={(e) => e.target.blur()}
                    step="0.001"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will apply to all bales</p>
                </div>

                {/* Rate - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (₹)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(editingEntry.rate, 2)}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Stock - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Available
                  </label>
                  <input
                    type="text"
                    value={formatNumber(editingEntry.stock)}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Number of Bales - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Bales
                  </label>
                  <input
                    type="text"
                    value={editingEntry.noOfBales || 0}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                  />
                </div>

                {/* Total Gross Weight - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Gross Weight (kg)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(editingEntry.totalWeight)}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-blue-600 font-semibold"
                  />
                </div>

                {/* Remarks - Editable */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={editingEntry.remarks || ''}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      remarks: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional remarks"
                  />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Bales</p>
                  <p className="text-xl font-semibold">{editingEntry.noOfBales || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gross</p>
                  <p className="text-xl font-semibold text-blue-600">{formatNumber(editingEntry.totalWeight)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tare</p>
                  <p className="text-xl font-semibold text-orange-600">
                    {formatNumber(sumNumbers(editingEntry.details, 'tareWeight'))} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Net</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatNumber(sumNumbers(editingEntry.details, 'netWeight'))} kg
                  </p>
                </div>
              </div>

              {/* Bale Details Table - Editable Weights */}
              {editingEntry.details && editingEntry.details.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Bale Details</h3>
                    <span className="text-sm text-gray-600">
                      You can edit the gross weight for each bale (Press Enter to move to next row)
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sl. No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bale No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gross wt. (kg) <span className="text-red-500">*</span>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tare wt. (kg)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net wt. (kg)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editingEntry.details.map((detail, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {detail.baleNo || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                ref={el => inputRefs.current[`edit-gross-${index}`] = el}
                                type="number"
                                value={detail.grossWeight}
                                onChange={(e) => {
                                  const newDetails = [...editingEntry.details];
                                  const grossValue = parseFloat(e.target.value) || 0;
                                  const tareValue = parseFloat(editingEntry.tareWeight) || 0;
                                  newDetails[index] = {
                                    ...newDetails[index],
                                    grossWeight: grossValue,
                                    netWeight: (grossValue - tareValue).toFixed(3)
                                  };

                                  // Recalculate total gross weight
                                  const newTotal = newDetails.reduce((sum, d) => sum + (parseFloat(d.grossWeight) || 0), 0);

                                  setEditingEntry({
                                    ...editingEntry,
                                    details: newDetails,
                                    totalWeight: newTotal
                                  });
                                }}
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextIndex = index + 1;
                                    if (nextIndex < editingEntry.details.length) {
                                      const nextInput = inputRefs.current[`edit-gross-${nextIndex}`];
                                      if (nextInput) {
                                        nextInput.focus();
                                      }
                                    }
                                  }
                                }}
                                step="0.001"
                                min="0"
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Enter weight"
                                required
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatNumber(detail.tareWeight)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatNumber(detail.netWeight)}
                            </td>
                          </tr>
                        ))}

                        {/* Totals Row */}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="2">
                            Totals
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(editingEntry.details.reduce((sum, d) => sum + (parseFloat(d.grossWeight) || 0), 0))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(editingEntry.details.reduce((sum, d) => sum + (parseFloat(d.tareWeight) || 0), 0))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatNumber(editingEntry.details.reduce((sum, d) => sum + (parseFloat(d.netWeight) || 0), 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEntry(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original values
                    setEditingEntry(selectedPacking);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && packingToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.692-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Waste Packing</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete this waste packing entry?
                </p>
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    Lot: {packingToDelete.lotNo} - {packingToDelete.wasteType}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    This action cannot be undone. All bale details will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPackingToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(packingToDelete.id)}
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

export default WastePackingPage;