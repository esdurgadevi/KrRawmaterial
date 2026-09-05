import React, { useState, useEffect } from 'react';
import fibreService from '../../services/admin1/master/fibreService';
import commodityService from '../../services/admin1/master/commodityService';

const Fibre = () => {
  // States
  const [fibres, setFibres] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commodityLoading, setCommodityLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingFibre, setEditingFibre] = useState(null);
  const [viewingFibre, setViewingFibre] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    commodityId: ''
  });

  // Load fibres and commodities on component mount
  useEffect(() => {
    fetchFibres();
    fetchCommodities();
  }, []);

  const fetchFibres = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fibreService.getAll();
      
      // Extract fibres array from response
      const fibresData = Array.isArray(response) ? response : [];
      
      setFibres(fibresData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load fibres');
      setFibres([]);
      setLoading(false);
    }
  };

  const fetchCommodities = async () => {
    setCommodityLoading(true);
    try {
      const response = await commodityService.getAll();
      const commoditiesData = Array.isArray(response) ? response : [];
      setCommodities(commoditiesData);
    } catch (err) {
      console.error('Failed to load commodities:', err);
    } finally {
      setCommodityLoading(false);
    }
  };

  // Filter fibres based on search
  const filteredFibres = (() => {
    const fibresArray = Array.isArray(fibres) ? fibres : [];
    
    return fibresArray.filter(fibre => {
      if (!fibre || typeof fibre !== 'object') return false;
      
      const code = fibre.code ? fibre.code.toString() : '';
      const name = fibre.name || '';
      
      return searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase());
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

    // Validate commodity selection
    if (!formData.commodityId) {
      setError('Please select a commodity');
      return;
    }

    try {
      if (editingFibre) {
        // Update existing fibre
        await fibreService.update(editingFibre.id, formData);
        setSuccess('Fibre updated successfully!');
      } else {
        // Create new fibre
        await fibreService.create(formData);
        setSuccess('Fibre created successfully!');
      }
      
      // Refresh fibres list
      fetchFibres();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (fibre) => {
    if (!fibre || !fibre.id) {
      setError('Invalid fibre data');
      return;
    }
    
    setEditingFibre(fibre);
    setFormData({
      code: fibre.code || '',
      name: fibre.name || '',
      commodityId: fibre.commodityId || ''
    });
    setShowModal(true);
  };

  const handleView = (fibre) => {
    if (!fibre || !fibre.id) {
      setError('Invalid fibre data');
      return;
    }
    
    setViewingFibre(fibre);
    setShowViewModal(true);
  };

  const handleDelete = async (id, fibreName) => {
    if (!id || !fibreName) {
      setError('Invalid fibre data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete fibre "${fibreName}"?`)) {
      return;
    }

    try {
      await fibreService.delete(id);
      setSuccess('Fibre deleted successfully!');
      fetchFibres();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete fibre');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      commodityId: ''
    });
    setEditingFibre(null);
    setViewingFibre(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
    const nextCode = await fibreService.getNextCode();
    setFormData((prev) => ({
      ...prev,
      code: nextCode,
    }));
  } catch (err) {
    setError("Failed to generate fibre code");
  }

    setShowModal(true);
  };

  const exportFibres = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Fibre Name,Commodity\n" +
        filteredFibres.map(f => {
          const commodity = commodities.find(c => c.id === f.commodityId);
          return `${f.code},${f.name},${commodity ? commodity.commodityName : 'N/A'}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "fibres.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Fibres exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export fibres');
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

  // Get commodity name by ID
  const getCommodityName = (commodityId) => {
    const commodity = commodities.find(c => c.id === commodityId);
    return commodity ? commodity.commodityName : 'Unknown Commodity';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Fibre Management</h1>
            <p className="text-gray-600">Manage all fibre types and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Fibre
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
                placeholder="Search fibres by code or name..."
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
              onClick={exportFibres}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchFibres();
                fetchCommodities();
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

      {/* Fibres Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Fibres ({filteredFibres.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredFibres.length} of {fibres.length} fibres
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading fibres...</p>
          </div>
        ) : filteredFibres.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">💾</span>
            <p className="text-gray-600 mb-2">No fibres found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first fibre
              </button>
            )}
          </div>
        ) : (
          /* Fibres Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FIBRE NAME
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LAST UPDATED
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFibres.map((fibre) => (
                  <tr key={fibre.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            #{formatCode(fibre.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {fibre.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏷️</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{fibre.name}</div>
                          <div className="text-xs text-gray-500">
                            Commodity: {getCommodityName(fibre.commodityId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(fibre.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(fibre.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(fibre.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(fibre.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(fibre)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(fibre)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(fibre.id, fibre.name)}
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

      {/* Create/Edit Fibre Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingFibre ? 'Edit Fibre' : 'Add New Fibre'}
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
                  {/* Fibre Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fibre Code *
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
                        placeholder="Enter unique fibre code"
                        disabled
                      />
                    </div>
                    {editingFibre && (
                      <p className="mt-1 text-xs text-gray-500">Fibre code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Fibre Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fibre Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏷️</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter fibre name"
                      />
                    </div>
                  </div>

                  {/* Commodity Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commodity *
                      <span className="text-xs text-gray-500 ml-1">(Associated commodity)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🛍️</span>
                      <select
                        name="commodityId"
                        value={formData.commodityId}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        disabled={commodityLoading}
                      >
                        <option value="">Select a commodity...</option>
                        {commodities.map((commodity) => (
                          <option key={commodity.id} value={commodity.id}>
                            {commodity.commodityName} (Code: {formatCode(commodity.commodityCode)})
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                    </div>
                    {commodityLoading && (
                      <p className="mt-1 text-xs text-gray-500">Loading commodities...</p>
                    )}
                    {commodities.length === 0 && !commodityLoading && (
                      <p className="mt-1 text-xs text-red-500">No commodities available. Please create a commodity first.</p>
                    )}
                  </div>

                  {/* Display existing fibre info when editing */}
                  {editingFibre && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fibre Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingFibre.createdAt ? new Date(editingFibre.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingFibre.updatedAt ? new Date(editingFibre.updatedAt).toLocaleString() : 'N/A'}
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
                    disabled={commodityLoading || commodities.length === 0}
                  >
                    {editingFibre ? 'Update Fibre' : 'Create Fibre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Fibre Details Modal */}
      {showViewModal && viewingFibre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Fibre Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Fibre Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">💾</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Fibre Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          #{formatCode(viewingFibre.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingFibre.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Fibre Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏷️</span>
                      <span className="text-lg font-medium text-gray-900">{viewingFibre.name}</span>
                    </div>
                  </div>

                  {/* Commodity Information - NEW SECTION */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Commodity Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">🛍️</span>
                        <span className="font-medium text-gray-900">
                          {getCommodityName(viewingFibre.commodityId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Commodity ID:</span>
                          <div className="font-medium">{viewingFibre.commodityId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Commodity Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const commodity = commodities.find(c => c.id === viewingFibre.commodityId);
                              return commodity ? formatCode(commodity.commodityCode) : 'N/A';
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingFibre.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingFibre.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingFibre.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingFibre.updatedAt)}
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
                      handleEdit(viewingFibre);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Fibre
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

export default Fibre;