// frontend/src/pages/admin/transaction-cotton/LotRejectedManagement.jsx
import React, { useState, useEffect } from 'react';
import lotRejectedService from '../../services/admin1/transaction-cotton/lotRejectedService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const LotRejectedManagement = () => {
  // States
  const [lots, setLots] = useState([]);
  const [rejectedLots, setRejectedLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedLotDetails, setSelectedLotDetails] = useState(null);
  const [rejectionStatus, setRejectionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLots, setFetchingLots] = useState(false);
  const [fetchingRejected, setFetchingRejected] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRejected, setSelectedRejected] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    inwardLotId: '',
    isRejected: false,
    remarks: ''
  });

  // Load data on mount
  useEffect(() => {
    fetchAllLots();
    fetchRejectedLots();
  }, []);

  // Fetch all lots
  const fetchAllLots = async () => {
    setFetchingLots(true);
    try {
      const response = await inwardLotService.getAll();
      const lotsData = Array.isArray(response) ? response : [];
      setLots(lotsData);
    } catch (err) {
      console.error('Failed to load lots:', err);
      setError('Failed to load lots');
    } finally {
      setFetchingLots(false);
    }
  };

  // Fetch rejected lots
  const fetchRejectedLots = async () => {
    setFetchingRejected(true);
    try {
      const response = await lotRejectedService.getAll();
      const rejectedData = Array.isArray(response) ? response : [];
      
      // Enhance rejected lots with lot details
      const enhancedRejected = await Promise.all(
        rejectedData.map(async (rej) => {
          try {
            const lotDetails = await inwardLotService.getById(rej.inwardLotId);
            return {
              ...rej,
              lotNo: lotDetails.lotNo,
              supplier: lotDetails.supplier,
              variety: lotDetails.variety,
              nettWeight: lotDetails.nettWeight,
              qty: lotDetails.qty
            };
          } catch (err) {
            return {
              ...rej,
              lotNo: 'N/A',
              supplier: 'N/A',
              variety: 'N/A'
            };
          }
        })
      );
      
      setRejectedLots(enhancedRejected);
    } catch (err) {
      console.error('Failed to load rejected lots:', err);
      setError('Failed to load rejected lots');
    } finally {
      setFetchingRejected(false);
    }
  };

  // When lot is selected → fetch full lot details and rejection status
  const handleLotSelect = async (lotId) => {
    if (!lotId) {
      setSelectedLot(null);
      setSelectedLotDetails(null);
      setRejectionStatus(null);
      setFormData({ inwardLotId: '', isRejected: false, remarks: '' });
      return;
    }

    const lot = lots.find(l => l.id === Number(lotId));
    setSelectedLot(lot);
    setFormData(prev => ({ ...prev, inwardLotId: lotId, isRejected: false }));

    try {
      // Fetch full lot details
      const lotDetails = await inwardLotService.getById(lotId);
      setSelectedLotDetails(lotDetails);
      
      // Check rejection status
      const status = await lotRejectedService.getByLotId(lotId);
      setRejectionStatus(status);
      if (status) {
        setFormData(prev => ({ 
          ...prev, 
          isRejected: status.isRejected,
          remarks: status.remarks || ''
        }));
      }
    } catch (err) {
      console.error('Failed to fetch lot details:', err);
      setError('Failed to load lot details');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Save rejection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.inwardLotId) {
      setError('Please select a lot');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        inwardLotId: parseInt(formData.inwardLotId),
        isRejected: formData.isRejected,
        remarks: formData.remarks || null
      };
      
      const response = await lotRejectedService.toggleRejection(payload);
      setSuccess(response.message || 'Lot rejection status updated successfully');
      
      // Refresh data
      fetchRejectedLots();
      
      // Close modal and reset
      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update rejection status');
    } finally {
      setLoading(false);
    }
  };

  // View rejection details
  const handleView = (rejected) => {
    setSelectedRejected(rejected);
    setShowViewModal(true);
  };

  // Un-reject (delete rejection record)
  const handleUnReject = async (id, lotNo) => {
    if (!window.confirm(`Are you sure you want to un-reject lot "${lotNo}"?`)) return;

    try {
      await lotRejectedService.unReject(id);
      setSuccess('Lot un-rejected successfully');
      fetchRejectedLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to un-reject');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      inwardLotId: '',
      isRejected: false,
      remarks: ''
    });
    setSelectedLot(null);
    setSelectedLotDetails(null);
    setRejectionStatus(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format number
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toFixed(decimals);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Lot Rejection Management</h1>
            <p className="text-gray-600">Manage rejected lots - View Only</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            Mark Lot Rejected
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
                placeholder="Search rejected lots by lot number or supplier..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {/* Implement search if needed */}}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchAllLots();
                fetchRejectedLots();
              }}
              disabled={fetchingLots || fetchingRejected}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${fetchingLots || fetchingRejected ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Rejected Lots Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Rejected Lots ({rejectedLots.length})</h2>
        </div>

        {fetchingRejected ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading rejected lots...</p>
          </div>
        ) : rejectedLots.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🚫</span>
            <p className="text-gray-600 mb-2">No rejected lots found</p>
            <button
              onClick={openCreateModal}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark a lot as rejected
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LOT NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SUPPLIER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VARIETY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QTY / WEIGHT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REJECTED ON
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REMARKS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rejectedLots.map((rej) => (
                  <tr key={rej.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {rej.lotNo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {rej.supplier || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {rej.variety || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {rej.qty || 0} bales
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(rej.nettWeight)} kg
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(rej.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {rej.remarks || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(rej)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUnReject(rej.id, rej.lotNo)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="Un-Reject"
                        >
                          Un-Reject
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
            Showing {rejectedLots.length} rejected lots
          </div>
        </div>
      </div>

      {/* Create/Edit Rejection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Mark Lot as Rejected</h3>
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

              <form onSubmit={handleSubmit}>
                {/* Lot Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lot *
                  </label>
                  <select
                    value={formData.inwardLotId}
                    onChange={(e) => handleLotSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Choose a Lot --</option>
                    {lots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        {lot.lotNo} - {lot.supplier || 'Unknown'} ({lot.qty || 0} bales)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lot Details (when selected) */}
                {selectedLotDetails && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Lot Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Lot No</label>
                        <p className="font-medium">{selectedLotDetails.lotNo}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Lot Date</label>
                        <p className="font-medium">{formatDate(selectedLotDetails.lotDate)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Supplier</label>
                        <p className="font-medium">{selectedLotDetails.supplier || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Variety</label>
                        <p className="font-medium">{selectedLotDetails.variety || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Station</label>
                        <p className="font-medium">{selectedLotDetails.station || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Quantity</label>
                        <p className="font-medium">{selectedLotDetails.qty || 0} bales</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Nett Weight</label>
                        <p className="font-medium">{formatNumber(selectedLotDetails.nettWeight)} kg</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Candy Rate</label>
                        <p className="font-medium">₹{formatNumber(selectedLotDetails.candyRate, 2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Checkbox */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRejected"
                      name="isRejected"
                      checked={formData.isRejected}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="isRejected" className="ml-3 text-lg font-medium text-gray-900">
                      Mark as Rejected
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 ml-8">
                    Check this box to mark the lot as rejected
                  </p>
                </div>

                {/* Remarks */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rejection remarks if any..."
                  />
                </div>

                {/* Current Status */}
                {rejectionStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    rejectionStatus.isRejected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm ${
                      rejectionStatus.isRejected ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {rejectionStatus.isRejected ? (
                        <>This lot is currently <strong>REJECTED</strong> (marked on {formatDate(rejectionStatus.createdAt)})</>
                      ) : (
                        <>This lot is currently <strong>NOT REJECTED</strong></>
                      )}
                    </p>
                    {rejectionStatus.remarks && (
                      <p className="text-xs text-gray-600 mt-1">
                        Remarks: {rejectionStatus.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
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
                    disabled={loading || !formData.inwardLotId}
                    className={`px-6 py-2 rounded-lg font-medium text-white ${
                      loading || !formData.inwardLotId
                        ? 'bg-gray-400 cursor-not-allowed'
                        : formData.isRejected
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Saving...' : formData.isRejected ? 'Mark as Rejected' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Rejection Details Modal */}
      {showViewModal && selectedRejected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Rejection Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Lot Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">Lot Number</p>
                  <p className="text-xl font-bold text-gray-900">{selectedRejected.lotNo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Supplier</p>
                    <p className="font-medium">{selectedRejected.supplier || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Variety</p>
                    <p className="font-medium">{selectedRejected.variety || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-medium">{selectedRejected.qty || 0} bales</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Nett Weight</p>
                    <p className="font-medium">{formatNumber(selectedRejected.nettWeight)} kg</p>
                  </div>
                </div>

                {/* Rejection Info */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-xs text-red-500">Rejected On</p>
                  <p className="text-lg font-semibold text-red-700">
                    {formatDate(selectedRejected.createdAt)}
                  </p>
                  <p className="text-xs text-red-500 mt-2">
                    {selectedRejected.createdAt ? new Date(selectedRejected.createdAt).toLocaleTimeString() : ''}
                  </p>
                </div>

                {/* Remarks */}
                {selectedRejected.remarks && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p className="text-gray-700">{selectedRejected.remarks}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleUnReject(selectedRejected.id, selectedRejected.lotNo);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Un-Reject Lot
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

export default LotRejectedManagement;