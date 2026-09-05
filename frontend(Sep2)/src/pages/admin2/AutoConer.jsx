import React, { useState, useEffect } from 'react';
import autoConerService from '../../services/admin2/transaction-qc/autoConerService';
import spinningCountService from '../../services/admin2/master/spinningCountService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';

const AutoConer = () => {
  // View states: 'list', 'view', 'edit', 'create'
  const [currentView, setCurrentView] = useState('list');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // List view states
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail view states
  const [detailLoading, setDetailLoading] = useState(false);
  const [counts, setCounts] = useState([]);
  const [simplexes, setSimplexes] = useState([]);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedSimplex, setSelectedSimplex] = useState(null);
  
  // Form fields - matching the image layout and model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().split('T')[0],
    type: 'CONES',
    countId: '',
    simplexId: '',
    noilsPercent: '',
    feedHank: '',
    mixNo: '',
    testNo: '',
    rf: '',
    side: '',
    thin: '',
    thick: '',
    neps: '',
    ipi: '',
    actCount: '',
    countCV: '',
    strength: '',
    strengthCV: '',
    uPercent: '',
    cvm: '',
    csp: '',
    h3: '',
    minus30: '',
    plus35: '',
    plus140: '',
    higherSensitivity: '',
    remarks: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await autoConerService.getAll();
      console.log("Fetched entries:", data);
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (currentView === 'list') {
      fetchEntries();
    } else {
      loadMasterData();
    }
  }, [currentView]);

  const loadMasterData = async () => {
    try {
      const [countsRes, simplexesRes] = await Promise.all([
        spinningCountService.getAll().catch(() => []),
        simplexMachineService.getAll().catch(() => [])
      ]);
      
      const countsList = Array.isArray(countsRes) ? countsRes : (countsRes?.spinningCounts || countsRes?.data || []);
      const simplexesList = Array.isArray(simplexesRes) ? simplexesRes : (simplexesRes?.simplexMachines || simplexesRes?.data || []);
      
      setCounts(countsList);
      setSimplexes(simplexesList);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await autoConerService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        type: entry.type || 'CONES',
        countId: entry.countId || '',
        simplexId: entry.simplexId || '',
        noilsPercent: entry.noilsPercent || '',
        feedHank: entry.feedHank || '',
        mixNo: entry.mixNo || '',
        testNo: entry.testNo || '',
        rf: entry.rf || '',
        side: entry.side || '',
        thin: entry.thin || '',
        thick: entry.thick || '',
        neps: entry.neps || '',
        ipi: entry.ipi || '',
        actCount: entry.actCount || '',
        countCV: entry.countCV || '',
        strength: entry.strength || '',
        strengthCV: entry.strengthCV || '',
        uPercent: entry.uPercent || '',
        cvm: entry.cvm || '',
        csp: entry.csp || '',
        h3: entry.h3 || '',
        minus30: entry.minus30 || '',
        plus35: entry.plus35 || '',
        plus140: entry.plus140 || '',
        higherSensitivity: entry.higherSensitivity || '',
        remarks: entry.remarks || '',
      });

      // Fetch referenced data for display
      if (entry.countId) {
        const count = await spinningCountService.getById(entry.countId);
        setSelectedCount(count);
      }
      if (entry.simplexId) {
        const simplex = await simplexMachineService.getById(entry.simplexId);
        setSelectedSimplex(simplex);
      }
    } catch (error) {
      console.error('Error loading entry details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if ((currentView === 'view' || currentView === 'edit') && selectedEntryId) {
      loadEntryDetails(selectedEntryId);
    }
  }, [currentView, selectedEntryId]);

  // ============= CRUD OPERATIONS =============
  const handleView = (id) => {
    setSelectedEntryId(id);
    setCurrentView('view');
  };

  const handleEdit = (id) => {
    setSelectedEntryId(id);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setCurrentView('create');
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await autoConerService.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry');
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        entryNo: parseInt(formData.entryNo) || 0,
        date: formData.date,
        type: formData.type || null,
        countId: parseInt(formData.countId),
        simplexId: parseInt(formData.simplexId),
        noilsPercent: parseFloat(formData.noilsPercent) || null,
        feedHank: parseFloat(formData.feedHank) || null,
        mixNo: parseFloat(formData.mixNo) || null,
        testNo: parseFloat(formData.testNo) || null,
        rf: formData.rf || null,
        side: formData.side || null,
        thin: parseFloat(formData.thin) || null,
        thick: parseFloat(formData.thick) || null,
        neps: parseFloat(formData.neps) || null,
        ipi: parseFloat(formData.ipi) || null,
        actCount: parseFloat(formData.actCount) || null,
        countCV: parseFloat(formData.countCV) || null,
        strength: parseFloat(formData.strength) || null,
        strengthCV: parseFloat(formData.strengthCV) || null,
        uPercent: parseFloat(formData.uPercent) || null,
        cvm: parseFloat(formData.cvm) || null,
        csp: parseFloat(formData.csp) || null,
        h3: parseFloat(formData.h3) || null,
        minus30: parseFloat(formData.minus30) || null,
        plus35: parseFloat(formData.plus35) || null,
        plus140: parseFloat(formData.plus140) || null,
        higherSensitivity: parseFloat(formData.higherSensitivity) || null,
        remarks: formData.remarks || null,
      };

      if (selectedEntryId) {
        await autoConerService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await autoConerService.create(payload);
        alert('Entry created successfully!');
      }

      setCurrentView('list');
      fetchEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry');
    }
  };

  const resetForm = () => {
    setSelectedEntryId(null);
    setSelectedCount(null);
    setSelectedSimplex(null);
    setFormData({
      entryNo: '',
      date: new Date().toISOString().split('T')[0],
      type: 'CONES',
      countId: '',
      simplexId: '',
      noilsPercent: '',
      feedHank: '',
      mixNo: '',
      testNo: '',
      rf: '',
      side: '',
      thin: '',
      thick: '',
      neps: '',
      ipi: '',
      actCount: '',
      countCV: '',
      strength: '',
      strengthCV: '',
      uPercent: '',
      cvm: '',
      csp: '',
      h3: '',
      minus30: '',
      plus35: '',
      plus140: '',
      higherSensitivity: '',
      remarks: '',
    });
  };

  const handleCancel = () => {
    setCurrentView('list');
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountChange = async (e) => {
    const countId = e.target.value;
    setFormData(prev => ({ ...prev, countId }));
    
    if (countId) {
      try {
        const count = await spinningCountService.getById(countId);
        setSelectedCount(count);
        // Auto-fill noilsPercent from count
        setFormData(prev => ({
          ...prev,
          noilsPercent: count.Noils || ''
        }));
      } catch (error) {
        console.error('Error fetching count details:', error);
      }
    } else {
      setSelectedCount(null);
      setFormData(prev => ({ ...prev, noilsPercent: '' }));
    }
  };

  const handleSimplexChange = async (e) => {
    const simplexId = e.target.value;
    setFormData(prev => ({ ...prev, simplexId }));
    
    if (simplexId) {
      try {
        const simplex = await simplexMachineService.getById(simplexId);
        setSelectedSimplex(simplex);
        // Auto-fill feedHank and rf/side from simplex
        setFormData(prev => ({
          ...prev,
          feedHank: simplex.feedHank || '',
          rf: simplex.mcNo || '',
          side: simplex.side || ''
        }));
      } catch (error) {
        console.error('Error fetching simplex details:', error);
      }
    } else {
      setSelectedSimplex(null);
      setFormData(prev => ({ ...prev, feedHank: '', rf: '', side: '' }));
    }
  };

  // ============= UTILITY FUNCTIONS =============
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).toUpperCase();
  };

  // Filter entries for list view
  const filteredEntries = entries.filter(entry => {
    const searchString = `${entry.entryNo} ${entry.type || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">AutoConer (IPI-Cops/Cones)</h1>
        <p className="text-sm text-gray-500 mt-1">AutoConer IPI-Cops/Cones - To Add, Modify and Delete AutoConer IPI-Cops/Cones</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by entry number or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Entry
          </button>
          <button
            onClick={fetchEntries}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">
            AutoConer Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACT COUNT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CREATED DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-4 text-center text-gray-500">No entries found</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{entry.entryNo}</div>
                      <div className="text-xs text-gray-500">ID: {entry.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 text-sm">{entry.type || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.countName || entry.countId}</td>
                    <td className="px-6 py-4 text-sm">{entry.actCount || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.ipi || '-'}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(entry.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button onClick={() => handleView(entry.id)} className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        <button onClick={() => handleEdit(entry.id)} className="text-green-600 hover:text-green-800 text-sm">Edit</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Showing {filteredEntries.length} of {entries.length} entries</p>
        </div>
      </div>
    </div>
  );

  // ============= RENDER DETAIL VIEW (Create/Edit/View) =============
  const renderDetailView = () => {
    const isReadOnly = currentView === 'view';
    const isCreate = currentView === 'create';
    
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">AutoConer (IPI-Cops/Cones)</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isCreate ? 'Create New Entry' : isReadOnly ? 'View Entry' : 'Edit Entry'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 txn-qc-form">
          {detailLoading ? (
            <div className="text-center py-10">Loading details...</div>
          ) : (
            <>
              {/* Entry No, Date, Type Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entry No</label>
                  <input
                    type="number"
                    name="entryNo"
                    value={formData.entryNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 9348"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="CONES">CONES</option>
                    <option value="COPS">COPS</option>
                  </select>
                </div>
              </div>

              {/* Count and Simplex Selection Row */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Count</label>
                  <select
                    name="countId"
                    value={formData.countId}
                    onChange={handleCountChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="">Select Count</option>
                    {counts.map(count => {
                      const label = count.countName || count.count_name || count.CountName || count.name || `Count #${count.id}`;
                      return (
                        <option key={count.id} value={count.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {selectedCount && (
                    <div className="text-xs text-gray-500 mt-1">Noils%: {selectedCount.Noils}</div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Simplex Machine</label>
                  <select
                    name="simplexId"
                    value={formData.simplexId}
                    onChange={handleSimplexChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="">Select Simplex</option>
                    {simplexes.map(simplex => {
                      const label = (simplex.mcNo || simplex.machineName || simplex.mcId || simplex.name || simplex.description || `Machine #${simplex.id}`) +
                                    (simplex.mcNo && simplex.mcId && simplex.mcNo !== simplex.mcId ? ` - ${simplex.mcId}` : '');
                      return (
                        <option key={simplex.id} value={simplex.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Remarks, Feed Hank, Side, Mix No, Test No Row */}
              <div className="grid grid-cols-5 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Feed Hank</label>
                  <input
                    type="number"
                    name="feedHank"
                    value={formData.feedHank}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Side</label>
                  <input
                    type="text"
                    name="side"
                    value={formData.side}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. LEFT/RIGHT"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mix No</label>
                  <input
                    type="number"
                    name="mixNo"
                    value={formData.mixNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 8.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Test No</label>
                  <input
                    type="number"
                    name="testNo"
                    value={formData.testNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 1226.00"
                  />
                </div>
              </div>

              {/* Thin, Thick, Neps, IPI Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Thin</label>
                  <input
                    type="number"
                    name="thin"
                    value={formData.thin}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 22.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Thick</label>
                  <input
                    type="number"
                    name="thick"
                    value={formData.thick}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 88.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Neps</label>
                  <input
                    type="number"
                    name="neps"
                    value={formData.neps}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 194.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">IPI</label>
                  <input
                    type="number"
                    name="ipi"
                    value={formData.ipi}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 304.00"
                  />
                </div>
              </div>

              {/* Act Count, Count CV, Strength, Strength CV Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Act Count</label>
                  <input
                    type="number"
                    name="actCount"
                    value={formData.actCount}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 69.60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Count CV</label>
                  <input
                    type="number"
                    name="countCV"
                    value={formData.countCV}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0.91"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Strength</label>
                  <input
                    type="number"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 42.48"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Strength CV</label>
                  <input
                    type="number"
                    name="strengthCV"
                    value={formData.strengthCV}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 4.41"
                  />
                </div>
              </div>

              {/* U%, CVM, CSP, H3 Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">U%</label>
                  <input
                    type="number"
                    name="uPercent"
                    value={formData.uPercent}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 11.73"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CVM</label>
                  <input
                    type="number"
                    name="cvm"
                    value={formData.cvm}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 14.84"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CSP</label>
                  <input
                    type="number"
                    name="csp"
                    value={formData.csp}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 2956.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">H3</label>
                  <input
                    type="number"
                    name="h3"
                    value={formData.h3}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 555.40"
                  />
                </div>
              </div>

              {/* -30, +35, +140 Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">-30</label>
                  <input
                    type="number"
                    name="minus30"
                    value={formData.minus30}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 2677"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">+35</label>
                  <input
                    type="number"
                    name="plus35"
                    value={formData.plus35}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 666"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">+140</label>
                  <input
                    type="number"
                    name="plus140"
                    value={formData.plus140}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 1016"
                  />
                </div>
              </div>

              {/* Higher Sensitivity */}
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-1">HIGHER SENSITIVITY</label>
                <input
                  type="number"
                  name="higherSensitivity"
                  value={formData.higherSensitivity}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  placeholder="e.g. 4359"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t flex justify-end space-x-3">
                {!isReadOnly && (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    {isCreate ? 'Create' : 'Update'}
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                >
                  {isReadOnly ? 'Close' : 'Cancel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return currentView === 'list' ? renderListView() : renderDetailView();
};

export default AutoConer;