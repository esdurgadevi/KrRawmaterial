import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import wasteMasterService from '../../services/admin1/master/wasteMasterService';
import packingTypeService from '../../services/admin1/master/packingTypeService';

const WasteMaster = () => {
  // States
  const [wasteMasters, setWasteMasters] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packingTypeLoading, setPackingTypeLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingWasteMaster, setEditingWasteMaster] = useState(null);
  const [viewingWasteMaster, setViewingWasteMaster] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    department: '',
    waste: '',
    packingTypeId: '',
    packingTypeName: '',
    wasteKg: '',
    hsnCode: '',
    packingPreWeightment: false
  });

  // Autocomplete states
  const [showPackingTypeDropdown, setShowPackingTypeDropdown] = useState(false);
  const [packingTypeSearch, setPackingTypeSearch] = useState('');
  const [packingTypeError, setPackingTypeError] = useState('');
  
  // Refs for closing dropdowns on click outside
  const packingTypeRef = useRef(null);

  // Load waste masters and packing types on component mount
  useEffect(() => {
    fetchWasteMasters();
    fetchPackingTypes();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (packingTypeRef.current && !packingTypeRef.current.contains(event.target)) {
        setShowPackingTypeDropdown(false);
        validatePackingType();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWasteMasters = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await wasteMasterService.getAll();
      const wasteMastersData = Array.isArray(response) ? response : [];
      setWasteMasters(wasteMastersData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load waste masters');
      setWasteMasters([]);
      setLoading(false);
    }
  };

  const fetchPackingTypes = async () => {
    setPackingTypeLoading(true);
    try {
      const response = await packingTypeService.getAll();
      const packingTypesData = Array.isArray(response) ? response : [];
      setPackingTypes(packingTypesData);
    } catch (err) {
      console.error('Failed to load packing types:', err);
    } finally {
      setPackingTypeLoading(false);
    }
  };

  // Get packing type name by ID
  const getPackingTypeName = (packingTypeId) => {
    const packingType = packingTypes.find(p => p.id === packingTypeId);
    return packingType ? packingType.name : 'Unknown Packing Type';
  };

  // Validate packing type selection
  const validatePackingType = () => {
    if (!formData.packingTypeId && packingTypeSearch) {
      // Check if the typed value matches any packing type name
      const matchedPackingType = packingTypes.find(
        p => p.name.toLowerCase() === packingTypeSearch.toLowerCase()
      );
      
      if (matchedPackingType) {
        // Auto-select if there's an exact match
        handlePackingTypeSelect(matchedPackingType);
        setPackingTypeError('');
      } else {
        setPackingTypeError('Please select a valid packing type from the list');
      }
    } else if (!formData.packingTypeId && !packingTypeSearch) {
      setPackingTypeError('');
    }
  };

  // Filter packing types based on search
  const filteredPackingTypes = packingTypes.filter(packingType => {
    if (!packingTypeSearch.trim()) return packingTypes;
    const searchLower = packingTypeSearch.toLowerCase();
    return packingType.name.toLowerCase().includes(searchLower) ||
           (packingType.code && packingType.code.toString().includes(searchLower));
  });

  // Filter waste masters based on search
  const filteredWasteMasters = (() => {
    const wasteMastersArray = Array.isArray(wasteMasters) ? wasteMasters : [];
    
    return wasteMastersArray.filter(wasteMaster => {
      if (!wasteMaster || typeof wasteMaster !== 'object') return false;
      
      const code = wasteMaster.code ? wasteMaster.code.toString() : '';
      const department = wasteMaster.department || '';
      const waste = wasteMaster.waste || '';
      const packingTypeName = getPackingTypeName(wasteMaster.packingTypeId) || '';
      const hsnCode = wasteMaster.hsnCode || '';
      
      return searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        waste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        packingTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hsnCode.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'code' || name === 'wasteKg') ? 
                (value === '' ? '' : parseInt(value) || value) : 
                value
    }));
  };

  // Handle packing type selection
  const handlePackingTypeSelect = (packingType) => {
    setFormData(prev => ({
      ...prev,
      packingTypeId: packingType.id,
      packingTypeName: packingType.name
    }));
    setPackingTypeSearch(packingType.name);
    setShowPackingTypeDropdown(false);
    setPackingTypeError('');
  };

  // Handle packing type search change
  const handlePackingTypeSearchChange = (e) => {
    const value = e.target.value;
    setPackingTypeSearch(value);
    setShowPackingTypeDropdown(true);
    
    // Clear the selection if user changes the text
    if (formData.packingTypeId) {
      // Check if the typed value still matches the selected packing type
      const selectedPackingType = packingTypes.find(p => p.id === formData.packingTypeId);
      if (!selectedPackingType || selectedPackingType.name !== value) {
        setFormData(prev => ({
          ...prev,
          packingTypeId: '',
          packingTypeName: ''
        }));
        setPackingTypeError('Please select a packing type from the list');
      } else {
        setPackingTypeError('');
      }
    } else if (!value.trim()) {
      // If user clears the input, clear everything
      setFormData(prev => ({
        ...prev,
        packingTypeId: '',
        packingTypeName: ''
      }));
      setPackingTypeError('');
    }
  };

  // Clear packing type selection
  const clearPackingTypeSelection = () => {
    setFormData(prev => ({
      ...prev,
      packingTypeId: '',
      packingTypeName: ''
    }));
    setPackingTypeSearch('');
    setShowPackingTypeDropdown(false);
    setPackingTypeError('');
  };

  // Handle packing type input blur
  const handlePackingTypeBlur = () => {
    setTimeout(() => {
      validatePackingType();
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPackingTypeError('');

    // Validate all required fields
    if (!formData.code || formData.code.toString().trim() === '') {
      setError('Waste master code is required');
      return;
    }

    if (!formData.department || formData.department.trim() === '') {
      setError('Department is required');
      return;
    }

    if (!formData.waste || formData.waste.trim() === '') {
      setError('Waste name is required');
      return;
    }

    // Validate packing type
    if (!formData.packingTypeId) {
      // Check if there's an exact match with the typed text
      const matchedPackingType = packingTypes.find(
        p => p.name.toLowerCase() === packingTypeSearch.toLowerCase()
      );
      
      if (matchedPackingType) {
        // Auto-select if match found
        setFormData(prev => ({
          ...prev,
          packingTypeId: matchedPackingType.id,
          packingTypeName: matchedPackingType.name
        }));
      } else {
        setPackingTypeError('Please select a valid packing type from the list');
        return;
      }
    }

    if (!formData.wasteKg || formData.wasteKg.toString().trim() === '') {
      setError('Waste weight (kg) is required');
      return;
    }

    try {
      // Prepare payload with proper types
      const payload = {
        code: parseInt(formData.code, 10),
        department: formData.department.trim(),
        waste: formData.waste.trim(),
        packingTypeId: parseInt(formData.packingTypeId, 10),
        wasteKg: parseFloat(formData.wasteKg),
        hsnCode: formData.hsnCode?.trim() || null,
        packingPreWeightment: Boolean(formData.packingPreWeightment)
      };
      
      if (editingWasteMaster) {
        // Update existing waste master
        await wasteMasterService.update(editingWasteMaster.id, payload);
        setSuccess('Waste master updated successfully!');
      } else {
        // Create new waste master
        await wasteMasterService.create(payload);
        setSuccess('Waste master created successfully!');
      }
      
      // Refresh waste masters list
      fetchWasteMasters();
      
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
      
      setError(`Failed to save waste master: ${errorMsg}`);
    }
  };

  const handleEdit = (wasteMaster) => {
    if (!wasteMaster || !wasteMaster.id) {
      setError('Invalid waste master data');
      return;
    }
    
    const packingTypeName = getPackingTypeName(wasteMaster.packingTypeId);
    
    setEditingWasteMaster(wasteMaster);
    setFormData({
      code: wasteMaster.code || '',
      department: wasteMaster.department || '',
      waste: wasteMaster.waste || '',
      packingTypeId: wasteMaster.packingTypeId || '',
      packingTypeName: packingTypeName || '',
      wasteKg: wasteMaster.wasteKg || '',
      hsnCode: wasteMaster.hsnCode || '',
      packingPreWeightment: wasteMaster.packingPreWeightment || false
    });
    setPackingTypeSearch(packingTypeName || '');
    setPackingTypeError('');
    setShowModal(true);
  };

  const handleView = (wasteMaster) => {
    if (!wasteMaster || !wasteMaster.id) {
      setError('Invalid waste master data');
      return;
    }
    
    setViewingWasteMaster(wasteMaster);
    setShowViewModal(true);
  };

  const handleDelete = async (id, wasteName) => {
    if (!id || !wasteName) {
      setError('Invalid waste master data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete waste master "${wasteName}"?`)) {
      return;
    }

    try {
      await wasteMasterService.delete(id);
      setSuccess('Waste master deleted successfully!');
      fetchWasteMasters();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete waste master');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      department: '',
      waste: '',
      packingTypeId: '',
      packingTypeName: '',
      wasteKg: '',
      hsnCode: '',
      packingPreWeightment: false
    });
    setPackingTypeSearch('');
    setPackingTypeError('');
    setShowPackingTypeDropdown(false);
    setEditingWasteMaster(null);
    setViewingWasteMaster(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
      const nextCode = await wasteMasterService.getNextCode();
      setFormData((prev) => ({
      ...prev,
      code: nextCode,
      }));
    } catch (error) {   
            setError("Failed to generate Transport code");
    }
    setShowModal(true);
  };

  const exportWasteMasters = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Department,Waste,Packing Type,Waste (Kg),HSN Code,Packing Pre-Weightment\n" +
        filteredWasteMasters.map(w => {
          const packingTypeName = getPackingTypeName(w.packingTypeId);
          return `${w.code},${w.department},${w.waste},${packingTypeName || 'N/A'},${w.wasteKg},${w.hsnCode || 'N/A'},${w.packingPreWeightment ? 'Yes' : 'No'}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "waste_masters.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Waste masters exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export waste masters');
    }
  };

  // Handle bulk import file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!data || data.length < 2) {
          setImportError('No valid data rows found in spreadsheet.');
          return;
        }

        const rows = data.slice(1).filter(r => r && r[0] && r[1]);
        const parsed = rows.map((r, idx) => ({
          srNo: idx + 1,
          department: String(r[0] || '').trim(),
          waste: String(r[1] || '').trim(),
          packingTypeId: parseInt(r[2], 10) || 1,
          wasteKg: parseFloat(r[3]) || 0,
          hsnCode: r[4] ? String(r[4]).trim() : '52021000'
        }));

        setImportPreview(parsed);
      } catch (err) {
        setImportError(`Failed to parse file: ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Confirm and submit bulk import
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;

    setImporting(true);
    setImportError('');

    try {
      const res = await wasteMasterService.bulkImport(importPreview);
      setSuccess(`Import complete: ${res.result?.importedCount || importPreview.length} waste masters added (${res.result?.skippedCount || 0} skipped duplicates).`);
      setShowImportModal(false);
      setImportPreview([]);
      fetchWasteMasters();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setImportError(err.response?.data?.message || err.message || 'Bulk import failed');
    } finally {
      setImporting(false);
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Waste Master Management</h1>
            <p className="text-gray-600">Manage all waste masters and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Waste Master
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
                placeholder="Search waste masters by code, department, waste, or HSN code..."
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
              onClick={exportWasteMasters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                setImportPreview([]);
                setImportError('');
                setShowImportModal(true);
              }}
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center font-medium"
            >
              <span className="mr-2">📤</span>
              Bulk Import
            </button>
            <button
              onClick={() => {
                fetchWasteMasters();
                fetchPackingTypes();
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

      {/* Waste Masters Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Waste Masters ({filteredWasteMasters.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredWasteMasters.length} of {wasteMasters.length} waste masters
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading waste masters...</p>
          </div>
        ) : filteredWasteMasters.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
            <p className="text-gray-600 mb-2">No waste masters found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first waste master
              </button>
            )}
          </div>
        ) : (
          /* Waste Masters Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WASTE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PACKING TYPE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WASTE (KG)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HSN CODE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRE-WEIGHTMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWasteMasters.map((wasteMaster) => (
                  <tr key={wasteMaster.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            #{formatCode(wasteMaster.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {wasteMaster.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏢</span>
                        <div className="text-sm font-medium text-gray-900">{wasteMaster.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏷️</span>
                        <div className="text-sm font-medium text-gray-900">{wasteMaster.waste}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📦</span>
                        <div className="text-sm font-medium text-gray-900">
                          {getPackingTypeName(wasteMaster.packingTypeId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">⚖️</span>
                        <div className="text-sm font-medium text-gray-900">{wasteMaster.wasteKg} kg</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📄</span>
                        <div className="text-sm font-medium text-gray-900">{wasteMaster.hsnCode || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        wasteMaster.packingPreWeightment 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {wasteMaster.packingPreWeightment ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(wasteMaster)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(wasteMaster)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(wasteMaster.id, wasteMaster.waste)}
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

      {/* Create/Edit Waste Master Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingWasteMaster ? 'Edit Waste Master' : 'Add New Waste Master'}
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
                  {/* Waste Master Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Master Code *
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
                        onWheel={(e) => e.target.blur()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique waste master code"
                        disabled
                      />
                    </div>
                    {editingWasteMaster && (
                      <p className="mt-1 text-xs text-gray-500">Waste master code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  {/* Waste Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏷️</span>
                      <input
                        type="text"
                        name="waste"
                        value={formData.waste}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter waste name"
                      />
                    </div>
                  </div>

                  {/* Packing Type Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing Type *
                      <span className="text-xs text-gray-500 ml-1">(Type to search and select from list)</span>
                    </label>
                    <div className="relative" ref={packingTypeRef}>
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📦</span>
                      <input
                        type="text"
                        value={packingTypeSearch}
                        onChange={handlePackingTypeSearchChange}
                        onFocus={() => setShowPackingTypeDropdown(true)}
                        onBlur={handlePackingTypeBlur}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type to search packing types..."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPackingTypeDropdown(!showPackingTypeDropdown)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-sm">▼</span>
                      </button>
                      
                      {/* Packing Type Dropdown */}
                      {showPackingTypeDropdown && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {packingTypeLoading ? (
                            <div className="p-3 text-center text-gray-500">
                              Loading packing types...
                            </div>
                          ) : filteredPackingTypes.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">
                              {packingTypeSearch ? 'No packing types found' : 'No packing types available'}
                            </div>
                          ) : (
                            filteredPackingTypes.map((packingType) => (
                              <div
                                key={packingType.id}
                                onClick={() => handlePackingTypeSelect(packingType)}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                  formData.packingTypeId === packingType.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{packingType.name}</div>
                                    {packingType.code && (
                                      <div className="text-xs text-gray-500">Code: #{formatCode(packingType.code)}</div>
                                    )}
                                  </div>
                                  {formData.packingTypeId === packingType.id && (
                                    <span className="w-4 h-4 text-blue-600">✓</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {packingTypeError && (
                      <p className="mt-1 text-xs text-red-500">{packingTypeError}</p>
                    )}
                  </div>

                  {/* Waste Weight (Kg) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waste Weight (Kg) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚖️</span>
                      <input
                        type="number"
                        name="wasteKg"
                        value={formData.wasteKg}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        onWheel={(e) => e.target.blur()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter waste weight in kg"
                      />
                    </div>
                  </div>

                  {/* HSN Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HSN Code
                      <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span>
                      <input
                        type="text"
                        name="hsnCode"
                        value={formData.hsnCode}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter HSN code"
                      />
                    </div>
                  </div>

                  {/* Packing Pre-Weightment */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="packingPreWeightment"
                      name="packingPreWeightment"
                      checked={formData.packingPreWeightment}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="packingPreWeightment" className="ml-2 text-sm font-medium text-gray-700">
                      Packing Pre-Weightment
                    </label>
                    <span className="ml-2 text-xs text-gray-500">(Enable pre-weightment for this waste)</span>
                  </div>

                  {/* Display existing waste master info when editing */}
                  {editingWasteMaster && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Waste Master Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingWasteMaster.createdAt ? new Date(editingWasteMaster.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingWasteMaster.updatedAt ? new Date(editingWasteMaster.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Packing Type:</span>
                          <div className="font-medium">
                            {getPackingTypeName(editingWasteMaster.packingTypeId)}
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
                    {editingWasteMaster ? 'Update Waste Master' : 'Create Waste Master'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Waste Master Details Modal */}
      {showViewModal && viewingWasteMaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Waste Master Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Waste Master Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📦</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Waste Master Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          #{formatCode(viewingWasteMaster.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingWasteMaster.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Department</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏢</span>
                      <span className="text-lg font-medium text-gray-900">{viewingWasteMaster.department}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Waste Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏷️</span>
                      <span className="text-lg font-medium text-gray-900">{viewingWasteMaster.waste}</span>
                    </div>
                  </div>

                  {/* Packing Type Information */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Packing Type Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">📦</span>
                        <span className="font-medium text-gray-900">
                          {getPackingTypeName(viewingWasteMaster.packingTypeId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Packing Type ID:</span>
                          <div className="font-medium">{viewingWasteMaster.packingTypeId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Packing Type Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const packingType = packingTypes.find(p => p.id === viewingWasteMaster.packingTypeId);
                              return packingType && packingType.code ? formatCode(packingType.code) : 'N/A';
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Weight Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">⚖️</span>
                        <span className="font-medium text-gray-900">{viewingWasteMaster.wasteKg} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">HSN Code</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">📄</span>
                        <span className="font-medium text-gray-900">{viewingWasteMaster.hsnCode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Packing Pre-Weightment</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        viewingWasteMaster.packingPreWeightment 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingWasteMaster.packingPreWeightment ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingWasteMaster.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingWasteMaster.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingWasteMaster.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingWasteMaster.updatedAt)}
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
                      handleEdit(viewingWasteMaster);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Waste Master
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Bulk Import Waste Masters</h3>
                <p className="text-xs text-gray-500 mt-1">Upload an Excel (.xlsx / .xls) or CSV file containing Waste Master records.</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  ⚠️ {importError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Spreadsheet File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {importPreview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Preview Parsed Records ({importPreview.length})</span>
                    <span className="text-xs text-gray-500">Auto-incrementing Code starting from next sequence</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Department</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Waste Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Packing Type ID</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Waste (Kg)</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">HSN Code</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {importPreview.map((row) => (
                          <tr key={row.srNo} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500">{row.srNo}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{row.department}</td>
                            <td className="px-3 py-2 text-gray-900">{row.waste}</td>
                            <td className="px-3 py-2 text-gray-700">{row.packingTypeId}</td>
                            <td className="px-3 py-2 text-gray-700">{row.wasteKg}</td>
                            <td className="px-3 py-2 text-gray-700">{row.hsnCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing || importPreview.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center"
              >
                {importing ? (
                  <>
                    <span className="animate-spin mr-2">↻</span> Importing...
                  </>
                ) : (
                  `Confirm & Import (${importPreview.length} Records)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteMaster;