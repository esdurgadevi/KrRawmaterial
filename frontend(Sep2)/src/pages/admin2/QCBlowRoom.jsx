import React, { useState, useEffect } from 'react';
import qcBlowRoomService from '../../services/admin2/transaction-qc/qcBlowRoomService';

const QCBlowRoom = () => {
  // View states: 'list', 'view', 'edit', 'create'
  const [currentView, setCurrentView] = useState('list');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  // List view states
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail view states
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Form fields - matching the model
  const [formData, setFormData] = useState({
    entryNo: '',
    date: new Date().toISOString().slice(0, 16),
    mixNo: '',
    remarks: '',
    
    // Bale Plucker / Vario Cleaner
    bpmPulley: '',
    bpfPulley: '',
    bpSpeed: '',
    vcSpeed: '',
    vcGrid: '',
    
    // Unimix
    u1Lattice: '',
    u2Lattice: '',
    u1Conveyer: '',
    u2Conveyer: '',
    u1Beater: '',
    u2Beater: '',
    u1MPulley: '',
    u2MPulley: '',
    u1FPulley: '',
    u2FPulley: '',
    
    // Flexi
    f1Beater: '',
    f2Beater: '',
    f1GridBar: '',
    f2GridBar: '',
    f1Waste: '',
    f2Waste: '',
    f1TtoF: '',
    f2TtoF: '',
    f1RtoB: '',
    f2RtoB: '',
    f1FtoF: '',
    f2FtoF: '',
    f1MPulley: '',
    f2MPulley: '',
    f1FPulley: '',
    f2FPulley: '',
  });

  // ============= LIST VIEW FUNCTIONS =============
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await qcBlowRoomService.getAll();
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
    if (currentView === 'list') {
      fetchEntries();
    }
  }, [currentView]);

  // ============= DETAIL VIEW FUNCTIONS =============
  const loadEntryDetails = async (id) => {
    setDetailLoading(true);
    try {
      const entry = await qcBlowRoomService.getById(id);
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
        mixNo: entry.mixNo || '',
        remarks: entry.remarks || '',
        
        bpmPulley: entry.bpmPulley || '',
        bpfPulley: entry.bpfPulley || '',
        bpSpeed: entry.bpSpeed || '',
        vcSpeed: entry.vcSpeed || '',
        vcGrid: entry.vcGrid || '',
        
        u1Lattice: entry.u1Lattice || '',
        u2Lattice: entry.u2Lattice || '',
        u1Conveyer: entry.u1Conveyer || '',
        u2Conveyer: entry.u2Conveyer || '',
        u1Beater: entry.u1Beater || '',
        u2Beater: entry.u2Beater || '',
        u1MPulley: entry.u1MPulley || '',
        u2MPulley: entry.u2MPulley || '',
        u1FPulley: entry.u1FPulley || '',
        u2FPulley: entry.u2FPulley || '',
        
        f1Beater: entry.f1Beater || '',
        f2Beater: entry.f2Beater || '',
        f1GridBar: entry.f1GridBar || '',
        f2GridBar: entry.f2GridBar || '',
        f1Waste: entry.f1Waste || '',
        f2Waste: entry.f2Waste || '',
        f1TtoF: entry.f1TtoF || '',
        f2TtoF: entry.f2TtoF || '',
        f1RtoB: entry.f1RtoB || '',
        f2RtoB: entry.f2RtoB || '',
        f1FtoF: entry.f1FtoF || '',
        f2FtoF: entry.f2FtoF || '',
        f1MPulley: entry.f1MPulley || '',
        f2MPulley: entry.f2MPulley || '',
        f1FPulley: entry.f1FPulley || '',
        f2FPulley: entry.f2FPulley || '',
      });
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
        await qcBlowRoomService.delete(id);
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
        mixNo: parseInt(formData.mixNo) || null,
        remarks: formData.remarks || null,
        
        bpmPulley: formData.bpmPulley || null,
        bpfPulley: formData.bpfPulley || null,
        bpSpeed: formData.bpSpeed || null,
        vcSpeed: formData.vcSpeed || null,
        vcGrid: formData.vcGrid || null,
        
        u1Lattice: formData.u1Lattice || null,
        u2Lattice: formData.u2Lattice || null,
        u1Conveyer: formData.u1Conveyer || null,
        u2Conveyer: formData.u2Conveyer || null,
        u1Beater: formData.u1Beater || null,
        u2Beater: formData.u2Beater || null,
        u1MPulley: formData.u1MPulley || null,
        u2MPulley: formData.u2MPulley || null,
        u1FPulley: formData.u1FPulley || null,
        u2FPulley: formData.u2FPulley || null,
        
        f1Beater: formData.f1Beater || null,
        f2Beater: formData.f2Beater || null,
        f1GridBar: formData.f1GridBar || null,
        f2GridBar: formData.f2GridBar || null,
        f1Waste: formData.f1Waste || null,
        f2Waste: formData.f2Waste || null,
        f1TtoF: formData.f1TtoF || null,
        f2TtoF: formData.f2TtoF || null,
        f1RtoB: formData.f1RtoB || null,
        f2RtoB: formData.f2RtoB || null,
        f1FtoF: formData.f1FtoF || null,
        f2FtoF: formData.f2FtoF || null,
        f1MPulley: formData.f1MPulley || null,
        f2MPulley: formData.f2MPulley || null,
        f1FPulley: formData.f1FPulley || null,
        f2FPulley: formData.f2FPulley || null,
      };

      if (selectedEntryId) {
        await qcBlowRoomService.update(selectedEntryId, payload);
        alert('Entry updated successfully!');
      } else {
        await qcBlowRoomService.create(payload);
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
    setFormData({
      entryNo: '',
      date: new Date().toISOString().slice(0, 16),
      mixNo: '',
      remarks: '',
      
      bpmPulley: '',
      bpfPulley: '',
      bpSpeed: '',
      vcSpeed: '',
      vcGrid: '',
      
      u1Lattice: '',
      u2Lattice: '',
      u1Conveyer: '',
      u2Conveyer: '',
      u1Beater: '',
      u2Beater: '',
      u1MPulley: '',
      u2MPulley: '',
      u1FPulley: '',
      u2FPulley: '',
      
      f1Beater: '',
      f2Beater: '',
      f1GridBar: '',
      f2GridBar: '',
      f1Waste: '',
      f2Waste: '',
      f1TtoF: '',
      f2TtoF: '',
      f1RtoB: '',
      f2RtoB: '',
      f1FtoF: '',
      f2FtoF: '',
      f1MPulley: '',
      f2MPulley: '',
      f1FPulley: '',
      f2FPulley: '',
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
    const searchString = `${entry.entryNo} ${entry.mixNo || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // ============= RENDER LIST VIEW =============
  const renderListView = () => (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">QC Blow Room</h1>
        <p className="text-sm text-gray-500 mt-1">To Add, Modify and Delete Blow Room Details</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by entry number or mix number..."
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
            QC Blow Room Entries ({filteredEntries.length})
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ENTRY NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DATE & TIME</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MIX NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">REMARKS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CREATED DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No entries found</td></tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{entry.entryNo}</div>
                      <div className="text-xs text-gray-500">ID: {entry.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDateTime(entry.date)}</td>
                    <td className="px-6 py-4 text-sm">{entry.mixNo || '-'}</td>
                    <td className="px-6 py-4 text-sm">{entry.remarks || '-'}</td>
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
            <h1 className="text-2xl font-semibold text-gray-800">QC Blow Room</h1>
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
              {/* Basic Info Row */}
              <div className="grid grid-cols-4 gap-4 mb-8 pb-4 border-b">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entry No</label>
                  <input
                    type="number"
                    name="entryNo"
                    value={formData.entryNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="Entry Number"
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
                  <label className="block text-xs text-gray-500 mb-1">Mix No</label>
                  <input
                    type="number"
                    name="mixNo"
                    value={formData.mixNo}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                    placeholder="Mix Number"
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
                    placeholder="Remarks"
                  />
                </div>
              </div>

              {/* Bale Plucker / Vario Cleaner Section */}
              <div className="mb-8">
                <h2 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">Bale Plucker / Vario Cleaner</h2>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BPM Pulley</label>
                    <input
                      type="text"
                      name="bpmPulley"
                      value={formData.bpmPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="BPM Pulley"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BPF Pulley</label>
                    <input
                      type="text"
                      name="bpfPulley"
                      value={formData.bpfPulley}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="BPF Pulley"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">BP Speed</label>
                    <input
                      type="text"
                      name="bpSpeed"
                      value={formData.bpSpeed}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="BP Speed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">VC Speed</label>
                    <input
                      type="text"
                      name="vcSpeed"
                      value={formData.vcSpeed}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="VC Speed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">VC Grid</label>
                    <input
                      type="text"
                      name="vcGrid"
                      value={formData.vcGrid}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                      placeholder="VC Grid"
                    />
                  </div>
                </div>
              </div>

              {/* Unimix Section */}
              <div className="mb-8">
                <h2 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">Unimix</h2>
                
                {/* Lattice */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Lattice</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U1 Lattice</label>
                      <input
                        type="text"
                        name="u1Lattice"
                        value={formData.u1Lattice}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U1 Lattice"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U2 Lattice</label>
                      <input
                        type="text"
                        name="u2Lattice"
                        value={formData.u2Lattice}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U2 Lattice"
                      />
                    </div>
                  </div>
                </div>

                {/* Conveyer */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Conveyer</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U1 Conveyer</label>
                      <input
                        type="text"
                        name="u1Conveyer"
                        value={formData.u1Conveyer}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U1 Conveyer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U2 Conveyer</label>
                      <input
                        type="text"
                        name="u2Conveyer"
                        value={formData.u2Conveyer}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U2 Conveyer"
                      />
                    </div>
                  </div>
                </div>

                {/* Beater */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Beater</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U1 Beater</label>
                      <input
                        type="text"
                        name="u1Beater"
                        value={formData.u1Beater}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U1 Beater"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U2 Beater</label>
                      <input
                        type="text"
                        name="u2Beater"
                        value={formData.u2Beater}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U2 Beater"
                      />
                    </div>
                  </div>
                </div>

                {/* Pulleys */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Pulleys</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U1 M Pulley</label>
                      <input
                        type="text"
                        name="u1MPulley"
                        value={formData.u1MPulley}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U1 M Pulley"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U1 F Pulley</label>
                      <input
                        type="text"
                        name="u1FPulley"
                        value={formData.u1FPulley}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U1 F Pulley"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U2 M Pulley</label>
                      <input
                        type="text"
                        name="u2MPulley"
                        value={formData.u2MPulley}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U2 M Pulley"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">U2 F Pulley</label>
                      <input
                        type="text"
                        name="u2FPulley"
                        value={formData.u2FPulley}
                        onChange={handleInputChange}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                        placeholder="U2 F Pulley"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flexi Section */}
              <div className="mb-8">
                <h2 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">Flexi</h2>
                
                {/* Flexi 1 & 2 Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Flexi 1 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Flexi 1</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Beater</label>
                        <input
                          type="text"
                          name="f1Beater"
                          value={formData.f1Beater}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 Beater"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Grid Bar</label>
                        <input
                          type="text"
                          name="f1GridBar"
                          value={formData.f1GridBar}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 Grid Bar"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Waste</label>
                        <input
                          type="text"
                          name="f1Waste"
                          value={formData.f1Waste}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 Waste"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">T to F</label>
                        <input
                          type="text"
                          name="f1TtoF"
                          value={formData.f1TtoF}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 T to F"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">R to B</label>
                        <input
                          type="text"
                          name="f1RtoB"
                          value={formData.f1RtoB}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 R to B"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">F to F</label>
                        <input
                          type="text"
                          name="f1FtoF"
                          value={formData.f1FtoF}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 F to F"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">M Pulley</label>
                        <input
                          type="text"
                          name="f1MPulley"
                          value={formData.f1MPulley}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 M Pulley"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">F Pulley</label>
                        <input
                          type="text"
                          name="f1FPulley"
                          value={formData.f1FPulley}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F1 F Pulley"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flexi 2 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Flexi 2</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Beater</label>
                        <input
                          type="text"
                          name="f2Beater"
                          value={formData.f2Beater}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 Beater"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Grid Bar</label>
                        <input
                          type="text"
                          name="f2GridBar"
                          value={formData.f2GridBar}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 Grid Bar"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Waste</label>
                        <input
                          type="text"
                          name="f2Waste"
                          value={formData.f2Waste}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 Waste"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">T to F</label>
                        <input
                          type="text"
                          name="f2TtoF"
                          value={formData.f2TtoF}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 T to F"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">R to B</label>
                        <input
                          type="text"
                          name="f2RtoB"
                          value={formData.f2RtoB}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 R to B"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">F to F</label>
                        <input
                          type="text"
                          name="f2FtoF"
                          value={formData.f2FtoF}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 F to F"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">M Pulley</label>
                        <input
                          type="text"
                          name="f2MPulley"
                          value={formData.f2MPulley}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 M Pulley"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">F Pulley</label>
                        <input
                          type="text"
                          name="f2FPulley"
                          value={formData.f2FPulley}
                          onChange={handleInputChange}
                          readOnly={isReadOnly}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${isReadOnly ? 'bg-gray-50' : ''}`}
                          placeholder="F2 F Pulley"
                        />
                      </div>
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

export default QCBlowRoom;