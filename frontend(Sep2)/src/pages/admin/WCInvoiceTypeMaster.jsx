// frontend/src/pages/admin/waste-cotton/WCInvoiceTypeMaster.jsx
import React, { useState, useEffect } from 'react';
import wcInvoiceService from '../../services/admin1/master/wcInvoiceService';

const WCInvoiceTypeMaster = () => {
  // States
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  
  // Validation errors for each row
  const [validationErrors, setValidationErrors] = useState({});

  // Form state for head
  const [formData, setFormData] = useState({
    code: '',
    name: 'GST WASTE SALE INVOICE',
    roundOffDigits: 0,
    packingForwardingCharges: 0,
    // All fields from the right panel - exactly as in the image
    details: [
      // Formula fields (with formulas from the image)
      { id: 1, fieldName: 'Assess Value', shortCode: 'X', displayKey: '[X]', formula: '[Total Kgs]*([Rate / kg]/[Rate Per])' },
      { id: 2, fieldName: 'Charity', shortCode: 'A', displayKey: '[A]', formula: '[Total Kgs]*[CharityRs]' },
      { id: 3, fieldName: 'Tax [VAT]', shortCode: 'B', displayKey: '[B]', formula: '' },
      { id: 4, fieldName: 'Duty', shortCode: 'C', displayKey: '[C]', formula: '' },
      { id: 5, fieldName: 'Chess', shortCode: 'D', displayKey: '[D]', formula: '([x]*[ChessRs]/100)' },
      { id: 6, fieldName: 'H.S.Cess', shortCode: 'E', displayKey: '[E]', formula: '' },
      { id: 7, fieldName: 'TCS', shortCode: 'F', displayKey: '[F]', formula: '([x]*[TCSRs]/100)' },
      { id: 8, fieldName: 'Others', shortCode: 'G', displayKey: '[G]', formula: '' },
      { id: 9, fieldName: 'Sub Total', shortCode: 'H', displayKey: '[H]', formula: '[X]+[D]+[F]' },
      { id: 10, fieldName: 'Total Value', shortCode: 'I', displayKey: '[I]', formula: '[H]+[GstAmt]+[IGstAmt]' },
      { id: 11, fieldName: 'Cenvat', shortCode: 'J', displayKey: '[J]', formula: '' },
      
      // Value fields (as shown in the second image)
      { id: 12, fieldName: 'CharityRs', shortCode: 'CHARITYRS', displayKey: '[CharityRs]', formula: '' },
      { id: 13, fieldName: 'TaxRs', shortCode: 'TAXRS', displayKey: '[TaxRs]', formula: '' },
      { id: 14, fieldName: 'DutyRs', shortCode: 'DUTYRS', displayKey: '[DutyRs]', formula: '' },
      { id: 15, fieldName: 'ChessRs', shortCode: 'CHESSRS', displayKey: '[ChessRs]', formula: '' },
      { id: 16, fieldName: 'HSChessRs', shortCode: 'HSCHESSRS', displayKey: '[HSChessRs]', formula: '' },
      { id: 17, fieldName: 'TCSRs', shortCode: 'TCSRS', displayKey: '[TCSRs]', formula: '' },
      { id: 18, fieldName: 'OthersRs', shortCode: 'OTHERSRS', displayKey: '[OthersRs]', formula: '' },
      { id: 19, fieldName: 'CenvatRs', shortCode: 'CENVATRS', displayKey: '[CenvatRs]', formula: '' },
      
      // System fields (as shown in the second image)
      { id: 20, fieldName: 'Total Kgs', shortCode: 'TOTALKGS', displayKey: '[Total Kgs]', formula: '' },
      { id: 21, fieldName: 'Rate / Kg', shortCode: 'RATEKG', displayKey: '[Rate / Kg]', formula: '' },
      { id: 22, fieldName: 'Qty', shortCode: 'QTY', displayKey: '[Qty]', formula: '' },
      { id: 23, fieldName: 'Round Off', shortCode: 'ROUNDOFF', displayKey: '[Round Off]', formula: '' }
    ]
  });

  // CORRECTED Validation function for formulas - now accepts the actual formulas from your image
  const validateFormula = (formula, rowId) => {
    if (!formula || formula.trim() === '') return true; // Empty formula is valid
    
    const errors = [];
    
    // Check for valid characters - allow spaces, slashes, etc.
    // This pattern allows: letters, numbers, spaces, +, -, *, /, (, ), ., [, ], and slashes for paths like "Rate / kg"
    const allowedPattern = /^[A-Za-z0-9\s\+\-\*\/\(\)\.\[\]\/]+$/;
    if (!allowedPattern.test(formula)) {
      errors.push('Invalid characters');
    }
    
    // Check for consecutive operators (++, --, **, //) - but allow // for comments?
    if (/(\+\+|\-\-|\*\*|\\\\|\/\/)/.test(formula)) {
      errors.push('Consecutive operators');
    }
    
    // Check for balanced parentheses
    let balance = 0;
    for (let char of formula) {
      if (char === '(') balance++;
      if (char === ')') balance--;
      if (balance < 0) {
        errors.push('Unbalanced parentheses');
        break;
      }
    }
    if (balance !== 0) {
      errors.push('Unbalanced parentheses');
    }
    
    // Extract all short codes used in formula - these are valid references
    const shortCodePattern = /\[([^\]]+)\]/g;
    const matches = [...formula.matchAll(shortCodePattern)];
    
    // Don't validate short codes - they can be any text like "Rate / kg", "Rate Per", "CharityRs", etc.
    
    setValidationErrors(prev => ({
      ...prev,
      [rowId]: errors.length > 0 ? errors : null
    }));
    
    return errors.length === 0;
  };

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await wcInvoiceService.getAll();
      setInvoices(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoice types');
    } finally {
      setLoading(false);
    }
  };

  // Handle head input changes
  const handleHeadChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'roundOffDigits' || name === 'packingForwardingCharges' 
        ? (value === '' ? '' : parseFloat(value) || 0)
        : value
    }));
  };

  // Handle detail field changes
  const handleDetailChange = (id, field, value) => {
    setFormData(prev => {
      const updatedDetails = prev.details.map(detail => 
        detail.id === id ? { ...detail, [field]: value } : detail
      );
      
      // Auto-generate display key if short code changes
      if (field === 'shortCode') {
        const uppercaseValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        updatedDetails.forEach(detail => {
          if (detail.id === id) {
            detail.shortCode = uppercaseValue;
            detail.displayKey = `[${uppercaseValue}]`;
          }
        });
      }
      
      return { ...prev, details: updatedDetails };
    });
    
    // Validate formula when it changes
    if (field === 'formula') {
      validateFormula(value, id);
    }
  };

  // Validate all formulas before submission
  const validateAllFormulas = () => {
    let hasErrors = false;
    formData.details.forEach(detail => {
      if (detail.formula && !validateFormula(detail.formula, detail.id)) {
        hasErrors = true;
      }
    });
    return !hasErrors;
  };

  // Validate entire form before submission
  const validateForm = () => {
    // Validate head fields
    if (!formData.code.trim()) {
      setError('Code is required');
      return false;
    }
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    // Validate each detail row
    for (let detail of formData.details) {
      if (!detail.fieldName.trim()) {
        setError(`Field Name is required for all rows`);
        return false;
      }
      
      if (!detail.shortCode.trim()) {
        setError(`Short Code is required for all rows`);
        return false;
      }
      
      // Validate formula if present - but now using our corrected validation
      if (detail.formula && !validateFormula(detail.formula, detail.id)) {
        setError(`Invalid formula in "${detail.fieldName}". Please check the formula.`);
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Prepare data for API
      const payload = {
        code: formData.code,
        name: formData.name,
        roundOffDigits: parseFloat(formData.roundOffDigits) || 0,
        packingForwardingCharges: parseFloat(formData.packingForwardingCharges) || 0,
        details: formData.details.map(({ id, ...rest }, index) => ({
          ...rest,
          sequence: index + 1
        }))
      };
      
      console.log('Submitting payload:', payload);
      
      if (editingInvoice) {
        await wcInvoiceService.update(editingInvoice.id, payload);
        setSuccess('Invoice type updated successfully!');
      } else {
        await wcInvoiceService.create(payload);
        setSuccess('Invoice type created successfully!');
      }
      
      // Refresh list and close modal
      fetchInvoices();
      setTimeout(() => {
        resetForm();
        setShowModal(false);
        setSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to save invoice type');
    }
  };

  // Handle edit
  const handleEdit = async (id) => {
    try {
      const invoice = await wcInvoiceService.getById(id);
      
      setEditingInvoice(invoice);
      
      // Map details with local IDs
      const detailsWithIds = invoice.details.map((detail, index) => ({
        id: index + 1,
        fieldName: detail.fieldName,
        shortCode: detail.shortCode,
        displayKey: detail.displayKey,
        formula: detail.formula || ''
      }));
      
      setFormData({
        code: invoice.code || '',
        name: invoice.name || 'GST WASTE SALE INVOICE',
        roundOffDigits: invoice.roundOffDigits || 0,
        packingForwardingCharges: invoice.packingForwardingCharges || 0,
        details: detailsWithIds
      });
      
      // Validate all formulas after loading
      setTimeout(() => {
        detailsWithIds.forEach(detail => {
          if (detail.formula) {
            validateFormula(detail.formula, detail.id);
          }
        });
      }, 100);
      
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching invoice for edit:', err);
      setError('Failed to load invoice details');
    }
  };

  // Handle view
  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  // Handle delete
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete invoice type "${code}"?`)) {
      return;
    }
    
    try {
      await wcInvoiceService.delete(id);
      setSuccess('Invoice type deleted successfully!');
      fetchInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete invoice type');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: 'GST WASTE SALE INVOICE',
      roundOffDigits: 0,
      packingForwardingCharges: 0,
      details: [
        // Exactly as in your image
        { id: 1, fieldName: 'Assess Value', shortCode: 'X', displayKey: '[X]', formula: '[Total Kgs]*([Rate / kg]/[Rate Per])' },
        { id: 2, fieldName: 'Charity', shortCode: 'A', displayKey: '[A]', formula: '[Total Kgs]*[CharityRs]' },
        { id: 3, fieldName: 'Tax [VAT]', shortCode: 'B', displayKey: '[B]', formula: '' },
        { id: 4, fieldName: 'Duty', shortCode: 'C', displayKey: '[C]', formula: '' },
        { id: 5, fieldName: 'Chess', shortCode: 'D', displayKey: '[D]', formula: '([x]*[ChessRs]/100)' },
        { id: 6, fieldName: 'H.S.Cess', shortCode: 'E', displayKey: '[E]', formula: '' },
        { id: 7, fieldName: 'TCS', shortCode: 'F', displayKey: '[F]', formula: '([x]*[TCSRs]/100)' },
        { id: 8, fieldName: 'Others', shortCode: 'G', displayKey: '[G]', formula: '' },
        { id: 9, fieldName: 'Sub Total', shortCode: 'H', displayKey: '[H]', formula: '[X]+[D]+[F]' },
        { id: 10, fieldName: 'Total Value', shortCode: 'I', displayKey: '[I]', formula: '[H]+[GstAmt]+[IGstAmt]' },
        { id: 11, fieldName: 'Cenvat', shortCode: 'J', displayKey: '[J]', formula: '' },
        { id: 12, fieldName: 'CharityRs', shortCode: 'CHARITYRS', displayKey: '[CharityRs]', formula: '' },
        { id: 13, fieldName: 'TaxRs', shortCode: 'TAXRS', displayKey: '[TaxRs]', formula: '' },
        { id: 14, fieldName: 'DutyRs', shortCode: 'DUTYRS', displayKey: '[DutyRs]', formula: '' },
        { id: 15, fieldName: 'ChessRs', shortCode: 'CHESSRS', displayKey: '[ChessRs]', formula: '' },
        { id: 16, fieldName: 'HSChessRs', shortCode: 'HSCHESSRS', displayKey: '[HSChessRs]', formula: '' },
        { id: 17, fieldName: 'TCSRs', shortCode: 'TCSRS', displayKey: '[TCSRs]', formula: '' },
        { id: 18, fieldName: 'OthersRs', shortCode: 'OTHERSRS', displayKey: '[OthersRs]', formula: '' },
        { id: 19, fieldName: 'CenvatRs', shortCode: 'CENVATRS', displayKey: '[CenvatRs]', formula: '' },
        { id: 20, fieldName: 'Total Kgs', shortCode: 'TOTALKGS', displayKey: '[Total Kgs]', formula: '' },
        { id: 21, fieldName: 'Rate / Kg', shortCode: 'RATEKG', displayKey: '[Rate / Kg]', formula: '' },
        { id: 22, fieldName: 'Qty', shortCode: 'QTY', displayKey: '[Qty]', formula: '' },
        { id: 23, fieldName: 'Round Off', shortCode: 'ROUNDOFF', displayKey: '[Round Off]', formula: '' }
      ]
    });
    setValidationErrors({});
    setEditingInvoice(null);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(inv => 
    inv.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Waste Cotton Sales Invoice Type</h1>
            <p className="text-gray-600">To Add, Modify Waste Cotton Sales Invoice Type details.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            Add New Invoice Type
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
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Types ({filteredInvoices.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading invoice types...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📄</span>
            <p className="text-gray-600 mb-2">No invoice types found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first invoice type
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROUND OFF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PACKING CHARGES
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {invoice.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {invoice.roundOffDigits || 0} digits
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        ₹{invoice.packingForwardingCharges || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(invoice)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(invoice.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id, invoice.code)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors"
                          title="Delete"
                        >
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl lg:max-w-5xl max-h-[100vh] flex flex-col my-8">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingInvoice ? 'Edit Invoice Type' : 'Create New Invoice Type'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Header Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleHeadChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter code"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Type *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleHeadChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="GST WASTE SALE INVOICE"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round Off Digits
                    </label>
                    {/* Changed to text input to prevent scroll-induced value changes */}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="roundOffDigits"
                      value={formData.roundOffDigits}
                      onChange={handleHeadChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing & Forwarding Charges
                    </label>
                    {/* Changed to text input to prevent scroll-induced value changes */}
                    <input
                      type="text"
                      inputMode="decimal"
                      name="packingForwardingCharges"
                      value={formData.packingForwardingCharges}
                      onChange={handleHeadChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Details Table */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h4>
                  <p className="text-sm text-gray-600 mb-2">All fields from the right panel - each row represents one field</p>
                  
                  <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">S.NO</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FIELD NAME</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">SHORT CODE *</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">DISPLAY KEY</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FORMULA</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.details.map((detail, index) => {
                          const hasError = validationErrors[detail.id]?.length > 0;
                          
                          return (
                            <tr key={detail.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={detail.fieldName}
                                  onChange={(e) => handleDetailChange(detail.id, 'fieldName', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="Field name"
                                  required
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={detail.shortCode}
                                  onChange={(e) => handleDetailChange(detail.id, 'shortCode', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="X"
                                  maxLength="10"
                                  required
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={detail.displayKey}
                                  onChange={(e) => handleDetailChange(detail.id, 'displayKey', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder={`[${detail.shortCode}]`}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={detail.formula}
                                    onChange={(e) => handleDetailChange(detail.id, 'formula', e.target.value)}
                                    onBlur={() => validateFormula(detail.formula, detail.id)}
                                    className={`w-full px-2 py-1 border rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Formula (optional for value fields)"
                                  />
                                  {hasError && (
                                    <p className="absolute text-xs text-red-600 mt-1">
                                      Invalid formula
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    * Formulas like [Total Kgs]*([Rate / kg]/[Rate Per]) and [Total Kgs]*[CharityRs] are valid. 
                    Short codes must be uppercase letters/numbers.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editingInvoice ? 'Update Invoice Type' : 'Create Invoice Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* View Modal */}
      {showViewModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl lg:max-w-5xl my-8 max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Invoice Type Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Code</p>
                    <p className="font-semibold text-lg">{viewingInvoice.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Invoice Type</p>
                    <p className="font-semibold text-lg">{viewingInvoice.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Round Off Digits</p>
                    <p className="font-semibold">{viewingInvoice.roundOffDigits || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Packing Charges</p>
                    <p className="font-semibold">₹{viewingInvoice.packingForwardingCharges || 0}</p>
                  </div>
                </div>

                {/* Details Table */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">All Invoice Fields</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Key</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formula</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {viewingInvoice.details?.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)).map((detail, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{idx + 1}</td>
                            <td className="px-4 py-2 text-sm font-medium">{detail.fieldName}</td>
                            <td className="px-4 py-2 text-sm font-mono">{detail.shortCode}</td>
                            <td className="px-4 py-2 text-sm font-mono">{detail.displayKey}</td>
                            <td className="px-4 py-2 text-sm font-mono text-blue-600">{detail.formula || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm">{formatDate(viewingInvoice.createdAt)}</p>
                    <p className="text-xs text-gray-500">
                      {viewingInvoice.createdAt ? new Date(viewingInvoice.createdAt).toLocaleTimeString() : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm">{formatDate(viewingInvoice.updatedAt)}</p>
                    <p className="text-xs text-gray-500">
                      {viewingInvoice.updatedAt ? new Date(viewingInvoice.updatedAt).toLocaleTimeString() : ''}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingInvoice.id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
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

export default WCInvoiceTypeMaster;