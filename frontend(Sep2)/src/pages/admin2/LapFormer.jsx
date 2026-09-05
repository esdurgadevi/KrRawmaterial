import React, { useState, useEffect } from 'react';
import lapFormerService from '../../services/admin2/transaction-qc/lapFormerService';
import spinningCountService from '../../services/admin2/master/spinningCountService';

const LapFormer = () => {
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
    countId: '',
    lapMachine: '',
    noilsPercent: '',
    noOfEnds: '',
    rollerSettings: '',
    remarks: '',
    lapWeight: '',
    avgLapWeight: '',
    betweenCV: '',
    withinCVPer: '',
    mcdA: '',
    mcdB: '',
    mcdDraft: '',
    lrdC: '',
    lrdD: '',
    fdPulley: '',
    fdDraft: '',
    cdPulley: '',
    cdDraft: '',
    ddPulley: '',
    ddDraft: '',
    tcdPulley: '',
    tcdDraft: '',
    bdPulley: '',
    bdDraft: '',
    idPulley: '',
    idDraft: '',
    g: '',
    h: '',
    draft: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await lapFormerService.getAll();
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
      const countsRes = await spinningCountService.getAll().catch(() => []);
      const countsList = Array.isArray(countsRes) ? countsRes : (countsRes?.spinningCounts || countsRes?.data || []);
      setCounts(countsList);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await lapFormerService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: entry.shift || '',
        countId: entry.countId || '',
        lapMachine: entry.lapMachine || '',
        noilsPercent: entry.noilsPercent || '',
        noOfEnds: entry.noOfEnds || '',
        rollerSettings: entry.rollerSettings || '',
        remarks: entry.remarks || '',
        lapWeight: entry.lapWeight || '',
        avgLapWeight: entry.avgLapWeight || '',
        betweenCV: entry.betweenCV || '',
        withinCVPer: entry.withinCVPer || '',
        mcdA: entry.mcdA || '',
        mcdB: entry.mcdB || '',
        mcdDraft: entry.mcdDraft || '',
        lrdC: entry.lrdC || '',
        lrdD: entry.lrdD || '',
        fdPulley: entry.fdPulley || '',
        fdDraft: entry.fdDraft || '',
        cdPulley: entry.cdPulley || '',
        cdDraft: entry.cdDraft || '',
        ddPulley: entry.ddPulley || '',
        ddDraft: entry.ddDraft || '',
        tcdPulley: entry.tcdPulley || '',
        tcdDraft: entry.tcdDraft || '',
        bdPulley: entry.bdPulley || '',
        bdDraft: entry.bdDraft || '',
        idPulley: entry.idPulley || '',
        idDraft: entry.idDraft || '',
        g: entry.g || '',
        h: entry.h || '',
        draft: entry.draft || '',
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
        await lapFormerService.delete(id);
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
        countId: parseInt(formData.countId),
        lapMachine: formData.lapMachine || null,
        noilsPercent: parseFloat(formData.noilsPercent) || null,
        noOfEnds: parseFloat(formData.noOfEnds) || null,
        rollerSettings: formData.rollerSettings || null,
        remarks: formData.remarks || null,
        lapWeight: parseFloat(formData.lapWeight) || null,
        avgLapWeight: parseFloat(formData.avgLapWeight) || null,
        betweenCV: parseFloat(formData.betweenCV) || null,
        withinCVPer: parseFloat(formData.withinCVPer) || null,
        mcdA: parseFloat(formData.mcdA) || null,
        mcdB: parseFloat(formData.mcdB) || null,
        mcdDraft: parseFloat(formData.mcdDraft) || null,
        lrdC: parseFloat(formData.lrdC) || null,
        lrdD: parseFloat(formData.lrdD) || null,
        fdPulley: parseFloat(formData.fdPulley) || null,
        fdDraft: parseFloat(formData.fdDraft) || null,
        cdPulley: parseFloat(formData.cdPulley) || null,
        cdDraft: parseFloat(formData.cdDraft) || null,
        ddPulley: parseFloat(formData.ddPulley) || null,
        ddDraft: parseFloat(formData.ddDraft) || null,
        tcdPulley: parseFloat(formData.tcdPulley) || null,
        tcdDraft: parseFloat(formData.tcdDraft) || null,
        bdPulley: parseFloat(formData.bdPulley) || null,
        bdDraft: parseFloat(formData.bdDraft) || null,
        idPulley: parseFloat(formData.idPulley) || null,
        idDraft: parseFloat(formData.idDraft) || null,
        g: parseFloat(formData.g) || null,
        h: parseFloat(formData.h) || null,
        draft: parseFloat(formData.draft) || null,
      };

      if (selectedEntryId) {
        await lapFormerService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await lapFormerService.create(payload);
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
      countId: '',
      lapMachine: '',
      noilsPercent: '',
      noOfEnds: '',
      rollerSettings: '',
      remarks: '',
      lapWeight: '',
      avgLapWeight: '',
      betweenCV: '',
      withinCVPer: '',
      mcdA: '',
      mcdB: '',
      mcdDraft: '',
      lrdC: '',
      lrdD: '',
      fdPulley: '',
      fdDraft: '',
      cdPulley: '',
      cdDraft: '',
      ddPulley: '',
      ddDraft: '',
      tcdPulley: '',
      tcdDraft: '',
      bdPulley: '',
      bdDraft: '',
      idPulley: '',
      idDraft: '',
      g: '',
      h: '',
      draft: '',
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

  // Filter entries for list view
  const filteredEntries = entries.filter(entry => {
    const searchString = `${entry.entryNo} ${entry.lapMachine || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lap Former</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all lap former entries</p>
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
            Lap Former Entries ({filteredEntries.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOILS%</th>
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
                    <td className="px-6 py-4 text-sm">{entry.lapMachine || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.countName || entry.countId}</td>
                    <td className="px-6 py-4 text-sm">{entry.noilsPercent || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">Lap Former</h1>
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
              {/* Entry No, Date, Count, Noils% Row */}
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
                    placeholder="e.g. 1"
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

              {/* Lap Mc, Feed Hank, Roller Settings Row */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lap Mc</label>
                  <input
                    type="text"
                    name="lapMachine"
                    value={formData.lapMachine}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. LABFORMER 1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Feed Hank</label>
                  <input
                    type="number"
                    value={selectedCount?.ActCount || ''}
                    readOnly
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                    placeholder="From Count"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Roller Settings</label>
                  <input
                    type="text"
                    name="rollerSettings"
                    value={formData.rollerSettings}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 42/44/46"
                  />
                </div>
              </div>

              {/* Remarks and No of Ends */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 0"
                  />
                </div>
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
                    placeholder="e.g. 24"
                  />
                </div>
              </div>

              {/* LapWeight, Between CV%, WithinCVPer, Avg Lap Weight */}
              {/* Lap Weight, Avg Lap Weight (Lap Weight 2), Between CV%, Within CV% */}
              <div className="mb-6 pb-4 border-b">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Lap Weight & CV %</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lap Weight</label>
                    <input
                      type="number"
                      name="lapWeight"
                      value={formData.lapWeight}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 69"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Avg Lap Weight (Lap Wt 2)</label>
                    <input
                      type="number"
                      name="avgLapWeight"
                      value={formData.avgLapWeight}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 68"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Between CV%</label>
                    <input
                      type="number"
                      name="betweenCV"
                      value={formData.betweenCV}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 0.59"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Within CV%</label>
                    <input
                      type="number"
                      name="withinCVPer"
                      value={formData.withinCVPer}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="e.g. 1.5"
                    />
                  </div>
                </div>
              </div>

              {/* MCD A, MCD B, LRD C, FD Pulley, LRD D, FD Draft */}
              <div className="mb-6 pb-4 border-b">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">MCD & LRD Settings</h2>
                <div className="grid grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MCD A</label>
                    <input
                      type="number"
                      name="mcdA"
                      value={formData.mcdA}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MCD B</label>
                    <input
                      type="number"
                      name="mcdB"
                      value={formData.mcdB}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="103.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">LRD C</label>
                    <input
                      type="number"
                      name="lrdC"
                      value={formData.lrdC}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="105"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">FD Pulley</label>
                    <input
                      type="number"
                      name="fdPulley"
                      value={formData.fdPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="96"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">LRD D</label>
                    <input
                      type="number"
                      name="lrdD"
                      value={formData.lrdD}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0.956"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">FD Draft</label>
                    <input
                      type="number"
                      name="fdDraft"
                      value={formData.fdDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0.85"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MCD Draft</label>
                    <input
                      type="number"
                      name="mcdDraft"
                      value={formData.mcdDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="1.016"
                    />
                  </div>
                </div>
              </div>

              {/* CD Pulley, DD Pulley, TCD Pulley, BD Pulley, TCD Draft, BD Draft */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">CD Pulley</h2>
                <div className="grid grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CD Pulley</label>
                    <input
                      type="number"
                      name="cdPulley"
                      value={formData.cdPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="102.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DD Pulley</label>
                    <input
                      type="number"
                      name="ddPulley"
                      value={formData.ddPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="102"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">TCD Pulley</label>
                    <input
                      type="number"
                      name="tcdPulley"
                      value={formData.tcdPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BD Pulley</label>
                    <input
                      type="number"
                      name="bdPulley"
                      value={formData.bdPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="56"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">TCD Draft</label>
                    <input
                      type="number"
                      name="tcdDraft"
                      value={formData.tcdDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0.95"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BD Draft</label>
                    <input
                      type="number"
                      name="bdDraft"
                      value={formData.bdDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0.59"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CD Draft</label>
                    <input
                      type="number"
                      name="cdDraft"
                      value={formData.cdDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="1.025"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DD Draft</label>
                    <input
                      type="number"
                      name="ddDraft"
                      value={formData.ddDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="1.069"
                    />
                  </div>
                </div>
              </div>

              {/* ID Pulley, G, DRAFT, ID Draft, H */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">ID Pulley</h2>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ID Pulley</label>
                    <input
                      type="number"
                      name="idPulley"
                      value={formData.idPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="102.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">G</label>
                    <input
                      type="number"
                      name="g"
                      value={formData.g}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="36"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DRAFT</label>
                    <input
                      type="number"
                      name="draft"
                      value={formData.draft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="1.46"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ID Draft</label>
                    <input
                      type="number"
                      name="idDraft"
                      value={formData.idDraft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="1.025"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">H</label>
                    <input
                      type="number"
                      name="h"
                      value={formData.h}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.1"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="40"
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

export default LapFormer;