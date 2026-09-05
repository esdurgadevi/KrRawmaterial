// frontend/src/pages/admin/transaction-cotton/LotAllowancePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import lotAllowanceService from '../../services/admin1/transaction-cotton/lotAllowanceService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const LotAllowancePage = () => {
  const navigate = useNavigate();
  
  // States for list view
  const [allowances, setAllowances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Data states
  const [selectedAllowance, setSelectedAllowance] = useState(null);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  
  // Loading states
  const [lotsLoading, setLotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allowanceNoLoading, setAllowanceNoLoading] = useState(false);
  
  // Dropdown visibility states
  const [showLotDropdown, setShowLotDropdown] = useState(false);
  
  // Search states
  const [lotSearch, setLotSearch] = useState('');
  
  // Refs for dropdowns
  const lotRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Header
    allowanceNo: '',
    allowanceDate: new Date().toISOString().split('T')[0],
    inwardLotId: '',
    
    // Lot details (from selected lot)
    lotNo: '',
    lotDate: '',
    partyName: '',
    variety: '',
    
    // Weight snapshot
    grossWeight: '',
    tareWeight: '',
    netWeight: '',
    
    // Rates snapshot
    candyRate: '',
    quintalRate: '',
    ratePerKg: '',
    actualValue: '',
    
    // Allowance fields
    allowanceRate: '',
    debitValue: '',
    
    // Optional
    debitLedger: '',
    remarks: ''
  });

  // Calculate values when candyRate or allowanceRate changes
  useEffect(() => {
    if (formData.candyRate) {
      const candyRate = parseFloat(formData.candyRate) || 0;
      const allowanceRate = parseFloat(formData.allowanceRate) || 0;
      
      // Calculate reduced candy rate (candyRate - allowanceRate)
      const reducedCandyRate = candyRate - allowanceRate;
      
      // Calculate rate per kg = reduced candy rate / 355.62
      const ratePerKg = reducedCandyRate / 355.62;
      
      // Calculate quintal rate = rate per kg * 100
      const quintalRate = ratePerKg * 100;
      
      // Calculate actual value = net weight * rate per kg
      const netWeight = parseFloat(formData.netWeight) || 0;
      const actualValue = netWeight * ratePerKg;
      
      // Calculate debit value = net weight * allowanceRate/355.62
      const debitValue = netWeight * (allowanceRate / 355.62);
      
      setFormData(prev => ({
        ...prev,
        ratePerKg: ratePerKg.toFixed(2),
        quintalRate: quintalRate.toFixed(2),
        actualValue: actualValue.toFixed(2),
        debitValue: debitValue.toFixed(2)
      }));
    }
  }, [formData.candyRate, formData.allowanceRate, formData.netWeight]);

  // Load data on mount
  useEffect(() => {
    fetchAllowances();
    fetchLots();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (lotRef.current && !lotRef.current.contains(event.target)) {
        setShowLotDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch allowances
  const fetchAllowances = async () => {
    setLoading(true);
    try {
      const response = await lotAllowanceService.getAll();
      const allowancesData = Array.isArray(response) ? response : [];
      setAllowances(allowancesData);
    } catch (err) {
      console.error('Failed to load allowances:', err);
      setError('Failed to load lot allowances');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lots
  const fetchLots = async () => {
    setLotsLoading(true);
    try {
      const response = await inwardLotService.getAll();
      const lotsData = Array.isArray(response) ? response : [];
      setLots(lotsData);
    } catch (err) {
      console.error('Failed to load lots:', err);
    } finally {
      setLotsLoading(false);
    }
  };

  // Fetch next allowance number
  const fetchNextAllowanceNo = async () => {
    try {
      setAllowanceNoLoading(true);
      const response = await lotAllowanceService.getNextAllowanceNo();
      setFormData(prev => ({
        ...prev,
        allowanceNo: response || ''
      }));
    } catch (err) {
      console.error('Error fetching next allowance number:', err);
      // Fallback to a default pattern
      const defaultNo = new Date().getFullYear().toString().slice(-2) + '001';
      setFormData(prev => ({
        ...prev,
        allowanceNo: defaultNo
      }));
    } finally {
      setAllowanceNoLoading(false);
    }
  };

  // Handle lot selection
  const handleLotSelect = async (lotId) => {
    try {
      setLoading(true);
      const response = await inwardLotService.getById(lotId);
      const lot = response;
      
      setSelectedLot(lot);
      
      // Populate form with lot data
      setFormData(prev => ({
        ...prev,
        inwardLotId: lot.id,
        lotNo: lot.lotNo || '',
        lotDate: lot.lotDate || '',
        partyName: lot.supplier || '',
        variety: lot.variety || '',
        grossWeight: lot.grossWeight || '',
        tareWeight: lot.tareWeight || '',
        netWeight: lot.nettWeight || '',
        candyRate: lot.candyRate || '',
        // These will be recalculated by useEffect
        quintalRate: '',
        ratePerKg: '',
        actualValue: '',
        debitValue: ''
      }));
      
      setLotSearch(lot.lotNo || '');
      setShowLotDropdown(false);
      
    } catch (error) {
      console.error('Error fetching lot details:', error);
      setError('Failed to load lot details');
    } finally {
      setLoading(false);
    }
  };

  // Clear lot selection
  const clearLotSelection = () => {
    setSelectedLot(null);
    setFormData(prev => ({
      ...prev,
      inwardLotId: '',
      lotNo: '',
      lotDate: '',
      partyName: '',
      variety: '',
      grossWeight: '',
      tareWeight: '',
      netWeight: '',
      candyRate: '',
      quintalRate: '',
      ratePerKg: '',
      actualValue: '',
      debitValue: ''
    }));
    setLotSearch('');
    setShowLotDropdown(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle create submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.inwardLotId) {
      setError('Please select a lot');
      return;
    }

    if (!formData.allowanceRate || parseFloat(formData.allowanceRate) <= 0) {
      setError('Please enter a valid allowance rate');
      return;
    }

    setSubmitting(true);

    try {
      await lotAllowanceService.create(formData);
      
      setSuccess('Lot allowance created successfully!');
      
      // Reset form and close modal
      setTimeout(() => {
        resetForm();
        setShowCreateModal(false);
        fetchAllowances();
      }, 2000);
      
    } catch (err) {
      console.error('Error creating allowance:', err);
      setError(err.response?.data?.message || 'Failed to create lot allowance');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view
  const handleView = async (id) => {
    try {
      const response = await lotAllowanceService.getById(id);
      setSelectedAllowance(response);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching allowance details:', error);
      setError('Failed to load allowance details');
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const response = await lotAllowanceService.getById(id);
      const allowance = response;
      
      setSelectedAllowance(allowance);
      
      // Find the lot
      const lot = lots.find(l => l.id === allowance.inwardLotId);
      setSelectedLot(lot);
      
      // Populate form
      setFormData({
        allowanceNo: allowance.allowanceNo || '',
        allowanceDate: allowance.allowanceDate || new Date().toISOString().split('T')[0],
        inwardLotId: allowance.inwardLotId || '',
        lotNo: allowance.lotNo || '',
        lotDate: allowance.lotDate || '',
        partyName: allowance.partyName || '',
        variety: allowance.variety || '',
        grossWeight: allowance.grossWeight || '',
        tareWeight: allowance.tareWeight || '',
        netWeight: allowance.netWeight || '',
        candyRate: allowance.candyRate || '',
        quintalRate: allowance.quintalRate || '',
        ratePerKg: allowance.ratePerKg || '',
        actualValue: allowance.actualValue || '',
        allowanceRate: allowance.allowanceRate || '',
        debitValue: allowance.debitValue || '',
        debitLedger: allowance.debitLedger || '',
        remarks: allowance.remarks || ''
      });
      
      setLotSearch(allowance.lotNo || '');
      setShowEditModal(true);
      
    } catch (error) {
      console.error('Error loading allowance for edit:', error);
      setError('Failed to load allowance details for editing');
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedAllowance) {
      setError('No allowance selected for update');
      return;
    }

    setSubmitting(true);

    try {
      await lotAllowanceService.update(selectedAllowance.id, formData);
      
      setSuccess('Lot allowance updated successfully!');
      
      // Reset and close
      setTimeout(() => {
        setShowEditModal(false);
        fetchAllowances();
        resetForm();
      }, 2000);
      
    } catch (err) {
      console.error('Error updating allowance:', err);
      setError(err.response?.data?.message || 'Failed to update lot allowance');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id, allowanceNo) => {
    if (!window.confirm(`Are you sure you want to delete allowance #${allowanceNo}?`)) {
      return;
    }

    try {
      await lotAllowanceService.delete(id);
      setSuccess('Lot allowance deleted successfully!');
      fetchAllowances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete lot allowance');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      allowanceNo: '',
      allowanceDate: new Date().toISOString().split('T')[0],
      inwardLotId: '',
      lotNo: '',
      lotDate: '',
      partyName: '',
      variety: '',
      grossWeight: '',
      tareWeight: '',
      netWeight: '',
      candyRate: '',
      quintalRate: '',
      ratePerKg: '',
      actualValue: '',
      allowanceRate: '',
      debitValue: '',
      debitLedger: '',
      remarks: ''
    });
    setSelectedLot(null);
    setLotSearch('');
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    fetchNextAllowanceNo();
    setShowCreateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).toUpperCase();
  };

  // Filter allowances based on search
  const filteredAllowances = allowances.filter(allowance => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (allowance.allowanceNo?.toString().includes(searchLower)) ||
      (allowance.lotNo?.toLowerCase().includes(searchLower)) ||
      (allowance.partyName?.toLowerCase().includes(searchLower))
    );
  });

  // Filter lots based on search
  const filteredLots = lots.filter(lot => {
    if (!lotSearch.trim()) return true;
    const searchLower = lotSearch.toLowerCase();
    return (
      (lot.lotNo && lot.lotNo.toLowerCase().includes(searchLower))
    );
  });

  // Export allowances
  const exportAllowances = () => {
    try {
      const headers = [
        'Allowance No',
        'Date',
        'Lot No',
        'Party Name',
        'Variety',
        'Gross Wt',
        'Tare Wt',
        'Net Wt',
        'Candy Rate',
        'Rate/Kg',
        'Actual Value',
        'Allowance Rate',
        'Debit Value'
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," +
        headers.join(',') + '\n' +
        filteredAllowances.map(a => {
          return [
            a.allowanceNo || '',
            `"${formatDate(a.allowanceDate)}"`,
            `"${a.lotNo || ''}"`,
            `"${a.partyName || ''}"`,
            `"${a.variety || ''}"`,
            a.grossWeight || 0,
            a.tareWeight || 0,
            a.netWeight || 0,
            a.candyRate || 0,
            a.ratePerKg || 0,
            a.actualValue || 0,
            a.allowanceRate || 0,
            a.debitValue || 0
          ].join(',');
        }).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lot-allowances-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Allowances exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export allowances');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Lot Allowance [ Less ]</h1>
            <p className="text-gray-600">To Add, Modify Lot Allowance details.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            Add New Allowance
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">✕</button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">✕</button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by allowance no, lot no, or party name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportAllowances}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchAllowances}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Allowances Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lot Allowances ({filteredAllowances.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading allowances...</p>
          </div>
        ) : filteredAllowances.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📋</span>
            <p className="text-gray-600 mb-2">No allowances found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first allowance
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ALLOWANCE NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LOT DETAILS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NET WEIGHT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ALLOWANCE RATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEBIT VALUE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAllowances.map((allowance, index) => (
                  <tr key={allowance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{allowance.allowanceNo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(allowance.allowanceDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {allowance.lotNo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {allowance.partyName} | {allowance.variety}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {allowance.netWeight} kg
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        ₹{allowance.allowanceRate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-red-600">
                        ₹{allowance.debitValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(allowance.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(allowance.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(allowance.id, allowance.allowanceNo)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
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

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredAllowances.length} of {allowances.length} allowances
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Lot Allowance</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowance No.
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      {allowanceNoLoading ? (
                        <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                          <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                          <span className="text-gray-500">Generating...</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="allowanceNo"
                          value={formData.allowanceNo}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Allowance number"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowance Date
                    </label>
                    <input
                      type="date"
                      name="allowanceDate"
                      value={formData.allowanceDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Lot Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lot No *
                  </label>
                  <div className="relative" ref={lotRef}>
                    <input
                      type="text"
                      value={lotSearch}
                      onChange={(e) => {
                        setLotSearch(e.target.value);
                        setShowLotDropdown(true);
                      }}
                      onFocus={() => setShowLotDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search lot number..."
                      required
                    />
                    {selectedLot && (
                      <button
                        type="button"
                        onClick={clearLotSelection}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                    
                    {showLotDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {lotsLoading ? (
                          <div className="p-3 text-center text-gray-500">Loading lots...</div>
                        ) : filteredLots.length === 0 ? (
                          <div className="p-3 text-center text-gray-500">No lots found</div>
                        ) : (
                          filteredLots.map((lot) => (
                            <div
                              key={lot.id}
                              onClick={() => handleLotSelect(lot.id)}
                              className="p-3 cursor-pointer hover:bg-gray-50 border-b"
                            >
                              <div className="font-medium">{lot.lotNo}</div>
                              <div className="text-xs text-gray-500">
                                {lot.supplier} | {lot.variety}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedLot && (
                  <>
                    {/* Lot Details Display */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-gray-500">Lot Date</label>
                            <p className="font-medium">{formatDate(formData.lotDate)}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Party Name</label>
                            <p className="font-medium">{formData.partyName}</p>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Variety</label>
                            <p className="font-medium">{formData.variety}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500">Gross Weight</label>
                              <p className="font-medium">{formData.grossWeight} kg</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Tare Weight</label>
                              <p className="font-medium">{formData.tareWeight} kg</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Net Weight</label>
                              <p className="font-medium">{formData.netWeight} kg</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-gray-500">Candy Rate</label>
                            <p className="font-medium">₹{formData.candyRate}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500">Rate/Kg</label>
                              <p className="font-medium text-green-600">₹{formData.ratePerKg || '0'}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Quintal Rate</label>
                              <p className="font-medium text-green-600">₹{formData.quintalRate || '0'}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Actual Value</label>
                            <p className="font-medium text-green-600">₹{formData.actualValue || '0'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Allowance Input */}
                    <div className="mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Allowance Rate (₹) *
                          </label>
                          <input
                            type="number"
                            name="allowanceRate"
                            value={formData.allowanceRate}
                            onChange={handleInputChange}
                            onWheel={(e) => e.target.blur()}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter allowance rate"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Debit Note Value
                          </label>
                          <input
                            type="number"
                            name="debitValue"
                            value={formData.debitValue}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg text-red-600 font-semibold"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Debit Value = Net Weight × (Allowance Rate / 355.62)
                      </p>
                    </div>

                    {/* Debit Ledger */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Debit Ledger
                      </label>
                      <input
                        type="text"
                        name="debitLedger"
                        value={formData.debitLedger}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter debit ledger"
                      />
                    </div>

                    {/* Remarks */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter remarks (optional)"
                      />
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !selectedLot}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Allowance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAllowance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Lot Allowance Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Allowance No.</p>
                    <p className="text-lg font-semibold">#{selectedAllowance.allowanceNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Allowance Date</p>
                    <p className="text-lg">{formatDate(selectedAllowance.allowanceDate)}</p>
                  </div>
                </div>

                {/* Lot Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Lot Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Lot No</p>
                      <p className="font-medium">{selectedAllowance.lotNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lot Date</p>
                      <p>{formatDate(selectedAllowance.lotDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Party Name</p>
                      <p>{selectedAllowance.partyName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variety</p>
                      <p>{selectedAllowance.variety}</p>
                    </div>
                  </div>
                </div>

                {/* Weights */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Gross Weight</p>
                    <p className="font-medium">{selectedAllowance.grossWeight} kg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Tare Weight</p>
                    <p className="font-medium">{selectedAllowance.tareWeight} kg</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Net Weight</p>
                    <p className="font-medium">{selectedAllowance.netWeight} kg</p>
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Candy Rate</p>
                    <p className="font-medium">₹{selectedAllowance.candyRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rate/Kg</p>
                    <p className="font-medium">₹{selectedAllowance.ratePerKg}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quintal Rate</p>
                    <p className="font-medium">₹{selectedAllowance.quintalRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Actual Value</p>
                    <p className="font-medium">₹{selectedAllowance.actualValue}</p>
                  </div>
                </div>

                {/* Allowance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Allowance Rate</p>
                    <p className="text-xl font-semibold text-blue-600">₹{selectedAllowance.allowanceRate}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Debit Note Value</p>
                    <p className="text-xl font-semibold text-red-600">₹{selectedAllowance.debitValue}</p>
                  </div>
                </div>

                {/* Debit Ledger */}
                {selectedAllowance.debitLedger && (
                  <div>
                    <p className="text-sm text-gray-500">Debit Ledger</p>
                    <p>{selectedAllowance.debitLedger}</p>
                  </div>
                )}

                {/* Remarks */}
                {selectedAllowance.remarks && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p>{selectedAllowance.remarks}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedAllowance.id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Edit Lot Allowance</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                {/* Header Section - Read-only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowance No.
                    </label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      #{formData.allowanceNo}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowance Date
                    </label>
                    <input
                      type="date"
                      name="allowanceDate"
                      value={formData.allowanceDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Lot Details - Read-only */}
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-500">Lot No</label>
                      <p className="font-medium">{formData.lotNo}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Lot Date</label>
                      <p className="font-medium">{formatDate(formData.lotDate)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Party Name</label>
                      <p className="font-medium">{formData.partyName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Variety</label>
                      <p className="font-medium">{formData.variety}</p>
                    </div>
                  </div>
                </div>

                {/* Weights - Read-only */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gross Weight</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {formData.grossWeight} kg
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tare Weight</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {formData.tareWeight} kg
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Net Weight</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                      {formData.netWeight} kg
                    </div>
                  </div>
                </div>

                {/* Candy Rate - Read-only */}
                <div className="mb-8">
                  <label className="block text-xs text-gray-500 mb-1">Candy Rate</label>
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                    ₹{formData.candyRate}
                  </div>
                </div>

                {/* Calculated Values - Read-only */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rate/Kg</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-green-600">
                      ₹{formData.ratePerKg}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Quintal Rate</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-green-600">
                      ₹{formData.quintalRate}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Actual Value</label>
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-green-600">
                      ₹{formData.actualValue}
                    </div>
                  </div>
                </div>

                {/* Editable Allowance Fields */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allowance Rate (₹) *
                      </label>
                      <input
                        type="number"
                        name="allowanceRate"
                        value={formData.allowanceRate}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Debit Note Value
                      </label>
                      <input
                        type="number"
                        name="debitValue"
                        value={formData.debitValue}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg text-red-600 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Debit Ledger */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debit Ledger
                  </label>
                  <input
                    type="text"
                    name="debitLedger"
                    value={formData.debitLedger}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Remarks */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Update Allowance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotAllowancePage;