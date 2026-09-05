// import React, { useState, useEffect } from 'react';
// import stationService from '../../services/admin1/master/stationService';
// import stateService from '../../services/admin1/master/stateService';

// const Station = () => {
//   // States
//   const [stations, setStations] = useState([]);
//   const [states, setStates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stateLoading, setStateLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Modal states
//   const [showModal, setShowModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [editingStation, setEditingStation] = useState(null);
//   const [viewingStation, setViewingStation] = useState(null);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     code: '',
//     station: '',
//     stateId: ''
//   });

//   // Load stations and states on component mount
//   useEffect(() => {
//     fetchStations();
//     fetchStates();
//   }, []);

//   const fetchStations = async () => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
    
//     try {
//       const response = await stationService.getAll();
//       const stationsData = Array.isArray(response) ? response : [];
//       setStations(stationsData);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message || 'Failed to load stations');
//       setStations([]);
//       setLoading(false);
//     }
//   };

//   const fetchStates = async () => {
//     setStateLoading(true);
//     try {
//       const response = await stateService.getAll();
//       const statesData = Array.isArray(response) ? response : [];
//       setStates(statesData);
//     } catch (err) {
//       console.error('Failed to load states:', err);
//     } finally {
//       setStateLoading(false);
//     }
//   };

//   // Get state name by ID
//   const getStateName = (stateId) => {
//     const state = states.find(s => s.id === stateId);
//     return state ? state.state : 'Unknown State';
//   };

//   // Filter stations based on search
//   const filteredStations = (() => {
//     const stationsArray = Array.isArray(stations) ? stations : [];
    
//     return stationsArray.filter(station => {
//       if (!station || typeof station !== 'object') return false;
      
//       const code = station.code ? station.code.toString() : '';
//       const stationName = station.station || '';
//       const stateName = getStateName(station.stateId) || '';
      
//       return searchTerm === '' || 
//         code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         stateName.toLowerCase().includes(searchTerm.toLowerCase());
//     });
//   })();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // Validate state selection
//     if (!formData.stateId) {
//       setError('Please select a state');
//       return;
//     }

//     // Validate all fields
//     if (!formData.code || formData.code.toString().trim() === '') {
//       setError('Station code is required');
//       return;
//     }

//     if (!formData.station || formData.station.trim() === '') {
//       setError('Station name is required');
//       return;
//     }

//     try {
//       // Prepare payload with proper types (integers for code and stateId)
//       const payload = {
//         code: parseInt(formData.code, 10),
//         station: formData.station.trim(),
//         stateId: parseInt(formData.stateId, 10)  // Convert to integer
//       };
      
//       if (editingStation) {
//         // Update existing station
//         await stationService.update(editingStation.id, payload);
//         setSuccess('Station updated successfully!');
//       } else {
//         // Create new station
//         await stationService.create(payload);
//         setSuccess('Station created successfully!');
//       }
      
//       // Refresh stations list
//       fetchStations();
      
//       // Reset form and close modal
//       resetForm();
//       setShowModal(false);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       // Show detailed error message
//       let errorMsg = 'Operation failed';
//       if (err.response?.data?.message) {
//         errorMsg = err.response.data.message;
//       } else if (err.response?.data?.error) {
//         errorMsg = err.response.data.error;
//       } else if (err.message) {
//         errorMsg = err.message;
//       }
      
//       setError(`Failed to save station: ${errorMsg}`);
//     }
//   };

//   const handleEdit = (station) => {
//     if (!station || !station.id) {
//       setError('Invalid station data');
//       return;
//     }
    
//     setEditingStation(station);
//     setFormData({
//       code: station.code || '',
//       station: station.station || '',
//       stateId: station.stateId || ''  // Keep as string for form
//     });
//     setShowModal(true);
//   };

//   const handleView = (station) => {
//     if (!station || !station.id) {
//       setError('Invalid station data');
//       return;
//     }
    
//     setViewingStation(station);
//     setShowViewModal(true);
//   };

//   const handleDelete = async (id, stationName) => {
//     if (!id || !stationName) {
//       setError('Invalid station data for deletion');
//       return;
//     }

//     if (!window.confirm(`Are you sure you want to delete station "${stationName}"?`)) {
//       return;
//     }

//     try {
//       await stationService.delete(id);
//       setSuccess('Station deleted successfully!');
//       fetchStations();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message || 'Failed to delete station');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       code: '',
//       station: '',
//       stateId: ''
//     });
//     setEditingStation(null);
//     setViewingStation(null);
//   };

//   const openCreateModal = async () => {
//     resetForm();
//     try {
//     const nextCode = await stationService.getNextCode();
//     setFormData((prev) => ({
//       ...prev,
//       code: nextCode,
//     }));
//   } catch (error) {
//     setError("Failed to generate station code");
//   }

//     setShowModal(true);
//   };

//   const exportStations = async () => {
//     try {
//       const csvContent = "data:text/csv;charset=utf-8," +
//         "Code,Station Name,State\n" +
//         filteredStations.map(s => {
//           const stateName = getStateName(s.stateId);
//           return `${s.code},${s.station},${stateName || 'N/A'}`;
//         }).join("\n");
      
//       const encodedUri = encodeURI(csvContent);
//       const link = document.createElement("a");
//       link.setAttribute("href", encodedUri);
//       link.setAttribute("download", "stations.csv");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       setSuccess('Stations exported successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError('Failed to export stations');
//     }
//   };

//   // Clear search
//   const clearSearch = () => {
//     setSearchTerm('');
//   };

//   // Format code display
//   const formatCode = (code) => {
//     if (!code && code !== 0) return 'N/A';
//     return code.toString().padStart(4, '0');
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit'
//     });
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Station Management</h1>
//             <p className="text-gray-600">Manage all stations and their configurations</p>
//           </div>
//           <button
//             onClick={openCreateModal}
//             className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
//           >
//             <span className="mr-2">+</span>
//             Add New Station
//           </button>
//         </div>
//       </div>

//       {/* Messages */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
//           <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
//           <div className="flex-1">{error}</div>
//           <button onClick={() => setError('')} className="ml-2">
//             ✕
//           </button>
//         </div>
//       )}
      
//       {success && (
//         <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
//           <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
//           <div className="flex-1">{success}</div>
//           <button onClick={() => setSuccess('')} className="ml-2">
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Search and Actions Bar */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//           {/* Search Input */}
//           <div className="flex-1">
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search stations by code, name, or state..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={clearSearch}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex space-x-2">
//             <button
//               onClick={exportStations}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
//             >
//               <span className="mr-2">📥</span>
//               Export
//             </button>
//             <button
//               onClick={() => {
//                 fetchStations();
//                 fetchStates();
//               }}
//               disabled={loading}
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
//             >
//               <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
//               Refresh
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stations Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         {/* Table Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Stations ({filteredStations.length})
//             </h2>
//             <span className="text-sm text-gray-500">
//               Showing {filteredStations.length} of {stations.length} stations
//             </span>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="p-8 text-center">
//             <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
//             <p className="text-gray-600">Loading stations...</p>
//           </div>
//         ) : filteredStations.length === 0 ? (
//           <div className="p-8 text-center">
//             <span className="text-5xl text-gray-400 mb-4 inline-block">📍</span>
//             <p className="text-gray-600 mb-2">No stations found</p>
//             {searchTerm ? (
//               <p className="text-sm text-gray-500">
//                 Try adjusting your search
//               </p>
//             ) : (
//               <button
//                 onClick={openCreateModal}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Create your first station
//               </button>
//             )}
//           </div>
//         ) : (
//           /* Stations Table */
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     CODE
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     STATION NAME
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     STATE
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     CREATED DATE
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     LAST UPDATED
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     ACTIONS
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredStations.map((station) => (
//                   <tr key={station.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {/* <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
//                           <span className="text-blue-600">#</span>
//                         </div> */}
//                         <div>
//                           <div className="font-mono font-semibold text-gray-900">
//                             {formatCode(station.code)}
//                           </div>
//                           <div className="text-xs text-gray-500">ID: {station.id}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         {/* <span className="text-gray-400 mr-2">📍</span> */}
//                         <div className="text-sm font-medium text-gray-900">{station.station}</div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         {/* <span className="text-gray-400 mr-2">🗺️</span> */}
//                         <div className="text-sm font-medium text-gray-900">
//                           {getStateName(station.stateId)}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">
//                         {formatDate(station.createdAt)}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {formatTime(station.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">
//                         {formatDate(station.updatedAt)}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {formatTime(station.updatedAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleView(station)}
//                           className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
//                         >
//                           {/* <span className="mr-1">👁️</span> */}
//                           View
//                         </button>
//                         <button
//                           onClick={() => handleEdit(station)}
//                           className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
//                         >
//                           {/* <span className="mr-1">✏️</span> */}
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(station.id, station.station)}
//                           className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
//                         >
//                           {/* <span className="mr-1">🗑️</span> */}
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Create/Edit Station Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               {/* Modal Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-semibold text-gray-800">
//                   {editingStation ? 'Edit Station' : 'Add New Station'}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="text-gray-400 hover:text-gray-500"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Form */}
//               <form onSubmit={handleSubmit}>
//                 <div className="space-y-4">
//                   {/* Station Code */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Station Code *
//                       <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
//                       <input
//                         type="number"
//                         name="code"
//                         value={formData.code}
//                         onChange={handleInputChange}
//                         required
//                         min="1"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter unique station code"
//                         disabled
//                       />
//                     </div>
//                     {editingStation && (
//                       <p className="mt-1 text-xs text-gray-500">Station code cannot be changed after creation</p>
//                     )}
//                   </div>

//                   {/* Station Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Station Name *
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📍</span>
//                       <input
//                         type="text"
//                         name="station"
//                         value={formData.station}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter station name"
//                       />
//                     </div>
//                   </div>

//                   {/* State Dropdown */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       State *
//                       <span className="text-xs text-gray-500 ml-1">(Associated state)</span>
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🗺️</span>
//                       <select
//                         name="stateId"
//                         value={formData.stateId}
//                         onChange={handleInputChange}
//                         required
//                         className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
//                         disabled={stateLoading}
//                       >
//                         <option value="">Select a state...</option>
//                         {states.map((state) => (
//                           <option key={state.id} value={state.id}>
//                             {state.state} {state.code ? `(Code: ${formatCode(state.code)})` : ''}
//                           </option>
//                         ))}
//                       </select>
//                       <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
//                     </div>
//                     {stateLoading && (
//                       <p className="mt-1 text-xs text-gray-500">Loading states...</p>
//                     )}
//                     {states.length === 0 && !stateLoading && (
//                       <p className="mt-1 text-xs text-red-500">No states available. Please create a state first.</p>
//                     )}
//                   </div>

//                   {/* Display existing station info when editing */}
//                   {editingStation && (
//                     <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Station Information</h4>
//                       <div className="grid grid-cols-2 gap-2 text-sm">
//                         <div>
//                           <span className="text-gray-500">Created:</span>
//                           <div className="font-medium">
//                             {editingStation.createdAt ? new Date(editingStation.createdAt).toLocaleString() : 'N/A'}
//                           </div>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">Last Updated:</span>
//                           <div className="font-medium">
//                             {editingStation.updatedAt ? new Date(editingStation.updatedAt).toLocaleString() : 'N/A'}
//                           </div>
//                         </div>
//                         <div className="col-span-2">
//                           <span className="text-gray-500">State:</span>
//                           <div className="font-medium">
//                             {getStateName(editingStation.stateId)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Form Actions */}
//                 <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowModal(false);
//                       resetForm();
//                     }}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
//                     disabled={stateLoading || states.length === 0}
//                   >
//                     {editingStation ? 'Update Station' : 'Create Station'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Station Details Modal */}
//       {showViewModal && viewingStation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="p-6">
//               {/* Modal Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-semibold text-gray-800">Station Details</h3>
//                 <button
//                   onClick={() => setShowViewModal(false)}
//                   className="text-gray-400 hover:text-gray-500"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Station Details */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-center mb-6">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
//                     <span className="text-3xl text-blue-600">📍</span>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500 uppercase">Station Code</label>
//                       <div className="mt-1 flex items-center">
//                         <span className="text-gray-400 mr-2">#</span>
//                         <span className="font-mono font-semibold text-gray-900">
//                           #{formatCode(viewingStation.code)}
//                         </span>
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
//                       <div className="mt-1 text-sm text-gray-900">{viewingStation.id}</div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-500 uppercase">Station Name</label>
//                     <div className="mt-1 flex items-center">
//                       <span className="text-gray-400 mr-2">📍</span>
//                       <span className="text-lg font-medium text-gray-900">{viewingStation.station}</span>
//                     </div>
//                   </div>

//                   {/* State Information */}
//                   <div className="pt-3 border-t border-gray-200">
//                     <label className="block text-xs font-medium text-gray-500 uppercase mb-2">State Information</label>
//                     <div className="p-3 bg-gray-50 rounded-lg">
//                       <div className="flex items-center mb-2">
//                         <span className="text-gray-400 mr-2">🗺️</span>
//                         <span className="font-medium text-gray-900">
//                           {getStateName(viewingStation.stateId)}
//                         </span>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2 text-sm">
//                         <div>
//                           <span className="text-gray-500">State ID:</span>
//                           <div className="font-medium">{viewingStation.stateId}</div>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">State Code:</span>
//                           <div className="font-medium">
//                             {(() => {
//                               const state = states.find(s => s.id === viewingStation.stateId);
//                               return state && state.code ? formatCode(state.code) : 'N/A';
//                             })()}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="pt-4 border-t border-gray-200">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-xs text-gray-500">Created Date</label>
//                         <div className="mt-1 text-sm font-medium text-gray-900">
//                           {formatDate(viewingStation.createdAt)}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {formatTime(viewingStation.createdAt)}
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-500">Last Updated</label>
//                         <div className="mt-1 text-sm font-medium text-gray-900">
//                           {formatDate(viewingStation.updatedAt)}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {formatTime(viewingStation.updatedAt)}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowViewModal(false);
//                       resetForm();
//                     }}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                   >
//                     Close
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowViewModal(false);
//                       handleEdit(viewingStation);
//                     }}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
//                   >
//                     Edit Station
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Station;


import React, { useState, useEffect } from 'react';
import stationService from '../../services/admin1/master/stationService';
import stateService from '../../services/admin1/master/stateService';

const Station = () => {
  // States
  const [stations, setStations] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateLoading, setStateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [viewingStation, setViewingStation] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    station: '',
    stateId: ''
  });

  // Load stations and states on component mount
  useEffect(() => {
    fetchStations();
    fetchStates();
  }, []);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchStations = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await stationService.getAll();
      const stationsData = Array.isArray(response) ? response : [];
      setStations(stationsData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load stations');
      setStations([]);
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    setStateLoading(true);
    try {
      const response = await stateService.getAll();
      const statesData = Array.isArray(response) ? response : [];
      setStates(statesData);
    } catch (err) {
      console.error('Failed to load states:', err);
    } finally {
      setStateLoading(false);
    }
  };

  // Get state name by ID
  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.state : 'Unknown State';
  };

  // Filter stations based on search
  const filteredStations = (() => {
    const stationsArray = Array.isArray(stations) ? stations : [];
    
    return stationsArray.filter(station => {
      if (!station || typeof station !== 'object') return false;
      
      const code = station.code ? station.code.toString() : '';
      const stationName = station.station || '';
      const stateName = getStateName(station.stateId) || '';
      
      return searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stateName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  // Calculate pagination data
  const paginationData = (() => {
    const totalItems = filteredStations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStations = filteredStations.slice(startIndex, endIndex);

    return { totalItems, totalPages, startIndex, endIndex, paginatedStations };
  })();

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= paginationData.totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to table top
      document.querySelector('.bg-white.rounded-lg.shadow-sm.overflow-hidden')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? (value === '' ? '' : parseInt(value) || value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate state selection
    if (!formData.stateId) {
      setError('Please select a state');
      return;
    }

    // Validate all fields
    if (!formData.code || formData.code.toString().trim() === '') {
      setError('Station code is required');
      return;
    }

    if (!formData.station || formData.station.trim() === '') {
      setError('Station name is required');
      return;
    }

    try {
      // Prepare payload with proper types (integers for code and stateId)
      const payload = {
        code: parseInt(formData.code, 10),
        station: formData.station.trim(),
        stateId: parseInt(formData.stateId, 10)  // Convert to integer
      };
      
      if (editingStation) {
        // Update existing station
        await stationService.update(editingStation.id, payload);
        setSuccess('Station updated successfully!');
      } else {
        // Create new station
        await stationService.create(payload);
        setSuccess('Station created successfully!');
      }
      
      // Refresh stations list
      fetchStations();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Show detailed error message
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save station: ${errorMsg}`);
    }
  };

  const handleEdit = (station) => {
    if (!station || !station.id) {
      setError('Invalid station data');
      return;
    }
    
    setEditingStation(station);
    setFormData({
      code: station.code || '',
      station: station.station || '',
      stateId: station.stateId || ''  // Keep as string for form
    });
    setShowModal(true);
  };

  const handleView = (station) => {
    if (!station || !station.id) {
      setError('Invalid station data');
      return;
    }
    
    setViewingStation(station);
    setShowViewModal(true);
  };

  const handleDelete = async (id, stationName) => {
    if (!id || !stationName) {
      setError('Invalid station data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete station "${stationName}"?`)) {
      return;
    }

    try {
      await stationService.delete(id);
      setSuccess('Station deleted successfully!');
      fetchStations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete station');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      station: '',
      stateId: ''
    });
    setEditingStation(null);
    setViewingStation(null);
  };

  const openCreateModal = async () => {
    resetForm();
    try {
    const nextCode = await stationService.getNextCode();
    setFormData((prev) => ({
      ...prev,
      code: nextCode,
    }));
  } catch (error) {
    setError("Failed to generate station code");
  }

    setShowModal(true);
  };

  const exportStations = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Station Name,State\n" +
        filteredStations.map(s => {
          const stateName = getStateName(s.stateId);
          return `${s.code},${s.station},${stateName || 'N/A'}`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "stations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Stations exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export stations');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Format code display
  const formatCode = (code) => {
    if (!code && code !== 0) return 'N/A';
    return code.toString().padStart(4, '0');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Station Management</h1>
            <p className="text-gray-600">Manage all stations and their configurations</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Station
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search stations by code, name, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportStations}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchStations();
                fetchStates();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Stations ({paginationData.paginatedStations.length}/{filteredStations.length})
            </h2>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {paginationData.totalPages || 1}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading stations...</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📍</span>
            <p className="text-gray-600 mb-2">No stations found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first station
              </button>
            )}
          </div>
        ) : (
          /* Stations Table */
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-16 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CODE
                    </th>
                    <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATION NAME
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATE
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CREATED DATE
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LAST UPDATED
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginationData.paginatedStations.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-50">
                      <td className="px-16 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="font-mono font-semibold text-gray-900">
                              {formatCode(station.code)}
                            </div>
                            <div className="text-xs text-gray-500">ID: {station.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{station.station}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {getStateName(station.stateId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(station.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(station.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(station.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(station.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(station)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(station)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(station.id, station.station)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredStations.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>

                {/* Page info */}
                <div className="text-sm text-gray-600">
                  Showing {paginationData.startIndex + 1} to {Math.min(paginationData.endIndex, paginationData.totalItems)} of {paginationData.totalItems} stations
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first 3, last 3, and current page with surrounding pages
                      const isVisible =
                        page === 1 ||
                        page === paginationData.totalPages ||
                        Math.abs(page - currentPage) <= 1 ||
                        (page < 4 && currentPage < 4) ||
                        (page > paginationData.totalPages - 3 && currentPage > paginationData.totalPages - 3);

                      if (!isVisible && page === 2) {
                        return <span key="ellipsis1" className="px-2 text-gray-500">...</span>;
                      }
                      if (!isVisible && page === paginationData.totalPages - 1) {
                        return <span key="ellipsis2" className="px-2 text-gray-500">...</span>;
                      }
                      if (!isVisible) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg border text-sm ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === paginationData.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingStation ? 'Edit Station' : 'Add New Station'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Station Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Code *
                      <span className="text-xs text-gray-500 ml-1">(Unique numeric code)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                      <input
                        type="number"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter unique station code"
                        disabled
                      />
                    </div>
                    {editingStation && (
                      <p className="mt-1 text-xs text-gray-500">Station code cannot be changed after creation</p>
                    )}
                  </div>

                  {/* Station Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Station Name *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📍</span>
                      <input
                        type="text"
                        name="station"
                        value={formData.station}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter station name"
                      />
                    </div>
                  </div>

                  {/* State Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                      <span className="text-xs text-gray-500 ml-1">(Associated state)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🗺️</span>
                      <select
                        name="stateId"
                        value={formData.stateId}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        disabled={stateLoading}
                      >
                        <option value="">Select a state...</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.state} {state.code ? `(Code: ${formatCode(state.code)})` : ''}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                    </div>
                    {stateLoading && (
                      <p className="mt-1 text-xs text-gray-500">Loading states...</p>
                    )}
                    {states.length === 0 && !stateLoading && (
                      <p className="mt-1 text-xs text-red-500">No states available. Please create a state first.</p>
                    )}
                  </div>

                  {/* Display existing station info when editing */}
                  {editingStation && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Station Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">
                            {editingStation.createdAt ? new Date(editingStation.createdAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <div className="font-medium">
                            {editingStation.updatedAt ? new Date(editingStation.updatedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">State:</span>
                          <div className="font-medium">
                            {getStateName(editingStation.stateId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    disabled={stateLoading || states.length === 0}
                  >
                    {editingStation ? 'Update Station' : 'Create Station'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Station Details Modal */}
      {showViewModal && viewingStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Station Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Station Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-blue-600">📍</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">Station Code</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-400 mr-2">#</span>
                        <span className="font-mono font-semibold text-gray-900">
                          #{formatCode(viewingStation.code)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase">ID</label>
                      <div className="mt-1 text-sm text-gray-900">{viewingStation.id}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Station Name</label>
                    <div className="mt-1 flex items-center">
                      {/* <span className="text-gray-400 mr-2">📍</span> */}
                      <span className="text-lg font-medium text-gray-900">{viewingStation.station}</span>
                    </div>
                  </div>

                  {/* State Information */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">State Information</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">🗺️</span>
                        <span className="font-medium text-gray-900">
                          {getStateName(viewingStation.stateId)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">State ID:</span>
                          <div className="font-medium">{viewingStation.stateId}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">State Code:</span>
                          <div className="font-medium">
                            {(() => {
                              const state = states.find(s => s.id === viewingStation.stateId);
                              return state && state.code ? formatCode(state.code) : 'N/A';
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500">Created Date</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingStation.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingStation.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Last Updated</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {formatDate(viewingStation.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(viewingStation.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingStation);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Station
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Station;