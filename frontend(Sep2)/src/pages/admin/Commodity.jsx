import React, { useState, useEffect } from 'react';
import commodityService from '../../services/admin1/master/commodityService';

const Commodity = () => {
  // States
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState(null);
  const [viewingCommodity, setViewingCommodity] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    commodityCode: '',
    commodityName: ''
  });

  // Load commodities on component mount
  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await commodityService.getAll();
      
      // Extract commodities array from response (response.data.commodities)
      const commoditiesData = Array.isArray(response) ? response : [];
      
      setCommodities(commoditiesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load commodities');
      setCommodities([]);
      setLoading(false);
    }
  };

  // Filter commodities based on search
  const filteredCommodities = (() => {
    const commoditiesArray = Array.isArray(commodities) ? commodities : [];
    
    return commoditiesArray.filter(commodity => {
      if (!commodity || typeof commodity !== 'object') return false;
      
      const commodityCode = commodity.commodityCode ? commodity.commodityCode.toString() : '';
      const commodityName = commodity.commodityName || '';
      
      return searchTerm === '' || 
        commodityCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commodityName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commodityCode' ? (value === '' ? '' : parseInt(value) || value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCommodity) {
        // Update existing commodity
        await commodityService.update(editingCommodity.id, formData);
        setSuccess('Commodity updated successfully!');
      } else {
        // Create new commodity
        await commodityService.create(formData);
        setSuccess('Commodity created successfully!');
      }
      
      // Refresh commodities list
      fetchCommodities();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (commodity) => {
    if (!commodity || !commodity.id) {
      setError('Invalid commodity data');
      return;
    }
    
    setEditingCommodity(commodity);
    setFormData({
      commodityCode: commodity.commodityCode || '',
      commodityName: commodity.commodityName || ''
    });
    setShowModal(true);
  };

  const handleView = (commodity) => {
    if (!commodity || !commodity.id) {
      setError('Invalid commodity data');
      return;
    }
    
    setViewingCommodity(commodity);
    setShowViewModal(true);
  };

  const handleDelete = async (id, commodityName) => {
    if (!id || !commodityName) {
      setError('Invalid commodity data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete commodity "${commodityName}"?`)) {
      return;
    }

    try {
      await commodityService.delete(id);
      setSuccess('Commodity deleted successfully!');
      fetchCommodities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete commodity');
    }
  };

  const resetForm = () => {
    setFormData({
      commodityCode: '',
      commodityName: ''
    });
    setEditingCommodity(null);
    setViewingCommodity(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
    const nextCode = await commodityService.getNextCode();
    setFormData(prev => ({
      ...prev,
      commodityCode: nextCode
    }));
  } catch (err) {
    setError("Failed to generate commodity code");
  }

    setShowModal(true);
  };

  const exportCommodities = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Commodity Name\n" +
        filteredCommodities.map(c => 
          `${c.commodityCode},${c.commodityName}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "commodities.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Commodities exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export commodities');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Format code display
  const formatCode = (code) => {
    if (!code && code !== 0) return 'N/A';
    return code.toString().padStart(4, '0');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Commodity Management</h1>
            <p className="text-gray-600">Manage all commodities and their details</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Commodity
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

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search commodities by code or name..."
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
              onClick={exportCommodities}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchCommodities}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Commodities Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Commodities ({filteredCommodities.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredCommodities.length} of {commodities.length} commodities
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading commodities...</p>
          </div>
        ) : filteredCommodities.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No commodities found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first commodity
              </button>
            )}
          </div>
        ) : (
          /* Commodities Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commodity Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommodities.map((commodity) => (
                  <tr key={commodity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {formatCode(commodity.commodityCode)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {commodity.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🛍️</span>
                        <div className="text-sm font-medium text-gray-900">{commodity.commodityName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(commodity.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(commodity.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(commodity.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(commodity.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(commodity)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(commodity)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(commodity.id, commodity.commodityName)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        >
                          <span className="mr-1">🗑️</span>
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
      </div>

      {/* Create/Edit Commodity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingCommodity ? 'Edit Commodity' : 'Add New Commodity'}
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
                  {/* Commodity Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commodity Code *
                      <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      <input
                        type="number"
                        name="commodityCode"
                        value={formData.commodityCode}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique commodity code"
                        disabled
                      />
                    </div>
                    {editingCommodity && (
                      <p className="mt-1 text-xs text-gray-500">Commodity code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Commodity Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commodity Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🛍️</span>
                      <input
                        type="text"
                        name="commodityName"
                        value={formData.commodityName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter commodity name"
                      />
                    </div>
                  </div>

                  {/* Display existing commodity info when editing */}
                  {editingCommodity && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Commodity Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingCommodity.createdAt ? new Date(editingCommodity.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingCommodity.updatedAt ? new Date(editingCommodity.updatedAt).toLocaleString() : 'N/A'}
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    {editingCommodity ? 'Update Commodity' : 'Create Commodity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Commodity Details Modal */}
      {showViewModal && viewingCommodity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Commodity Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Commodity Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📦</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Commodity Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {formatCode(viewingCommodity.commodityCode)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingCommodity.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Commodity Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🛍️</span>
                      <span className="text-lg font-medium text-gray-900">{viewingCommodity.commodityName}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingCommodity.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCommodity.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingCommodity.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCommodity.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingCommodity);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Commodity
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

export default Commodity;