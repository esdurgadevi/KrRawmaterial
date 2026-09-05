import React, { useState, useEffect } from 'react';
import finisherDrawingService from '../../services/admin2/transaction-qc/finisherDrawingService';
import spinningCountService from '../../services/admin2/master/spinningCountService';

const FinisherDrawing = () => {
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
  const [selectedCount, setSelectedCount] = useState(null);
  
  // Form fields - matching the image layout and model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().split('T')[0],
    shift: '',
    type: 'FINISHER',
    countId: '',
    averageWeight: '',
    hank: '',
    cv: '',
    sw: '',
    w1: '',
    w2: '',
    w3: '',
    w4: '',
    w5: '',
    w8: '',
    w9: '',
    noOfEnds: '',
    speed: '',
    setting: '',
    trumpet: '',
    breakDraft: '',
    totalDraft: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await finisherDrawingService.getAll();
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
      const countsData = await spinningCountService.getAll();
      setCounts(Array.isArray(countsData) ? countsData : []);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await finisherDrawingService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: entry.shift || '',
        type: entry.type || 'FINISHER',
        countId: entry.countId || '',
        averageWeight: entry.averageWeight || '',
        hank: entry.hank || '',
        cv: entry.cv || '',
        sw: entry.sw || '',
        w1: entry.w1 || '',
        w2: entry.w2 || '',
        w3: entry.w3 || '',
        w4: entry.w4 || '',
        w5: entry.w5 || '',
        w8: entry.w8 || '',
        w9: entry.w9 || '',
        noOfEnds: entry.noOfEnds || '',
        speed: entry.speed || '',
        setting: entry.setting || '',
        trumpet: entry.trumpet || '',
        breakDraft: entry.breakDraft || '',
        totalDraft: entry.totalDraft || '',
      });

      // Fetch referenced data for display
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
        await finisherDrawingService.delete(id);
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
        type: formData.type,
        countId: parseInt(formData.countId),
        averageWeight: parseFloat(formData.averageWeight) || null,
        hank: parseFloat(formData.hank) || null,
        cv: parseFloat(formData.cv) || null,
        sw: parseFloat(formData.sw) || null,
        w1: parseFloat(formData.w1) || null,
        w2: parseFloat(formData.w2) || null,
        w3: parseFloat(formData.w3) || null,
        w4: parseFloat(formData.w4) || null,
        w5: parseFloat(formData.w5) || null,
        w8: parseFloat(formData.w8) || null,
        w9: parseFloat(formData.w9) || null,
        noOfEnds: parseFloat(formData.noOfEnds) || null,
        speed: parseFloat(formData.speed) || null,
        setting: parseFloat(formData.setting) || null,
        trumpet: parseFloat(formData.trumpet) || null,
        breakDraft: parseFloat(formData.breakDraft) || null,
        totalDraft: parseFloat(formData.totalDraft) || null,
      };

      if (selectedEntryId) {
        await finisherDrawingService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await finisherDrawingService.create(payload);
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
    setFormData({
      entryNo: '',
      date: new Date().toISOString().split('T')[0],
      shift: '',
      type: 'FINISHER',
      countId: '',
      averageWeight: '',
      hank: '',
      cv: '',
      sw: '',
      w1: '',
      w2: '',
      w3: '',
      w4: '',
      w5: '',
      w8: '',
      w9: '',
      noOfEnds: '',
      speed: '',
      setting: '',
      trumpet: '',
      breakDraft: '',
      totalDraft: '',
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
    const searchString = `${entry.entryNo} ${entry.type || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">FINISHER DRAWING</h1>
        <p className="text-sm text-gray-500 mt-1">Finisher Drawing - To Add, Modify and Delete Finisher Drawing Entry Details</p>
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
            Finisher Drawing Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SHIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
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
                    <td className="px-6 py-4 text-sm">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 text-sm">{entry.shift || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.type || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.count?.countName || entry.countName || entry.countId || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">FINISHER DRAWING</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isCreate ? 'Create New Entry' : isReadOnly ? 'View Entry' : 'Edit Entry'} - Finisher Drawing
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
                    placeholder="e.g. 9824"
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

              {/* Count Selection */}
              <div className="mb-6 pb-4 border-b">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Count</label>
                    <select
                      name="countId"
                      value={formData.countId}
                      onChange={handleCountChange}
                      disabled={isReadOnly}
                      className={`w-full md:w-96 px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
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
              </div>

              {/* Type and Average Weight Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="FINISHER"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Average Weight</label>
                  <input
                    type="number"
                    name="averageWeight"
                    value={formData.averageWeight}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 19.295"
                  />
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
                    placeholder="e.g. 0.1399"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CV %</label>
                  <input
                    type="number"
                    name="cv"
                    value={formData.cv}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0.35"
                  />
                </div>
              </div>

              {/* FD MCNO and SW Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">FD MCNO</label>
                  <input
                    type="text"
                    name="fdMcno"
                    value={formData.fdMcno}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. FD9"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">SW</label>
                  <input
                    type="number"
                    name="sw"
                    value={formData.sw}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 528.000"
                  />
                </div>
              </div>

              {/* W Values Row 1 */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">NW 1</label>
                  <input
                    type="number"
                    name="nw1"
                    value={formData.nw1}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 52.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">NW 2</label>
                  <input
                    type="number"
                    name="nw2"
                    value={formData.nw2}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 66.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 1</label>
                  <input
                    type="number"
                    name="w1"
                    value={formData.w1}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 109.10"
                  />
                </div>
              </div>

              {/* W Values Row 2 */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 3</label>
                  <input
                    type="number"
                    name="w3"
                    value={formData.w3}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 54.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 4</label>
                  <input
                    type="number"
                    name="w4"
                    value={formData.w4}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 55.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 5</label>
                  <input
                    type="number"
                    name="w5"
                    value={formData.w5}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 100.20"
                  />
                </div>
              </div>

              {/* W Values Row 3 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 8</label>
                  <input
                    type="number"
                    name="w8"
                    value={formData.w8}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 60.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">W 9</label>
                  <input
                    type="number"
                    name="w9"
                    value={formData.w9}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 60.00"
                  />
                </div>
                <div></div>
              </div>

              {/* No of Ends, Speed, Setting, Trumpet Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">No of Ends</label>
                  <input
                    type="number"
                    name="noOfEnds"
                    value={formData.noOfEnds}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 8.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Speed</label>
                  <input
                    type="number"
                    name="speed"
                    value={formData.speed}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 350"
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
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Trumpet</label>
                  <input
                    type="number"
                    name="trumpet"
                    value={formData.trumpet}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 3.5"
                  />
                </div>
              </div>

              {/* Break Draft and Total Draft Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                    placeholder="e.g. 1.28"
                  />
                </div>
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
                    placeholder="e.g. 7.70"
                  />
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

export default FinisherDrawing;