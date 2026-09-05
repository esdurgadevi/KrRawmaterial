// // frontend/src/pages/admin/WasteEntryPage.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import wasteEntryService from '../../services/admin1/transaction-waste/wasteEntryService';
// import wasteMasterService from '../../services/admin1/master/wasteMasterService';
// import godownService from '../../services/admin1/master/godownService';
// import packingTypeService from '../../services/admin1/master/packingTypeService';

// const WasteEntryPage = () => {
//   // State Management
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [openModal, setOpenModal] = useState(false);
//   const [openViewModal, setOpenViewModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [viewEntry, setViewEntry] = useState(null);
//   const [notification, setNotification] = useState({ show: false, message: '', type: '' });

//   // Master Data States
//   const [wasteMasters, setWasteMasters] = useState([]);
//   const [godowns, setGodowns] = useState([]);
//   const [packingTypes, setPackingTypes] = useState([]);

//   // Dynamic departments list derived from waste masters
//   const departments = React.useMemo(() => {
//     if (!Array.isArray(wasteMasters)) return [];
//     return Array.from(
//       new Set(
//         wasteMasters
//           .map(w => w.department)
//           .filter(dept => dept && typeof dept === 'string' && dept.trim() !== '')
//           .map(dept => dept.trim())
//       )
//     ).sort();
//   }, [wasteMasters]);

//   // UI States
//   const [showWasteDropdown, setShowWasteDropdown] = useState({});
//   const [showPackingDropdown, setShowPackingDropdown] = useState({});
//   const [showGodownDropdown, setShowGodownDropdown] = useState({});
//   const [showDepartmentDropdown, setShowDepartmentDropdown] = useState({});

//   // Search states
//   const [wasteSearch, setWasteSearch] = useState({});
//   const [packingSearch, setPackingSearch] = useState({});
//   const [godownSearch, setGodownSearch] = useState({});
//   const [departmentSearch, setDepartmentSearch] = useState({});

//   // Error states
//   const [errors, setErrors] = useState({});

//   // Refs
//   const wasteRefs = useRef({});
//   const packingRefs = useRef({});
//   const godownRefs = useRef({});
//   const departmentRefs = useRef({});
//   const modalRef = useRef(null);

//   // Form State
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     shift: 'ALL',
//     remarks: '',
//     details: [
//       {
//         department: '',
//         wasteMasterId: '',
//         packingTypeId: '',
//         godownId: '',
//         netWeight: ''
//       }
//     ]
//   });

//   const shifts = ['ALL', 'A', 'B', 'C'];

//   // Fetch master data
//   useEffect(() => {
//     fetchMasterData();
//   }, []);

//   // Fetch entries
//   useEffect(() => {
//     fetchEntries();
//   }, []);

//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       // Close all dropdowns when clicking outside
//       if (!event.target.closest('.dropdown-container')) {
//         setShowDepartmentDropdown({});
//         setShowWasteDropdown({});
//         setShowPackingDropdown({});
//         setShowGodownDropdown({});
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const fetchMasterData = async () => {
//     try {
//       const [wasteData, godownData, packingData] = await Promise.all([
//         wasteMasterService.getAll(),
//         godownService.getAll(),
//         packingTypeService.getAll()
//       ]);

//       setWasteMasters(Array.isArray(wasteData) ? wasteData : []);
//       setGodowns(Array.isArray(godownData) ? godownData : []);
//       setPackingTypes(Array.isArray(packingData) ? packingData : []);
//     } catch (error) {
//       console.error('Error fetching master data:', error);
//       showNotification('Failed to load master data', 'error');
//     }
//   };

//   const fetchEntries = async () => {
//     try {
//       setLoading(true);
//       const data = await wasteEntryService.getAll();
//       setEntries(Array.isArray(data) ? data : []);
//     } catch (error) {
//       showNotification('Failed to fetch waste entries', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotification = (message, type = 'success') => {
//     setNotification({ show: true, message, type });
//     setTimeout(() => {
//       setNotification({ show: false, message: '', type: '' });
//     }, 3000);
//   };

//   // Helper functions to get display names using id instead of _id
//   const getWasteMasterName = (wasteMaster) => {
//     if (!wasteMaster) return '-';
//     if (typeof wasteMaster === 'object') {
//       return wasteMaster.waste || wasteMaster.name || '-';
//     }
//     const found = wasteMasters.find(w => w.id === wasteMaster || w._id === wasteMaster);
//     return found ? (found.waste || found.name) : '-';
//   };

//   const getPackingTypeName = (packingType) => {
//     if (!packingType) return '-';
//     if (typeof packingType === 'object') {
//       return packingType.name || '-';
//     }
//     const found = packingTypes.find(p => p.id === packingType || p._id === packingType);
//     return found ? found.name : '-';
//   };

//   const getGodownName = (godown) => {
//     if (!godown) return '-';
//     if (typeof godown === 'object') {
//       return godown.godownName || godown.name || '-';
//     }
//     const found = godowns.find(g => g.id === godown || g._id === godown);
//     return found ? (found.godownName || found.name) : '-';
//   };

//   // Filter functions
//   const getFilteredDepartments = (searchTerm) => {
//     if (!searchTerm) return departments;
//     return departments.filter(dept => 
//       dept.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   const getFilteredWasteMasters = (searchTerm) => {
//     if (!searchTerm) return wasteMasters;
//     return wasteMasters.filter(waste => 
//       (waste.waste || waste.name)?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   const getFilteredPackingTypes = (searchTerm) => {
//     if (!searchTerm) return packingTypes;
//     return packingTypes.filter(packing => 
//       packing.name?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   const getFilteredGodowns = (searchTerm) => {
//     if (!searchTerm) return godowns;
//     return godowns.filter(godown => 
//       (godown.godownName || godown.name)?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       date: new Date().toISOString().split('T')[0],
//       shift: 'ALL',
//       remarks: '',
//       details: [
//         {
//           department: '',
//           wasteMasterId: '',
//           packingTypeId: '',
//           godownId: '',
//           netWeight: ''
//         }
//       ]
//     });
//     setDepartmentSearch({});
//     setWasteSearch({});
//     setPackingSearch({});
//     setGodownSearch({});
//     setErrors({});
//     setSelectedEntry(null);
//     setIsEditing(false);
//   };

//   // Open create modal
//   const handleOpenCreateModal = () => {
//     resetForm();
//     setOpenModal(true);
//   };

//   // Open view modal
//   const handleOpenViewModal = async (entry) => {
//     try {
//       setModalLoading(true);
//       const fullEntry = await wasteEntryService.getById(entry.id || entry._id);
//       setViewEntry(fullEntry);
//       setOpenViewModal(true);
//     } catch (error) {
//       showNotification('Failed to load entry details', 'error');
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Open edit modal
//   const handleOpenEditModal = async (entry) => {
//     try {
//       setModalLoading(true);
//       const fullEntry = await wasteEntryService.getById(entry.id || entry._id);

//       // Format the data for editing
//       const formattedDetails = fullEntry.details.map(detail => ({
//         department: detail.department || '',
//         wasteMasterId: detail.wasteMaster?.id || detail.wasteMasterId || '',
//         packingTypeId: detail.packingType?.id || detail.packingTypeId || '',
//         godownId: detail.godown?.id || detail.godownId || '',
//         netWeight: detail.netWeight || ''
//       }));

//       setFormData({
//         date: fullEntry.date.split('T')[0],
//         shift: fullEntry.shift,
//         remarks: fullEntry.remarks || '',
//         details: formattedDetails
//       });

//       // Set search values for each row
//       formattedDetails.forEach((detail, index) => {
//         setDepartmentSearch(prev => ({ ...prev, [index]: detail.department }));

//         const waste = wasteMasters.find(w => w.id === detail.wasteMasterId || w._id === detail.wasteMasterId);
//         setWasteSearch(prev => ({ ...prev, [index]: waste ? (waste.waste || waste.name) : '' }));

//         const packing = packingTypes.find(p => p.id === detail.packingTypeId || p._id === detail.packingTypeId);
//         setPackingSearch(prev => ({ ...prev, [index]: packing ? packing.name : '' }));

//         const godown = godowns.find(g => g.id === detail.godownId || g._id === detail.godownId);
//         setGodownSearch(prev => ({ ...prev, [index]: godown ? (godown.godownName || godown.name) : '' }));
//       });

//       setSelectedEntry(fullEntry);
//       setIsEditing(true);
//       setOpenModal(true);
//     } catch (error) {
//       showNotification('Failed to load entry details', 'error');
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Close modals
//   const handleCloseModal = () => {
//     setOpenModal(false);
//     resetForm();
//   };

//   const handleCloseViewModal = () => {
//     setOpenViewModal(false);
//     setViewEntry(null);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle detail changes
//   const handleDetailChange = (index, field, value) => {
//     const updatedDetails = [...formData.details];
//     updatedDetails[index] = {
//       ...updatedDetails[index],
//       [field]: value
//     };

//     setFormData(prev => ({
//       ...prev,
//       details: updatedDetails
//     }));

//     // Clear error for this field
//     if (errors[`${index}_${field}`]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[`${index}_${field}`];
//         return newErrors;
//       });
//     }
//   };

//   // Department handlers
//   const handleDepartmentSelect = (index, department) => {
//     handleDetailChange(index, 'department', department);
//     setDepartmentSearch(prev => ({ ...prev, [index]: department }));
//     setShowDepartmentDropdown(prev => ({ ...prev, [index]: false }));
//   };

//   const handleDepartmentSearchChange = (index, value) => {
//     setDepartmentSearch(prev => ({ ...prev, [index]: value }));
//     setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }));
//     if (formData.details[index]?.department !== value) {
//       handleDetailChange(index, 'department', '');
//     }
//   };

//   // Waste handlers (using id)
//   const handleWasteSelect = (index, waste) => {
//     const wasteId = waste.id || waste._id;
//     handleDetailChange(index, 'wasteMasterId', wasteId);
//     setWasteSearch(prev => ({ ...prev, [index]: waste.waste || waste.name }));
//     setShowWasteDropdown(prev => ({ ...prev, [index]: false }));
//   };

//   const handleWasteSearchChange = (index, value) => {
//     setWasteSearch(prev => ({ ...prev, [index]: value }));
//     setShowWasteDropdown(prev => ({ ...prev, [index]: true }));
//     if (formData.details[index]?.wasteMasterId) {
//       handleDetailChange(index, 'wasteMasterId', '');
//     }
//   };

//   // Packing handlers (using id)
//   const handlePackingSelect = (index, packing) => {
//     const packingId = packing.id || packing._id;
//     handleDetailChange(index, 'packingTypeId', packingId);
//     setPackingSearch(prev => ({ ...prev, [index]: packing.name }));
//     setShowPackingDropdown(prev => ({ ...prev, [index]: false }));
//   };

//   const handlePackingSearchChange = (index, value) => {
//     setPackingSearch(prev => ({ ...prev, [index]: value }));
//     setShowPackingDropdown(prev => ({ ...prev, [index]: true }));
//     if (formData.details[index]?.packingTypeId) {
//       handleDetailChange(index, 'packingTypeId', '');
//     }
//   };

//   // Godown handlers (using id)
//   const handleGodownSelect = (index, godown) => {
//     const godownId = godown.id || godown._id;
//     handleDetailChange(index, 'godownId', godownId);
//     setGodownSearch(prev => ({ ...prev, [index]: godown.godownName || godown.name }));
//     setShowGodownDropdown(prev => ({ ...prev, [index]: false }));
//   };

//   const handleGodownSearchChange = (index, value) => {
//     setGodownSearch(prev => ({ ...prev, [index]: value }));
//     setShowGodownDropdown(prev => ({ ...prev, [index]: true }));
//     if (formData.details[index]?.godownId) {
//       handleDetailChange(index, 'godownId', '');
//     }
//   };

//   // Add/Remove rows
//   const addDetailRow = () => {
//     setFormData(prev => ({
//       ...prev,
//       details: [
//         ...prev.details,
//         {
//           department: '',
//           wasteMasterId: '',
//           packingTypeId: '',
//           godownId: '',
//           netWeight: ''
//         }
//       ]
//     }));
//   };

//   const removeDetailRow = (index) => {
//     if (formData.details.length > 1) {
//       const updatedDetails = formData.details.filter((_, i) => i !== index);
//       setFormData(prev => ({
//         ...prev,
//         details: updatedDetails
//       }));

//       // Clean up related states
//       const cleanupState = (state) => {
//         const newState = {};
//         Object.keys(state).forEach(key => {
//           const numKey = parseInt(key);
//           if (numKey < index) newState[key] = state[key];
//           else if (numKey > index) newState[(numKey - 1).toString()] = state[key];
//         });
//         return newState;
//       };

//       setDepartmentSearch(cleanupState(departmentSearch));
//       setWasteSearch(cleanupState(wasteSearch));
//       setPackingSearch(cleanupState(packingSearch));
//       setGodownSearch(cleanupState(godownSearch));
//     }
//   };

//   // Calculate total weight
//   const calculateTotalWeight = () => {
//     return formData.details.reduce((total, detail) => {
//       return total + (Number(detail.netWeight) || 0);
//     }, 0);
//   };

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};
//     let isValid = true;

//     if (!formData.date) {
//       showNotification('Date is required', 'error');
//       return false;
//     }

//     formData.details.forEach((detail, index) => {
//       if (!detail.department) {
//         newErrors[`${index}_department`] = 'Department is required';
//         isValid = false;
//       }
//       if (!detail.wasteMasterId) {
//         newErrors[`${index}_waste`] = 'Waste type is required';
//         isValid = false;
//       }
//       if (!detail.packingTypeId) {
//         newErrors[`${index}_packing`] = 'Packing type is required';
//         isValid = false;
//       }
//       if (!detail.godownId) {
//         newErrors[`${index}_godown`] = 'Godown is required';
//         isValid = false;
//       }
//       if (!detail.netWeight || detail.netWeight <= 0) {
//         newErrors[`${index}_weight`] = 'Valid weight is required';
//         isValid = false;
//       }
//     });

//     setErrors(newErrors);
//     return isValid;
//   };

//   // Submit form (using id for update)
//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       setModalLoading(true);

//       if (isEditing && selectedEntry) {
//         await wasteEntryService.update(selectedEntry.id || selectedEntry._id, formData);
//         showNotification('Waste entry updated successfully');
//       } else {
//         await wasteEntryService.create(formData);
//         showNotification('Waste entry created successfully');
//       }

//       await fetchEntries();
//       handleCloseModal();
//     } catch (error) {
//       showNotification(error.response?.data?.message || 'Operation failed', 'error');
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Delete entry (using id)
//   const handleDelete = async (entry) => {
//     const id = entry.id || entry._id;
//     if (window.confirm('Are you sure you want to delete this entry?')) {
//       try {
//         setLoading(true);
//         await wasteEntryService.delete(id);
//         showNotification('Waste entry deleted successfully');
//         await fetchEntries();
//       } catch (error) {
//         showNotification('Failed to delete entry', 'error');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     }).replace(/ /g, '-');
//   };

//   // Calculate total weight from entries - FIXED VERSION
//   const calculateTotalWeightFromEntries = () => {
//     return entries.reduce((sum, entry) => {
//       const entryTotal = entry.details?.reduce((s, d) => {
//         // Convert to number, handle string values
//         const weight = typeof d.netWeight === 'string' ? parseFloat(d.netWeight) : Number(d.netWeight);
//         return s + (isNaN(weight) ? 0 : weight);
//       }, 0) || 0;
//       return sum + entryTotal;
//     }, 0);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Notification */}
//       {notification.show && (
//         <div className={`fixed top-4 right-4 z-50 animate-slide-in ${
//           notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
//         } border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
//           <div className="flex items-center justify-between">
//             <span className="font-medium">{notification.message}</span>
//             <button 
//               onClick={() => setNotification({ show: false, message: '', type: '' })}
//               className="ml-4 text-xl hover:text-gray-700"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Entry Management</h1>
//             <p className="text-gray-600 mt-1">Manage waste entries across departments</p>
//           </div>
//           <button
//             onClick={handleOpenCreateModal}
//             className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200"
//           >
//             <span className="mr-2 text-xl">+</span>
//             New Waste Entry
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards - FIXED TOTAL WEIGHT CALCULATION */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <div className="flex items-center">
//             <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
//               <span className="text-xl">📦</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Entries</p>
//               <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <div className="flex items-center">
//             <div className="p-3 rounded-lg bg-green-50 text-green-600">
//               <span className="text-xl">📅</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Today's Entries</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <div className="flex items-center">
//             <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
//               <span className="text-xl">⚖️</span>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Weight</p>
//               <p className="text-2xl font-bold text-gray-800">
//                 {calculateTotalWeightFromEntries().toLocaleString()} kg
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Rest of the component remains exactly the same */}
//       {/* Entries Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-800">Waste Entries</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-100">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packing</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Godown</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan="9" className="px-6 py-8 text-center">
//                     <div className="flex justify-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     </div>
//                   </td>
//                 </tr>
//               ) : entries.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
//                     No waste entries found. Create your first entry!
//                   </td>
//                 </tr>
//               ) : (
//                 entries.map((entry) => (
//                   <React.Fragment key={entry.id || entry._id}>
//                     {entry.details?.map((detail, detailIndex) => (
//                       <tr key={`${entry.id || entry._id}-${detailIndex}`} className="hover:bg-gray-50">
//                         {detailIndex === 0 && (
//                           <>
//                             <td className="px-6 py-4 whitespace-nowrap" rowSpan={entry.details.length}>
//                               <div className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap" rowSpan={entry.details.length}>
//                               <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                                 entry.shift === 'ALL' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
//                               }`}>
//                                 {entry.shift}
//                               </span>
//                             </td>
//                           </>
//                         )}
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{detail.department || '-'}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{getWasteMasterName(detail.wasteMaster || detail.wasteMasterId)}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{getPackingTypeName(detail.packingType || detail.packingTypeId)}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-semibold text-gray-900">
//                             {typeof detail.netWeight === 'number' ? detail.netWeight.toLocaleString() : detail.netWeight}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{getGodownName(detail.godown || detail.godownId)}</div>
//                         </td>
//                         {detailIndex === 0 && (
//                           <td className="px-6 py-4" rowSpan={entry.details.length}>
//                             <div className="text-sm text-gray-600 max-w-xs truncate" title={entry.remarks}>
//                               {entry.remarks || '-'}
//                             </div>
//                           </td>
//                         )}
//                         {detailIndex === 0 && (
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={entry.details.length}>
//                             <div className="flex space-x-3">
//                               <button
//                                 onClick={() => handleOpenViewModal(entry)}
//                                 className="text-green-600 hover:text-green-800 hover:underline"
//                               >
//                                 View
//                               </button>
//                               <button
//                                 onClick={() => handleOpenEditModal(entry)}
//                                 className="text-blue-600 hover:text-blue-800 hover:underline"
//                               >
//                                 Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(entry)}
//                                 className="text-red-600 hover:text-red-800 hover:underline"
//                               >
//                                 Delete
//                               </button>
//                             </div>
//                           </td>
//                         )}
//                       </tr>
//                     ))}
//                   </React.Fragment>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Create/Edit Modal */}
//       {openModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//             {/* Modal Header */}
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {isEditing ? 'Edit Waste Entry' : 'Create New Waste Entry'}
//               </h3>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//                 disabled={modalLoading}
//               >
//                 ×
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {/* Header Information */}
//               <div className="mb-6 p-5 bg-gray-50 rounded-lg">
//                 <h4 className="text-base font-medium text-gray-700 mb-4">Waste Entry Details</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">
//                       Date <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       name="date"
//                       value={formData.date}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       disabled={modalLoading}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">
//                       Shift <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="shift"
//                       value={formData.shift}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       disabled={modalLoading}
//                     >
//                       {shifts.map(shift => (
//                         <option key={shift} value={shift}>{shift}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-600 mb-1">
//                       Remarks
//                     </label>
//                     <textarea
//                       name="remarks"
//                       value={formData.remarks}
//                       onChange={handleInputChange}
//                       rows="2"
//                       className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Any additional remarks..."
//                       disabled={modalLoading}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Details Section */}
//               <div>
//                 <div className="flex justify-between items-center mb-4">
//                   <h4 className="text-base font-medium text-gray-700">Waste Details</h4>
//                   <button
//                     type="button"
//                     onClick={addDetailRow}
//                     className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
//                     disabled={modalLoading}
//                   >
//                     <span className="mr-1 text-lg">+</span> Add Row
//                   </button>
//                 </div>

//                 <div className="space-y-4">
//                   {formData.details.map((detail, index) => (
//                     <div key={index} className="bg-gray-50 p-4 rounded-lg">
//                       <div className="grid grid-cols-12 gap-3">
//                         {/* Department */}
//                         <div className="col-span-2">
//                           <div className="relative dropdown-container">
//                             <input
//                               type="text"
//                               value={departmentSearch[index] || ''}
//                               onChange={(e) => handleDepartmentSearchChange(index, e.target.value)}
//                               onFocus={() => setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }))}
//                               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                                 errors[`${index}_department`] ? 'border-red-500' : 'border-gray-200'
//                               }`}
//                               placeholder="Department..."
//                               disabled={modalLoading}
//                             />

//                             {showDepartmentDropdown[index] && (
//                               <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {getFilteredDepartments(departmentSearch[index]).length === 0 ? (
//                                   <div className="p-3 text-center text-gray-500">No departments found</div>
//                                 ) : (
//                                   getFilteredDepartments(departmentSearch[index]).map(dept => (
//                                     <div
//                                       key={dept}
//                                       onClick={() => handleDepartmentSelect(index, dept)}
//                                       className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                                     >
//                                       <div className="font-medium text-gray-900">{dept}</div>
//                                     </div>
//                                   ))
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                           {errors[`${index}_department`] && (
//                             <p className="mt-1 text-xs text-red-500">{errors[`${index}_department`]}</p>
//                           )}
//                         </div>

//                         {/* Waste Type */}
//                         <div className="col-span-2">
//                           <div className="relative dropdown-container">
//                             <input
//                               type="text"
//                               value={wasteSearch[index] || ''}
//                               onChange={(e) => handleWasteSearchChange(index, e.target.value)}
//                               onFocus={() => setShowWasteDropdown(prev => ({ ...prev, [index]: true }))}
//                               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                                 errors[`${index}_waste`] ? 'border-red-500' : 'border-gray-200'
//                               }`}
//                               placeholder="Waste type..."
//                               disabled={modalLoading}
//                             />

//                             {showWasteDropdown[index] && (
//                               <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {getFilteredWasteMasters(wasteSearch[index]).length === 0 ? (
//                                   <div className="p-3 text-center text-gray-500">No waste types found</div>
//                                 ) : (
//                                   getFilteredWasteMasters(wasteSearch[index]).map(waste => (
//                                     <div
//                                       key={waste.id || waste._id}
//                                       onClick={() => handleWasteSelect(index, waste)}
//                                       className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                                     >
//                                       <div className="font-medium text-gray-900">{waste.waste || waste.name}</div>
//                                       <div className="text-xs text-gray-500">
//                                         Code: {waste.code || 'N/A'} • Dept: {waste.department || 'N/A'}
//                                       </div>
//                                     </div>
//                                   ))
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                           {errors[`${index}_waste`] && (
//                             <p className="mt-1 text-xs text-red-500">{errors[`${index}_waste`]}</p>
//                           )}
//                         </div>

//                         {/* Packing Type */}
//                         <div className="col-span-2">
//                           <div className="relative dropdown-container">
//                             <input
//                               type="text"
//                               value={packingSearch[index] || ''}
//                               onChange={(e) => handlePackingSearchChange(index, e.target.value)}
//                               onFocus={() => setShowPackingDropdown(prev => ({ ...prev, [index]: true }))}
//                               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                                 errors[`${index}_packing`] ? 'border-red-500' : 'border-gray-200'
//                               }`}
//                               placeholder="Packing type..."
//                               disabled={modalLoading}
//                             />

//                             {showPackingDropdown[index] && (
//                               <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {getFilteredPackingTypes(packingSearch[index]).length === 0 ? (
//                                   <div className="p-3 text-center text-gray-500">No packing types found</div>
//                                 ) : (
//                                   getFilteredPackingTypes(packingSearch[index]).map(packing => (
//                                     <div
//                                       key={packing.id || packing._id}
//                                       onClick={() => handlePackingSelect(index, packing)}
//                                       className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                                     >
//                                       <div className="font-medium text-gray-900">{packing.name}</div>
//                                       <div className="text-xs text-gray-500">Code: {packing.code || 'N/A'}</div>
//                                     </div>
//                                   ))
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                           {errors[`${index}_packing`] && (
//                             <p className="mt-1 text-xs text-red-500">{errors[`${index}_packing`]}</p>
//                           )}
//                         </div>

//                         {/* Godown */}
//                         <div className="col-span-2">
//                           <div className="relative dropdown-container">
//                             <input
//                               type="text"
//                               value={godownSearch[index] || ''}
//                               onChange={(e) => handleGodownSearchChange(index, e.target.value)}
//                               onFocus={() => setShowGodownDropdown(prev => ({ ...prev, [index]: true }))}
//                               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                                 errors[`${index}_godown`] ? 'border-red-500' : 'border-gray-200'
//                               }`}
//                               placeholder="Godown..."
//                               disabled={modalLoading}
//                             />

//                             {showGodownDropdown[index] && (
//                               <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {getFilteredGodowns(godownSearch[index]).length === 0 ? (
//                                   <div className="p-3 text-center text-gray-500">No godowns found</div>
//                                 ) : (
//                                   getFilteredGodowns(godownSearch[index]).map(godown => (
//                                     <div
//                                       key={godown.id || godown._id}
//                                       onClick={() => handleGodownSelect(index, godown)}
//                                       className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                                     >
//                                       <div className="font-medium text-gray-900">{godown.godownName || godown.name}</div>
//                                       <div className="text-xs text-gray-500">
//                                         Code: {godown.code || 'N/A'} • {godown.location || 'No location'}
//                                       </div>
//                                     </div>
//                                   ))
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                           {errors[`${index}_godown`] && (
//                             <p className="mt-1 text-xs text-red-500">{errors[`${index}_godown`]}</p>
//                           )}
//                         </div>

//                         {/* Net Weight */}
//                         <div className="col-span-3">
//                           <input
//                             type="number"
//                             value={detail.netWeight}
//                             onChange={(e) => handleDetailChange(index, 'netWeight', e.target.value)}
//                             className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
//                               errors[`${index}_weight`] ? 'border-red-500' : 'border-gray-200'
//                             }`}
//                             placeholder="Weight (kg)"
//                             min="0"
//                             step="0.01"
//                             disabled={modalLoading}
//                           />
//                           {errors[`${index}_weight`] && (
//                             <p className="mt-1 text-xs text-red-500">{errors[`${index}_weight`]}</p>
//                           )}
//                         </div>

//                         {/* Remove button */}
//                         <div className="col-span-1 flex items-center justify-center">
//                           {formData.details.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeDetailRow(index)}
//                               className="text-red-500 hover:text-red-700 text-2xl"
//                               disabled={modalLoading}
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Total */}
//                 <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total Rows: {formData.details.length}</span>
//                   <div className="text-right">
//                     <span className="text-sm text-gray-600 mr-3">Total Weight:</span>
//                     <span className="text-lg font-semibold text-gray-800">{calculateTotalWeight().toLocaleString()} kg</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={handleCloseModal}
//                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                   disabled={modalLoading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={modalLoading}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 min-w-[100px] justify-center"
//                 >
//                   {modalLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       Saving...
//                     </>
//                   ) : (
//                     isEditing ? 'Update Entry' : 'Create Entry'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Modal */}
//       {openViewModal && viewEntry && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             {/* Modal Header */}
//             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
//               <h3 className="text-xl font-semibold text-gray-800">Waste Entry Details</h3>
//               <button
//                 onClick={handleCloseViewModal}
//                 className="text-gray-400 hover:text-gray-600 text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="flex-1 overflow-y-auto p-6">
//               {/* Header Information */}
//               <div className="mb-6 p-5 bg-gray-50 rounded-lg">
//                 <h4 className="text-base font-medium text-gray-700 mb-4">Entry Information</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-500">Date</p>
//                     <p className="text-base font-medium text-gray-900">{formatDate(viewEntry.date)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Shift</p>
//                     <p className="text-base font-medium text-gray-900">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
//                         viewEntry.shift === 'ALL' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
//                       }`}>
//                         {viewEntry.shift}
//                       </span>
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Entry ID</p>
//                     <p className="text-base font-medium text-gray-900">{viewEntry.id || viewEntry._id}</p>
//                   </div>
//                   {viewEntry.remarks && (
//                     <div className="md:col-span-3">
//                       <p className="text-sm text-gray-500">Remarks</p>
//                       <p className="text-base text-gray-900">{viewEntry.remarks}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Details Table */}
//               <div>
//                 <h4 className="text-base font-medium text-gray-700 mb-4">Waste Details</h4>
//                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waste Type</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packing</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Godown</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {viewEntry.details?.map((detail, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
//                           <td className="px-4 py-3 text-sm text-gray-900">{detail.department || '-'}</td>
//                           <td className="px-4 py-3 text-sm text-gray-900">{getWasteMasterName(detail.wasteMaster || detail.wasteMasterId)}</td>
//                           <td className="px-4 py-3 text-sm text-gray-900">{getPackingTypeName(detail.packingType || detail.packingTypeId)}</td>
//                           <td className="px-4 py-3 text-sm text-gray-900">{getGodownName(detail.godown || detail.godownId)}</td>
//                           <td className="px-4 py-3 text-sm font-semibold text-gray-900">
//                             {typeof detail.netWeight === 'number' ? detail.netWeight.toLocaleString() : detail.netWeight}
//                           </td>
//                         </tr>
//                       ))}
//                       <tr className="bg-gray-50 font-medium">
//                         <td colSpan="5" className="px-4 py-3 text-sm text-gray-700 text-right">Total Weight:</td>
//                         <td className="px-4 py-3 text-sm font-bold text-gray-900">
//                           {viewEntry.details?.reduce((sum, d) => {
//                             const weight = typeof d.netWeight === 'string' ? parseFloat(d.netWeight) : Number(d.netWeight);
//                             return sum + (isNaN(weight) ? 0 : weight);
//                           }, 0).toLocaleString()} kg
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Metadata */}
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
//                 <div>
//                   <p>Created: {viewEntry.createdAt ? new Date(viewEntry.createdAt).toLocaleString() : 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p>Last Updated: {viewEntry.updatedAt ? new Date(viewEntry.updatedAt).toLocaleString() : 'N/A'}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
//               <div className="flex justify-end">
//                 <button
//                   onClick={handleCloseViewModal}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WasteEntryPage;

// frontend/src/pages/admin/WasteEntryPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import wasteEntryService from '../../services/admin1/transaction-waste/wasteEntryService';
import wasteMasterService from '../../services/admin1/master/wasteMasterService';
import godownService from '../../services/admin1/master/godownService';
import packingTypeService from '../../services/admin1/master/packingTypeService';

const WasteEntryPage = () => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Master Data States
  const [wasteMasters, setWasteMasters] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);

  // Dynamic departments list derived from waste masters
  const departments = React.useMemo(() => {
    if (!Array.isArray(wasteMasters)) return [];
    return Array.from(
      new Set(
        wasteMasters
          .map(w => w.department)
          .filter(dept => dept && typeof dept === 'string' && dept.trim() !== '')
          .map(dept => dept.trim())
      )
    ).sort();
  }, [wasteMasters]);

  // UI States
  const [showWasteDropdown, setShowWasteDropdown] = useState({});
  const [showPackingDropdown, setShowPackingDropdown] = useState({});
  const [showGodownDropdown, setShowGodownDropdown] = useState({});
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search states
  const [wasteSearch, setWasteSearch] = useState({});
  const [packingSearch, setPackingSearch] = useState({});
  const [godownSearch, setGodownSearch] = useState({});
  const [departmentSearch, setDepartmentSearch] = useState({});

  // Error states
  const [errors, setErrors] = useState({});

  // Refs
  const wasteRefs = useRef({});
  const packingRefs = useRef({});
  const godownRefs = useRef({});
  const departmentRefs = useRef({});
  const modalRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'ALL',
    remarks: '',
    details: [
      {
        department: '',
        wasteMasterId: '',
        packingTypeId: '',
        godownId: '',
        netWeight: ''
      }
    ]
  });

  const shifts = ['ALL', 'A', 'B', 'C'];

  // Fetch master data
  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch entries
  useEffect(() => {
    fetchEntries();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close all dropdowns when clicking outside
      if (!event.target.closest('.dropdown-container')) {
        setShowDepartmentDropdown({});
        setShowWasteDropdown({});
        setShowPackingDropdown({});
        setShowGodownDropdown({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMasterData = async () => {
    try {
      const [wasteData, godownData, packingData] = await Promise.all([
        wasteMasterService.getAll(),
        godownService.getAll(),
        packingTypeService.getAll()
      ]);

      setWasteMasters(Array.isArray(wasteData) ? wasteData : []);
      setGodowns(Array.isArray(godownData) ? godownData : []);
      setPackingTypes(Array.isArray(packingData) ? packingData : []);
    } catch (error) {
      console.error('Error fetching master data:', error);
      showNotification('Failed to load master data', 'error');
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await wasteEntryService.getAll();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('Failed to fetch waste entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Helper functions to get display names using id instead of _id
  const getWasteMasterName = (wasteMaster) => {
    if (!wasteMaster) return '-';
    if (typeof wasteMaster === 'object') {
      return wasteMaster.waste || wasteMaster.name || '-';
    }
    const found = wasteMasters.find(w => w.id === wasteMaster || w._id === wasteMaster);
    return found ? (found.waste || found.name) : '-';
  };

  const getPackingTypeName = (packingType) => {
    if (!packingType) return '-';
    if (typeof packingType === 'object') {
      return packingType.name || '-';
    }
    const found = packingTypes.find(p => p.id === packingType || p._id === packingType);
    return found ? found.name : '-';
  };

  const getGodownName = (godown) => {
    if (!godown) return '-';
    if (typeof godown === 'object') {
      return godown.godownName || godown.name || '-';
    }
    const found = godowns.find(g => g.id === godown || g._id === godown);
    return found ? (found.godownName || found.name) : '-';
  };

  // Filter functions
  const getFilteredDepartments = (searchTerm) => {
    if (!searchTerm) return departments;
    return departments.filter(dept =>
      dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredWasteMasters = (searchTerm) => {
    if (!searchTerm) return wasteMasters;
    return wasteMasters.filter(waste =>
      (waste.waste || waste.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredPackingTypes = (searchTerm) => {
    if (!searchTerm) return packingTypes;
    return packingTypes.filter(packing =>
      packing.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredGodowns = (searchTerm) => {
    if (!searchTerm) return godowns;
    return godowns.filter(godown =>
      (godown.godownName || godown.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shift: 'ALL',
      remarks: '',
      details: [
        {
          department: '',
          wasteMasterId: '',
          packingTypeId: '',
          godownId: '',
          netWeight: ''
        }
      ]
    });
    setDepartmentSearch({});
    setWasteSearch({});
    setPackingSearch({});
    setGodownSearch({});
    setErrors({});
    setSelectedEntry(null);
    setIsEditing(false);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        const headSheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === "waste entry head") || wb.SheetNames.find(n => n === "Waste Entry Head");
        const detailSheetName = wb.SheetNames.find(n => n.trim().toLowerCase() === "waste entry detail") || wb.SheetNames.find(n => n === "Waste Entry Detail");

        if (!headSheetName || !detailSheetName) {
          showNotification("Invalid Excel file: Must contain 'Waste Entry Head' and 'Waste Entry Detail' sheets.", "error");
          return;
        }

        const headers = XLSX.utils.sheet_to_json(wb.Sheets[headSheetName], { header: 1 });
        const details = XLSX.utils.sheet_to_json(wb.Sheets[detailSheetName]);

        if (headers.length === 0 || details.length === 0) {
          showNotification("Empty sheets found.", "error");
          return;
        }

        setLoading(true);
        const res = await wasteEntryService.bulkImport({ headers, details });
        showNotification(`Successfully imported ${res.importedCount} waste entries!`, "success");
        fetchEntries();
      } catch (err) {
        console.error("Import error:", err);
        showNotification(err.response?.data?.message || "Failed to parse and import Excel file", "error");
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    resetForm();
    setOpenModal(true);
  };

  // Open view modal
  const handleOpenViewModal = async (entry) => {
    try {
      setModalLoading(true);
      const fullEntry = await wasteEntryService.getById(entry.id || entry._id);
      setViewEntry(fullEntry);
      setOpenViewModal(true);
    } catch (error) {
      showNotification('Failed to load entry details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = async (entry) => {
    try {
      setModalLoading(true);
      const fullEntry = await wasteEntryService.getById(entry.id || entry._id);

      // Format the data for editing
      const formattedDetails = fullEntry.details.map(detail => ({
        department: detail.department || '',
        wasteMasterId: detail.wasteMaster?.id || detail.wasteMasterId || '',
        packingTypeId: detail.packingType?.id || detail.packingTypeId || '',
        godownId: detail.godown?.id || detail.godownId || '',
        netWeight: detail.netWeight || ''
      }));

      setFormData({
        date: fullEntry.date.split('T')[0],
        shift: fullEntry.shift,
        remarks: fullEntry.remarks || '',
        details: formattedDetails
      });

      // Set search values for each row
      formattedDetails.forEach((detail, index) => {
        setDepartmentSearch(prev => ({ ...prev, [index]: detail.department }));

        const waste = wasteMasters.find(w => w.id === detail.wasteMasterId || w._id === detail.wasteMasterId);
        setWasteSearch(prev => ({ ...prev, [index]: waste ? (waste.waste || waste.name) : '' }));

        const packing = packingTypes.find(p => p.id === detail.packingTypeId || p._id === detail.packingTypeId);
        setPackingSearch(prev => ({ ...prev, [index]: packing ? packing.name : '' }));

        const godown = godowns.find(g => g.id === detail.godownId || g._id === detail.godownId);
        setGodownSearch(prev => ({ ...prev, [index]: godown ? (godown.godownName || godown.name) : '' }));
      });

      setSelectedEntry(fullEntry);
      setIsEditing(true);
      setOpenModal(true);
    } catch (error) {
      showNotification('Failed to load entry details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Close modals
  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setViewEntry(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle detail changes
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      details: updatedDetails
    }));

    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}_${field}`];
        return newErrors;
      });
    }
  };

  // Department handlers
  const handleDepartmentSelect = (index, department) => {
    handleDetailChange(index, 'department', department);
    setDepartmentSearch(prev => ({ ...prev, [index]: department }));
    setShowDepartmentDropdown(prev => ({ ...prev, [index]: false }));
  };

  const handleDepartmentSearchChange = (index, value) => {
    setDepartmentSearch(prev => ({ ...prev, [index]: value }));
    setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }));
    if (formData.details[index]?.department !== value) {
      handleDetailChange(index, 'department', '');
    }
  };

  // Waste handlers (using id)
  const handleWasteSelect = (index, waste) => {
    const wasteId = waste.id || waste._id;
    handleDetailChange(index, 'wasteMasterId', wasteId);
    setWasteSearch(prev => ({ ...prev, [index]: waste.waste || waste.name }));
    setShowWasteDropdown(prev => ({ ...prev, [index]: false }));
  };

  const handleWasteSearchChange = (index, value) => {
    setWasteSearch(prev => ({ ...prev, [index]: value }));
    setShowWasteDropdown(prev => ({ ...prev, [index]: true }));
    if (formData.details[index]?.wasteMasterId) {
      handleDetailChange(index, 'wasteMasterId', '');
    }
  };

  // Packing handlers (using id)
  const handlePackingSelect = (index, packing) => {
    const packingId = packing.id || packing._id;
    handleDetailChange(index, 'packingTypeId', packingId);
    setPackingSearch(prev => ({ ...prev, [index]: packing.name }));
    setShowPackingDropdown(prev => ({ ...prev, [index]: false }));
  };

  const handlePackingSearchChange = (index, value) => {
    setPackingSearch(prev => ({ ...prev, [index]: value }));
    setShowPackingDropdown(prev => ({ ...prev, [index]: true }));
    if (formData.details[index]?.packingTypeId) {
      handleDetailChange(index, 'packingTypeId', '');
    }
  };

  // Godown handlers (using id)
  const handleGodownSelect = (index, godown) => {
    const godownId = godown.id || godown._id;
    handleDetailChange(index, 'godownId', godownId);
    setGodownSearch(prev => ({ ...prev, [index]: godown.godownName || godown.name }));
    setShowGodownDropdown(prev => ({ ...prev, [index]: false }));
  };

  const handleGodownSearchChange = (index, value) => {
    setGodownSearch(prev => ({ ...prev, [index]: value }));
    setShowGodownDropdown(prev => ({ ...prev, [index]: true }));
    if (formData.details[index]?.godownId) {
      handleDetailChange(index, 'godownId', '');
    }
  };

  // Add/Remove rows
  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          department: '',
          wasteMasterId: '',
          packingTypeId: '',
          godownId: '',
          netWeight: ''
        }
      ]
    }));
  };

  const removeDetailRow = (index) => {
    if (formData.details.length > 1) {
      const updatedDetails = formData.details.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        details: updatedDetails
      }));

      // Clean up related states
      const cleanupState = (state) => {
        const newState = {};
        Object.keys(state).forEach(key => {
          const numKey = parseInt(key);
          if (numKey < index) newState[key] = state[key];
          else if (numKey > index) newState[(numKey - 1).toString()] = state[key];
        });
        return newState;
      };

      setDepartmentSearch(cleanupState(departmentSearch));
      setWasteSearch(cleanupState(wasteSearch));
      setPackingSearch(cleanupState(packingSearch));
      setGodownSearch(cleanupState(godownSearch));
    }
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    return formData.details.reduce((total, detail) => {
      return total + (Number(detail.netWeight) || 0);
    }, 0);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.date) {
      showNotification('Date is required', 'error');
      return false;
    }

    formData.details.forEach((detail, index) => {
      if (!detail.department) {
        newErrors[`${index}_department`] = 'Department is required';
        isValid = false;
      }
      if (!detail.wasteMasterId) {
        newErrors[`${index}_waste`] = 'Waste type is required';
        isValid = false;
      }
      if (!detail.packingTypeId) {
        newErrors[`${index}_packing`] = 'Packing type is required';
        isValid = false;
      }
      if (!detail.godownId) {
        newErrors[`${index}_godown`] = 'Godown is required';
        isValid = false;
      }
      if (!detail.netWeight || detail.netWeight <= 0) {
        newErrors[`${index}_weight`] = 'Valid weight is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Submit form (using id for update)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setModalLoading(true);

      if (isEditing && selectedEntry) {
        await wasteEntryService.update(selectedEntry.id || selectedEntry._id, formData);
        showNotification('Waste entry updated successfully');
      } else {
        await wasteEntryService.create(formData);
        showNotification('Waste entry created successfully');
      }

      await fetchEntries();
      handleCloseModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete entry (using id)
  const handleDelete = async (entry) => {
    const id = entry.id || entry._id;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        await wasteEntryService.delete(id);
        showNotification('Waste entry deleted successfully');
        await fetchEntries();
      } catch (error) {
        showNotification('Failed to delete entry', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
  };

  // Calculate total weight from entries - FIXED VERSION
  const calculateTotalWeightFromEntries = () => {
    return entries.reduce((sum, entry) => {
      const entryTotal = entry.details?.reduce((s, d) => {
        // Convert to number, handle string values
        const weight = typeof d.netWeight === 'string' ? parseFloat(d.netWeight) : Number(d.netWeight);
        return s + (isNaN(weight) ? 0 : weight);
      }, 0) || 0;
      return sum + entryTotal;
    }, 0);
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(entries.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
          } border px-4 py-3 rounded-lg shadow-lg max-w-md`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-4 text-xl hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Waste Entry Management</h1>
            <p className="text-gray-600 mt-1">Manage waste entries across departments</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <label className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center cursor-pointer transition duration-200 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Import Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportExcel}
              />
            </label>
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200 text-sm"
            >
              <span className="mr-2 text-xl">+</span>
              New Waste Entry
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - FIXED TOTAL WEIGHT CALCULATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <span className="text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-800">{entries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Entries</p>
              <p className="text-2xl font-bold text-gray-800">
                {entries.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <span className="text-xl">⚖️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Weight</p>
              <p className="text-2xl font-bold text-gray-800">
                {calculateTotalWeightFromEntries().toLocaleString()} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains exactly the same */}
      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Waste Entries</h2>
        </div>

        {/* Responsive table - no horizontal scrolling */}
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[9%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="w-[7%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Shift</th>
                <th className="w-[13%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                <th className="w-[15%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Waste Type</th>
                <th className="w-[11%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Packing</th>
                <th className="w-[9%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Weight (kg)</th>
                <th className="w-[12%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Godown</th>
                <th className="w-[10%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Remarks</th>
                <th className="w-[14%] px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No waste entries found. Create your first entry!
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <React.Fragment key={entry.id || entry._id}>
                    {entry.details?.map((detail, detailIndex) => (
                      <tr key={`${entry.id || entry._id}-${detailIndex}`} className="hover:bg-gray-50">
                        {detailIndex === 0 && (
                          <>
                            <td className="px-2 sm:px-3 py-3 align-top break-words" rowSpan={entry.details.length}>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {formatDate(entry.date)}
                              </div>
                            </td>

                            <td className="px-2 sm:px-3 py-3 align-top" rowSpan={entry.details.length}>
                              <span className={`inline-block px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${entry.shift === 'ALL'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-green-50 text-green-700'
                                }`}>
                                {entry.shift}
                              </span>
                            </td>
                          </>
                        )}

                        <td className="px-2 sm:px-3 py-3 align-top break-words">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {detail.department || '-'}
                          </div>
                        </td>

                        <td className="px-2 sm:px-3 py-3 align-top break-words">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {getWasteMasterName(detail.wasteMaster || detail.wasteMasterId)}
                          </div>
                        </td>

                        <td className="px-2 sm:px-3 py-3 align-top break-words">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {getPackingTypeName(detail.packingType || detail.packingTypeId)}
                          </div>
                        </td>

                        <td className="px-2 sm:px-3 py-3 align-top">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {typeof detail.netWeight === 'number'
                              ? detail.netWeight.toLocaleString()
                              : detail.netWeight}
                          </div>
                        </td>

                        <td className="px-2 sm:px-3 py-3 align-top break-words">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {getGodownName(detail.godown || detail.godownId)}
                          </div>
                        </td>

                        {detailIndex === 0 && (
                          <td className="px-2 sm:px-3 py-3 align-top break-words" rowSpan={entry.details.length}>
                            <div
                              className="text-xs sm:text-sm text-gray-600 line-clamp-2"
                              title={entry.remarks}
                            >
                              {entry.remarks || '-'}
                            </div>
                          </td>
                        )}

                        {detailIndex === 0 && (
                          <td className="px-2 sm:px-3 py-3 align-top" rowSpan={entry.details.length}>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => handleOpenViewModal(entry)}
                                className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 transition"
                              >
                                View
                              </button>

                              <button
                                onClick={() => handleOpenEditModal(entry)}
                                className="px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-200 transition"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(entry)}
                                className="px-2.5 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {entries.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, entries.length)} of {entries.length} entries
              </span>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 px-2 py-1 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1.5 text-sm text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[34px] px-2.5 py-1.5 text-sm rounded-md transition ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Waste Entry' : 'Create New Waste Entry'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={modalLoading}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Waste Entry Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalLoading}
                    >
                      {shifts.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any additional remarks..."
                      disabled={modalLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-gray-700">Waste Details</h4>
                  <button
                    type="button"
                    onClick={addDetailRow}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    disabled={modalLoading}
                  >
                    <span className="mr-1 text-lg">+</span> Add Row
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-12 gap-3">
                        {/* Department */}
                        <div className="col-span-2">
                          <div className="relative dropdown-container">
                            <input
                              type="text"
                              value={departmentSearch[index] || ''}
                              onChange={(e) => handleDepartmentSearchChange(index, e.target.value)}
                              onFocus={() => setShowDepartmentDropdown(prev => ({ ...prev, [index]: true }))}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`${index}_department`] ? 'border-red-500' : 'border-gray-200'
                                }`}
                              placeholder="Department..."
                              disabled={modalLoading}
                            />

                            {showDepartmentDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredDepartments(departmentSearch[index]).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">No departments found</div>
                                ) : (
                                  getFilteredDepartments(departmentSearch[index]).map(dept => (
                                    <div
                                      key={dept}
                                      onClick={() => handleDepartmentSelect(index, dept)}
                                      className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900">{dept}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {errors[`${index}_department`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${index}_department`]}</p>
                          )}
                        </div>

                        {/* Waste Type */}
                        <div className="col-span-2">
                          <div className="relative dropdown-container">
                            <input
                              type="text"
                              value={wasteSearch[index] || ''}
                              onChange={(e) => handleWasteSearchChange(index, e.target.value)}
                              onFocus={() => setShowWasteDropdown(prev => ({ ...prev, [index]: true }))}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`${index}_waste`] ? 'border-red-500' : 'border-gray-200'
                                }`}
                              placeholder="Waste type..."
                              disabled={modalLoading}
                            />

                            {showWasteDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredWasteMasters(wasteSearch[index]).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">No waste types found</div>
                                ) : (
                                  getFilteredWasteMasters(wasteSearch[index]).map(waste => (
                                    <div
                                      key={waste.id || waste._id}
                                      onClick={() => handleWasteSelect(index, waste)}
                                      className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900">{waste.waste || waste.name}</div>
                                      <div className="text-xs text-gray-500">
                                        Code: {waste.code || 'N/A'} • Dept: {waste.department || 'N/A'}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {errors[`${index}_waste`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${index}_waste`]}</p>
                          )}
                        </div>

                        {/* Packing Type */}
                        <div className="col-span-2">
                          <div className="relative dropdown-container">
                            <input
                              type="text"
                              value={packingSearch[index] || ''}
                              onChange={(e) => handlePackingSearchChange(index, e.target.value)}
                              onFocus={() => setShowPackingDropdown(prev => ({ ...prev, [index]: true }))}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`${index}_packing`] ? 'border-red-500' : 'border-gray-200'
                                }`}
                              placeholder="Packing type..."
                              disabled={modalLoading}
                            />

                            {showPackingDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredPackingTypes(packingSearch[index]).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">No packing types found</div>
                                ) : (
                                  getFilteredPackingTypes(packingSearch[index]).map(packing => (
                                    <div
                                      key={packing.id || packing._id}
                                      onClick={() => handlePackingSelect(index, packing)}
                                      className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900">{packing.name}</div>
                                      <div className="text-xs text-gray-500">Code: {packing.code || 'N/A'}</div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {errors[`${index}_packing`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${index}_packing`]}</p>
                          )}
                        </div>

                        {/* Godown */}
                        <div className="col-span-2">
                          <div className="relative dropdown-container">
                            <input
                              type="text"
                              value={godownSearch[index] || ''}
                              onChange={(e) => handleGodownSearchChange(index, e.target.value)}
                              onFocus={() => setShowGodownDropdown(prev => ({ ...prev, [index]: true }))}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`${index}_godown`] ? 'border-red-500' : 'border-gray-200'
                                }`}
                              placeholder="Godown..."
                              disabled={modalLoading}
                            />

                            {showGodownDropdown[index] && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredGodowns(godownSearch[index]).length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">No godowns found</div>
                                ) : (
                                  getFilteredGodowns(godownSearch[index]).map(godown => (
                                    <div
                                      key={godown.id || godown._id}
                                      onClick={() => handleGodownSelect(index, godown)}
                                      className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-medium text-gray-900">{godown.godownName || godown.name}</div>
                                      <div className="text-xs text-gray-500">
                                        Code: {godown.code || 'N/A'} • {godown.location || 'No location'}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {errors[`${index}_godown`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${index}_godown`]}</p>
                          )}
                        </div>

                        {/* Net Weight */}
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={detail.netWeight}
                            onChange={(e) => handleDetailChange(index, 'netWeight', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`${index}_weight`] ? 'border-red-500' : 'border-gray-200'
                              }`}
                            placeholder="Weight (kg)"
                            min="0"
                            step="0.01"
                            disabled={modalLoading}
                          />
                          {errors[`${index}_weight`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${index}_weight`]}</p>
                          )}
                        </div>

                        {/* Remove button */}
                        <div className="col-span-1 flex items-center justify-center">
                          {formData.details.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDetailRow(index)}
                              className="text-red-500 hover:text-red-700 text-2xl"
                              disabled={modalLoading}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rows: {formData.details.length}</span>
                  <div className="text-right">
                    <span className="text-sm text-gray-600 mr-3">Total Weight:</span>
                    <span className="text-lg font-semibold text-gray-800">{calculateTotalWeight().toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modalLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50 min-w-[100px] justify-center"
                >
                  {modalLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Update Entry' : 'Create Entry'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {openViewModal && viewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Waste Entry Details</h3>
              <button
                onClick={handleCloseViewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Header Information */}
              <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                <h4 className="text-base font-medium text-gray-700 mb-4">Entry Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(viewEntry.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shift</p>
                    <p className="text-base font-medium text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${viewEntry.shift === 'ALL' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>
                        {viewEntry.shift}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entry ID</p>
                    <p className="text-base font-medium text-gray-900">{viewEntry.id || viewEntry._id}</p>
                  </div>
                  {viewEntry.remarks && (
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="text-base text-gray-900">{viewEntry.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Table */}
              <div>
                <h4 className="text-base font-medium text-gray-700 mb-4">Waste Details</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waste Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Packing</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Godown</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewEntry.details?.map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{detail.department || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getWasteMasterName(detail.wasteMaster || detail.wasteMasterId)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getPackingTypeName(detail.packingType || detail.packingTypeId)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getGodownName(detail.godown || detail.godownId)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {typeof detail.netWeight === 'number' ? detail.netWeight.toLocaleString() : detail.netWeight}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan="5" className="px-4 py-3 text-sm text-gray-700 text-right">Total Weight:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {viewEntry.details?.reduce((sum, d) => {
                            const weight = typeof d.netWeight === 'string' ? parseFloat(d.netWeight) : Number(d.netWeight);
                            return sum + (isNaN(weight) ? 0 : weight);
                          }, 0).toLocaleString()} kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <div>
                  <p>Created: {viewEntry.createdAt ? new Date(viewEntry.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p>Last Updated: {viewEntry.updatedAt ? new Date(viewEntry.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteEntryPage;
