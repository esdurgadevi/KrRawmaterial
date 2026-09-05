import React, { useState, useEffect } from 'react';
import spinningLongFrameService from '../../services/admin2/transaction-qc/spinningLongFrameService';
import spinningCountService from '../../services/admin2/master/spinningCountService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';

const SpinningLongFrame = () => {
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
  
  // Form fields - matching the image layout
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().split('T')[0],
    countId: '',
    simplexId: '',
    rf: '',
    side: 'LEFT',
    tpi: '',
    cp: '',
    brw: '',
    bdw: '',
    draft: '',
    twistA: '',
    twistB: '',
    twistC: '',
    twistD: '',
    e: '',
    f: '',
    l: '',
    ratchet: '',
    spacer: '',
    tr: '',
    bottomRoll: '',
    topRoll: '',
    bottomApron: '',
    topApron: '',
    chaseLength: '',
    spindleType: '',
    ringDiaType: '',
    lift: '',
    topArm: '',
    remarks: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await spinningLongFrameService.getAll();
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
      const entry = await spinningLongFrameService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        countId: entry.countId || '',
        simplexId: entry.simplexId || '',
        rf: entry.rf || '',
        side: entry.side || 'LEFT',
        tpi: entry.tpi || '',
        cp: entry.cp || '',
        brw: entry.brw || '',
        bdw: entry.bdw || '',
        draft: entry.draft || '',
        twistA: entry.twistA || '',
        twistB: entry.twistB || '',
        twistC: entry.twistC || '',
        twistD: entry.twistD || '',
        e: entry.e || '',
        f: entry.f || '',
        l: entry.l || '',
        ratchet: entry.ratchet || '',
        spacer: entry.spacer || '',
        tr: entry.tr || '',
        bottomRoll: entry.bottomRoll || '',
        topRoll: entry.topRoll || '',
        bottomApron: entry.bottomApron || '',
        topApron: entry.topApron || '',
        chaseLength: entry.chaseLength || '',
        spindleType: entry.spindleType || '',
        ringDiaType: entry.ringDiaType || '',
        lift: entry.lift || '',
        topArm: entry.topArm || '',
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
        await spinningLongFrameService.delete(id);
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
        entryNo: formData.entryNo,
        date: formData.date,
        countId: parseInt(formData.countId),
        simplexId: parseInt(formData.simplexId),
        rf: formData.rf || null,
        side: formData.side,
        tpi: parseFloat(formData.tpi) || null,
        cp: parseFloat(formData.cp) || null,
        brw: parseFloat(formData.brw) || null,
        bdw: parseFloat(formData.bdw) || null,
        draft: parseFloat(formData.draft) || null,
        twistA: parseFloat(formData.twistA) || null,
        twistB: parseFloat(formData.twistB) || null,
        twistC: parseFloat(formData.twistC) || null,
        twistD: parseFloat(formData.twistD) || null,
        e: parseFloat(formData.e) || null,
        f: parseFloat(formData.f) || null,
        l: parseFloat(formData.l) || null,
        ratchet: parseFloat(formData.ratchet) || null,
        spacer: formData.spacer || null,
        tr: formData.tr || null,
        bottomRoll: formData.bottomRoll || null,
        topRoll: formData.topRoll || null,
        bottomApron: formData.bottomApron || null,
        topApron: formData.topApron || null,
        chaseLength: formData.chaseLength || null,
        spindleType: formData.spindleType || null,
        ringDiaType: formData.ringDiaType || null,
        lift: formData.lift || null,
        topArm: formData.topArm || null,
        remarks: formData.remarks || null,
      };

      if (selectedEntryId) {
        await spinningLongFrameService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await spinningLongFrameService.create(payload);
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
      countId: '',
      simplexId: '',
      rf: '',
      side: 'LEFT',
      tpi: '',
      cp: '',
      brw: '',
      bdw: '',
      draft: '',
      twistA: '',
      twistB: '',
      twistC: '',
      twistD: '',
      e: '',
      f: '',
      l: '',
      ratchet: '',
      spacer: '',
      tr: '',
      bottomRoll: '',
      topRoll: '',
      bottomApron: '',
      topApron: '',
      chaseLength: '',
      spindleType: '',
      ringDiaType: '',
      lift: '',
      topArm: '',
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
      } catch (error) {
        console.error('Error fetching count details:', error);
      }
    } else {
      setSelectedCount(null);
    }
  };

  const handleSimplexChange = async (e) => {
    const simplexId = e.target.value;
    setFormData(prev => ({ ...prev, simplexId }));
    
    if (simplexId) {
      try {
        const simplex = await simplexMachineService.getById(simplexId);
        setSelectedSimplex(simplex);
      } catch (error) {
        console.error('Error fetching simplex details:', error);
      }
    } else {
      setSelectedSimplex(null);
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
    const searchString = `${entry.entryNo} ${entry.countName || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Spinning (Long Frame)</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all spinning long frame entries</p>
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
            Spinning Long Frame Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COUNT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIMPLEX</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIDE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CREATED DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No entries found</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{entry.entryNo}</div>
                      <div className="text-xs text-gray-500">ID: {entry.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(entry.date)}</td>
                    <td className="px-6 py-4 text-sm">{entry.countName || entry.countId}</td>
                    <td className="px-6 py-4 text-sm">{entry.simplexName || entry.simplexId}</td>
                    <td className="px-6 py-4 text-sm">{entry.side || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">Spinning (Long Frame)</h1>
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
              {/* Header Row with Entry No, Date, Count, Noils% */}
              <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entry No</label>
                  <input
                    type="text"
                    name="entryNo"
                    value={formData.entryNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 587"
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
                    type="text"
                    value={selectedCount?.Noils || ''}
                    readOnly
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Simplex, Feed Hank, RF, Side, TPI */}
              <div className="grid grid-cols-5 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Simplex</label>
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Feed Hank</label>
                  <input
                    type="text"
                    value={selectedSimplex?.feedHank || ''}
                    readOnly
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">RF</label>
                  <input
                    type="text"
                    name="rf"
                    value={formData.rf}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Side</label>
                  <select
                    name="side"
                    value={formData.side}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  >
                    <option value="LEFT">LEFT</option>
                    <option value="RIGHT">RIGHT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TPI</label>
                  <input
                    type="number"
                    name="tpi"
                    value={formData.tpi}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-6 pb-4 border-b">
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

              {/* Draft Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Draft</h2>
                <div className="grid grid-cols-4 gap-4">
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
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BRW</label>
                    <input
                      type="number"
                      name="brw"
                      value={formData.brw}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BDW</label>
                    <input
                      type="number"
                      name="bdw"
                      value={formData.bdw}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
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
                    />
                  </div>
                </div>
              </div>

              {/* Twist Wheel Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Twist Wheel</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">A</label>
                    <input
                      type="number"
                      name="twistA"
                      value={formData.twistA}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">B</label>
                    <input
                      type="number"
                      name="twistB"
                      value={formData.twistB}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">C</label>
                    <input
                      type="number"
                      name="twistC"
                      value={formData.twistC}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">D</label>
                    <input
                      type="number"
                      name="twistD"
                      value={formData.twistD}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Winding Length Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Winding Length</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">E</label>
                    <input
                      type="number"
                      name="e"
                      value={formData.e}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">F</label>
                    <input
                      type="number"
                      name="f"
                      value={formData.f}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">L</label>
                    <input
                      type="number"
                      name="l"
                      value={formData.l}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Roll & Top Roll Section */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Bottom Roll</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Bottom Roll</label>
                      <input
                        type="text"
                        name="bottomRoll"
                        value={formData.bottomRoll}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. 42.5/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Bottom Apron</label>
                      <input
                        type="text"
                        name="bottomApron"
                        value={formData.bottomApron}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. 80.5*30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Chase Length</label>
                      <input
                        type="text"
                        name="chaseLength"
                        value={formData.chaseLength}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. 48MM"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Roll</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Top Roll</label>
                      <input
                        type="text"
                        name="topRoll"
                        value={formData.topRoll}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. 51/61"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Top Apron</label>
                      <input
                        type="text"
                        name="topApron"
                        value={formData.topApron}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. 38.1*30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Spindle Type</label>
                      <input
                        type="text"
                        name="spindleType"
                        value={formData.spindleType}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="e.g. LMW HN"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ratchet, Spacer, TR Section */}
              <div className="grid grid-cols-3 gap-4 mb-6">
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
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Spacer</label>
                  <input
                    type="text"
                    name="spacer"
                    value={formData.spacer}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 3.50MM"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TR</label>
                  <input
                    type="text"
                    name="tr"
                    value={formData.tr}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 14/OU1ELUDR"
                  />
                </div>
              </div>

              {/* Ring Dia Type, Lift, Top Arm */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ring Dia Type</label>
                  <input
                    type="text"
                    name="ringDiaType"
                    value={formData.ringDiaType}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 36MM EMPERROR"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lift</label>
                  <input
                    type="text"
                    name="lift"
                    value={formData.lift}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 160MM"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Top Arm</label>
                  <input
                    type="text"
                    name="topArm"
                    value={formData.topArm}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. P3-1"
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

export default SpinningLongFrame;