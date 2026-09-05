import React, { useState, useEffect } from 'react';
import packingTypeService from '../../services/admin1/master/packingTypeService';

const PackingType = () => {
  // States
  const [packingTypes, setPackingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPackingType, setEditingPackingType] = useState(null);
  const [viewingPackingType, setViewingPackingType] = useState(null);
  
  // Form state - updated with new fields
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    tareWeight: '',
    rate: ''
  });

  // Load packing types on component mount
  useEffect(() => {
    fetchPackingTypes();
  }, []);

  const fetchPackingTypes = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await packingTypeService.getAll();
      
      // Extract packing types array from response
      const packingTypesData = Array.isArray(response) ? response : [];
      
      setPackingTypes(packingTypesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load packing types');
      setPackingTypes([]);
      setLoading(false);
    }
  };

  // Filter packing types based on search
  const filteredPackingTypes = (() => {
    const packingTypesArray = Array.isArray(packingTypes) ? packingTypes : [];
    
    return packingTypesArray.filter(packingType => {
      if (!packingType || typeof packingType !== 'object') return false;
      
      const packingCode = packingType.code ? packingType.code.toString() : '';
      const packingName = packingType.name || '';
      
      return searchTerm === '' || 
        packingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packingName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : 
               (name === 'tareWeight' || name === 'rate') ? (value === '' ? '' : parseFloat(value) || value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Prepare data with proper number formatting
      const submitData = {
        code: parseInt(formData.code),
        name: formData.name,
        tareWeight: parseFloat(formData.tareWeight) || 0,
        rate: parseFloat(formData.rate) || 0
      };

      if (editingPackingType) {
        // Update existing packing type
        await packingTypeService.update(editingPackingType.id, submitData);
        setSuccess('Packing type updated successfully!');
      } else {
        // Create new packing type
        await packingTypeService.create(submitData);
        setSuccess('Packing type created successfully!');
      }
      
      // Refresh packing types list
      fetchPackingTypes();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (packingType) => {
    if (!packingType || !packingType.id) {
      setError('Invalid packing type data');
      return;
    }
    
    setEditingPackingType(packingType);
    setFormData({
      code: packingType.code || '',
      name: packingType.name || '',
      tareWeight: packingType.tareWeight || '',
      rate: packingType.rate || ''
    });
    setShowModal(true);
  };

  const handleView = (packingType) => {
    if (!packingType || !packingType.id) {
      setError('Invalid packing type data');
      return;
    }
    
    setViewingPackingType(packingType);
    setShowViewModal(true);
  };

  const handleDelete = async (id, packingTypeName) => {
    if (!id || !packingTypeName) {
      setError('Invalid packing type data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete packing type "${packingTypeName}"?`)) {
      return;
    }

    try {
      await packingTypeService.delete(id);
      setSuccess('Packing type deleted successfully!');
      fetchPackingTypes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete packing type');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      tareWeight: '',
      rate: ''
    });
    setEditingPackingType(null);
    setViewingPackingType(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
      const nextCode = await packingTypeService.getNextCode();
      setFormData((prev) => ({
        ...prev,
        code: nextCode,
      }));
    } catch (error) {
      setError("Failed to generate packing type code");
    }
    setShowModal(true);
  };

  const exportPackingTypes = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Packing Type Name,Tare Weight (kg),Rate (₹)\n" +
        filteredPackingTypes.map(p => 
          `${p.code},${p.name},${p.tareWeight || 0},${p.rate || 0}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "packing_types.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Packing types exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export packing types');
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

  // Format weight/rate display
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    return parseFloat(value).toFixed(2);
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Packing Type Management</h1>
            <p className="text-gray-600">Manage all packing types and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Packing Type
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
                placeholder="Search packing types by code or name..."
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
              onClick={exportPackingTypes}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchPackingTypes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Packing Types Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Packing Types ({filteredPackingTypes.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredPackingTypes.length} of {packingTypes.length} types
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading packing types...</p>
          </div>
        ) : filteredPackingTypes.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No packing types found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first packing type
              </button>
            )}
          </div>
        ) : (
          /* Packing Types Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packing Type Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tare Weight (kg)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate (₹)
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
                {filteredPackingTypes.map((packingType) => (
                  <tr key={packingType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {formatCode(packingType.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {packingType.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📦</span>
                        <div className="text-sm font-medium text-gray-900">{packingType.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatNumber(packingType.tareWeight)} kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">₹ {formatNumber(packingType.rate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(packingType.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(packingType.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(packingType.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(packingType.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(packingType)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(packingType)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(packingType.id, packingType.name)}
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

      {/* Create/Edit Packing Type Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingPackingType ? 'Edit Packing Type' : 'Add New Packing Type'}
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
                  {/* Packing Type Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Type Code *
                      <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      <input
                        type="number"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique packing type code"
                        disabled
                      />
                    </div>
                    {editingPackingType && (
                      <p className="mt-1 text-xs text-gray-500">Packing type code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Packing Type Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Type Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📦</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter packing type name (e.g., Box, Bag, Carton)"
                      />
                    </div>
                  </div>

                  {/* Tare Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tare Weight (kg) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                      <input
                        type="number"
                        name="tareWeight"
                        value={formData.tareWeight}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        required
                        step="0.01"
                        min="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter tare weight in kg"
                      />
                    </div>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                      <input
  type="number"
  name="rate"
  value={formData.rate}
  onChange={handleInputChange}
  onWheel={(e) => e.target.blur()}   // ✅ FIX
  required
  step="0.01"
  min="0"
  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="Enter rate in ₹"
/>
                    </div>
                  </div>

                  {/* Display existing packing type info when editing */}
                  {editingPackingType && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Packing Type Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingPackingType.createdAt ? new Date(editingPackingType.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingPackingType.updatedAt ? new Date(editingPackingType.updatedAt).toLocaleString() : 'N/A'}
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
                    {editingPackingType ? 'Update Type' : 'Create Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Packing Type Details Modal */}
      {showViewModal && viewingPackingType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Packing Type Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Packing Type Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📦</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Type Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {formatCode(viewingPackingType.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingPackingType.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Packing Type Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">📦</span>
                      <span className="text-lg font-medium text-gray-900">{viewingPackingType.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Tare Weight</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">⚖️</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(viewingPackingType.tareWeight)} kg
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Rate</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">💰</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹ {formatNumber(viewingPackingType.rate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingPackingType.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingPackingType.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingPackingType.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingPackingType.updatedAt)}
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
                      handleEdit(viewingPackingType);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Type
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

export default PackingType;