import React, { useState, useEffect, useRef } from 'react';
import costMasterService from '../../services/admin1/master/costMasterService';

const CostMasterManagement = () => {
  // States
  const [costMasters, setCostMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [viewingCost, setViewingCost] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    department: '',
    cost: ''
  });

  // Load cost masters on component mount
  useEffect(() => {
    fetchCostMasters();
  }, []);

  const fetchCostMasters = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await costMasterService.getAll();
      const costData = Array.isArray(response) ? response : [];
      setCostMasters(costData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load cost masters');
      setCostMasters([]);
      setLoading(false);
    }
  };

  // Filter cost masters based on search
  const filteredCostMasters = (() => {
    const costsArray = Array.isArray(costMasters) ? costMasters : [];
    
    return costsArray.filter(cost => {
      if (!cost || typeof cost !== 'object') return false;
      
      const department = cost.department || '';
      const costValue = cost.cost ? cost.cost.toString() : '';
      
      return searchTerm === '' || 
        department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        costValue.includes(searchTerm);
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? (value === '' ? '' : parseFloat(value) || '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.department || formData.department.trim() === '') {
      setError('Department is required');
      return;
    }

    if (!formData.cost || isNaN(formData.cost) || parseFloat(formData.cost) <= 0) {
      setError('Please enter a valid cost amount');
      return;
    }

    // Check for duplicate department (case-insensitive)
    const existingCost = costMasters.find(
      cost => 
        cost.department.toLowerCase() === formData.department.toLowerCase().trim() &&
        (!editingCost || cost.id !== editingCost.id)
    );
    
    if (existingCost) {
      setError(`Cost for department "${formData.department}" already exists`);
      return;
    }

    try {
      // Prepare payload
      const payload = {
        department: formData.department.trim(),
        cost: parseFloat(formData.cost)
      };
      
      if (editingCost) {
        // Update existing cost master
        await costMasterService.update(editingCost.id, payload);
        setSuccess('Cost master updated successfully!');
      } else {
        // Create new cost master
        await costMasterService.create(payload);
        setSuccess('Cost master created successfully!');
      }
      
      // Refresh cost masters list
      fetchCostMasters();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save cost master: ${errorMsg}`);
    }
  };

  const handleEdit = (cost) => {
    if (!cost || !cost.id) {
      setError('Invalid cost master data');
      return;
    }
    
    setEditingCost(cost);
    setFormData({
      department: cost.department || '',
      cost: cost.cost || ''
    });
    setShowModal(true);
  };

  const handleView = (cost) => {
    if (!cost || !cost.id) {
      setError('Invalid cost master data');
      return;
    }
    
    setViewingCost(cost);
    setShowViewModal(true);
  };

  const handleDelete = async (id, department) => {
    if (!id || !department) {
      setError('Invalid cost master data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete cost for "${department}"?`)) {
      return;
    }

    try {
      await costMasterService.delete(id);
      setSuccess('Cost master deleted successfully!');
      fetchCostMasters();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete cost master');
    }
  };

  const resetForm = () => {
    setFormData({
      department: '',
      cost: ''
    });
    setEditingCost(null);
    setViewingCost(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const exportCostMasters = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Department,Cost (₹),Created Date\n" +
        filteredCostMasters.map(cost => 
          `"${cost.department}",₹${cost.cost},"${cost.createdAt ? new Date(cost.createdAt).toLocaleDateString() : 'N/A'}"`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cost-masters-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Cost masters exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export cost masters');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
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
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Cost Master Management</h1>
            <p className="text-gray-600">Manage department-wise cost configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Cost
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
                placeholder="Search by department or cost amount..."
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
              onClick={exportCostMasters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={fetchCostMasters}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Cost Masters Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Cost Masters ({filteredCostMasters.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredCostMasters.length} of {costMasters.length} records
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading cost masters...</p>
          </div>
        ) : filteredCostMasters.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">💰</span>
            <p className="text-gray-600 mb-2">No cost masters found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first cost master
              </button>
            )}
          </div>
        ) : (
          /* Cost Masters Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEPARTMENT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COST (₹)
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
                {filteredCostMasters.map((cost) => (
                  <tr key={cost.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏢</span>
                        <div className="text-sm font-medium text-gray-900">{cost.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-2">💰</span>
                        <span className="text-lg font-bold text-green-700">
                          ₹{parseFloat(cost.cost).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(cost.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(cost.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(cost.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(cost.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(cost)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                        >
                          <span className="mr-1">👁️</span>
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(cost)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                        >
                          <span className="mr-1">✏️</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cost.id, cost.department)}
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

      {/* Create/Edit Cost Master Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingCost ? 'Edit Cost Master' : 'Add New Cost Master'}
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
                        placeholder="Enter department name"
                      />
                    </div>
                  </div>

                  {/* Cost Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        onWheel={(e) => e.target.blur()}
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter cost amount"
                      />
                    </div>
                  </div>

                  {/* Display existing cost info when editing */}
                  {editingCost && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Master Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingCost.createdAt ? new Date(editingCost.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingCost.updatedAt ? new Date(editingCost.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Current Cost:</span>
                          <div className="font-bold text-green-700">
                            ₹{parseFloat(editingCost.cost).toFixed(2)}
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.department || !formData.cost}
                  >
                    {editingCost ? 'Update Cost' : 'Create Cost'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Cost Master Details Modal */}
      {showViewModal && viewingCost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Cost Master Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Cost Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-green-600">💰</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Department */}
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-gray-400 mr-2">🏢</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {viewingCost.department}
                    </span>
                  </div>

                  {/* Cost Amount */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-700 mb-1">Cost Amount</div>
                      <div className="text-3xl font-bold text-green-800">
                        ₹{parseFloat(viewingCost.cost).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Created Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(viewingCost.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCost.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Updated</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(viewingCost.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingCost.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingCost);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Cost
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

export default CostMasterManagement;