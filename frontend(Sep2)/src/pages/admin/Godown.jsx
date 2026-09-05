import React, { useState, useEffect } from 'react';
import godownService from '../../services/admin1/master/godownService';

const Godown = () => {
  // States
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGodown, setEditingGodown] = useState(null);
  const [viewingGodown, setViewingGodown] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    godownName: '',
    locationName: '',
    type: '',
    address: '',
    shortAddress: ''
  });
  
  // Unique types for filtering
  const [types, setTypes] = useState([]);

  // Load godowns on component mount
  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await godownService.getAll();
      
      // Extract godowns array from response (response.data.godowns)
      const godownsData = Array.isArray(response) ? response : [];
      
      setGodowns(godownsData);
      
      // Extract unique types for filter
      if (godownsData.length > 0) {
        const uniqueTypes = [...new Set(godownsData.map(godown => 
          godown.type || ''
        ).filter(type => type && type.trim()))].sort();
        setTypes(uniqueTypes);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load godowns');
      setGodowns([]);
      setTypes([]);
      setLoading(false);
    }
  };

  // Filter godowns based on search and filter
  const filteredGodowns = (() => {
    const godownsArray = Array.isArray(godowns) ? godowns : [];
    
    return godownsArray.filter(godown => {
      if (!godown || typeof godown !== 'object') return false;
      
      const godownCode = godown.code ? godown.code.toString() : '';
      const godownName = godown.godownName || '';
      const locationName = godown.locationName || '';
      const type = godown.type || '';
      const address = godown.address || '';
      
      const matchesSearch = searchTerm === '' || 
        godownCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        godownName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === '' || type === filterType;
      
      return matchesSearch && matchesType;
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingGodown) {
        // Update existing godown
        await godownService.update(editingGodown.id, formData);
        setSuccess('Godown updated successfully!');
      } else {
        // Create new godown
        await godownService.create(formData);
        setSuccess('Godown created successfully!');
      }
      
      // Refresh godowns list
      fetchGodowns();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (godown) => {
    if (!godown || !godown.id) {
      setError('Invalid godown data');
      return;
    }
    
    setEditingGodown(godown);
    setFormData({
      code: godown.code || '',
      godownName: godown.godownName || '',
      locationName: godown.locationName || '',
      type: godown.type || '',
      address: godown.address || '',
      shortAddress: godown.shortAddress || ''
    });
    setShowModal(true);
  };

  const handleView = (godown) => {
    if (!godown || !godown.id) {
      setError('Invalid godown data');
      return;
    }
    
    setViewingGodown(godown);
    setShowViewModal(true);
  };

  const handleDelete = async (id, godownName) => {
    if (!id || !godownName) {
      setError('Invalid godown data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete godown "${godownName}"?`)) {
      return;
    }

    try {
      await godownService.delete(id);
      setSuccess('Godown deleted successfully!');
      fetchGodowns();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete godown');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      godownName: '',
      locationName: '',
      type: '',
      address: '',
      shortAddress: ''
    });
    setEditingGodown(null);
    setViewingGodown(null);
  };

  const openCreateModal = async () => {
    resetForm();
    
  try {
    const nextCode = await godownService.getNextCode();
    setFormData((prev) => ({
      ...prev,
      code: nextCode,
    }));
  } catch (error) {
    setError("Failed to generate godown code");
  }

    setShowModal(true);
  };

  const exportGodowns = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Godown Name,Location,Type,Address,Short Address\n" +
        filteredGodowns.map(g => 
          `${g.code},${g.godownName},${g.locationName},${g.type},${g.address},${g.shortAddress || ''}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "godowns.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Godowns exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export godowns');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Godown Management</h1>
            <p className="text-gray-600">Manage all godowns and their locations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Godown
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

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search godowns by code, name, location, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚙️</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Types</option>
                {Array.isArray(types) && types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              Clear Filters
            </button>
            <button
              onClick={exportGodowns}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchGodowns}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Godowns Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Godowns ({filteredGodowns.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredGodowns.length} of {godowns.length} godowns
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading godowns...</p>
          </div>
        ) : filteredGodowns.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🏢</span>
            <p className="text-gray-600 mb-2">No godowns found</p>
            {searchTerm || filterType ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first godown
              </button>
            )}
          </div>
        ) : (
          /* Godowns Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Godown Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGodowns.map((godown) => (
                  <tr key={godown.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {formatCode(godown.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {godown.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏢</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{godown.godownName}</div>
                          {godown.shortAddress && (
                            <div className="text-xs text-gray-500">{godown.shortAddress}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2 text-xs">📍</span>
                          <div className="text-sm text-gray-900">{godown.locationName}</div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2 text-xs">📋</span>
                          <div className="text-xs text-gray-600">{godown.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(godown.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(godown.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(godown)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(godown)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(godown.id, godown.godownName)}
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

      {/* Create/Edit Godown Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingGodown ? 'Edit Godown' : 'Add New Godown'}
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
                  {/* Godown Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Godown Code *
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
                        placeholder="Enter unique godown code"
                        disabled
                      />
                    </div>
                    {editingGodown && (
                      <p className="mt-1 text-xs text-gray-500">Godown code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Godown Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Godown Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span>
                      <input
                        type="text"
                        name="godownName"
                        value={formData.godownName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter godown name"
                      />
                    </div>
                  </div>

                  {/* Location Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📍</span>
                      <input
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter location name"
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📋</span>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter godown type (e.g., Storage, Factory, Distribution)"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏠</span>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter complete address"
                      />
                    </div>
                  </div>

                  {/* Short Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Address (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💼</span>
                      <input
                        type="text"
                        name="shortAddress"
                        value={formData.shortAddress}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter short address for display"
                      />
                    </div>
                  </div>
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
                    {editingGodown ? 'Update Godown' : 'Create Godown'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Godown Details Modal */}
      {showViewModal && viewingGodown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Godown Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Godown Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">🏢</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Godown Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {formatCode(viewingGodown.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingGodown.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Godown Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏢</span>
                      <span className="text-lg font-medium text-gray-900">{viewingGodown.godownName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Location</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2 text-xs">📍</span>
                        <span className="text-sm text-gray-900">{viewingGodown.locationName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Type</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2 text-xs">📋</span>
                        <span className="text-sm text-gray-900">{viewingGodown.type}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Address</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start">
                        <span className="text-gray-400 mr-2">🏠</span>
                        <div className="text-sm text-gray-900 whitespace-pre-line">{viewingGodown.address}</div>
                      </div>
                    </div>
                  </div>

                  {viewingGodown.shortAddress && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Short Address</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">💼</span>
                        <span className="text-sm text-gray-900">{viewingGodown.shortAddress}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingGodown.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingGodown.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingGodown.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingGodown.updatedAt)}
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
                      handleEdit(viewingGodown);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Godown
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

export default Godown;