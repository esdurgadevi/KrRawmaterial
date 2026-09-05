import React, { useState, useEffect } from 'react';
import qcEntryService from '../../services/admin2/transaction-qc/qcEntryService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';
import lotEntryService from '../../services/admin1/transaction-cotton/lotEntryService';

const QCEntryManagement = () => {
  // View states: 'list', 'view', 'edit', 'create'
  const [currentView, setCurrentView] = useState('list');
  const [selectedLotNo, setSelectedLotNo] = useState('');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // List view states
  const [qcEntries, setQcEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail view states
  const [lots, setLots] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [strMode, setStrMode] = useState('ICC');
  const [lotData, setLotData] = useState(null);
  
  // QC Form fields - matching backend model field names
  const [formData, setFormData] = useState({
    // Read-only fields from lot
    candyRate: '',
    weight: '',
    permitNo: '',
    
    // Test fields (matching backend model)
    rd: '',
    staple: '',
    plusB: '',
    moist: '',
    mr: '',
    ui: '',
    eLog: '',
    strength: '',
    mic: '',
    sfcN: '',
    tsfN: '',
    neps: '',
    sci: '',
    grade: '',
    ml50: '',
    conStaple: '',
    sfcStaple: '',
    sfcCW: '',
    tsfW: '',
    fqi: '',
    twoPointFiveMm: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchQCEntries = async () => {
    setLoading(true);
    try {
      const entries = await qcEntryService.getAll();
      console.log("Fetched QC entries:", entries);
      
      if (Array.isArray(entries)) {
        setQcEntries(entries);
      } else {
        console.error("Unexpected response format:", entries);
        setQcEntries([]);
      }
    } catch (error) {
      console.error('Error fetching QC entries:', error);
      setQcEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'list') {
      fetchQCEntries();
    } else {
      loadLotsForSelection();
    }
  }, [currentView]);

  const loadLotsForSelection = async () => {
    try {
      const [inwardRes, testResults] = await Promise.all([
        inwardLotService.getAll().catch(() => []),
        lotEntryService.getAllLots().catch(() => [])
      ]);
      
      const inwardLotsList = (Array.isArray(inwardRes) ? inwardRes : inwardRes?.data || inwardRes?.lots || []).map(l => ({
        id: l.id,
        lotNo: l.lotNo,
        ...l
      }));
      
      const testLotsList = (Array.isArray(testResults) ? testResults : testResults?.data || []).map(r => ({
        id: r.lotId || r.lot?.id || r.id,
        lotNo: r.lotNo || r.lot?.lotNo,
        ...(r.lot || {})
      }));

      const combined = [...inwardLotsList, ...testLotsList].filter(l => l && l.lotNo);
      const uniqueLots = Array.from(new Map(combined.map(l => [l.lotNo, l])).values());
      setLots(uniqueLots);
    } catch (error) {
      console.error('Error loading lots for selection:', error);
    }
  };

  // Real-time FQI Calculation: FQI = (2.5% * 0.46 * Strength * MR) / Mic
  // For HVI mode, Strength used in formula is (strength / 1.28)
  useEffect(() => {
    const t25 = parseFloat(formData.twoPointFiveMm);
    const str = parseFloat(formData.strength);
    const mr = parseFloat(formData.mr);
    const mic = parseFloat(formData.mic);

    if (!isNaN(t25) && !isNaN(str) && !isNaN(mr) && !isNaN(mic) && mic > 0) {
      const effStrength = strMode === 'HVI' ? (str / 1.28) : str;
      const calculatedFqi = ((t25 * 0.46 * effStrength * mr) / mic).toFixed(3);
      setFormData(prev => ({
        ...prev,
        fqi: calculatedFqi
      }));
    }
  }, [formData.twoPointFiveMm, formData.strength, formData.mr, formData.mic, strMode]);

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadLotDetails = async (lotNo) => {
    if (!lotNo) return;
    
    setDetailLoading(true);
    try {
      const response = await inwardLotService.getAll();
      const lotsList = response?.lots || response || [];
      const foundLot = lotsList.find(l => l.lotNo === lotNo);
      
      if (!foundLot) {
        console.error("Lot not found with number:", lotNo);
        setDetailLoading(false);
        return;
      }

      const lotDetails = await inwardLotService.getById(foundLot.id);
      console.log("Lot details fetched:", lotDetails);
      
      setSelectedLotId(lotDetails.id);
      setLotData(lotDetails);

      // Fetch corresponding LotTestResult for prefill
      let lotTestResult = null;
      try {
        const testResults = await lotEntryService.getAllLots();
        lotTestResult = (testResults || []).find(r => r.lotId === foundLot.id || r.lot?.id === foundLot.id);
      } catch (err) {
        console.error("Error fetching lot test result for prefill:", err);
      }

      // Check if existing QC entry exists for this lot
      let qcEntry = null;
      try {
        qcEntry = await qcEntryService.getQCEntryByLotId(foundLot.id);
        if (qcEntry) {
          setSelectedEntryId(qcEntry.id);
        }
      } catch (error) {
        console.log("No existing QC entry for this lot yet");
      }

      // Value picker: 1. QC Entry, 2. Lot Test Result, 3. Default
      const getVal = (qcVal, lotVal, defaultVal = '') => {
        if (qcVal !== undefined && qcVal !== null && qcVal !== '') return qcVal;
        if (lotVal !== undefined && lotVal !== null && lotVal !== '') return lotVal;
        return defaultVal;
      };

      const rdVal = getVal(qcEntry?.rd, lotTestResult?.rd, '');
      const stapleVal = getVal(qcEntry?.staple, lotTestResult?.staple, '');
      const plusBVal = getVal(qcEntry?.plusB, lotTestResult?.plusB, '');
      const moistVal = getVal(qcEntry?.moist, lotTestResult?.moist, '');
      const mrVal = getVal(qcEntry?.mr, lotTestResult?.mr, '');
      const uiVal = getVal(qcEntry?.ui, lotTestResult?.ui, '');
      const eLogVal = getVal(qcEntry?.eLog, lotTestResult?.eLog, '');
      const strengthVal = getVal(qcEntry?.strength, lotTestResult?.strength, '');
      const micVal = getVal(qcEntry?.mic, lotTestResult?.mic, '');
      const sciVal = getVal(qcEntry?.sci, lotTestResult?.sci, '');
      const gradeVal = getVal(qcEntry?.grade, lotTestResult?.grade, '');
      const ml50Val = getVal(qcEntry?.ml50, lotTestResult?.ml50, '');
      const conStapleVal = getVal(qcEntry?.conStaple, lotTestResult?.conStaple, '');
      const twoPointFiveMmVal = getVal(qcEntry?.twoPointFiveMm, lotTestResult?.twoPointFive, '');
      const strModeVal = getVal(qcEntry?.strMode, lotTestResult?.strMode, 'ICC');

      // Missing fields between Lot Test Result and QC Entry default to '0'
      const sfcStapleVal = getVal(qcEntry?.sfcStaple, null, '0');
      const sfcCWVal = getVal(qcEntry?.sfcCW, null, '0');
      const tsfWVal = getVal(qcEntry?.tsfW, null, '0');
      const sfcNVal = getVal(qcEntry?.sfcN, null, '0');
      const tsfNVal = getVal(qcEntry?.tsfN, null, '0');
      const nepsVal = getVal(qcEntry?.neps, null, '0');

      // Pre-calculate FQI if not set
      let fqiVal = getVal(qcEntry?.fqi, null, '');
      if (!fqiVal && twoPointFiveMmVal && strengthVal && mrVal && micVal && parseFloat(micVal) > 0) {
        const t25 = parseFloat(twoPointFiveMmVal);
        const str = parseFloat(strengthVal);
        const mr = parseFloat(mrVal);
        const mic = parseFloat(micVal);
        const effStrength = strModeVal === 'HVI' ? (str / 1.28) : str;
        fqiVal = ((t25 * 0.46 * effStrength * mr) / mic).toFixed(3);
      }

      setFormData(prev => ({
        ...prev,
        candyRate: lotDetails.candyRate || '',
        weight: lotDetails.nettWeight || '',
        permitNo: lotDetails.billNo || '',
        rd: rdVal,
        staple: stapleVal,
        plusB: plusBVal,
        moist: moistVal,
        mr: mrVal,
        ui: uiVal,
        eLog: eLogVal,
        strength: strengthVal,
        mic: micVal,
        sci: sciVal,
        grade: gradeVal,
        ml50: ml50Val,
        conStaple: conStapleVal,
        twoPointFiveMm: twoPointFiveMmVal,
        sfcStaple: sfcStapleVal,
        sfcCW: sfcCWVal,
        tsfW: tsfWVal,
        sfcN: sfcNVal,
        tsfN: tsfNVal,
        neps: nepsVal,
        fqi: fqiVal,
      }));

      if (strModeVal) setStrMode(strModeVal);
    } catch (error) {
      console.error('Error loading lot details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if ((currentView === 'view' || currentView === 'edit' || currentView === 'create') && selectedLotNo) {
      loadLotDetails(selectedLotNo);
    }
  }, [currentView, selectedLotNo, selectedEntryId]);

  // ============= CRUD OPERATIONS =============
  const handleView = (lotNo, entryId) => {
    setSelectedLotNo(lotNo);
    setSelectedEntryId(entryId);
    setCurrentView('view');
  };

  const handleEdit = (lotNo, entryId) => {
    setSelectedLotNo(lotNo);
    setSelectedEntryId(entryId);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setCurrentView('create');
    resetForm();
  };

  const handleDelete = async (id, lotNo) => {
    if (window.confirm(`Are you sure you want to delete QC entry for Lot ${lotNo}?`)) {
      try {
        await qcEntryService.delete(id);
        fetchQCEntries();
      } catch (error) {
        console.error('Error deleting QC entry:', error);
        alert('Error deleting QC entry');
      }
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!selectedLotId) {
        alert('Please select a lot');
        return;
      }

      // Get today's date for testDate
      const today = new Date().toISOString().split('T')[0];
      
      // Prepare payload matching backend model
      const payload = {
        inwardLotId: selectedLotId,
        testDate: today,
        strMode: strMode,
        
        // Map form fields to model fields (only include if they have values)
        ...(formData.rd && { rd: parseFloat(formData.rd) }),
        ...(formData.staple && { staple: parseFloat(formData.staple) }),
        ...(formData.plusB && { plusB: parseFloat(formData.plusB) }),
        ...(formData.moist && { moist: parseFloat(formData.moist) }),
        ...(formData.mr && { mr: parseFloat(formData.mr) }),
        ...(formData.ui && { ui: parseFloat(formData.ui) }),
        ...(formData.eLog && { eLog: parseFloat(formData.eLog) }),
        ...(formData.strength && { strength: parseFloat(formData.strength) }),
        ...(formData.mic && { mic: parseFloat(formData.mic) }),
        ...(formData.sfcN && { sfcN: parseFloat(formData.sfcN) }),
        ...(formData.tsfN && { tsfN: parseFloat(formData.tsfN) }),
        ...(formData.neps && { neps: parseInt(formData.neps) }),
        ...(formData.sci && { sci: parseInt(formData.sci) }),
        ...(formData.grade && { grade: formData.grade }),
        ...(formData.ml50 && { ml50: parseFloat(formData.ml50) }),
        ...(formData.conStaple && { conStaple: parseFloat(formData.conStaple) }),
        ...(formData.sfcStaple && { sfcStaple: parseFloat(formData.sfcStaple) }),
        ...(formData.sfcCW && { sfcCW: parseFloat(formData.sfcCW) }),
        ...(formData.tsfW && { tsfW: parseFloat(formData.tsfW) }),
        ...(formData.fqi && { fqi: parseFloat(formData.fqi) }),
        ...(formData.twoPointFiveMm && { twoPointFiveMm: parseFloat(formData.twoPointFiveMm) }),
      };

      console.log("Saving QC entry with payload:", payload);

      if (selectedEntryId) {
        // Update existing
        await qcEntryService.update(selectedEntryId, payload);
        alert('QC Entry updated successfully!');
      } else {
        // Create new
        await qcEntryService.create(payload);
        alert('QC Entry updated successfully!');
      }

      setCurrentView('list');
      fetchQCEntries();
      resetForm();
    } catch (error) {
      console.error('Error saving QC entry:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Error saving QC entry. Please check if an entry already exists for this lot.');
      }
    }
  };

  const resetForm = () => {
    setSelectedLotNo('');
    setSelectedLotId(null);
    setSelectedEntryId(null);
    setLotData(null);
    setStrMode('ICC');
    setFormData({
      candyRate: '',
      weight: '',
      permitNo: '',
      rd: '',
      staple: '',
      plusB: '',
      moist: '',
      mr: '',
      ui: '',
      eLog: '',
      strength: '',
      mic: '',
      sfcN: '',
      tsfN: '',
      neps: '',
      sci: '',
      grade: '',
      ml50: '',
      conStaple: '',
      sfcStaple: '',
      sfcCW: '',
      tsfW: '',
      fqi: '',
      twoPointFiveMm: '',
    });
  };

  const handleCancel = () => {
    setCurrentView('list');
    resetForm();
  };

  const handleLotSelect = async (e) => {
    const lotNo = e.target.value;
    setSelectedLotNo(lotNo);
    if (lotNo) {
      await loadLotDetails(lotNo);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
  const filteredEntries = qcEntries.filter(entry => {
    const searchString = `${entry.lotNo} ${entry.inwardLot?.lotNo || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">QC Entry Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all QC test entries and their details</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search QC entries by lot number..."
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
            Update QC Entry
          </button>
          <button
            onClick={fetchQCEntries}
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
            QC Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LOT NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TEST DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KEY RESULTS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STR MODE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No QC entries found</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{entry.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{entry.lotNo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{formatDate(entry.testDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-x-2 text-xs">
                        <div><span className="text-gray-500">Staple:</span> {entry.staple || '-'}</div>
                        <div><span className="text-gray-500">Mic:</span> {entry.mic || '-'}</div>
                        <div><span className="text-gray-500">Strength:</span> {entry.strength || '-'}</div>
                        <div><span className="text-gray-500">SCI:</span> {entry.sci || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{entry.strMode || 'ICC'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleView(entry.lotNo, entry.id)} 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id, entry.lotNo)} 
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ============= RENDER DETAIL VIEW (Create/Edit/View) =============
  const renderDetailView = () => {
    const isReadOnly = currentView === 'view';
    const isCreate = currentView === 'create';
    
    return (
      <div className="p-6 max-w-7xl mx-auto txn-qc-form">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {isCreate ? 'Update QC Entry' : isReadOnly ? `View QC Entry - Lot ${selectedLotNo}` : `Edit QC Entry - Lot ${selectedLotNo}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">To Add, Modify, Delete the Lot Test Result</p>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>

        {/* Lot Selection for Create */}
        {isCreate && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Lot No.</label>
            <select
              value={selectedLotNo}
              onChange={handleLotSelect}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            >
              <option value="">Choose a lot</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.lotNo}>{lot.lotNo}</option>
              ))}
            </select>
          </div>
        )}

        {/* Main Content */}
        {selectedLotNo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {detailLoading ? (
              <div className="text-center py-10">Loading lot details...</div>
            ) : (
              <>
                {/* Header Info with Dates */}
                <div className="grid grid-cols-6 gap-4 mb-6 pb-4 border-b">
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Lot No.</div>
                    <div className="text-sm font-medium">{selectedLotNo}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Lot Date</div>
                    <div className="text-sm font-medium">{lotData?.lotDate ? formatDate(lotData.lotDate) : '-'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Bill No.</div>
                    <div className="text-sm font-medium">{lotData?.billNo || '-'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500">Bill Date</div>
                    <div className="text-sm font-medium">{lotData?.billDate ? formatDate(lotData.billDate) : '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Supplier</div>
                    <div className="text-sm font-medium">{lotData?.supplier || '-'}</div>
                  </div>
                </div>

                {/* Second Row - Variety, Station */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500">Variety</div>
                    <div className="text-sm font-medium">{lotData?.variety || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Station</div>
                    <div className="text-sm font-medium">{lotData?.station || '-'}</div>
                  </div>
                </div>

                {/* Candy Rate & Weight Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
                  <div>
                    <div className="text-xs text-gray-500">Candy Rate</div>
                    <div className="text-sm font-medium">{lotData?.candyRate || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Net Weight</div>
                    <div className="text-sm font-medium">{lotData?.nettWeight || '-'}</div>
                  </div>
                </div>

                {/* QC Test Results Grid - Two Column Layout */}
                <div className="grid grid-cols-2 gap-8 mt-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* RD & Staple */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">RD</label>
                        <input 
                          type="number" 
                          name="rd" 
                          value={formData.rd} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.01"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Staple</label>
                        <input 
                          type="number" 
                          name="staple" 
                          value={formData.staple} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* +B & Moist */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">+B</label>
                        <input 
                          type="number" 
                          name="plusB" 
                          value={formData.plusB} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Moist</label>
                        <input 
                          type="number" 
                          name="moist" 
                          value={formData.moist} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* MR & UI */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">MR</label>
                        <input 
                          type="number" 
                          name="mr" 
                          value={formData.mr} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.01"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">UI</label>
                        <input 
                          type="number" 
                          name="ui" 
                          value={formData.ui} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* E Log & Strength */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">E Log</label>
                        <input 
                          type="number" 
                          name="eLog" 
                          value={formData.eLog} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
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
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Mic & SFCN */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mic</label>
                        <input 
                          type="number" 
                          name="mic" 
                          value={formData.mic} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.01"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFCN</label>
                        <input 
                          type="number" 
                          name="sfcN" 
                          value={formData.sfcN} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* TSFN & NEPS */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">TSFN</label>
                        <input 
                          type="number" 
                          name="tsfN" 
                          value={formData.tsfN} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">NEPS</label>
                        <input 
                          type="number" 
                          name="neps" 
                          value={formData.neps} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* SCI & Grade */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SCI</label>
                        <input 
                          type="number" 
                          name="sci" 
                          value={formData.sci} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Grade</label>
                        <input 
                          type="text" 
                          name="grade" 
                          value={formData.grade} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* ML 50% & Con Staple */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">ML 50%</label>
                        <input 
                          type="number" 
                          name="ml50" 
                          value={formData.ml50} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.01"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Con Staple</label>
                        <input 
                          type="number" 
                          name="conStaple" 
                          value={formData.conStaple} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* SFC Staple & SFC CW */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFC Staple</label>
                        <input 
                          type="number" 
                          name="sfcStaple" 
                          value={formData.sfcStaple} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">SFC CW</label>
                        <input 
                          type="number" 
                          name="sfcCW" 
                          value={formData.sfcCW} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* TSF W & FQI */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">TSF W</label>
                        <input 
                          type="number" 
                          name="tsfW" 
                          value={formData.tsfW} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">FQI</label>
                        <input 
                          type="number" 
                          name="fqi" 
                          value={formData.fqi} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.1"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* 2.5mm */}
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">2.5 mm</label>
                        <input 
                          type="number" 
                          name="twoPointFiveMm" 
                          value={formData.twoPointFiveMm} 
                          onChange={handleInputChange} 
                          readOnly={isReadOnly} 
                          step="0.01"
                          className={`w-full px-2 py-1 border rounded text-sm ${isReadOnly ? 'bg-gray-50' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section with Radio and Buttons */}
                <div className="mt-8 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <span className="text-sm font-medium text-gray-700">Str. Mode</span>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strMode" 
                        value="ICC" 
                        checked={strMode === 'ICC'} 
                        onChange={(e) => setStrMode(e.target.value)} 
                        disabled={isReadOnly} 
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span className="text-sm text-gray-700">ICC</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="strMode" 
                        value="HVI" 
                        checked={strMode === 'HVI'} 
                        onChange={(e) => setStrMode(e.target.value)} 
                        disabled={isReadOnly} 
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span className="text-sm text-gray-700">HVI</span>
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    {!isReadOnly && (
                      <button 
                        onClick={handleSave} 
                        className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Update
                      </button>
                    )}
                    <button 
                      onClick={handleCancel} 
                      className="px-6 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main render
  return currentView === 'list' ? renderListView() : renderDetailView();
};

export default QCEntryManagement;