import React, { useState, useEffect } from 'react';
import comberEntryService from '../../services/admin2/transaction-qc/comberEntryService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';
import spinningCountService from '../../services/admin2/master/spinningCountService';

const ComberEntry = () => {
  // View states: 'list', 'view', 'edit', 'create'
  const [currentView, setCurrentView] = useState('list');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // List view states
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail view states
  const [detailLoading, setDetailLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [counts, setCounts] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedCount, setSelectedCount] = useState(null);
  
  // Form fields - matching the image layout and model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().split('T')[0],
    shift: '',
    simplexMachineId: '',
    countId: '',
    lapWeight: '',
    speedMPM: '',
    noilsPercent: '',
    totalNoils: '',
    aValue: '',
    bValue: '',
    cValue: '',
    draft: '',
    indexValue: '',
    topComSetting: '',
    tTrumpet: '',
    cTrumpet: '',
    feedMM: '',
    piecingIndex: '',
    ratchet: '',
    bDraft: '',
    tableDraft: '',
    setting: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await comberEntryService.getAll();
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
      const [machinesRes, countsRes] = await Promise.all([
        simplexMachineService.getAll().catch(() => []),
        spinningCountService.getAll().catch(() => [])
      ]);
      
      const machinesList = Array.isArray(machinesRes) ? machinesRes : (machinesRes?.simplexMachines || machinesRes?.data || []);
      const countsList = Array.isArray(countsRes) ? countsRes : (countsRes?.spinningCounts || countsRes?.data || []);
      
      setMachines(machinesList);
      setCounts(countsList);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await comberEntryService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: entry.shift || '',
        simplexMachineId: entry.simplexMachineId || '',
        countId: entry.countId || '',
        lapWeight: entry.lapWeight || '',
        speedMPM: entry.speedMPM || '',
        noilsPercent: entry.noilsPercent || '',
        totalNoils: entry.totalNoils || '',
        aValue: entry.aValue || '',
        bValue: entry.bValue || '',
        cValue: entry.cValue || '',
        draft: entry.draft || '',
        indexValue: entry.indexValue || '',
        topComSetting: entry.topComSetting || '',
        tTrumpet: entry.tTrumpet || '',
        cTrumpet: entry.cTrumpet || '',
        feedMM: entry.feedMM || '',
        piecingIndex: entry.piecingIndex || '',
        ratchet: entry.ratchet || '',
        bDraft: entry.bDraft || '',
        tableDraft: entry.tableDraft || '',
        setting: entry.setting || '',
      });

      // Fetch referenced data for display
      if (entry.simplexMachineId) {
        const machine = await simplexMachineService.getById(entry.simplexMachineId);
        setSelectedMachine(machine);
      }
      if (entry.countId) {
        const count = await spinningCountService.getById(entry.countId);
        setSelectedCount(count);
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
        await comberEntryService.delete(id);
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
        shift: parseInt(formData.shift) || null,
        simplexMachineId: parseInt(formData.simplexMachineId),
        countId: parseInt(formData.countId),
        lapWeight: parseFloat(formData.lapWeight) || null,
        speedMPM: parseFloat(formData.speedMPM) || null,
        totalNoils: parseFloat(formData.totalNoils) || null,
        aValue: parseFloat(formData.aValue) || null,
        bValue: parseFloat(formData.bValue) || null,
        cValue: parseFloat(formData.cValue) || null,
        draft: parseFloat(formData.draft) || null,
        indexValue: parseFloat(formData.indexValue) || null,
        topComSetting: parseFloat(formData.topComSetting) || null,
        tTrumpet: parseFloat(formData.tTrumpet) || null,
        cTrumpet: parseFloat(formData.cTrumpet) || null,
        feedMM: parseFloat(formData.feedMM) || null,
        piecingIndex: parseFloat(formData.piecingIndex) || null,
        ratchet: parseFloat(formData.ratchet) || null,
        bDraft: parseFloat(formData.bDraft) || null,
        tableDraft: parseFloat(formData.tableDraft) || null,
        setting: parseFloat(formData.setting) || null,
      };

      if (selectedEntryId) {
        await comberEntryService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await comberEntryService.create(payload);
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
    setSelectedMachine(null);
    setSelectedCount(null);
    setFormData({
      entryNo: '',
      date: new Date().toISOString().split('T')[0],
      shift: '',
      simplexMachineId: '',
      countId: '',
      lapWeight: '',
      speedMPM: '',
      totalNoils: '',
      aValue: '',
      bValue: '',
      cValue: '',
      draft: '',
      indexValue: '',
      topComSetting: '',
      tTrumpet: '',
      cTrumpet: '',
      feedMM: '',
      piecingIndex: '',
      ratchet: '',
      bDraft: '',
      tableDraft: '',
      setting: '',
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

  const handleMachineChange = async (e) => {
    const machineId = e.target.value;
    setFormData(prev => ({ ...prev, simplexMachineId: machineId }));
    
    if (machineId) {
      try {
        const machine = await simplexMachineService.getById(machineId);
        setSelectedMachine(machine);
      } catch (error) {
        console.error('Error fetching machine details:', error);
      }
    } else {
      setSelectedMachine(null);
    }
  };

  const handleCountChange = async (e) => {
    const countId = e.target.value;
    setFormData(prev => ({ ...prev, countId }));
    
    if (countId) {
      try {
        const count = await spinningCountService.getById(countId);
        setSelectedCount(count);
      } catch (error) {
        console.error('Error fetching count details:', error);
      }
    } else {
      setSelectedCount(null);
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

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
  };

  // Filter entries for list view
  const filteredEntries = entries.filter(entry => {
    const searchString = `${entry.entryNo} ${entry.machineName || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Comber Entry</h1>
        <p className="text-sm text-gray-500 mt-1">To Add, Modify and Delete Comber Entry Details</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by entry number or machine..."
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
            Comber Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SHIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MACHINE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TOTAL NOILS</th>
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
                    <td className="px-6 py-4 text-sm">{entry.shift || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.simplex?.mcNo ? `${entry.simplex.mcNo}${entry.simplex.mcId && entry.simplex.mcId !== entry.simplex.mcNo ? ` - ${entry.simplex.mcId}` : ''}` : (entry.machineName || entry.simplexMachineId || '-')}</td>
                    <td className="px-6 py-4 text-sm">{entry.count?.countName || entry.countName || entry.countId || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.totalNoils || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">Comber Entry</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isCreate ? 'Create New Entry' : isReadOnly ? 'View Entry' : 'Edit Entry'} - Comber Entry Details
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
              {/* Entry No, Date, Time, Shift Row */}
              <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entry No</label>
                  <input
                    type="number"
                    name="entryNo"
                    value={formData.entryNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 1662"
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
                  <label className="block text-xs text-gray-500 mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="1"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Shift</label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="">Select Shift</option>
                    <option value="1">Shift 1</option>
                    <option value="2">Shift 2</option>
                    <option value="3">Shift 3</option>
                  </select>
                </div>
              </div>

              {/* Machine and Count Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Comber Machine</label>
                  <select
                    name="simplexMachineId"
                    value={formData.simplexMachineId}
                    onChange={handleMachineChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="">Select Machine</option>
                    {machines.map(machine => {
                      const label = (machine.mcNo || machine.machineName || machine.mcId || machine.name || machine.description || `Machine #${machine.id}`) +
                                    (machine.mcNo && machine.mcId && machine.mcNo !== machine.mcId ? ` - ${machine.mcId}` : '');
                      return (
                        <option key={machine.id} value={machine.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
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
                </div>
              </div>

              {/* Speed MPM, Noils %, Hank & Total Noils Row (Matching Screenshot Image 2 & 5) */}
              <div className="grid grid-cols-5 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lap Wt (GPM)</label>
                  <input
                    type="number"
                    name="lapWeight"
                    value={formData.lapWeight}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 68"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Speed MPM</label>
                  <input
                    type="number"
                    name="speedMPM"
                    value={formData.speedMPM}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Noils %</label>
                  <input
                    type="number"
                    name="noilsPercent"
                    value={formData.noilsPercent}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 17.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total Noils</label>
                  <input
                    type="number"
                    name="totalNoils"
                    value={formData.totalNoils}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 17.50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hank</label>
                  <input
                    type="number"
                    value={selectedCount?.ActCount || ''}
                    readOnly
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                    placeholder="From Count"
                  />
                </div>
              </div>

              {/* A, B, C, Draft, Index, Top Com Settings */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">A</h2>
                <div className="grid grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A</label>
                    <input
                      type="number"
                      name="aValue"
                      value={formData.aValue}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 33.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">B</label>
                    <input
                      type="number"
                      name="bValue"
                      value={formData.bValue}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 32.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">C</label>
                    <input
                      type="number"
                      name="cValue"
                      value={formData.cValue}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 34.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Draft</label>
                    <input
                      type="number"
                      name="draft"
                      value={formData.draft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 13.36"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Index</label>
                    <input
                      type="number"
                      name="indexValue"
                      value={formData.indexValue}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Top Com Settings</label>
                    <input
                      type="number"
                      name="topComSetting"
                      value={formData.topComSetting}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 1.00"
                    />
                  </div>
                </div>
              </div>

              {/* T.Trumpet, PiecingIndex, Table Draft, C.Trumpet, Ratchet, Setting, Feed in MM, B.Draft */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">T.Trumpet</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">T.Trumpet</label>
                    <input
                      type="number"
                      name="tTrumpet"
                      value={formData.tTrumpet}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">PiecingIndex</label>
                    <input
                      type="number"
                      name="piecingIndex"
                      value={formData.piecingIndex}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 2.80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Table Draft</label>
                    <input
                      type="number"
                      name="tableDraft"
                      value={formData.tableDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">C.Trumpet</label>
                    <input
                      type="number"
                      name="cTrumpet"
                      value={formData.cTrumpet}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 3.5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ratchet</label>
                    <input
                      type="number"
                      name="ratchet"
                      value={formData.ratchet}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 22.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Setting</label>
                    <input
                      type="number"
                      name="setting"
                      value={formData.setting}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 43.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Feed in MM</label>
                    <input
                      type="number"
                      name="feedMM"
                      value={formData.feedMM}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 4.3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">B.Draft</label>
                    <input
                      type="number"
                      name="bDraft"
                      value={formData.bDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 1.21"
                    />
                  </div>
                </div>
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

export default ComberEntry;