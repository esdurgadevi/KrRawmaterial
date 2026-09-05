import React, { useState, useEffect } from 'react';
import qcSimplexService from '../../services/admin2/transaction-qc/qcSimplexService';
import spinningCountService from '../../services/admin2/master/spinningCountService';
import simplexMachineService from '../../services/admin2/master/simplexMachineService';

const QCSimplex = () => {
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
    shift: '',
    type: '',
    countId: '',
    simplexId: '',
    noilsPercent: '',
    feedHank: '',
    tpi: '',
    checkedHank: '',
    remarks: '',
    
    // Draft Section
    cp: '',
    brw: '',
    bdw: '',
    draft: '',
    
    // Twist Wheel
    g: '',
    h: '',
    tw: '',
    
    // Lifter Wheel
    e: '',
    f: '',
    l: '',
    
    spacer: '',
    floating: '',
    middle: '',
    back: '',
    
    // Wheels / Pullys
    tension: '',
    creelTension: '',
    coneDrumEnd: '',
    motorPully: '',
    machinePully: '',
    
    bottomRoll: '',
    bottomApron: '',
    topRoll: '',
    topApron: '',
    lift: '',
    
    flyerType: '',
    topArm: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await qcSimplexService.getAll();
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
      const entry = await qcSimplexService.getById(id);
      console.log("Loaded entry:", entry);
      
      setFormData({
        entryNo: entry.entryNo || '',
        date: entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0],
        shift: entry.shift || '',
        type: entry.type || '',
        countId: entry.countId || '',
        simplexId: entry.simplexId || '',
        noilsPercent: entry.noilsPercent || '',
        feedHank: entry.feedHank || '',
        tpi: entry.tpi || '',
        checkedHank: entry.checkedHank || '',
        remarks: entry.remarks || '',
        
        cp: entry.cp || '',
        brw: entry.brw || '',
        bdw: entry.bdw || '',
        draft: entry.draft || '',
        
        g: entry.g || '',
        h: entry.h || '',
        tw: entry.tw || '',
        
        e: entry.e || '',
        f: entry.f || '',
        l: entry.l || '',
        
        spacer: entry.spacer || '',
        floating: entry.floating || '',
        middle: entry.middle || '',
        back: entry.back || '',
        
        tension: entry.tension || '',
        creelTension: entry.creelTension || '',
        coneDrumEnd: entry.coneDrumEnd || '',
        motorPully: entry.motorPully || '',
        machinePully: entry.machinePully || '',
        
        bottomRoll: entry.bottomRoll || '',
        bottomApron: entry.bottomApron || '',
        topRoll: entry.topRoll || '',
        topApron: entry.topApron || '',
        lift: entry.lift || '',
        
        flyerType: entry.flyerType || '',
        topArm: entry.topArm || '',
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
        await qcSimplexService.delete(id);
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
        type: formData.type || null,
        countId: parseInt(formData.countId),
        simplexId: parseInt(formData.simplexId),
        noilsPercent: parseFloat(formData.noilsPercent) || null,
        feedHank: parseFloat(formData.feedHank) || null,
        tpi: parseFloat(formData.tpi) || null,
        checkedHank: parseFloat(formData.checkedHank) || null,
        remarks: formData.remarks || null,
        
        cp: parseFloat(formData.cp) || null,
        brw: parseFloat(formData.brw) || null,
        bdw: parseFloat(formData.bdw) || null,
        draft: parseFloat(formData.draft) || null,
        
        g: parseFloat(formData.g) || null,
        h: parseFloat(formData.h) || null,
        tw: parseFloat(formData.tw) || null,
        
        e: parseFloat(formData.e) || null,
        f: parseFloat(formData.f) || null,
        l: parseFloat(formData.l) || null,
        
        spacer: formData.spacer || null,
        floating: formData.floating || null,
        middle: formData.middle || null,
        back: formData.back || null,
        
        tension: parseFloat(formData.tension) || null,
        creelTension: parseFloat(formData.creelTension) || null,
        coneDrumEnd: parseFloat(formData.coneDrumEnd) || null,
        motorPully: parseFloat(formData.motorPully) || null,
        machinePully: parseFloat(formData.machinePully) || null,
        
        bottomRoll: formData.bottomRoll || null,
        bottomApron: formData.bottomApron || null,
        topRoll: formData.topRoll || null,
        topApron: formData.topApron || null,
        lift: formData.lift || null,
        
        flyerType: formData.flyerType || null,
        topArm: formData.topArm || null,
      };

      if (selectedEntryId) {
        await qcSimplexService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await qcSimplexService.create(payload);
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
      shift: '',
      type: '',
      countId: '',
      simplexId: '',
      noilsPercent: '',
      feedHank: '',
      tpi: '',
      checkedHank: '',
      remarks: '',
      
      cp: '',
      brw: '',
      bdw: '',
      draft: '',
      
      g: '',
      h: '',
      tw: '',
      
      e: '',
      f: '',
      l: '',
      
      spacer: '',
      floating: '',
      middle: '',
      back: '',
      
      tension: '',
      creelTension: '',
      coneDrumEnd: '',
      motorPully: '',
      machinePully: '',
      
      bottomRoll: '',
      bottomApron: '',
      topRoll: '',
      topApron: '',
      lift: '',
      
      flyerType: '',
      topArm: '',
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

  const handleSimplexChange = async (e) => {
    const simplexId = e.target.value;
    setFormData(prev => ({ ...prev, simplexId }));
    
    if (simplexId) {
      try {
        const simplex = await simplexMachineService.getById(simplexId);
        setSelectedSimplex(simplex);
        setFormData(prev => ({
          ...prev,
          feedHank: simplex.feedHank || ''
        }));
      } catch (error) {
        console.error('Error fetching simplex details:', error);
      }
    } else {
      setSelectedSimplex(null);
      setFormData(prev => ({ ...prev, feedHank: '' }));
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
        <h1 className="text-2xl font-semibold text-gray-800">QC Simplex</h1>
        <p className="text-sm text-gray-500 mt-1">To Add, Modify and Delete Simplex Details</p>
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
            QC Simplex Entries ({filteredEntries.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIMPLEX</th>
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
                    <td className="px-6 py-4 text-sm">{entry.countName || entry.countId}</td>
                    <td className="px-6 py-4 text-sm">{entry.simplexName || entry.simplexId}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">QC Simplex</h1>
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
              {/* Entry No, Date, Shift Row */}
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
                    placeholder="e.g. 31"
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

              {/* Noils%, TPI, Checked Hank, Feed Hank Row */}
              <div className="grid grid-cols-4 gap-4 mb-6 pb-4 border-b">
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">TPI</label>
                  <input
                    type="number"
                    name="tpi"
                    value={formData.tpi}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 1.536"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Checked Hank</label>
                  <input
                    type="number"
                    name="checkedHank"
                    value={formData.checkedHank}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    step="0.0001"
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="e.g. 1.4000"
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
                    placeholder="From Simplex"
                  />
                </div>
              </div>

              {/* Simplex Details Row */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Simplex Details</label>
                  <input
                    type="text"
                    value={selectedSimplex ? `${selectedSimplex.mcNo} - ${selectedSimplex.mcId}` : ''}
                    readOnly
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md text-sm"
                    placeholder="SIMPLEX6"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type / Remarks</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="WITOUT-TENSION"
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
                    placeholder="Additional remarks"
                  />
              </div>

              {/* Draft Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Draft</h2>
                <div className="grid grid-cols-6 gap-4">
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
                      placeholder="54.00"
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
                      placeholder="69"
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
                      placeholder="55"
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
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">TW</label>
                    <input
                      type="number"
                      name="tw"
                      value={formData.tw}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="54"
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
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="72"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DRAFT</label>
                    <input
                      type="number"
                      name="draft"
                      value={formData.draft}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      step="0.001"
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="10.083"
                    />
                  </div>
                </div>
              </div>

              {/* Lifter Wheel Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Lifter Wheel</h2>
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
                      placeholder="54"
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
                      placeholder=""
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
                      placeholder="39"
                    />
                  </div>
                </div>
              </div>

              {/* Spacer Colors Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Spacer / Colors</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Spacer</label>
                    <input
                      type="text"
                      name="spacer"
                      value={formData.spacer}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="BLACK"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Floating</label>
                    <input
                      type="text"
                      name="floating"
                      value={formData.floating}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="GREEN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Middle</label>
                    <input
                      type="text"
                      name="middle"
                      value={formData.middle}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="GREEN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Back</label>
                    <input
                      type="text"
                      name="back"
                      value={formData.back}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="GREEN"
                    />
                  </div>
                </div>
              </div>

              {/* Wheels - Pulls Section */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Wheels - Pulls</h2>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tension</label>
                    <input
                      type="number"
                      name="tension"
                      value={formData.tension}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Creel Tension</label>
                    <input
                      type="number"
                      name="creelTension"
                      value={formData.creelTension}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="42"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cone Drum End</label>
                    <input
                      type="number"
                      name="coneDrumEnd"
                      value={formData.coneDrumEnd}
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
                    <label className="block text-xs text-gray-500 mb-1">Machine Pully</label>
                    <input
                      type="number"
                      name="machinePully"
                      value={formData.machinePully}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Roll Details Section */}
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
                        placeholder="47/55/46"
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
                        placeholder="54/52/46"
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
                        placeholder="36*40"
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
                        placeholder="76*40"
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
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flyer Type and Top Arm */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Flyer Type</label>
                  <input
                    type="text"
                    name="flyerType"
                    value={formData.flyerType}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="LMW HN"
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
                    placeholder="SKF PK 1500A"
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

export default QCSimplex;