// frontend/src/pages/admin/LocationTransferPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import locationTransferService from '../../services/admin1/transaction-cotton/locationTransferService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import godownService from '../../services/admin1/master/godownService';
import transportService from '../../services/admin1/master/transportService';

const LocationTransferPage = () => {
  // State Management
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Master Data
  const [godowns, setGodowns] = useState([]);
  const [transports, setTransports] = useState([]);
  const [lots, setLots] = useState([]); // Summary lots from getAll

  // Form State - Header
  const [formData, setFormData] = useState({
    transferNo: '',
    transferDate: new Date().toISOString().split('T')[0],
    fromLocationId: '',
    toLocationId: '',
    transMode: 'ROAD',
    transportId: '',
    lorryNo: '',
    driverName: '',
    ownerMobile: '',
    driverMobile: '',
    itemName: 'Cotton Bale',
    qty: 0,
    kgs: 0,
    value: 0
  });

  // Multi-row lot selection state
  const [lotRows, setLotRows] = useState([]);

  // Search states for each row
  const [lotSearchRows, setLotSearchRows] = useState({});
  const [showLotDropdownRows, setShowLotDropdownRows] = useState({});
  const [loadingLotDetailsRows, setLoadingLotDetailsRows] = useState({});

  // Refs
  const lotRefs = useRef({});
  const modalRef = useRef(null);

  // Transport modes
  const transportModes = ['ROAD', 'RAIL', 'AIR', 'SEA'];

  // Fetch initial data
  useEffect(() => {
    fetchTransfers();
    fetchMasterData();
    fetchLots();
  }, []);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(lotRefs.current).forEach(key => {
        if (lotRefs.current[key] && !lotRefs.current[key].contains(event.target)) {
          setShowLotDropdownRows(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate totals whenever lot rows change
  useEffect(() => {
    updateTotals();
  }, [lotRows]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await locationTransferService.getAllLocationTransfers();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('Failed to fetch location transfers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [godownData, transportData] = await Promise.all([
        godownService.getAll(),
        transportService.getAll()
      ]);
      setGodowns(Array.isArray(godownData) ? godownData : []);
      setTransports(Array.isArray(transportData) ? transportData : []);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    }
  };

  const fetchLots = async () => {
    try {
      const data = await inwardLotService.getAll();
      setLots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  };

  // Fetch weightments for a lot using the service
  const fetchLotWeightments = async (lotId, rowId) => {
    try {
      setLoadingLotDetailsRows(prev => ({ ...prev, [rowId]: true }));

      // 1️⃣ Get lot details using lotId to get lot number
      const lotResponse = await inwardLotService.getById(lotId);

      const lotNo = lotResponse?.lotNo;

      if (!lotNo) {
        throw new Error("Lot number not found");
      }

      // 2️⃣ Call the NEW API format
      const weightments = await locationTransferService.getWeightmentsByLot(lotNo);

      // Ensure array
      const baleList = Array.isArray(weightments) ? weightments : [];

      // 3️⃣ Update row
      setLotRows(prev =>
        prev.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              weightments: baleList,
              availableQty: baleList.length,
              candyRate: 55600 // default value
            };
          }
          return row;
        })
      );

    } catch (error) {

      console.error("Failed to fetch weightments:", error);
      showNotification("Failed to load bale details", "error");

    } finally {

      setLoadingLotDetailsRows(prev => ({ ...prev, [rowId]: false }));

    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get godown name by id
  const getGodownName = (id) => {
    if (!id) return '-';
    const godown = godowns.find(g => g.id === id || g._id === id);
    return godown ? (godown.godownName || godown.name) : '-';
  };

  // Get godown id by name (for display)
  const getGodownIdByName = (name) => {
    if (!name) return null;
    const godown = godowns.find(g => (g.godownName || g.name) === name);
    return godown?.id || null;
  };

  // Get transport name by id
  const getTransportName = (id) => {
    if (!id) return '-';
    const transport = transports.find(t => t.id === id || t._id === id);
    return transport ? transport.transportName || transport.name : '-';
  };

  // Add new row
  const addNewRow = () => {
    const newRowId = Date.now().toString();
    setLotRows(prev => [...prev, {
      id: newRowId,
      lotId: null,
      lotNo: '',
      supplier: '',
      availableQty: 0,
      transferQty: 0,
      weightments: [],
      selectedBales: new Set(),
      candyRate: 55600
    }]);
  };

  // Remove row
  const removeRow = (rowId) => {
    setLotRows(prev => prev.filter(row => row.id !== rowId));
    // Clean up search states
    setLotSearchRows(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
    setShowLotDropdownRows(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
    setLoadingLotDetailsRows(prev => {
      const newState = { ...prev };
      delete newState[rowId];
      return newState;
    });
  };

  // Handle lot selection for a specific row
  const handleLotSelect = async (lot, rowId) => {
    // Get the correct database ID
    const databaseId = lot.id || lot._id;

    // Update the row with basic lot info
    setLotRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          lotId: databaseId, // This is the database ID
          lotNo: lot.lotNo,   // This is the display lot number
          supplier: lot.supplier || ''
        };
      }
      return row;
    }));

    // Update search input for this row
    setLotSearchRows(prev => ({
      ...prev,
      [rowId]: `${lot.lotNo} - ${lot.supplier || ''}`
    }));

    setShowLotDropdownRows(prev => ({ ...prev, [rowId]: false }));

    // Fetch weightments using the database ID
    await fetchLotWeightments(databaseId, rowId);
  };

  // Filter lots based on search for a specific row
  const getFilteredLots = (searchTerm, rowId) => {
    if (!searchTerm) return lots;

    // Get already selected lot IDs to exclude them
    const selectedLotIds = lotRows
      .filter(row => row.id !== rowId && row.lotId)
      .map(row => row.lotId);

    return lots.filter(lot => {
      // Skip if lot is already selected in another row
      const lotId = lot.id || lot._id;
      if (selectedLotIds.includes(lotId)) return false;

      const lotNo = lot.lotNo?.toLowerCase() || '';
      const supplier = lot.supplier?.toLowerCase() || '';
      const searchTermLower = searchTerm.toLowerCase();
      return lotNo.includes(searchTermLower) || supplier.includes(searchTermLower);
    });
  };

  // Handle individual checkbox change for a row
  const handleBaleCheckboxChange = (rowId, weightmentId, checked) => {
    setLotRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newSelectedBales = new Set(row.selectedBales);
        if (checked) {
          newSelectedBales.add(weightmentId);
        } else {
          newSelectedBales.delete(weightmentId);
        }

        // Update transfer quantity based on selected bales
        const newTransferQty = newSelectedBales.size;

        return {
          ...row,
          selectedBales: newSelectedBales,
          transferQty: newTransferQty
        };
      }
      return row;
    }));
  };

  // Handle select all for a row
  const handleSelectAllChange = (rowId, checked) => {
    setLotRows(prev => prev.map(row => {
      if (row.id === rowId && row.weightments) {
        if (checked) {
          const allIds = new Set(row.weightments.map(w => w.id));
          return {
            ...row,
            selectedBales: allIds,
            transferQty: allIds.size
          };
        } else {
          return {
            ...row,
            selectedBales: new Set(),
            transferQty: 0
          };
        }
      }
      return row;
    }));
  };

  // Handle transfer quantity input change
  const handleTransferQtyChange = (rowId, value) => {
    const qty = parseInt(value) || 0;

    setLotRows(prev => prev.map(row => {
      if (row.id === rowId && row.weightments) {
        // If qty is 0, clear all selections
        if (qty === 0) {
          return {
            ...row,
            transferQty: 0,
            selectedBales: new Set()
          };
        }

        // If qty > available, cap at available
        const validQty = Math.min(qty, row.availableQty);

        // Select first N bales
        const newSelectedBales = new Set();
        if (validQty > 0 && row.weightments.length > 0) {
          row.weightments.slice(0, validQty).forEach(w => {
            newSelectedBales.add(w.id);
          });
        }

        return {
          ...row,
          transferQty: validQty,
          selectedBales: newSelectedBales
        };
      }
      return row;
    }));
  };

  // Update totals based on all rows
  const updateTotals = () => {
    let totalQty = 0;
    let totalKgs = 0;
    let totalValue = 0;

    lotRows.forEach(row => {
      if (row.selectedBales && row.selectedBales.size > 0 && row.weightments) {
        const selectedWeightments = row.weightments.filter(w =>
          row.selectedBales.has(w.id)
        );

        totalQty += selectedWeightments.length;

        selectedWeightments.forEach(weightment => {
          const baleWeight = parseFloat(weightment.baleWeight) ||
            (parseFloat(weightment.grossWeight) - parseFloat(weightment.tareWeight) || 0);
          totalKgs += baleWeight;

          const baleValue = parseFloat(weightment.baleValue) ||
            (baleWeight / 356) * (row.candyRate || 55600);
          totalValue += baleValue;
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      qty: totalQty,
      kgs: parseFloat(totalKgs.toFixed(3)),
      value: parseFloat(totalValue.toFixed(2))
    }));
  };

  // Handle input changes for header
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.transferNo) {
      showNotification('Transfer number is required', 'error');
      return false;
    }
    if (!formData.transferDate) {
      showNotification('Date is required', 'error');
      return false;
    }
    if (!formData.fromLocationId) {
      showNotification('From location is required', 'error');
      return false;
    }
    if (!formData.toLocationId) {
      showNotification('To location is required', 'error');
      return false;
    }
    if (lotRows.length === 0) {
      showNotification('Please add at least one lot', 'error');
      return false;
    }

    let hasSelectedBales = false;
    lotRows.forEach(row => {
      if (row.selectedBales && row.selectedBales.size > 0) {
        hasSelectedBales = true;
      }
    });

    if (!hasSelectedBales) {
      showNotification('Please select at least one bale', 'error');
      return false;
    }

    return true;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      transferNo: '',
      transferDate: new Date().toISOString().split('T')[0],
      fromLocationId: '',
      toLocationId: '',
      transMode: 'ROAD',
      transportId: '',
      lorryNo: '',
      driverName: '',
      ownerMobile: '',
      driverMobile: '',
      itemName: 'Cotton Bale',
      qty: 0,
      kgs: 0,
      value: 0
    });
    setLotRows([]);
    setLotSearchRows({});
    setShowLotDropdownRows({});
    setLoadingLotDetailsRows({});
    setSelectedTransfer(null);
    setIsEditing(false);
  };

  // Open create modal
  const handleOpenCreateModal = async () => {
    resetForm();
    try {
      // Get next transfer number from service
      const response = await locationTransferService.getNextTransferNo();
      setFormData(prev => ({
        ...prev,
        transferNo: response.transferNo || response
      }));
    } catch (error) {
      console.error('Failed to generate transfer number:', error);
      // Fallback to local generation
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const nextYear = (parseInt(year) + 1).toString().padStart(2, '0');
      const transferNo = `LT/${year}-${nextYear}/` + String(transfers.length + 1).padStart(4, '0');
      setFormData(prev => ({ ...prev, transferNo }));
    }
    setOpenModal(true);
  };

  // Open view modal
  const handleOpenViewModal = async (transfer) => {
    try {
      setModalLoading(true);
      const fullTransfer = await locationTransferService.getLocationTransferById(transfer.id || transfer._id);
      setViewTransfer(fullTransfer);
      setOpenViewModal(true);
    } catch (error) {
      showNotification('Failed to load transfer details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = async (transfer) => {
    try {
      setModalLoading(true);
      const fullTransfer = await locationTransferService.getLocationTransferById(transfer.id || transfer._id);

      // Map the data to form fields
      setFormData({
        transferNo: fullTransfer.transferNo || '',
        transferDate: fullTransfer.transferDate ? fullTransfer.transferDate.split('T')[0] : '',
        fromLocationId: fullTransfer.fromLocationId || getGodownIdByName(fullTransfer.from) || '',
        toLocationId: fullTransfer.toLocationId || getGodownIdByName(fullTransfer.to) || '',
        transMode: fullTransfer.transMode || 'ROAD',
        transportId: fullTransfer.transportId || '',
        lorryNo: fullTransfer.lorryNo || '',
        driverName: fullTransfer.driverName || '',
        ownerMobile: fullTransfer.ownerMobile || '',
        driverMobile: fullTransfer.driverMobile || '',
        itemName: fullTransfer.itemName || 'Cotton Bale',
        qty: fullTransfer.qty || 0,
        kgs: fullTransfer.kgs || 0,
        value: fullTransfer.value || 0
      });

      // Process details into rows
      if (fullTransfer.details && fullTransfer.details.length > 0) {
        const rows = [];

        for (const detail of fullTransfer.details) {
          const rowId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

          if (detail.lotId) {
            // Find the lot
            const lot = lots.find(l => (l.id === detail.lotId || l._id === detail.lotId));

            // Get lot number first
            let lotNo = lot?.lotNo || detail.lotNo;

            // Fetch weightments for this lot using lot number
            let weightments = [];
            if (lotNo) {
              try {
                const weightmentsData = await locationTransferService.getWeightmentsByLot(lotNo);
                weightments = Array.isArray(weightmentsData) ? weightmentsData : [];
              } catch (error) {
                console.error('Failed to fetch weightments for edit:', error);
              }
            }

            // Collect selected bale IDs
            const selectedBales = new Set();
            if (detail.bales) {
              detail.bales.forEach(bale => {
                selectedBales.add(bale.weightmentId);
              });
            }

            rows.push({
              id: rowId,
              lotId: detail.lotId,
              lotNo: lot?.lotNo || detail.lotNo || '',
              supplier: lot?.supplier || '',
              availableQty: weightments.length,
              transferQty: detail.transferQty || selectedBales.size,
              weightments: weightments,
              selectedBales: selectedBales,
              candyRate: 55600
            });

            // Set search text
            setLotSearchRows(prev => ({
              ...prev,
              [rowId]: `${lot?.lotNo || detail.lotNo} - ${lot?.supplier || ''}`
            }));
          }
        }

        setLotRows(rows);
      }

      setSelectedTransfer(fullTransfer);
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      showNotification('Failed to load transfer details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Close modals
  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setViewTransfer(null);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setModalLoading(true);

      // Prepare details array
      const details = lotRows
        .filter(row => row.selectedBales && row.selectedBales.size > 0)
        .map(row => ({
          lotId: row.lotId, // This is the database ID
          stockQty: row.availableQty,
          transferQty: row.selectedBales.size,
          weightmentIds: Array.from(row.selectedBales)
        }));

      // Prepare submit data
      const submitData = {
        transferNo: formData.transferNo,
        transferDate: formData.transferDate,
        fromLocationId: parseInt(formData.fromLocationId),
        toLocationId: parseInt(formData.toLocationId),
        transMode: formData.transMode,
        transportId: formData.transportId ? parseInt(formData.transportId) : null,
        lorryNo: formData.lorryNo || null,
        driverName: formData.driverName || null,
        ownerMobile: formData.ownerMobile || null,
        driverMobile: formData.driverMobile || null,
        itemName: formData.itemName,
        qty: formData.qty,
        kgs: parseFloat(formData.kgs),
        value: parseFloat(formData.value),
        details: details
      };

      console.log('Submitting data:', JSON.stringify(submitData, null, 2));

      if (isEditing && selectedTransfer) {
        await locationTransferService.updateLocationTransfer(selectedTransfer.id || selectedTransfer._id, submitData);
        showNotification('Location transfer updated successfully');
      } else {
        await locationTransferService.createLocationTransfer(submitData);
        showNotification('Location transfer created successfully');
      }

      await fetchTransfers();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(error.response?.data?.message || error.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete transfer
  const handleDelete = async (transfer) => {
    const id = transfer.id || transfer._id;
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        setLoading(true);
        await locationTransferService.deleteLocationTransfer(id);
        showNotification('Location transfer deleted successfully');
        await fetchTransfers();
      } catch (error) {
        showNotification('Failed to delete transfer', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter transfers based on search
  const filteredTransfers = transfers.filter((t) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    const tNo = t.transferNo?.toLowerCase() || '';
    const fromGodown = (t.from || getGodownName(t.fromLocationId) || '').toLowerCase();
    const toGodown = (t.to || getGodownName(t.toLocationId) || '').toLowerCase();
    const lorryNo = t.lorryNo?.toLowerCase() || '';
    const mode = t.transMode?.toLowerCase() || '';
    return (
      tNo.includes(s) ||
      fromGodown.includes(s) ||
      toGodown.includes(s) ||
      lorryNo.includes(s) ||
      mode.includes(s)
    );
  });

  // Pagination derived values
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
          } border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-xl hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Location Transfer</h1>
            <p className="text-gray-600 mt-1">Manage inter-godown transfers of cotton bales</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <span className="mr-2 text-xl">+</span>
            New Transfer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="ml">
              <p className="text-sm font-medium text-gray-600">Total Transfers</p>
              <p className="text-2xl font-bold text-gray-800">{transfers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="ml">
              <p className="text-sm font-medium text-gray-600">Today's Transfers</p>
              <p className="text-2xl font-bold text-gray-800">
                {transfers.filter(t => {
                  const today = new Date().toISOString().split('T')[0];
                  return t.transferDate === today;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="ml">
              <p className="text-sm font-medium text-gray-600">Total Kgs</p>
              <p className="text-2xl font-bold text-gray-800">
                {transfers.reduce((sum, t) => sum + (parseFloat(t.kgs) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="ml">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{transfers.reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by transfer no, godown, lorry no, or mode..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>
          <button
            onClick={fetchTransfers}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Location Transfers ({filteredTransfers.length})</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredTransfers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left divide-y divide-gray-100">
            <thead className="bg-gray-50 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-2 py-2 whitespace-nowrap">Transfer No</th>
                <th className="px-2 py-2 whitespace-nowrap">Date</th>
                <th className="px-2 py-2">From</th>
                <th className="px-2 py-2">To</th>
                <th className="px-2 py-2 whitespace-nowrap">Mode</th>
                <th className="px-2 py-2">Lorry No</th>
                <th className="px-2 py-2 whitespace-nowrap">Qty</th>
                <th className="px-2 py-2 whitespace-nowrap">Kgs</th>
                <th className="px-2 py-2 whitespace-nowrap">Value</th>
                <th className="px-2 py-2 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-2 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-2 py-8 text-center text-gray-500">
                    No location transfers found.
                  </td>
                </tr>
              ) : (
                paginatedTransfers.map((transfer) => (
                  <tr key={transfer.id || transfer._id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{transfer.transferNo || '-'}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-600">
                      {formatDate(transfer.transferDate)}
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-gray-900 max-w-[110px] truncate" title={transfer.from || getGodownName(transfer.fromLocationId)}>
                        {transfer.from || getGodownName(transfer.fromLocationId)}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-gray-900 max-w-[110px] truncate" title={transfer.to || getGodownName(transfer.toLocationId)}>
                        {transfer.to || getGodownName(transfer.toLocationId)}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${transfer.transMode === 'ROAD' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                        {transfer.transMode || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-gray-900 max-w-[90px] truncate" title={transfer.lorryNo || '-'}>
                        {transfer.lorryNo || '-'}
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap font-semibold text-gray-900">
                      {transfer.qty || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-900">
                      {transfer.kgs ? Number(transfer.kgs).toLocaleString() : '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap font-semibold text-gray-900">
                      {transfer.value ? `₹${Number(transfer.value).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenViewModal(transfer)}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[11px] font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(transfer)}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-[11px] font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transfer)}
                          className="px-2 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-[11px] font-medium"
                        >
                          Delete
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-white gap-4">
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
                Showing {filteredTransfers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length} entries
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
                        ? 'bg-gray-800 text-white border-gray-800'
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

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Location Transfer' : 'New Location Transfer'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={modalLoading}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Section */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Details</h4>

                {/* First Row - Transfer No, Date, From, To */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Transfer No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="transferNo"
                      value={formData.transferNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100"
                      placeholder=""
                      disabled={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="transferDate"
                      value={formData.transferDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      From <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fromLocationId"
                      value={formData.fromLocationId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Godown</option>
                      {godowns.map(godown => (
                        <option key={godown.id} value={godown.id}>
                          {godown.godownName || godown.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      To <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toLocationId"
                      value={formData.toLocationId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Godown</option>
                      {godowns.map(godown => (
                        <option key={godown.id} value={godown.id}>
                          {godown.godownName || godown.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Second Row - Trans Mode, Lorry No, Owner Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Trans Mode
                    </label>
                    <select
                      name="transMode"
                      value={formData.transMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      {transportModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Lorry No
                    </label>
                    <input
                      type="text"
                      name="lorryNo"
                      value={formData.lorryNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Owner Mobile
                    </label>
                    <input
                      type="text"
                      name="ownerMobile"
                      value={formData.ownerMobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading}
                    />
                  </div>
                </div>

                {/* Third Row - Transport, Driver Name, Driver Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Transport
                    </label>
                    <select
                      name="transportId"
                      value={formData.transportId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={modalLoading}
                    >
                      <option value="">Select Transport</option>
                      {transports.map(transport => (
                        <option key={transport.id} value={transport.id}>
                          {transport.transportName || transport.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Driver Mobile
                    </label>
                    <input
                      type="text"
                      name="driverMobile"
                      value={formData.driverMobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading}
                    />
                  </div>
                </div>

                {/* Fourth Row - Item Name */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder=""
                      disabled={modalLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Multi-row Lot Selection Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-700">Lots to Transfer</h4>
                  <button
                    type="button"
                    onClick={addNewRow}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center"
                    disabled={modalLoading}
                  >
                    <span className="mr-1">+</span> Add Lot
                  </button>
                </div>

                {lotRows.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
                    No lots added. Click "Add Lot" to start selecting bales.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {lotRows.map((row, index) => (
                      <div key={row.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-medium text-gray-700">Lot #{index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={modalLoading}
                          >
                            Remove
                          </button>
                        </div>

                        {/* Lot Search Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="relative" ref={el => lotRefs.current[row.id] = el}>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Select Lot <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={lotSearchRows[row.id] || ''}
                              onChange={(e) => {
                                setLotSearchRows(prev => ({ ...prev, [row.id]: e.target.value }));
                                setShowLotDropdownRows(prev => ({ ...prev, [row.id]: true }));
                              }}
                              onFocus={() => setShowLotDropdownRows(prev => ({ ...prev, [row.id]: true }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder=""
                              disabled={modalLoading || loadingLotDetailsRows[row.id]}
                            />

                            {showLotDropdownRows[row.id] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredLots(lotSearchRows[row.id] || '', row.id).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">No lots available</div>
                                ) : (
                                  getFilteredLots(lotSearchRows[row.id] || '', row.id).map(lot => {
                                    const nettWeight = lot.nettWeight || '';
                                    const balesQty = lot.qty || 0;
                                    return (
                                      <div
                                        key={lot.id || lot._id}
                                        onClick={() => handleLotSelect(lot, row.id)}
                                        className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-medium text-gray-900">{lot.lotNo}</div>
                                        <div className="text-xs text-gray-500">
                                          Available: {balesQty} bales • {nettWeight} kg
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Available Qty
                            </label>
                            <input
                              type="number"
                              value={row.availableQty}
                              readOnly
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Transfer Qty
                            </label>
                            <input
                              type="number"
                              value={row.transferQty}
                              onChange={(e) => handleTransferQtyChange(row.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder=""
                              min="0"
                              max={row.availableQty}
                              disabled={modalLoading || !row.weightments.length}
                            />
                          </div>
                        </div>

                        {/* Bale Selection Table */}
                        {loadingLotDetailsRows[row.id] ? (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                              <span className="text-sm text-gray-600">Loading bale details...</span>
                            </div>
                          </div>
                        ) : row.weightments && row.weightments.length > 0 ? (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-600">Select Bales</span>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={row.selectedBales && row.selectedBales.size === row.weightments.length}
                                  onChange={(e) => handleSelectAllChange(row.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  disabled={modalLoading}
                                />
                                <span className="text-sm text-gray-700">Select All</span>
                              </label>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-12 px-4 py-3">
                                      <span className="sr-only">Select</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Bale Number
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Gross Weight (kg)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Tare Weight (kg)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Net Weight (kg)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {row.weightments.map((weightment) => {
                                    const grossWeight = parseFloat(weightment.grossWeight) || 0;
                                    const tareWeight = parseFloat(weightment.tareWeight) || 0;
                                    const netWeight = parseFloat(weightment.baleWeight) || (grossWeight - tareWeight);

                                    return (
                                      <tr
                                        key={weightment.id}
                                        className={`hover:bg-gray-50 ${row.selectedBales?.has(weightment.id) ? 'bg-blue-50' : ''
                                          }`}
                                      >
                                        <td className="px-4 py-3">
                                          <input
                                            type="checkbox"
                                            checked={row.selectedBales?.has(weightment.id) || false}
                                            onChange={(e) => handleBaleCheckboxChange(row.id, weightment.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            disabled={modalLoading}
                                          />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {weightment.baleNo || `Bale #${weightment.id}`}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {grossWeight.toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                          {tareWeight.toFixed(3)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                          {netWeight.toFixed(3)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : row.lotId ? (
                          <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                            No bales available for this lot.
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Quantity (Bales)
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Kgs
                    </label>
                    <input
                      type="text"
                      value={formData.kgs}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Total Value (₹)
                    </label>
                    <input
                      type="text"
                      value={formData.value}
                      readOnly
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modalLoading || Object.values(loadingLotDetailsRows).some(v => v)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 min-w-[100px] justify-center"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Update' : 'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {openViewModal && viewTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Location Transfer Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transfer No</p>
                    <p className="text-base font-medium text-gray-900">{viewTransfer.transferNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transfer Date</p>
                    <p className="text-base text-gray-900">{formatDate(viewTransfer.transferDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">From Location</p>
                    <p className="text-base text-gray-900">{viewTransfer.from || getGodownName(viewTransfer.fromLocationId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To Location</p>
                    <p className="text-base text-gray-900">{viewTransfer.to || getGodownName(viewTransfer.toLocationId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transport Mode</p>
                    <p className="text-base text-gray-900">{viewTransfer.transMode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lorry No</p>
                    <p className="text-base text-gray-900">{viewTransfer.lorryNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transport</p>
                    <p className="text-base text-gray-900">{viewTransfer.transport?.transportName || getTransportName(viewTransfer.transportId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="text-base text-gray-900">{viewTransfer.driverName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner Mobile</p>
                    <p className="text-base text-gray-900">{viewTransfer.ownerMobile || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Mobile</p>
                    <p className="text-base text-gray-900">{viewTransfer.driverMobile || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Item Name</p>
                    <p className="text-base text-gray-900">{viewTransfer.itemName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              {viewTransfer.details && viewTransfer.details.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-700 mb-4">Transfer Details</h4>
                  {viewTransfer.details.map((detail, idx) => (
                    <div key={idx} className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Lot: {detail.lot?.lotNo || detail.lotId}</h5>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bale Number</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {detail.bales && detail.bales.map((bale, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {bale.weightment?.baleNo || `Bale #${bale.weightmentId}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {bale.weightment?.baleWeight ||
                                    (bale.weightment ?
                                      (parseFloat(bale.weightment.grossWeight) - parseFloat(bale.weightment.tareWeight)).toFixed(3) : '-')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  ₹{bale.weightment?.baleValue?.toFixed(2) || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{viewTransfer.qty || 0} Bales</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewTransfer.kgs ? `${Number(viewTransfer.kgs).toLocaleString()} kgs` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewTransfer.value ? `₹${Number(viewTransfer.value).toLocaleString()}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <div>
                  <p>Created: {viewTransfer.createdAt ? new Date(viewTransfer.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p>Last Updated: {viewTransfer.updatedAt ? new Date(viewTransfer.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationTransferPage;