import React, { useState, useEffect, useRef } from 'react';
import wasteLotService from '../../services/admin1/master/wasteLotService';
import wasteMasterService from '../../services/admin1/master/wasteMasterService';

const WasteLot = () => {
  // States
  const [wasteLots, setWasteLots] = useState([]);
  const [wasteMasters, setWasteMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteMasterLoading, setWasteMasterLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [viewingLot, setViewingLot] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    lotNo: '',
    wasteMasterId: '',
    wasteMasterDetails: null,
    active: true
  });

  // Autocomplete states
  const [showWasteDropdown, setShowWasteDropdown] = useState(false);
  const [wasteSearch, setWasteSearch] = useState('');
  
  // Refs for closing dropdowns
  const wasteRef = useRef(null);

  // Load waste lots and masters on component mount
  useEffect(() => {
    fetchWasteLots();
    fetchWasteMasters();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wasteRef.current && !wasteRef.current.contains(event.target)) {
        setShowWasteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWasteLots = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await wasteLotService.getAll();
      const lotsData = Array.isArray(response) ? response : [];
      setWasteLots(lotsData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load waste lots');
      setWasteLots([]);
      setLoading(false);
    }
  };

  const fetchWasteMasters = async () => {
    setWasteMasterLoading(true);
    try {
      const response = await wasteMasterService.getAll();
      const mastersData = Array.isArray(response) ? response : [];
      setWasteMasters(mastersData);
    } catch (err) {
      console.error('Failed to load waste masters:', err);
    } finally {
      setWasteMasterLoading(false);
    }
  };

  // Filter waste masters based on search
  const filteredWasteMasters = wasteMasters.filter(master => {
    if (!wasteSearch.trim()) return wasteMasters;
    const searchLower = wasteSearch.toLowerCase();
    return (
      master.waste.toLowerCase().includes(searchLower) ||
      master.department.toLowerCase().includes(searchLower) ||
      (master.code && master.code.toString().includes(searchLower)) ||
      (master.hsnCode && master.hsnCode.toLowerCase().includes(searchLower))
    );
  });

  // Get waste master by ID
  const getWasteMaster = (masterId) => {
    return wasteMasters.find(m => m.id === masterId);
  };

  // Format waste display name
  const getWasteDisplayName = (masterId) => {
    const master = getWasteMaster(masterId);
    if (!master) return 'Unknown Waste';
    return `${master.waste} (${master.department})`;
  };

  // Get waste master details for display
  const getWasteDetails = (masterId) => {
    const master = getWasteMaster(masterId);
    if (!master) return null;
    
    return {
      id: master.id,
      code: master.code,
      waste: master.waste,
      department: master.department,
      wasteKg: master.wasteKg,
      hsnCode: master.hsnCode,
      packingPreWeightment: master.packingPreWeightment
    };
  };

  // Filter waste lots based on search and active filter
  const filteredLots = (() => {
    let lotsArray = Array.isArray(wasteLots) ? wasteLots : [];
    
    // Apply active filter
    if (activeFilter === 'active') {
      lotsArray = lotsArray.filter(lot => lot.active === true);
    } else if (activeFilter === 'inactive') {
      lotsArray = lotsArray.filter(lot => lot.active === false);
    }
    
    // Apply search filter
    return lotsArray.filter(lot => {
      if (!lot || typeof lot !== 'object') return false;
      
      const wasteName = getWasteDisplayName(lot.wasteMasterId);
      const lotNo = lot.lotNo || '';
      const status = lot.active ? 'Active' : 'Inactive';
      
      return searchTerm === '' || 
        wasteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle waste master selection
  const handleWasteSelect = (master) => {
    setFormData(prev => ({
      ...prev,
      wasteMasterId: master.id,
      wasteMasterDetails: getWasteDetails(master.id)
    }));
    setWasteSearch(`${master.waste} (${master.department})`);
    setShowWasteDropdown(false);
  };

  // Handle waste search change
  const handleWasteSearchChange = (e) => {
    const value = e.target.value;
    setWasteSearch(value);
    setShowWasteDropdown(true);
    
    if (!value.trim()) {
      setFormData(prev => ({
        ...prev,
        wasteMasterId: '',
        wasteMasterDetails: null
      }));
    }
  };

  // Clear waste selection
  const clearWasteSelection = () => {
    setFormData(prev => ({
      ...prev,
      wasteMasterId: '',
      wasteMasterDetails: null
    }));
    setWasteSearch('');
    setShowWasteDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.lotNo || formData.lotNo.trim() === '') {
      setError('Lot number is required');
      return;
    }

    if (!formData.wasteMasterId) {
      setError('Please select a waste type from the list');
      return;
    }

    // Check for duplicate lot number (case-insensitive)
    const existingLot = wasteLots.find(
      lot => 
        lot.lotNo.toLowerCase() === formData.lotNo.toLowerCase().trim() &&
        (!editingLot || lot.id !== editingLot.id)
    );
    
    if (existingLot) {
      setError(`Lot number "${formData.lotNo}" already exists`);
      return;
    }

    try {
      // Prepare payload
      const payload = {
        lotNo: formData.lotNo.trim(),
        wasteMasterId: parseInt(formData.wasteMasterId, 10),
        active: formData.active
      };
      
      if (editingLot) {
        // Update existing lot
        await wasteLotService.update(editingLot.id, payload);
        setSuccess('Waste lot updated successfully!');
      } else {
        // Create new lot
        await wasteLotService.create(payload);
        setSuccess('Waste lot created successfully!');
      }
      
      // Refresh lots list
      fetchWasteLots();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save waste lot: ${errorMsg}`);
    }
  };

  const handleEdit = (lot) => {
    if (!lot || !lot.id) {
      setError('Invalid waste lot data');
      return;
    }
    
    const wasteDetails = getWasteDetails(lot.wasteMasterId);
    const wasteName = getWasteDisplayName(lot.wasteMasterId);
    
    setEditingLot(lot);
    setFormData({
      lotNo: lot.lotNo || '',
      wasteMasterId: lot.wasteMasterId || '',
      wasteMasterDetails: wasteDetails,
      active: lot.active !== undefined ? lot.active : true
    });
    setWasteSearch(wasteName || '');
    setShowModal(true);
  };

  const handleView = (lot) => {
    if (!lot || !lot.id) {
      setError('Invalid waste lot data');
      return;
    }
    
    setViewingLot(lot);
    setShowViewModal(true);
  };

  const handleDelete = async (id, lotNo) => {
    if (!id || !lotNo) {
      setError('Invalid waste lot data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete waste lot "${lotNo}"?`)) {
      return;
    }

    try {
      await wasteLotService.delete(id);
      setSuccess('Waste lot deleted successfully!');
      fetchWasteLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete waste lot');
    }
  };

  const resetForm = () => {
    setFormData({
      lotNo: '',
      wasteMasterId: '',
      wasteMasterDetails: null,
      active: true
    });
    setWasteSearch('');
    setShowWasteDropdown(false);
    setEditingLot(null);
    setViewingLot(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const exportLots = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Lot No,Waste Type,Department,Waste Code,HSN Code,Waste Weight (kg),Packing Pre-Weightment,Status,Created Date\n" +
        filteredLots.map(lot => {
          const master = getWasteMaster(lot.wasteMasterId);
          return `"${lot.lotNo}","${master ? master.waste : 'Unknown'}","${master ? master.department : 'Unknown'}","${master ? master.code : 'N/A'}","${master ? master.hsnCode || 'N/A' : 'N/A'}","${master ? master.wasteKg : 'N/A'}","${master ? (master.packingPreWeightment ? 'Yes' : 'No') : 'N/A'}","${lot.active ? 'Active' : 'Inactive'}","${lot.createdAt ? new Date(lot.createdAt).toLocaleDateString() : 'N/A'}"`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `waste-lots-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Waste lots exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export waste lots');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Toggle lot status
  const toggleLotStatus = async (id, currentStatus) => {
    try {
      await wasteLotService.update(id, { active: !currentStatus });
      setSuccess(`Waste lot ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchWasteLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to update waste lot status: ${err.message}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Waste Lot Management</h1>
            <p className="text-gray-600">Manage waste lots with waste type suggestions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Lot
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Status Filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg border ${activeFilter === 'all' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
              >
                All Lots
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg border ${activeFilter === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
              >
                Active Only
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-4 py-2 rounded-lg border ${activeFilter === 'inactive' ? 'bg-gray-200 text-gray-800 border-gray-400' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
              >
                Inactive Only
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Lots</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by lot number, waste type, department, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportLots}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchWasteLots();
                fetchWasteMasters();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Waste Lots Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Waste Lots ({filteredLots.length})
            </h2>
            <div className="text-sm text-gray-500">
              <span className="mr-4">
                Active: {wasteLots.filter(l => l.active).length}
              </span>
              <span>
                Inactive: {wasteLots.filter(l => !l.active).length}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading waste lots...</p>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No waste lots found</p>
            {searchTerm || activeFilter !== 'all' ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first waste lot
              </button>
            )}
          </div>
        ) : (
          /* Lots Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LOT NUMBER
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WASTE DETAILS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WASTE WEIGHT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLots.map((lot) => {
                  const master = getWasteMaster(lot.wasteMasterId);
                  return (
                    <tr key={lot.id} className={`hover:bg-gray-50 ${!lot.active ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <span className="text-blue-600">#</span>
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-gray-900">
                              {lot.lotNo}
                            </div>
                            <div className="text-xs text-gray-500">ID: {lot.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📦</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {master ? master.waste : 'Unknown Waste'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Code: #{master ? master.code : 'N/A'} | HSN: {master ? master.hsnCode || 'N/A' : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">🏢</span>
                          <div className="text-sm font-medium text-gray-900">
                            {master ? master.department : 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">⚖️</span>
                          <div className="text-sm font-medium text-gray-900">
                            {master ? `${master.wasteKg} kg` : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleLotStatus(lot.id, lot.active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${lot.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}
                        >
                          {lot.active ? (
                            <>
                              <span className="w-3 h-3 mr-1">☑</span>
                              Active
                            </>
                          ) : (
                            <>
                              <span className="w-3 h-3 mr-1">📦</span>
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(lot.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(lot.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(lot)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <span className="mr-1">👁️</span>
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(lot)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lot.id, lot.lotNo)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Waste Lot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingLot ? 'Edit Waste Lot' : 'Create New Waste Lot'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Lot Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Number *
                      <span className="text-xs text-gray-500 ml-1">(Unique identifier)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      <input
                        type="text"
                        name="lotNo"
                        value={formData.lotNo}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique lot number"
                      />
                    </div>
                  </div>

                  {/* Waste Type Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Type *
                      <span className="text-xs text-gray-500 ml-1">(Type to search from waste masters)</span>
                    </label>
                    <div className="relative" ref={wasteRef}>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📦</span>
                      <input
                        type="text"
                        value={wasteSearch}
                        onChange={handleWasteSearchChange}
                        onFocus={() => setShowWasteDropdown(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type to search waste types..."
                        required
                      />
                      {formData.wasteMasterId && (
                        <button
                          type="button"
                          onClick={clearWasteSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                      
                      {/* Waste Dropdown */}
                      {showWasteDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {wasteMasterLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                              Loading waste types...
                            </div>
                          ) : filteredWasteMasters.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              {wasteSearch ? 'No waste types found' : 'No waste types available'}
                            </div>
                          ) : (
                            filteredWasteMasters.map((master) => (
                              <div
                                key={master.id}
                                onClick={() => handleWasteSelect(master)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                  formData.wasteMasterId === master.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{master.waste}</div>
                                    <div className="text-xs text-gray-500">
                                      Department: {master.department} | Code: #{master.code} | Weight: {master.wasteKg}kg
                                    </div>
                                  </div>
                                  {formData.wasteMasterId === master.id && (
                                    <span className="w-4 h-4 text-blue-600">✓</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {!formData.wasteMasterId && wasteSearch && (
                      <p className="mt-1 text-xs text-red-500">Please select a waste type from the list</p>
                    )}
                  </div>

                  {/* Selected Waste Details */}
                  {formData.wasteMasterDetails && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Waste Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-blue-600">Waste Type:</span>
                          <div className="font-medium">{formData.wasteMasterDetails.waste}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Department:</span>
                          <div className="font-medium">{formData.wasteMasterDetails.department}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Waste Code:</span>
                          <div className="font-medium">#{formData.wasteMasterDetails.code}</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Weight:</span>
                          <div className="font-medium">{formData.wasteMasterDetails.wasteKg} kg</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-blue-600">HSN Code:</span>
                          <div className="font-medium">{formData.wasteMasterDetails.hsnCode || 'N/A'}</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-blue-600">Packing Pre-Weightment:</span>
                          <div className="font-medium">
                            {formData.wasteMasterDetails.packingPreWeightment ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                      Active Lot
                    </label>
                    <span className="ml-2 text-xs text-gray-500">
                      (Inactive lots won't appear in active listings)
                    </span>
                  </div>

                  {/* Display existing lot info when editing */}
                  {editingLot && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Lot Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingLot.createdAt ? new Date(editingLot.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingLot.updatedAt ? new Date(editingLot.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Current Status:</span>
                          <div className={`font-medium ${editingLot.active ? 'text-green-600' : 'text-gray-600'}`}>
                            {editingLot.active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.lotNo || !formData.wasteMasterId}
                  >
                    {editingLot ? 'Update Lot' : 'Create Lot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Waste Lot Details Modal */}
      {showViewModal && viewingLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Waste Lot Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Lot Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📦</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Lot Header */}
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900">{viewingLot.lotNo}</h4>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${viewingLot.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                      {viewingLot.active ? 'Active Lot' : 'Inactive Lot'}
                    </div>
                  </div>

                  {/* Waste Details */}
                  {(() => {
                    const master = getWasteMaster(viewingLot.wasteMasterId);
                    return master ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-4">
                          <span className="text-gray-400 mr-2">📦</span>
                          <h5 className="text-lg font-semibold text-gray-900">Waste Information</h5>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Waste Type</label>
                              <div className="mt-1 font-medium text-gray-900">{master.waste}</div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Department</label>
                              <div className="mt-1 font-medium text-gray-900">{master.department}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Waste Code</label>
                              <div className="mt-1 font-medium text-gray-900">#{master.code}</div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">HSN Code</label>
                              <div className="mt-1 font-medium text-gray-900">{master.hsnCode || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Waste Weight</label>
                              <div className="mt-1 font-medium text-gray-900">{master.wasteKg} kg</div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Packing Pre-Weightment</label>
                              <div className="mt-1 font-medium text-gray-900">
                                {master.packingPreWeightment ? 'Yes' : 'No'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700">Waste master information not available</p>
                      </div>
                    );
                  })()}

                  {/* Timestamps */}
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 font-medium text-gray-900">
                          {formatDate(viewingLot.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingLot.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 font-medium text-gray-900">
                          {formatDate(viewingLot.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingLot.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingLot);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Lot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteLot;