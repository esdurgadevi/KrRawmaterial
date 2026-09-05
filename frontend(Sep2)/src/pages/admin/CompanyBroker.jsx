import React, { useState, useEffect } from 'react';
import companyBrokerService from '../../services/admin1/master/companyBrokerService';

const CompanyBroker = () => {
  // States
  const [companyBrokers, setCompanyBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCompanyBroker, setEditingCompanyBroker] = useState(null);
  const [viewingCompanyBroker, setViewingCompanyBroker] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    companyName: '',
    shortDesc: '',
    address: ''
  });

  // Load company brokers on component mount
  useEffect(() => {
    fetchCompanyBrokers();
  }, []);

  const fetchCompanyBrokers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await companyBrokerService.getAll();
      
      // Extract company brokers array from response (response.data.companyBrokers)
      const brokersData = Array.isArray(response) ? response : [];
      
      setCompanyBrokers(brokersData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load company brokers');
      setCompanyBrokers([]);
      setLoading(false);
    }
  };

  // Filter company brokers based on search
  const filteredBrokers = (() => {
    const brokersArray = Array.isArray(companyBrokers) ? companyBrokers : [];
    
    return brokersArray.filter(broker => {
      if (!broker || typeof broker !== 'object') return false;
      
      const brokerCode = broker.code ? broker.code.toString() : '';
      const companyName = broker.companyName || '';
      const shortDesc = broker.shortDesc || '';
      const address = broker.address || '';
      
      return searchTerm === '' || 
        brokerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase());
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
      if (editingCompanyBroker) {
        // Update existing company broker
        await companyBrokerService.update(editingCompanyBroker.id, formData);
        setSuccess('Company broker updated successfully!');
      } else {
        // Create new company broker
        await companyBrokerService.create(formData);
        setSuccess('Company broker created successfully!');
      }
      
      // Refresh company brokers list
      fetchCompanyBrokers();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (broker) => {
    if (!broker || !broker.id) {
      setError('Invalid company broker data');
      return;
    }
    
    setEditingCompanyBroker(broker);
    setFormData({
      code: broker.code || '',
      companyName: broker.companyName || '',
      shortDesc: broker.shortDesc || '',
      address: broker.address || ''
    });
    setShowModal(true);
  };

  const handleView = (broker) => {
    if (!broker || !broker.id) {
      setError('Invalid company broker data');
      return;
    }
    
    setViewingCompanyBroker(broker);
    setShowViewModal(true);
  };

  const handleDelete = async (id, companyName) => {
    if (!id || !companyName) {
      setError('Invalid company broker data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete company broker "${companyName}"?`)) {
      return;
    }

    try {
      await companyBrokerService.delete(id);
      setSuccess('Company broker deleted successfully!');
      fetchCompanyBrokers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete company broker');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      companyName: '',
      shortDesc: '',
      address: ''
    });
    setEditingCompanyBroker(null);
    setViewingCompanyBroker(null);
  };

  const openCreateModal = async () => {
    resetForm();
     try {
    const nextCode = await companyBrokerService.getNextCode();
    setFormData((prev) => ({
      ...prev,
      code: nextCode,
    }));
  } catch (err) {
    setError("Failed to generate company broker code");
  }
    setShowModal(true);
  };

  const exportBrokers = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Company Name,Short Description,Address\n" +
        filteredBrokers.map(b => 
          `${b.code},${b.companyName},${b.shortDesc || ''},${b.address || ''}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "company_brokers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Company brokers exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export company brokers');
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Company Broker Management</h1>
            <p className="text-gray-600">Manage all company brokers and their information</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Company Broker
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
                placeholder="Search company brokers by code, name, or description..."
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
              onClick={exportBrokers}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchCompanyBrokers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Company Brokers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Company Brokers ({filteredBrokers.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredBrokers.length} of {companyBrokers.length} brokers
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading company brokers...</p>
          </div>
        ) : filteredBrokers.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">👥</span>
            <p className="text-gray-600 mb-2">No company brokers found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first company broker
              </button>
            )}
          </div>
        ) : (
          /* Company Brokers Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name & Details
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
                {filteredBrokers.map((broker) => (
                  <tr key={broker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600">#</span>
                        </div>
                        <div>
                          <div className="font-mono font-semibold text-gray-900">
                            {formatCode(broker.code)}
                          </div>
                          <div className="text-xs text-gray-500">ID: {broker.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">🏢</span>
                          <div className="text-sm font-medium text-gray-900">{broker.companyName}</div>
                        </div>
                        {broker.shortDesc && (
                          <div className="flex items-start">
                            <span className="text-gray-400 mr-2 text-xs">📄</span>
                            <div className="text-xs text-gray-600">{broker.shortDesc}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(broker.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(broker.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(broker.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(broker.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(broker)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(broker)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(broker.id, broker.companyName)}
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

      {/* Create/Edit Company Broker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingCompanyBroker ? 'Edit Company Broker' : 'Add New Company Broker'}
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
                  {/* Company Broker Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Broker Code *
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
                        placeholder="Enter unique company broker code"
                        disabled
                      />
                    </div>
                    {editingCompanyBroker && (
                      <p className="mt-1 text-xs text-gray-500">Company broker code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span>
                      <textarea
                        name="shortDesc"
                        value={formData.shortDesc}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter short description or notes"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏠</span>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter company address"
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
                    {editingCompanyBroker ? 'Update Broker' : 'Create Broker'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Company Broker Details Modal */}
      {showViewModal && viewingCompanyBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Company Broker Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Company Broker Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">👥</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Broker Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {formatCode(viewingCompanyBroker.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingCompanyBroker.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Company Name</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-400 mr-2">🏢</span>
                      <span className="text-lg font-medium text-gray-900">{viewingCompanyBroker.companyName}</span>
                    </div>
                  </div>

                  {viewingCompanyBroker.shortDesc && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Short Description</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          <span className="text-gray-400 mr-2">📄</span>
                          <div className="text-sm text-gray-900">{viewingCompanyBroker.shortDesc}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewingCompanyBroker.address && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Address</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          <span className="text-gray-400 mr-2">🏠</span>
                          <div className="text-sm text-gray-900 whitespace-pre-line">{viewingCompanyBroker.address}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingCompanyBroker.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCompanyBroker.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingCompanyBroker.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCompanyBroker.updatedAt)}
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
                      handleEdit(viewingCompanyBroker);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Broker
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

export default CompanyBroker;