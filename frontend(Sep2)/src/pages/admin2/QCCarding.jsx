import React, { useState, useEffect } from 'react';
import qcCardingService from '../../services/admin2/transaction-qc/qcCardingService';
import spinningCountService from '../../services/admin2/master/spinningCountService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';

const QCCarding = () => {
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
  const [machines, setMachines] = useState([]);
  const [selectedCount, setSelectedCount] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  // Form fields - matching the updated model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
    countId: '',
    cardingId: '',
    noilsPercent: '',
    hank: '',
    remarks: '',
    shift: '',
    
    // Production Section
    avgWeight: '',
    cvPercent: '',
    avgHank: '',
    cp: '',
    speedMPM: '',
    cylinder: '',
    lickerin: '',
    flats: '',
    wastePercent: '',
    setting: '',
    
    // Settings Section
    lToC: '',
    cToF: '',
    cToD: '',
    feedToL: '',
    tensionDraft: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await qcCardingService.getAll();
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
      const [countsRes, machinesRes] = await Promise.all([
        spinningCountService.getAll().catch(() => []),
        simplexMachineService.getAll().catch(() => [])
      ]);
      
      const countsList = Array.isArray(countsRes) ? countsRes : (countsRes?.spinningCounts || countsRes?.data || []);
      const machinesList = Array.isArray(machinesRes) ? machinesRes : (machinesRes?.simplexMachines || machinesRes?.data || []);
      
      setCounts(countsList);
      setMachines(machinesList);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await qcCardingService.getById(id);
      console.log("Loaded entry:", entry);
      
      // Format datetime for input
      let datetime = '';
      if (entry.date) {
        const date = new Date(entry.date);
        datetime = date.toISOString().slice(0, 16);
      }
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: datetime,
        countId: entry.countId || '',
        cardingId: entry.cardingId || '',
        noilsPercent: entry.noilsPercent || '',
        hank: entry.hank || '',
        remarks: entry.remarks || '',
        shift: entry.shift || '',
        
        avgWeight: entry.avgWeight || '',
        cvPercent: entry.cvPercent || '',
        avgHank: entry.avgHank || '',
        cp: entry.cp || '',
        speedMPM: entry.speedMPM || '',
        cylinder: entry.cylinder || '',
        lickerin: entry.lickerin || '',
        flats: entry.flats || '',
        wastePercent: entry.wastePercent || '',
        setting: entry.setting || '',
        
        lToC: entry.lToC || '',
        cToF: entry.cToF || '',
        cToD: entry.cToD || '',
        feedToL: entry.feedToL || '',
        tensionDraft: entry.tensionDraft || '',
      });

      // Fetch referenced data for display
      if (entry.countId) {
        const count = await spinningCountService.getById(entry.countId);
        setSelectedCount(count);
      }
      if (entry.cardingId) {
        const machine = await simplexMachineService.getById(entry.cardingId);
        setSelectedMachine(machine);
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
        await qcCardingService.delete(id);
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
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        countId: parseInt(formData.countId),
        cardingId: parseInt(formData.cardingId),
        noilsPercent: parseFloat(formData.noilsPercent) || null,
        hank: parseFloat(formData.hank) || null,
        remarks: formData.remarks || null,
        shift: parseInt(formData.shift) || null,
        
        avgWeight: parseFloat(formData.avgWeight) || null,
        cvPercent: parseFloat(formData.cvPercent) || null,
        avgHank: parseFloat(formData.avgHank) || null,
        cp: parseFloat(formData.cp) || null,
        speedMPM: parseFloat(formData.speedMPM) || null,
        cylinder: parseFloat(formData.cylinder) || null,
        lickerin: parseFloat(formData.lickerin) || null,
        flats: formData.flats || null,
        wastePercent: parseFloat(formData.wastePercent) || null,
        setting: formData.setting || null,
        
        lToC: formData.lToC || null,
        cToF: formData.cToF || null,
        cToD: formData.cToD || null,
        feedToL: formData.feedToL || null,
        tensionDraft: parseFloat(formData.tensionDraft) || null,
      };

      if (selectedEntryId) {
        await qcCardingService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await qcCardingService.create(payload);
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
    setSelectedMachine(null);
    setFormData({
      entryNo: '',
      date: new Date().toISOString().slice(0, 16),
      countId: '',
      cardingId: '',
      noilsPercent: '',
      hank: '',
      remarks: '',
      shift: '',
      
      avgWeight: '',
      cvPercent: '',
      avgHank: '',
      cp: '',
      speedMPM: '',
      cylinder: '',
      lickerin: '',
      flats: '',
      wastePercent: '',
      setting: '',
      
      lToC: '',
      cToF: '',
      cToD: '',
      feedToL: '',
      tensionDraft: '',
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

  const handleMachineChange = async (e) => {
    const cardingId = e.target.value;
    setFormData(prev => ({ ...prev, cardingId }));
    
    if (cardingId) {
      try {
        const machine = await simplexMachineService.getById(cardingId);
        setSelectedMachine(machine);
      } catch (error) {
        console.error('Error fetching machine details:', error);
      }
    } else {
      setSelectedMachine(null);
    }
  };

  // ============= UTILITY FUNCTIONS =============
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase() + ' ' + date.toLocaleTimeString();
  };

  // Filter entries for list view
  const filteredEntries = entries.filter(entry => {
    const searchString = `${entry.entryNo} ${entry.countName || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">QC-Carding</h1>
        <p className="text-sm text-gray-500 mt-1">QC Carding - To Add, Modify and Delete the Details</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by entry number or count..."
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
            QC Carding Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE & TIME</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CARDING</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SHIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HANK</th>
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
                    <td className="px-6 py-4 text-sm">{formatDateTime(entry.date)}</td>
                    <td className="px-6 py-4 text-sm">{entry.countName || entry.countId}</td>
                    <td className="px-6 py-4 text-sm">{entry.machineName || entry.cardingId}</td>
                    <td className="px-6 py-4 text-sm">{entry.shift || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.hank || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">QC-Carding</h1>
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
              {/* Entry No, Date & Time, Count, Noils% Row */}
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
                    placeholder="e.g. 3039"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Noils%</label>
                  <input
                    type="number"
                    name="noilsPercent"
                    value={formData.noilsPercent}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 16.00"
                  />
                </div>
              </div>

              {/* Carding Machine, Hank, Remarks, Shift Row */}
              <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Carding Machine</label>
                  <select
                    name="cardingId"
                    value={formData.cardingId}
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
                  <label className="block text-xs text-gray-500 mb-1">Hank</label>
                  <input
                    type="number"
                    name="hank"
                    value={formData.hank}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.0001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0.1400"
                  />
                </div>
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

              {/* Main Grid - Two Column Layout */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Production Data */}
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Avg Weight</label>
                      <input
                        type="number"
                        name="avgWeight"
                        value={formData.avgWeight}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.001"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="19.101"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CV%</label>
                      <input
                        type="number"
                        name="cvPercent"
                        value={formData.cvPercent}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="1.70"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Avg Hank</label>
                      <input
                        type="number"
                        name="avgHank"
                        value={formData.avgHank}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.0001"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.1413"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CP</label>
                      <input
                        type="number"
                        name="cp"
                        value={formData.cp}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="14.25"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Speed MPM</label>
                      <input
                        type="number"
                        name="speedMPM"
                        value={formData.speedMPM}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="135"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cylinder</label>
                      <input
                        type="number"
                        name="cylinder"
                        value={formData.cylinder}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="445"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Lickerin</label>
                      <input
                        type="number"
                        name="lickerin"
                        value={formData.lickerin}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Flats</label>
                      <input
                        type="text"
                        name="flats"
                        value={formData.flats}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="15.5INCH"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Waste %</label>
                      <input
                        type="number"
                        name="wastePercent"
                        value={formData.wastePercent}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="9.48"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Setting</label>
                      <input
                        type="text"
                        name="setting"
                        value={formData.setting}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Settings Data */}
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Lin to C</label>
                      <input
                        type="text"
                        name="lToC"
                        value={formData.lToC}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.2MM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">C to F</label>
                      <input
                        type="text"
                        name="cToF"
                        value={formData.cToF}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.25MM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">C to D</label>
                      <input
                        type="text"
                        name="cToD"
                        value={formData.cToD}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.125MM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feed to L</label>
                      <input
                        type="text"
                        name="feedToL"
                        value={formData.feedToL}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="1.0MM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tension Draft</label>
                      <input
                        type="number"
                        name="tensionDraft"
                        value={formData.tensionDraft}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="1.25"
                      />
                    </div>
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

export default QCCarding;