import React, { useState, useEffect, useRef } from 'react';
import mixingService from '../../services/admin1/master/mixingService';
import fibreService from '../../services/admin1/master/fibreService';
import mixingGroupService from '../../services/admin1/master/mixingGroupService';

const Mixing = () => {
  // States
  const [mixings, setMixings] = useState([]);
  const [fibres, setFibres] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fibreLoading, setFibreLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMixing, setEditingMixing] = useState(null);
  const [viewingMixing, setViewingMixing] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    mixingCode: '',
    mixingName: '',
    fibreId: '',
    fibreName: '',
    mixingGroupId: '',
    mixingGroupName: ''
  });

  // Autocomplete states
  const [showFibreDropdown, setShowFibreDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [fibreSearch, setFibreSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  
  // Refs for closing dropdowns on click outside
  const fibreRef = useRef(null);
  const groupRef = useRef(null);

  // Load mixings, fibres, and mixing groups on component mount
  useEffect(() => {
    fetchMixings();
    fetchFibres();
    fetchMixingGroups();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fibreRef.current && !fibreRef.current.contains(event.target)) {
        setShowFibreDropdown(false);
      }
      if (groupRef.current && !groupRef.current.contains(event.target)) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMixings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await mixingService.getAll();
      const mixingsData = Array.isArray(response) ? response : [];
      setMixings(mixingsData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load mixings');
      setMixings([]);
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

  const fetchMixingGroups = async () => {
    setGroupLoading(true);
    try {
      const response = await mixingGroupService.getAll();
      const groupsData = Array.isArray(response) ? response : [];
      setMixingGroups(groupsData);
    } catch (err) {
      console.error('Failed to load mixing groups:', err);
    } finally {
      setGroupLoading(false);
    }
  };

  // Get fibre name by ID
  const getFibreName = (fibreId) => {
    const fibre = fibres.find(f => f.id === fibreId);
    return fibre ? fibre.name : 'Unknown Fibre';
  };

  // Get mixing group name by ID
  const getMixingGroupName = (groupId) => {
    const group = mixingGroups.find(g => g.id === groupId);
    return group ? group.mixingName : 'Unknown Group';
  };

  // Filter fibres based on search
  const filteredFibres = fibres.filter(fibre => {
    if (!fibreSearch.trim()) return true;
    const searchLower = fibreSearch.toLowerCase();
    return fibre.name.toLowerCase().includes(searchLower) ||
           (fibre.code && fibre.code.toString().includes(searchLower));
  });

  // Filter mixing groups based on search
  const filteredGroups = mixingGroups.filter(group => {
    if (!groupSearch.trim()) return true;
    const searchLower = groupSearch.toLowerCase();
    return group.mixingName.toLowerCase().includes(searchLower) ||
           (group.groupCode && group.groupCode.toString().includes(searchLower));
  });

  // Filter mixings based on search
  const filteredMixings = (() => {
    const mixingsArray = Array.isArray(mixings) ? mixings : [];
    
    return mixingsArray.filter(mixing => {
      if (!mixing || typeof mixing !== 'object') return false;
      
      const mixingCode = mixing.mixingCode ? mixing.mixingCode.toString() : '';
      const mixingName = mixing.mixingName || '';
      const fibreName = getFibreName(mixing.fibreId) || '';
      const groupName = getMixingGroupName(mixing.mixingGroupId) || '';
      
      return searchTerm === '' || 
        mixingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fibreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mixingCode' ? (value === '' ? '' : parseInt(value) || value) : value
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

  // Handle mixing group selection
  const handleGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: group.id,
      mixingGroupName: group.mixingName
    }));
    setGroupSearch(group.mixingName);
    setShowGroupDropdown(false);
  };

  // Handle group search change
  const handleGroupSearchChange = (e) => {
    const value = e.target.value;
    setGroupSearch(value);
    setShowGroupDropdown(true);
    
    // If user clears the input, clear the selection
    if (!value.trim()) {
      setFormData(prev => ({
        ...prev,
        mixingGroupId: '',
        mixingGroupName: ''
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

  // Clear group selection
  const clearGroupSelection = () => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: '',
      mixingGroupName: ''
    }));
    setGroupSearch('');
    setShowGroupDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all required fields
    if (!formData.mixingCode || formData.mixingCode.toString().trim() === '') {
      setError('Mixing code is required');
      return;
    }

    if (!formData.mixingName || formData.mixingName.trim() === '') {
      setError('Mixing name is required');
      return;
    }

    if (!formData.fibreId) {
      setError('Please select a valid fibre from the list');
      return;
    }

    if (!formData.mixingGroupId) {
      setError('Please select a valid mixing group from the list');
      return;
    }

    try {
      // Prepare payload with proper types (integers for numeric fields)
      const payload = {
        mixingCode: parseInt(formData.mixingCode, 10),
        mixingName: formData.mixingName.trim(),
        fibreId: parseInt(formData.fibreId, 10),
        mixingGroupId: parseInt(formData.mixingGroupId, 10)
      };
      
      if (editingMixing) {
        // Update existing mixing
        await mixingService.update(editingMixing.id, payload);
        setSuccess('Mixing updated successfully!');
      } else {
        // Create new mixing
        await mixingService.create(payload);
        setSuccess('Mixing created successfully!');
      }
      
      // Refresh mixings list
      fetchMixings();
      
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
      
      setError(`Failed to save mixing: ${errorMsg}`);
    }
  };

  const handleEdit = (mixing) => {
    if (!mixing || !mixing.id) {
      setError('Invalid mixing data');
      return;
    }
    
    const fibreName = getFibreName(mixing.fibreId);
    const groupName = getMixingGroupName(mixing.mixingGroupId);
    
    setEditingMixing(mixing);
    setFormData({
      mixingCode: mixing.mixingCode || '',
      mixingName: mixing.mixingName || '',
      fibreId: mixing.fibreId || '',
      fibreName: fibreName || '',
      mixingGroupId: mixing.mixingGroupId || '',
      mixingGroupName: groupName || ''
    });
    setFibreSearch(fibreName || '');
    setGroupSearch(groupName || '');
    setShowModal(true);
  };

  const handleView = (mixing) => {
    if (!mixing || !mixing.id) {
      setError('Invalid mixing data');
      return;
    }
    
    setViewingMixing(mixing);
    setShowViewModal(true);
  };

  const handleDelete = async (id, mixingName) => {
    if (!id || !mixingName) {
      setError('Invalid mixing data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete mixing "${mixingName}"?`)) {
      return;
    }

    try {
      await mixingService.delete(id);
      setSuccess('Mixing deleted successfully!');
      fetchMixings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete mixing');
    }
  };

  const resetForm = () => {
    setFormData({
      mixingCode: '',
      mixingName: '',
      fibreId: '',
      fibreName: '',
      mixingGroupId: '',
      mixingGroupName: ''
    });
    setFibreSearch('');
    setGroupSearch('');
    setShowFibreDropdown(false);
    setShowGroupDropdown(false);
    setEditingMixing(null);
    setViewingMixing(null);
  };

  const openCreateModal = async() => {
    resetForm();
     try {
    const nextCode = await mixingService.getNextCode();
    setFormData((prev) => ({
      ...prev,
      mixingCode: nextCode,
    }));
  } catch (error) {
    setError("Failed to generate mixing code");
  }

    setShowModal(true);
  };

  const exportMixings = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Mixing Name,Fibre,Mixing Group\n" +
        filteredMixings.map(m => {
          const fibreName = getFibreName(m.fibreId);
          const groupName = getMixingGroupName(m.mixingGroupId);
          return `${m.mixingCode},${m.mixingName},${fibreName || 'N/A'},${groupName || 'N/A'}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "mixings.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Mixings exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export mixings');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Mixing Management</h1>
            <p className="text-gray-600">Manage all mixings and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Mixing
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
                placeholder="Search mixings by code, name, fibre, or group..."
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
              onClick={exportMixings}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchMixings();
                fetchFibres();
                fetchMixingGroups();
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

      {/* Mixings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Mixings ({filteredMixings.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredMixings.length} of {mixings.length} mixings
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading mixings...</p>
          </div>
        ) : filteredMixings.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📊</span>
            <p className="text-gray-600 mb-2">No mixings found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first mixing
              </button>
            )}
          </div>
        ) : (
          /* Mixings Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MIXING NAME
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FIBRE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MIXING GROUP
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
                {filteredMixings.map((mixing) => (
                  <tr key={mixing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            #{formatCode(mixing.mixingCode)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {mixing.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📊</span>
                        <div className="text-sm font-medium text-gray-900">{mixing.mixingName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📦</span>
                        <div className="text-sm font-medium text-gray-900">
                          {getFibreName(mixing.fibreId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏷️</span>
                        <div className="text-sm font-medium text-gray-900">
                          {getMixingGroupName(mixing.mixingGroupId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(mixing.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(mixing.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(mixing.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(mixing.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(mixing)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(mixing)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(mixing.id, mixing.mixingName)}
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

      {/* Create/Edit Mixing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingMixing ? 'Edit Mixing' : 'Add New Mixing'}
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
                  {/* Mixing Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mixing Code *
                      <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      <input
                        type="number"
                        name="mixingCode"
                        value={formData.mixingCode}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique mixing code"
                        disabled
                      />
                    </div>
                    {editingMixing && (
                      <p className="mt-1 text-xs text-gray-500">Mixing code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Mixing Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mixing Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📊</span>
                      <input
                        type="text"
                        name="mixingName"
                        value={formData.mixingName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter mixing name"
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

                  {/* Mixing Group Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mixing Group *
                      <span className="text-xs text-gray-500 ml-1">(Type to search and select)</span>
                    </label>
                    <div className="relative" ref={groupRef}>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏷️</span>
                      <input
                        type="text"
                        value={groupSearch}
                        onChange={handleGroupSearchChange}
                        onFocus={() => setShowGroupDropdown(true)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type to search mixing groups..."
                        required
                      />
                      {formData.mixingGroupId && (
                        <button
                          type="button"
                          onClick={clearGroupSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                      
                      {/* Group Dropdown */}
                      {showGroupDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {groupLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              Loading mixing groups...
                            </div>
                          ) : filteredGroups.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              {groupSearch ? 'No mixing groups found' : 'No mixing groups available'}
                            </div>
                          ) : (
                            filteredGroups.map((group) => (
                              <div
                                key={group.id}
                                onClick={() => handleGroupSelect(group)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                  formData.mixingGroupId === group.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{group.mixingName}</div>
                                    {group.groupCode && (
                                      <div className="text-xs text-gray-500">Code: #{formatCode(group.groupCode)}</div>
                                    )}
                                  </div>
                                  {formData.mixingGroupId === group.id && (
                                    <span className="w-4 h-4 text-blue-600">✓</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {!formData.mixingGroupId && groupSearch && (
                      <p className="mt-1 text-xs text-red-500">Please select a mixing group from the list</p>
                    )}
                  </div>

                  {/* Display existing mixing info when editing */}
                  {editingMixing && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Mixing Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingMixing.createdAt ? new Date(editingMixing.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingMixing.updatedAt ? new Date(editingMixing.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Fibre:</span>
                          <div className="font-medium">
                            {getFibreName(editingMixing.fibreId)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Mixing Group:</span>
                          <div className="font-medium">
                            {getMixingGroupName(editingMixing.mixingGroupId)}
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
                    disabled={!formData.fibreId || !formData.mixingGroupId}
                  >
                    {editingMixing ? 'Update Mixing' : 'Create Mixing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Mixing Details Modal */}
      {showViewModal && viewingMixing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Mixing Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Mixing Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📊</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Mixing Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          #{formatCode(viewingMixing.mixingCode)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingMixing.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Mixing Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">📊</span>
                      <span className="text-lg font-medium text-gray-900">{viewingMixing.mixingName}</span>
                    </div>
                  </div>

                  {/* Fibre Information */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Fibre Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">📦</span>
                        <span className="font-medium text-gray-900">
                          {getFibreName(viewingMixing.fibreId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Fibre ID:</span>
                          <div className="font-medium">{viewingMixing.fibreId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Fibre Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const fibre = fibres.find(f => f.id === viewingMixing.fibreId);
                              return fibre && fibre.code ? formatCode(fibre.code) : 'N/A';
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mixing Group Information */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Mixing Group Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">🏷️</span>
                        <span className="font-medium text-gray-900">
                          {getMixingGroupName(viewingMixing.mixingGroupId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Group ID:</span>
                          <div className="font-medium">{viewingMixing.mixingGroupId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Group Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const group = mixingGroups.find(g => g.id === viewingMixing.mixingGroupId);
                              return group && group.groupCode ? formatCode(group.groupCode) : 'N/A';
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
                          {formatDate(viewingMixing.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingMixing.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingMixing.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingMixing.updatedAt)}
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
                      handleEdit(viewingMixing);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Mixing
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

export default Mixing;