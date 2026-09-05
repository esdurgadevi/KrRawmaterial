import React, { useState, useEffect } from 'react';
import breakerDrawingService from '../../services/admin2/transaction-qc/breakerDrawingService';
import spinningCountService from '../../services/admin2/master/spinningCountService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';

const BreakerDrawing = () => {
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
  
  // Form fields - matching the image layout and model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    shift: '',
    type: 'BREAKER AS BREAKER',
    machineId: '',
    countId: '',
    noOfDoubling: '',
    awLeft: '',
    awRight: '',
    ahkLeft: '',
    ahkRight: '',
    totalDraft: '',
    actualDraft: '',
    breakDraft: '',
    rollerSetting: '',
    speed: '',
    motorPully: '',
    feedChangeGear: '',
    draftChangeGear: '',
    draftCChangeGear: '',
    webTensionChangeGear: '',
    deliverySpeedMPM: '',
    condenserSize: '',
    breakDraftChangeGearA: '',
    breakDraftChangeGearB: '',
    coilerChangeGearC: '',
    coilerChangeGearD: '',
    canChangeGearE: '',
    canChangeGearF: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await breakerDrawingService.getAll();
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
      const entry = await breakerDrawingService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        time: entry.time || '',
        shift: entry.shift || '',
        type: entry.type || 'BREAKER AS BREAKER',
        machineId: entry.machineId || '',
        countId: entry.countId || '',
        noOfDoubling: entry.noOfDoubling || '',
        awLeft: entry.awLeft || '',
        awRight: entry.awRight || '',
        ahkLeft: entry.ahkLeft || '',
        ahkRight: entry.ahkRight || '',
        totalDraft: entry.totalDraft || '',
        actualDraft: entry.actualDraft || '',
        breakDraft: entry.breakDraft || '',
        rollerSetting: entry.rollerSetting || '',
        speed: entry.speed || '',
        motorPully: entry.motorPully || '',
        feedChangeGear: entry.feedChangeGear || '',
        draftChangeGear: entry.draftChangeGear || '',
        draftCChangeGear: entry.draftCChangeGear || '',
        webTensionChangeGear: entry.webTensionChangeGear || '',
        deliverySpeedMPM: entry.deliverySpeedMPM || '',
        condenserSize: entry.condenserSize || '',
        breakDraftChangeGearA: entry.breakDraftChangeGearA || '',
        breakDraftChangeGearB: entry.breakDraftChangeGearB || '',
        coilerChangeGearC: entry.coilerChangeGearC || '',
        coilerChangeGearD: entry.coilerChangeGearD || '',
        canChangeGearE: entry.canChangeGearE || '',
        canChangeGearF: entry.canChangeGearF || '',
      });

      // Fetch referenced data for display
      if (entry.countId) {
        const count = await spinningCountService.getById(entry.countId);
        setSelectedCount(count);
      }
      if (entry.machineId) {
        const machine = await simplexMachineService.getById(entry.machineId);
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
        await breakerDrawingService.delete(id);
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
        time: formData.time || null,
        shift: parseInt(formData.shift) || null,
        machineId: parseInt(formData.machineId),
        countId: parseInt(formData.countId),
        noOfDoubling: parseFloat(formData.noOfDoubling) || null,
        awLeft: parseFloat(formData.awLeft) || null,
        awRight: parseFloat(formData.awRight) || null,
        ahkLeft: parseFloat(formData.ahkLeft) || null,
        ahkRight: parseFloat(formData.ahkRight) || null,
        totalDraft: parseFloat(formData.totalDraft) || null,
        actualDraft: parseFloat(formData.actualDraft) || null,
        breakDraft: parseFloat(formData.breakDraft) || null,
        speed: parseFloat(formData.speed) || null,
        motorPully: parseFloat(formData.motorPully) || null,
        deliverySpeedMPM: parseFloat(formData.deliverySpeedMPM) || null,
        condenserSize: parseFloat(formData.condenserSize) || null,
      };

      if (selectedEntryId) {
        await breakerDrawingService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await breakerDrawingService.create(payload);
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
      date: new Date().toISOString().split('T')[0],
      time: '',
      shift: '',
      machineId: '',
      countId: '',
      noOfDoubling: '',
      awLeft: '',
      awRight: '',
      ahkLeft: '',
      ahkRight: '',
      totalDraft: '',
      actualDraft: '',
      breakDraft: '',
      speed: '',
      motorPully: '',
      deliverySpeedMPM: '',
      condenserSize: '',
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
      } catch (error) {
        console.error('Error fetching count details:', error);
      }
    } else {
      setSelectedCount(null);
    }
  };

  const handleMachineChange = async (e) => {
    const machineId = e.target.value;
    setFormData(prev => ({ ...prev, machineId }));
    
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
        <h1 className="text-2xl font-semibold text-gray-800">BREAKER DRAWING</h1>
        <p className="text-sm text-gray-500 mt-1">Breaker Drawing - To Add, Modify and Delete Breaker Drawing Entry Details</p>
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
            Breaker Drawing Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIME</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SHIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MACHINE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
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
                    <td className="px-6 py-4 text-sm">{formatTime(entry.time)}</td>
                    <td className="px-6 py-4 text-sm">{entry.shift || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.machine?.mcNo ? `${entry.machine.mcNo}${entry.machine.mcId && entry.machine.mcId !== entry.machine.mcNo ? ` - ${entry.machine.mcId}` : ''}` : (entry.machineName || entry.machineId || '-')}</td>
                    <td className="px-6 py-4 text-sm">{entry.count?.countName || entry.countName || entry.countId || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">BREAKER DRAWING</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isCreate ? 'Create New Entry' : isReadOnly ? 'View Entry' : 'Edit Entry'} - Breaker Drawing
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
                    placeholder="e.g. 912"
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

              {/* Type Row (Matching Screenshot Image 1) */}
              <div className="mb-6 pb-4 border-b">
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md text-sm bg-red-50/50 font-medium ${isReadOnly ? 'bg-gray-50' : ''}`}
                  placeholder="BREAKER AS BREAKER"
                />
              </div>

              {/* Machine, Count and No of Doubling Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Machine</label>
                  <select
                    name="machineId"
                    value={formData.machineId}
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">No of Doubling</label>
                  <input
                    type="number"
                    name="noOfDoubling"
                    value={formData.noOfDoubling}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0.06"
                  />
                </div>
              </div>

              {/* Feed Data Section */}
              <div className="mb-6 pb-4 border-b">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Fed & Del Hank / AW & A Hnk</h2>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fed Hank</label>
                    <input
                      type="number"
                      value={selectedMachine?.feedHank || ''}
                      readOnly
                      className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Del Hank</label>
                    <input
                      type="number"
                      value={selectedCount?.ActCount || ''}
                      readOnly
                      className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A W Left</label>
                    <input
                      type="number"
                      name="awLeft"
                      value={formData.awLeft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 19.805"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A W Right</label>
                    <input
                      type="number"
                      name="awRight"
                      value={formData.awRight}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 19.495"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A Hnk Left</label>
                    <input
                      type="number"
                      name="ahkLeft"
                      value={formData.ahkLeft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.0001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 19.5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A Hnk Right</label>
                    <input
                      type="number"
                      name="ahkRight"
                      value={formData.ahkRight}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.0001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 19.6050"
                    />
                  </div>
                </div>
              </div>

              {/* Drafts, Speeds & Change Gears Grid (3 Columns - Matching Image 1 & 4 Exactly) */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Drafts, Speeds & Change Gears</h2>
                <div className="grid grid-cols-3 gap-6">
                  {/* Column 1: Drafts & Physical Settings */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Total Draft</label>
                      <input
                        type="number"
                        name="totalDraft"
                        value={formData.totalDraft}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Actual Draft</label>
                      <input
                        type="number"
                        name="actualDraft"
                        value={formData.actualDraft}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Break Draft</label>
                      <input
                        type="number"
                        name="breakDraft"
                        value={formData.breakDraft}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Roller Setting</label>
                      <input
                        type="number"
                        name="rollerSetting"
                        value={formData.rollerSetting}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Delivery Speed MPM</label>
                      <input
                        type="number"
                        name="deliverySpeedMPM"
                        value={formData.deliverySpeedMPM}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Condenser Size</label>
                      <input
                        type="number"
                        name="condenserSize"
                        value={formData.condenserSize}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Column 2: Speeds & Primary Change Gears */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Speed</label>
                      <input
                        type="number"
                        name="speed"
                        value={formData.speed}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Motor Pully</label>
                      <input
                        type="number"
                        name="motorPully"
                        value={formData.motorPully}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Feed Change Gear</label>
                      <input
                        type="number"
                        name="feedChangeGear"
                        value={formData.feedChangeGear}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Draft Change Gear</label>
                      <input
                        type="number"
                        name="draftChangeGear"
                        value={formData.draftChangeGear}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Draft C Change Gear</label>
                      <input
                        type="number"
                        name="draftCChangeGear"
                        value={formData.draftCChangeGear}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Web Tension Change Gear</label>
                      <input
                        type="number"
                        name="webTensionChangeGear"
                        value={formData.webTensionChangeGear}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Column 3: Auxiliary & CAN Change Gears */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Break Draft Change Gear A</label>
                      <input
                        type="number"
                        name="breakDraftChangeGearA"
                        value={formData.breakDraftChangeGearA}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Break Draft Change Gear B</label>
                      <input
                        type="number"
                        name="breakDraftChangeGearB"
                        value={formData.breakDraftChangeGearB}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Coiler Change Gear C</label>
                      <input
                        type="number"
                        name="coilerChangeGearC"
                        value={formData.coilerChangeGearC}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Coiler Change Gear D</label>
                      <input
                        type="number"
                        name="coilerChangeGearD"
                        value={formData.coilerChangeGearD}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CAN Change Gear E</label>
                      <input
                        type="number"
                        name="canChangeGearE"
                        value={formData.canChangeGearE}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CAN Change Gear F</label>
                      <input
                        type="number"
                        name="canChangeGearF"
                        value={formData.canChangeGearF}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="0.00"
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

export default BreakerDrawing;