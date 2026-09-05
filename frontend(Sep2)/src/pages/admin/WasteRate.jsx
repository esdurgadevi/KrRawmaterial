import React, { useState, useEffect, useRef } from 'react';
import wasteMasterService from '../../services/admin1/master/wasteMasterService';
import wasteRateService from '../../services/admin1/master/wasteRateService';

const WasteRate = () => {
  // States
  const [wasteRates, setWasteRates] = useState([]);
  const [wasteMasters, setWasteMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteMasterLoading, setWasteMasterLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [viewingRate, setViewingRate] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    wasteMasterId: '',
    wasteMasterName: '',
    rateDate: new Date().toISOString().split('T')[0],
    rate: '',
    remarks: ''
  });

  // Autocomplete states
  const [showWasteDropdown, setShowWasteDropdown] = useState(false);
  const [wasteSearch, setWasteSearch] = useState('');
  const [availableWasteMasters, setAvailableWasteMasters] = useState([]);
  
  // Refs for closing dropdowns
  const wasteRef = useRef(null);

  // Load waste rates and masters on component mount
  useEffect(() => {
    fetchWasteRates();
    fetchWasteMasters();
  }, []);

  // Filter waste masters based on selected date
  useEffect(() => {
    if (wasteMasters.length > 0) {
      filterAvailableWasteMasters();
    }
  }, [selectedDate, wasteMasters, wasteRates]);

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

  const fetchWasteRates = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await wasteRateService.getAll();
      const ratesData = Array.isArray(response) ? response : [];
      setWasteRates(ratesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load waste rates');
      setWasteRates([]);
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

  // Filter available waste masters (only those not already having rate for selected date)
  const filterAvailableWasteMasters = () => {
    // Get waste master IDs that already have rates for the selected date
    const existingRateMasterIds = wasteRates
      .filter(rate => rate.rateDate === selectedDate)
      .map(rate => rate.wasteMasterId);

    // Filter waste masters that don't have rates for selected date
    const available = wasteMasters.filter(master => 
      !existingRateMasterIds.includes(master.id) &&
      (!wasteSearch.trim() || 
        master.waste.toLowerCase().includes(wasteSearch.toLowerCase()) ||
        (master.code && master.code.toString().includes(wasteSearch.toLowerCase()))
      )
    );

    setAvailableWasteMasters(available);
  };

  // Get waste master name by ID
  const getWasteMasterName = (masterId) => {
    const master = wasteMasters.find(m => m.id === masterId);
    return master ? `${master.waste} (${master.department})` : 'Unknown Waste';
  };

  // Filter waste rates based on search and date filter
  const filteredRates = (() => {
    let ratesArray = Array.isArray(wasteRates) ? wasteRates : [];
    
    // Apply date filter if selected
    if (dateFilter) {
      ratesArray = ratesArray.filter(rate => rate.rateDate === dateFilter);
    }
    
    // Apply search filter
    return ratesArray.filter(rate => {
      if (!rate || typeof rate !== 'object') return false;
      
      const masterName = getWasteMasterName(rate.wasteMasterId) || '';
      const remarks = rate.remarks || '';
      const rateValue = rate.rate ? rate.rate.toString() : '';
      
      return searchTerm === '' || 
        masterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rateValue.includes(searchTerm);
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle waste master selection
  const handleWasteSelect = (master) => {
    setFormData(prev => ({
      ...prev,
      wasteMasterId: master.id,
      wasteMasterName: `${master.waste} (${master.department})`
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
        wasteMasterName: ''
      }));
    }
  };

  // Clear waste selection
  const clearWasteSelection = () => {
    setFormData(prev => ({
      ...prev,
      wasteMasterId: '',
      wasteMasterName: ''
    }));
    setWasteSearch('');
    setShowWasteDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.wasteMasterId) {
      setError('Please select a waste type from the list');
      return;
    }

    if (!formData.rateDate) {
      setError('Rate date is required');
      return;
    }

    if (!formData.rate || isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
      setError('Please enter a valid rate amount');
      return;
    }

    try {
      // Prepare payload
      const payload = {
        wasteMasterId: parseInt(formData.wasteMasterId, 10),
        rateDate: formData.rateDate,
        rate: parseFloat(formData.rate),
        remarks: formData.remarks.trim() || null
      };
      
      if (editingRate) {
        // Update existing rate
        await wasteRateService.update(editingRate.id, payload);
        setSuccess('Waste rate updated successfully!');
      } else {
        // Create new rate
        await wasteRateService.create(payload);
        setSuccess('Waste rate created successfully!');
      }
      
      // Refresh rates list
      fetchWasteRates();
      
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
      
      setError(`Failed to save waste rate: ${errorMsg}`);
    }
  };

  const handleEdit = (rate) => {
    if (!rate || !rate.id) {
      setError('Invalid waste rate data');
      return;
    }
    
    const masterName = getWasteMasterName(rate.wasteMasterId);
    
    setEditingRate(rate);
    setFormData({
      wasteMasterId: rate.wasteMasterId || '',
      wasteMasterName: masterName || '',
      rateDate: rate.rateDate || new Date().toISOString().split('T')[0],
      rate: rate.rate || '',
      remarks: rate.remarks || ''
    });
    setWasteSearch(masterName || '');
    setShowModal(true);
  };

  const handleView = (rate) => {
    if (!rate || !rate.id) {
      setError('Invalid waste rate data');
      return;
    }
    
    setViewingRate(rate);
    setShowViewModal(true);
  };

  const handleDelete = async (id, masterName) => {
    if (!id || !masterName) {
      setError('Invalid waste rate data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete waste rate for "${masterName}"?`)) {
      return;
    }

    try {
      await wasteRateService.delete(id);
      setSuccess('Waste rate deleted successfully!');
      fetchWasteRates();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete waste rate');
    }
  };

  const resetForm = () => {
    setFormData({
      wasteMasterId: '',
      wasteMasterName: '',
      rateDate: new Date().toISOString().split('T')[0],
      rate: '',
      remarks: ''
    });
    setWasteSearch('');
    setShowWasteDropdown(false);
    setEditingRate(null);
    setViewingRate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const exportRates = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Date,Waste Type,Department,Rate (₹),Remarks\n" +
        filteredRates.map(rate => {
          const master = wasteMasters.find(m => m.id === rate.wasteMasterId);
          const wasteType = master ? master.waste : 'Unknown';
          const department = master ? master.department : 'Unknown';
          return `${rate.rateDate},${wasteType},${department},₹${rate.rate},${rate.remarks || ''}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `waste-rates-${dateFilter || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Waste rates exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export waste rates');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter('');
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

  // Get waste master details
  const getWasteMasterDetails = (masterId) => {
    return wasteMasters.find(m => m.id === masterId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Waste Rate Management</h1>
            <p className="text-gray-600">Manage waste rates for different waste types and dates</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Rate
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
          {/* Date Filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {dateFilter && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Rates</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by waste type, department, rate, or remarks..."
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
              onClick={exportRates}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchWasteRates();
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

      {/* Waste Rates Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Waste Rates {dateFilter && `for ${formatDate(dateFilter)}`}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredRates.length} of {wasteRates.length} rates
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading waste rates...</p>
          </div>
        ) : filteredRates.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">💰</span>
            <p className="text-gray-600 mb-2">
              {dateFilter ? `No waste rates found for ${formatDate(dateFilter)}` : 'No waste rates found'}
            </p>
            {searchTerm || dateFilter ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Add your first waste rate
              </button>
            )}
          </div>
        ) : (
          /* Rates Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WASTE TYPE & DEPARTMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RATE (₹)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REMARKS
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
                {filteredRates.map((rate) => {
                  const master = getWasteMasterDetails(rate.wasteMasterId);
                  return (
                    <tr key={rate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📅</span>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(rate.rateDate)}
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
                              {master ? master.department : 'Unknown Department'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">💰</span>
                          <span className="text-lg font-bold text-green-700">
                            ₹{parseFloat(rate.rate).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">📄</span>
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {rate.remarks || 'No remarks'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(rate.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(rate)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <span className="mr-1">👁️</span>
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(rate)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id, getWasteMasterName(rate.wasteMasterId))}
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

      {/* Create/Edit Waste Rate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingRate ? 'Edit Waste Rate' : 'Add New Waste Rate'}
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
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Date *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                      <input
                        type="date"
                        name="rateDate"
                        value={formData.rateDate}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Waste Type Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Type *
                      <span className="text-xs text-gray-500 ml-1">
                        {availableWasteMasters.length === 0 
                          ? 'No waste types available for selected date' 
                          : `(${availableWasteMasters.length} available)`}
                      </span>
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
                        disabled={availableWasteMasters.length === 0}
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
                      {showWasteDropdown && availableWasteMasters.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {availableWasteMasters.map((master) => (
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
                                    Department: {master.department} | Code: #{master.code}
                                  </div>
                                </div>
                                {formData.wasteMasterId === master.id && (
                                  <span className="w-4 h-4 text-blue-600">✓</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {availableWasteMasters.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        All waste types already have rates for {formatDate(formData.rateDate)}
                      </p>
                    )}
                  </div>

                  {/* Rate Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                      <input
                        type="number"
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter rate amount"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add any remarks or notes..."
                      />
                    </div>
                  </div>

                  {/* Display existing rate info when editing */}
                  {editingRate && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Rate Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingRate.createdAt ? new Date(editingRate.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingRate.updatedAt ? new Date(editingRate.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Current Rate:</span>
                          <div className="font-bold text-green-700">
                            ₹{parseFloat(editingRate.rate).toFixed(2)}
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
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.wasteMasterId || !formData.rateDate || !formData.rate}
                  >
                    {editingRate ? 'Update Rate' : 'Create Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Waste Rate Details Modal */}
      {showViewModal && viewingRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Waste Rate Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Rate Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-green-600">💰</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Rate Date */}
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-gray-400 mr-2">📅</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatDate(viewingRate.rateDate)}
                    </span>
                  </div>

                  {/* Waste Type Details */}
                  {(() => {
                    const master = getWasteMasterDetails(viewingRate.wasteMasterId);
                    return master ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          <span className="text-gray-400 mr-2">📦</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{master.waste}</h4>
                            <p className="text-sm text-gray-600">{master.department}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Code:</span>
                            <div className="font-medium">#{master.code}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">HSN Code:</span>
                            <div className="font-medium">{master.hsnCode || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Packing Type:</span>
                            <div className="font-medium">{master.packingTypeId}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Waste Weight:</span>
                            <div className="font-medium">{master.wasteKg} kg</div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Rate Amount */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-700 mb-1">Rate Amount</div>
                      <div className="text-3xl font-bold text-green-800">
                        ₹{parseFloat(viewingRate.rate).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {viewingRate.remarks && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <span className="text-blue-400 mr-2 mt-0.5 flex-shrink-0">📄</span>
                        <div>
                          <h5 className="text-sm font-medium text-blue-800 mb-1">Remarks</h5>
                          <p className="text-sm text-blue-700">{viewingRate.remarks}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Created Date</div>
                        <div className="font-medium text-gray-900">
                          {viewingRate.createdAt ? new Date(viewingRate.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {viewingRate.createdAt ? new Date(viewingRate.createdAt).toLocaleTimeString() : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Updated</div>
                        <div className="font-medium text-gray-900">
                          {viewingRate.updatedAt ? new Date(viewingRate.updatedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {viewingRate.updatedAt ? new Date(viewingRate.updatedAt).toLocaleTimeString() : ''}
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
                      handleEdit(viewingRate);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                  >
                    Edit Rate
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

export default WasteRate;