import React, { useState, useEffect, useRef } from 'react';
import varietyService from '../../services/admin1/master/varietyService';
import fibreService from '../../services/admin1/master/fibreService';

const Variety = () => {
  // States
  const [varieties, setVarieties] = useState([]);
  const [fibres, setFibres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fibreLoading, setFibreLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingVariety, setEditingVariety] = useState(null);
  const [viewingVariety, setViewingVariety] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    variety: '',
    fibreId: '',
    fibreName: ''
  });

  // Autocomplete states
  const [showFibreDropdown, setShowFibreDropdown] = useState(false);
  const [fibreSearch, setFibreSearch] = useState('');
  
  // Refs for closing dropdowns on click outside
  const fibreRef = useRef(null);

  // Load varieties and fibres on component mount
  useEffect(() => {
    fetchVarieties();
    fetchFibres();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fibreRef.current && !fibreRef.current.contains(event.target)) {
        setShowFibreDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchVarieties = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await varietyService.getAll();
      const varietiesData = Array.isArray(response) ? response : [];
      setVarieties(varietiesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load varieties');
      setVarieties([]);
      setLoading(false);
    }
  };

  const fetchFibres = async () => {
    setFibreLoading(true);
    try {
      const response = await fibreService.getAll();
      const fibresData = Array.isArray(response) ? response : [];
      setFibres(fibresData);
    } catch (err) {
      console.error('Failed to load fibres:', err);
    } finally {
      setFibreLoading(false);
    }
  };

  // Get fibre name by ID
  const getFibreName = (fibreId) => {
    const fibre = fibres.find(f => f.id === fibreId);
    return fibre ? fibre.name : 'Unknown Fibre';
  };

  // Filter fibres based on search
  const filteredFibres = fibres.filter(fibre => {
    if (!fibreSearch.trim()) return true;
    const searchLower = fibreSearch.toLowerCase();
    return fibre.name.toLowerCase().includes(searchLower) ||
           (fibre.code && fibre.code.toString().includes(searchLower));
  });

  // Filter varieties based on search
  const filteredVarieties = (() => {
    const varietiesArray = Array.isArray(varieties) ? varieties : [];
    
    return varietiesArray.filter(variety => {
      if (!variety || typeof variety !== 'object') return false;
      
      const code = variety.code ? variety.code.toString() : '';
      const varietyName = variety.variety || '';
      const fibreName = getFibreName(variety.fibreId) || '';
      
      return searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        varietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fibreName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : value
    }));
  };

  // Handle fibre selection
  const handleFibreSelect = (fibre) => {
    setFormData(prev => ({
      ...prev,
      fibreId: fibre.id,
      fibreName: fibre.name
    }));
    setFibreSearch(fibre.name);
    setShowFibreDropdown(false);
  };

  // Handle fibre search change
  const handleFibreSearchChange = (e) => {
    const value = e.target.value;
    setFibreSearch(value);
    setShowFibreDropdown(true);
    
    // If user clears the input, clear the selection
    if (!value.trim()) {
      setFormData(prev => ({
        ...prev,
        fibreId: '',
        fibreName: ''
      }));
    }
  };

  // Clear fibre selection
  const clearFibreSelection = () => {
    setFormData(prev => ({
      ...prev,
      fibreId: '',
      fibreName: ''
    }));
    setFibreSearch('');
    setShowFibreDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all required fields
    if (!formData.code || formData.code.toString().trim() === '') {
      setError('Variety code is required');
      return;
    }

    if (!formData.variety || formData.variety.trim() === '') {
      setError('Variety name is required');
      return;
    }

    if (!formData.fibreId) {
      setError('Please select a valid fibre from the list');
      return;
    }

    try {
      // Prepare payload with proper types (integers for numeric fields)
      const payload = {
        code: parseInt(formData.code, 10),
        variety: formData.variety.trim(),
        fibreId: parseInt(formData.fibreId, 10)
      };
      
      if (editingVariety) {
        // Update existing variety
        await varietyService.update(editingVariety.id, payload);
        setSuccess('Variety updated successfully!');
      } else {
        // Create new variety
        await varietyService.create(payload);
        setSuccess('Variety created successfully!');
      }
      
      // Refresh varieties list
      fetchVarieties();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Show detailed error message
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save variety: ${errorMsg}`);
    }
  };

  const handleEdit = (variety) => {
    if (!variety || !variety.id) {
      setError('Invalid variety data');
      return;
    }
    
    const fibreName = getFibreName(variety.fibreId);
    
    setEditingVariety(variety);
    setFormData({
      code: variety.code || '',
      variety: variety.variety || '',
      fibreId: variety.fibreId || '',
      fibreName: fibreName || ''
    });
    setFibreSearch(fibreName || '');
    setShowModal(true);
  };

  const handleView = (variety) => {
    if (!variety || !variety.id) {
      setError('Invalid variety data');
      return;
    }
    
    setViewingVariety(variety);
    setShowViewModal(true);
  };

  const handleDelete = async (id, varietyName) => {
    if (!id || !varietyName) {
      setError('Invalid variety data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete variety "${varietyName}"?`)) {
      return;
    }

    try {
      await varietyService.delete(id);
      setSuccess('Variety deleted successfully!');
      fetchVarieties();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete variety');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      variety: '',
      fibreId: '',
      fibreName: ''
    });
    setFibreSearch('');
    setShowFibreDropdown(false);
    setEditingVariety(null);
    setViewingVariety(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
      const nextCode = await varietyService.getNextCode();
      setFormData((prev) => ({
      ...prev,
      code: nextCode,
      }));
    } catch (error) {   
            setError("Failed to generate Transport code");
    }
    setShowModal(true);
  };

  const exportVarieties = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Variety Name,Fibre\n" +
        filteredVarieties.map(v => {
          const fibreName = getFibreName(v.fibreId);
          return `${v.code},${v.variety},${fibreName || 'N/A'}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "varieties.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Varieties exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export varieties');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Variety Management</h1>
            <p className="text-gray-600">Manage all varieties and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Variety
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
                placeholder="Search varieties by code, name, or fibre..."
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
              onClick={exportVarieties}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchVarieties();
                fetchFibres();
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

      {/* Varieties Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Varieties ({filteredVarieties.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredVarieties.length} of {varieties.length} varieties
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading varieties...</p>
          </div>
        ) : filteredVarieties.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🏷️</span>
            <p className="text-gray-600 mb-2">No varieties found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first variety
              </button>
            )}
          </div>
        ) : (
          /* Varieties Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VARIETY NAME
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FIBRE
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
                {filteredVarieties.map((variety) => (
                  <tr key={variety.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            #{formatCode(variety.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {variety.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏷️</span>
                        <div className="text-sm font-medium text-gray-900">{variety.variety}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📦</span>
                        <div className="text-sm font-medium text-gray-900">
                          {getFibreName(variety.fibreId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(variety.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(variety.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(variety.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(variety.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(variety)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(variety)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(variety.id, variety.variety)}
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

      {/* Create/Edit Variety Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingVariety ? 'Edit Variety' : 'Add New Variety'}
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
                  {/* Variety Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety Code *
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
                        placeholder="Enter unique variety code"
                        disabled
                      />
                    </div>
                    {editingVariety && (
                      <p className="mt-1 text-xs text-gray-500">Variety code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Variety Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏷️</span>
                      <input
                        type="text"
                        name="variety"
                        value={formData.variety}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter variety name"
                      />
                    </div>
                  </div>

                  {/* Fibre Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fibre *
                      <span className="text-xs text-gray-500 ml-1">(Type to search and select)</span>
                    </label>
                    <div className="relative" ref={fibreRef}>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📦</span>
                      <input
                        type="text"
                        value={fibreSearch}
                        onChange={handleFibreSearchChange}
                        onFocus={() => setShowFibreDropdown(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type to search fibres..."
                        required
                      />
                      {formData.fibreId && (
                        <button
                          type="button"
                          onClick={clearFibreSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                      
                      {/* Fibre Dropdown */}
                      {showFibreDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {fibreLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              Loading fibres...
                            </div>
                          ) : filteredFibres.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              {fibreSearch ? 'No fibres found' : 'No fibres available'}
                            </div>
                          ) : (
                            filteredFibres.map((fibre) => (
                              <div
                                key={fibre.id}
                                onClick={() => handleFibreSelect(fibre)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                  formData.fibreId === fibre.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{fibre.name}</div>
                                    {fibre.code && (
                                      <div className="text-xs text-gray-500">Code: #{formatCode(fibre.code)}</div>
                                    )}
                                  </div>
                                  {formData.fibreId === fibre.id && (
                                    <span className="w-4 h-4 text-blue-600">✓</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {!formData.fibreId && fibreSearch && (
                      <p className="mt-1 text-xs text-red-500">Please select a fibre from the list</p>
                    )}
                  </div>

                  {/* Display existing variety info when editing */}
                  {editingVariety && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Variety Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingVariety.createdAt ? new Date(editingVariety.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingVariety.updatedAt ? new Date(editingVariety.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Fibre:</span>
                          <div className="font-medium">
                            {getFibreName(editingVariety.fibreId)}
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
                    disabled={!formData.fibreId}
                  >
                    {editingVariety ? 'Update Variety' : 'Create Variety'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Variety Details Modal */}
      {showViewModal && viewingVariety && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Variety Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Variety Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">🏷️</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Variety Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          #{formatCode(viewingVariety.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingVariety.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Variety Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏷️</span>
                      <span className="text-lg font-medium text-gray-900">{viewingVariety.variety}</span>
                    </div>
                  </div>

                  {/* Fibre Information */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Fibre Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">📦</span>
                        <span className="font-medium text-gray-900">
                          {getFibreName(viewingVariety.fibreId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Fibre ID:</span>
                          <div className="font-medium">{viewingVariety.fibreId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Fibre Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const fibre = fibres.find(f => f.id === viewingVariety.fibreId);
                              return fibre && fibre.code ? formatCode(fibre.code) : 'N/A';
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
                          {formatDate(viewingVariety.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingVariety.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingVariety.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingVariety.updatedAt)}
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
                      handleEdit(viewingVariety);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Variety
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

export default Variety;