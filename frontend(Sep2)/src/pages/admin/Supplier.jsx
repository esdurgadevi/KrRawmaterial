// import React, { useState, useEffect } from 'react';
// import supplierService from '../../services/admin1/master/supplierService';
// import stateService from '../../services/admin1/master/stateService';

// // Helper component for detail items in view modal
// const DetailItem = ({ label, value, isMultiline = false, isLink = false }) => {
//   if (!value) return null;
  
//   return (
//     <div className={`${isMultiline ? '' : 'flex items-center justify-between'}`}>
//       <span className="text-xs text-gray-500">{label}:</span>
//       {isLink ? (
//         <a 
//           href={value.startsWith('http') ? value : `https://${value}`} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
//         >
//           {value}
//         </a>
//       ) : isMultiline ? (
//         <div className="mt-1">
//           <p className="text-sm text-gray-900 whitespace-pre-line">{value}</p>
//         </div>
//       ) : (
//         <span className="text-sm font-medium text-gray-900 truncate ml-2">{value}</span>
//       )}
//     </div>
//   );
// };

// const Supplier = () => {
//   // States
//   const [suppliers, setSuppliers] = useState([]);
//   const [states, setStates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statesLoading, setStatesLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterState, setFilterState] = useState('');
  
//   // Modal states
//   const [showModal, setShowModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [editingSupplier, setEditingSupplier] = useState(null);
//   const [viewingSupplier, setViewingSupplier] = useState(null);
  
//   // Form state
//   const [formData, setFormData] = useState({
//     code: '',
//     accountGroup: '',
//     accountName: '',
//     place: '',
//     address: '',
//     deliveryAddress: '',
//     pincode: '',
//     stateId: '',
//     tinNo: '',
//     cstNo: '',
//     gstNo: '',
//     phoneNo: '',
//     cellNo: '',
//     email: '',
//     website: '',
//     contactPerson: '',
//     fax: '',
//     accountNo: '',
//     openingCredit: 0,
//     openingDebit: 0
//   });

//   // Load suppliers and states on component mount
//   useEffect(() => {
//     fetchSuppliers();
//     fetchStates();
//   }, []);

//   const fetchSuppliers = async () => {
//     setLoading(true);
//     setError('');
//     setSuccess('');
    
//     try {
//       const response = await supplierService.getAll();
      
//       // Extract suppliers array from response (response.data.suppliers)
//       const suppliersData = Array.isArray(response) ? response : [];
      
//       setSuppliers(suppliersData);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message || 'Failed to load suppliers');
//       setSuppliers([]);
//       setLoading(false);
//     }
//   };

//   const fetchStates = async () => {
//     setStatesLoading(true);
//     try {
//       const response = await stateService.getAll();
      
//       // Extract states array from response (response.data.states)
//       const statesData = Array.isArray(response) ? response : [];
      
//       setStates(statesData);
//       setStatesLoading(false);
//     } catch (err) {
//       console.error('Failed to load states:', err);
//       setStates([]);
//       setStatesLoading(false);
//     }
//   };

//   // Filter suppliers based on search
//   const filteredSuppliers = (() => {
//     const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    
//     return suppliersArray.filter(supplier => {
//       if (!supplier || typeof supplier !== 'object') return false;
      
//       const code = supplier.code || '';
//       const accountName = supplier.accountName || '';
//       const place = supplier.place || '';
//       const accountGroup = supplier.accountGroup || '';
//       const stateName = supplier.State ? supplier.State.state || '' : '';
//       const gstNo = supplier.gstNo || '';
//       const phoneNo = supplier.phoneNo || '';
      
//       const matchesSearch = searchTerm === '' || 
//         code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         place.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         accountGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         gstNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         phoneNo.toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesState = filterState === '' || 
//         (supplier.State && supplier.State.id && supplier.State.id.toString() === filterState);
      
//       return matchesSearch && matchesState;
//     });
//   })();

//   const handleInputChange = (e) => {
//     const { name, value, type } = e.target;
    
//     if (type === 'number') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value === '' ? '' : parseFloat(value) || 0
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: name === 'stateId' ? (value === '' ? '' : parseInt(value) || value) : value
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     // Validate required fields
//     if (!formData.code || !formData.accountName || !formData.accountGroup) {
//       setError('Code, Account Name, and Account Group are required');
//       return;
//     }

//     try {
//       if (editingSupplier) {
//         // Update existing supplier
//         await supplierService.update(editingSupplier.id, formData);
//         setSuccess('Supplier updated successfully!');
//       } else {
//         // Create new supplier
//         await supplierService.create(formData);
//         setSuccess('Supplier created successfully!');
//       }
      
//       // Refresh suppliers list
//       fetchSuppliers();
      
//       // Reset form and close modal
//       resetForm();
//       setShowModal(false);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message || 'Operation failed');
//     }
//   };

//   const handleEdit = (supplier) => {
//     if (!supplier || !supplier.id) {
//       setError('Invalid supplier data');
//       return;
//     }
    
//     setEditingSupplier(supplier);
//     setFormData({
//       code: supplier.code || '',
//       accountGroup: supplier.accountGroup || '',
//       accountName: supplier.accountName || '',
//       place: supplier.place || '',
//       address: supplier.address || '',
//       deliveryAddress: supplier.deliveryAddress || '',
//       pincode: supplier.pincode || '',
//       stateId: supplier.stateId || '',
//       tinNo: supplier.tinNo || '',
//       cstNo: supplier.cstNo || '',
//       gstNo: supplier.gstNo || '',
//       phoneNo: supplier.phoneNo || '',
//       cellNo: supplier.cellNo || '',
//       email: supplier.email || '',
//       website: supplier.website || '',
//       contactPerson: supplier.contactPerson || '',
//       fax: supplier.fax || '',
//       accountNo: supplier.accountNo || '',
//       openingCredit: supplier.openingCredit || 0,
//       openingDebit: supplier.openingDebit || 0
//     });
//     setShowModal(true);
//   };

//   const handleView = (supplier) => {
//     if (!supplier || !supplier.id) {
//       setError('Invalid supplier data');
//       return;
//     }
    
//     setViewingSupplier(supplier);
//     setShowViewModal(true);
//   };

//   const handleDelete = async (id, supplierName) => {
//     if (!id || !supplierName) {
//       setError('Invalid supplier data for deletion');
//       return;
//     }

//     if (!window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
//       return;
//     }

//     try {
//       await supplierService.delete(id);
//       setSuccess('Supplier deleted successfully!');
//       fetchSuppliers();
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message || 'Failed to delete supplier');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       code: '',
//       accountGroup: '',
//       accountName: '',
//       place: '',
//       address: '',
//       deliveryAddress: '',
//       pincode: '',
//       stateId: '',
//       tinNo: '',
//       cstNo: '',
//       gstNo: '',
//       phoneNo: '',
//       cellNo: '',
//       email: '',
//       website: '',
//       contactPerson: '',
//       fax: '',
//       accountNo: '',
//       openingCredit: 0,
//       openingDebit: 0
//     });
//     setEditingSupplier(null);
//     setViewingSupplier(null);
//   };

//   const openCreateModal = async() => {
//     resetForm();
//     try {
//         const nextCode = await supplierService.getNextCode();
//         setFormData((prev) => ({
//           ...prev,
//           code: nextCode,
//         }));
//       } catch (error) {
//         setError("Failed to generate supplier code");
//       }
    
//     setShowModal(true);
//   };

//   const exportSuppliers = async () => {
//     try {
//       const csvContent = "data:text/csv;charset=utf-8," +
//         "Code,Account Name,Account Group,Place,State,Phone,GST No,Email\n" +
//         filteredSuppliers.map(s => 
//           `${s.code},${s.accountName},${s.accountGroup},${s.place},${s.State ? s.State.state : 'N/A'},${s.phoneNo || ''},${s.gstNo || ''},${s.email || ''}`
//         ).join("\n");
      
//       const encodedUri = encodeURI(csvContent);
//       const link = document.createElement("a");
//       link.setAttribute("href", encodedUri);
//       link.setAttribute("download", "suppliers.csv");
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       setSuccess('Suppliers exported successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError('Failed to export suppliers');
//     }
//   };

//   // Clear filters
//   const clearFilters = () => {
//     setSearchTerm('');
//     setFilterState('');
//   };

//   // Format code display
//   const formatCode = (code) => {
//     if (!code) return 'N/A';
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

//   // Get unique states for filter dropdown
//   const uniqueStates = [...new Set(suppliers
//     .filter(s => s.State)
//     .map(s => ({ id: s.State.id, name: s.State.state }))
//   )].sort((a, b) => a.name.localeCompare(b.name));

//   // Account group options
//   const accountGroupOptions = ['Option A', 'Option B'];

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Supplier Management</h1>
//             <p className="text-gray-600">Manage all suppliers and their details</p>
//           </div>
//           <button
//             onClick={openCreateModal}
//             className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
//           >
//             <span className="mr-2">+</span>
//             Add New Supplier
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

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
//           {/* Search Input */}
//           <div className="flex-1">
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
//               <input
//                 type="text"
//                 placeholder="Search suppliers by code, name, place, GST, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* State Filter */}
//           <div className="w-full md:w-64">
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚙️</span>
//               <select
//                 value={filterState}
//                 onChange={(e) => setFilterState(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//               >
//                 <option value="">All States</option>
//                 {uniqueStates.map(state => (
//                   <option key={state.id} value={state.id}>{state.name}</option>
//                 ))}
//               </select>
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex space-x-2">
//             <button
//               onClick={clearFilters}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
//             >
//               Clear Filters
//             </button>
//             <button
//               onClick={exportSuppliers}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
//             >
//               <span className="mr-2">📥</span>
//               Export
//             </button>
//             <button
//               onClick={() => {
//                 fetchSuppliers();
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

//       {/* Suppliers Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         {/* Table Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Suppliers ({filteredSuppliers.length})
//             </h2>
//             <span className="text-sm text-gray-500">
//               Showing {filteredSuppliers.length} of {suppliers.length} suppliers
//             </span>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading ? (
//           <div className="p-8 text-center">
//             <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
//             <p className="text-gray-600">Loading suppliers...</p>
//           </div>
//         ) : filteredSuppliers.length === 0 ? (
//           <div className="p-8 text-center">
//             <span className="text-5xl text-gray-400 mb-4 inline-block">🚚</span>
//             <p className="text-gray-600 mb-2">No suppliers found</p>
//             {searchTerm || filterState ? (
//               <p className="text-sm text-gray-500">
//                 Try adjusting your search or filter
//               </p>
//             ) : (
//               <button
//                 onClick={openCreateModal}
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Create your first supplier
//               </button>
//             )}
//           </div>
//         ) : (
//           /* Suppliers Table */
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Code
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Supplier Details
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact & Location
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Created Date
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredSuppliers.map((supplier) => (
//                   <tr key={supplier.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div>
//                           <div className="font-mono font-semibold text-gray-900">
//                             {supplier.code}
//                           </div>
//                           <div className="text-xs text-gray-500">ID: {supplier.id}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center">
//                           <div className="text-sm font-medium text-gray-900">{supplier.accountName}</div>
//                         </div>
//                         <div className="flex items-center">
//                           <div className="text-sm text-gray-600">{supplier.accountGroup}</div>
//                         </div>
//                         {supplier.gstNo && (
//                           <div className="flex items-center">
//                             <div className="text-sm text-gray-500">GST: {supplier.gstNo}</div>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="space-y-1">
//                         <div className="flex items-center">
//                           <div className="text-sm text-gray-600">{supplier.place}</div>
//                         </div>
//                         <div className="flex items-center">
//                           <div className="text-sm text-gray-600">
//                             {supplier.State ? supplier.State.state : 'N/A'}
//                           </div>
//                         </div>
//                         {supplier.phoneNo && (
//                           <div className="flex items-center">
//                             <div className="text-sm text-gray-500">{supplier.phoneNo}</div>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">
//                         {formatDate(supplier.createdAt)}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {formatTime(supplier.createdAt)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleView(supplier)}
//                           className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
//                         >
//                           View
//                         </button>
//                         <button
//                           onClick={() => handleEdit(supplier)}
//                           className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(supplier.id, supplier.accountName)}
//                           className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
//                         >
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

//       {/* Create/Edit Supplier Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
//             <div className="p-6">
//               {/* Modal Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-xl font-semibold text-gray-800">
//                   {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
//                 <div className="space-y-6">
//                   {/* Basic Information Section */}
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Basic Information</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* Code */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Supplier Code *
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
//                           <input
//                             type="text"
//                             name="code"
//                             value={formData.code}
//                             onChange={handleInputChange}
//                             required
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter supplier code"
//                             disabled
//                           />
//                         </div>
//                       </div>

//                       {/* Account Group - Now with dropdown */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Account Group *
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span>
//                           <select
//                             name="accountGroup"
//                             value={formData.accountGroup}
//                             onChange={handleInputChange}
//                             required
//                             className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                           >
//                             <option value="">Select Account Group</option>
//                             <option value={'Creditars_cotton'}>Creditars_cotton</option>
//                             <option value={'Debtors_others'}>Debtors_others</option>
//                             {/* {accountGroupOptions.map(option => (
//                               <option key={option} value={option}>
//                                 {option}
//                               </option>
//                             ))} */}
//                           </select>
//                           <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
//                         </div>
//                       </div>

//                       {/* Account Name */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Account Name *
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span>
//                           <input
//                             type="text"
//                             name="accountName"
//                             value={formData.accountName}
//                             onChange={handleInputChange}
//                             required
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter supplier/company name"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Rest of the form remains exactly the same */}
//                   {/* Location Information Section */}
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Location Information</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* Place */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Place *
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📍</span>
//                           <input
//                             type="text"
//                             name="place"
//                             value={formData.place}
//                             onChange={handleInputChange}
//                             required
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter city/town"
//                           />
//                         </div>
//                       </div>

//                       {/* State Dropdown */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           State
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🌍</span>
//                           {statesLoading ? (
//                             <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
//                               <span className="w-4 h-4 text-gray-400 animate-spin inline-block mr-2">↻</span>
//                               <span className="text-gray-500">Loading states...</span>
//                             </div>
//                           ) : (
//                             <select
//                               name="stateId"
//                               value={formData.stateId}
//                               onChange={handleInputChange}
//                               className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                             >
//                               <option value="">Select a state</option>
//                               {states.map(state => (
//                                 <option key={state.id} value={state.id}>
//                                   {state.code ? `${formatCode(state.code)} - ${state.state}` : state.state}
//                                 </option>
//                               ))}
//                             </select>
//                           )}
//                           {!statesLoading && states.length > 0 && (
//                             <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Pincode */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Pincode
//                         </label>
//                         <input
//                           type="text"
//                           name="pincode"
//                           value={formData.pincode}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter pincode"
//                         />
//                       </div>

//                       {/* Address */}
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Address
//                         </label>
//                         <textarea
//                           name="address"
//                           value={formData.address}
//                           onChange={handleInputChange}
//                           rows="2"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter full address"
//                         />
//                       </div>

//                       {/* Delivery Address */}
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Delivery Address
//                         </label>
//                         <textarea
//                           name="deliveryAddress"
//                           value={formData.deliveryAddress}
//                           onChange={handleInputChange}
//                           rows="2"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter delivery address"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Tax & Legal Information Section */}
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Tax & Legal Information</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* TIN No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           TIN No
//                         </label>
//                         <input
//                           type="text"
//                           name="tinNo"
//                           value={formData.tinNo}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter TIN number"
//                         />
//                       </div>

//                       {/* CST No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           CST No
//                         </label>
//                         <input
//                           type="text"
//                           name="cstNo"
//                           value={formData.cstNo}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter CST number"
//                         />
//                       </div>

//                       {/* GST No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           GST No
//                         </label>
//                         <input
//                           type="text"
//                           name="gstNo"
//                           value={formData.gstNo}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter GST number"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Contact Information Section */}
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Contact Information</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* Phone No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Phone No
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span>
//                           <input
//                             type="text"
//                             name="phoneNo"
//                             value={formData.phoneNo}
//                             onChange={handleInputChange}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter phone number"
//                           />
//                         </div>
//                       </div>

//                       {/* Cell No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Cell No
//                         </label>
//                         <input
//                           type="text"
//                           name="cellNo"
//                           value={formData.cellNo}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter mobile number"
//                         />
//                       </div>

//                       {/* Email */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Email
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
//                           <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter email address"
//                           />
//                         </div>
//                       </div>

//                       {/* Website */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Website
//                         </label>
//                         <input
//                           type="text"
//                           name="website"
//                           value={formData.website}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter website URL"
//                         />
//                       </div>

//                       {/* Contact Person */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Contact Person
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
//                           <input
//                             type="text"
//                             name="contactPerson"
//                             value={formData.contactPerson}
//                             onChange={handleInputChange}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             placeholder="Enter contact person name"
//                           />
//                         </div>
//                       </div>

//                       {/* Fax */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Fax
//                         </label>
//                         <input
//                           type="text"
//                           name="fax"
//                           value={formData.fax}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter fax number"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Financial Information Section */}
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Financial Information</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {/* Account No */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Account No
//                         </label>
//                         <input
//                           type="text"
//                           name="accountNo"
//                           value={formData.accountNo}
//                           onChange={handleInputChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter account number"
//                         />
//                       </div>

//                       {/* Opening Credit */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Opening Credit
//                         </label>
//                         <input
//                           type="text"
//                           name="openingCredit"
//                           value={formData.openingCredit}
//                           onChange={handleInputChange}
//                           inputMode="decimal"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="0.00"
//                         />
//                       </div>

//                       {/* Opening Debit */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Opening Debit
//                         </label>
//                         <input
//                           type="text"
//                           name="openingDebit"
//                           value={formData.openingDebit}
//                           onChange={handleInputChange}
//                           inputMode="decimal"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="0.00"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Modal Footer */}
//                   <div className="flex items-center justify-between pt-6 border-t border-gray-200">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowModal(false);
//                         resetForm();
//                       }}
//                       className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                     >
//                       Cancel
//                     </button>
//                     <div className="flex space-x-3">
//                       <button
//                         type="button"
//                         onClick={resetForm}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                       >
//                         Reset Form
//                       </button>
//                       <button
//                         type="submit"
//                         className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
//                       >
//                         {editingSupplier ? (
//                           <>
//                             <span className="mr-2">✏️</span>
//                             Update Supplier
//                           </>
//                         ) : (
//                           <>
//                             <span className="mr-2">+</span>
//                             Create Supplier
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Supplier Modal */}
//       {showViewModal && viewingSupplier && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
//             <div className="p-6">
//               {/* Modal Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-800">Supplier Details</h3>
//                   <p className="text-sm text-gray-500 mt-1">ID: {viewingSupplier.id}</p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowViewModal(false);
//                     setViewingSupplier(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-500"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Supplier Details */}
//               <div className="space-y-6">
//                 {/* Header Section */}
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="flex items-center">
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
//                           <span className="text-2xl text-blue-600">🏢</span>
//                         </div>
//                         <div>
//                           <h4 className="text-lg font-bold text-gray-900">
//                             {viewingSupplier.accountName}
//                           </h4>
//                           <div className="flex items-center space-x-4 mt-1">
//                             <span className="text-sm font-mono font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
//                               Code: {viewingSupplier.code}
//                             </span>
//                             <span className="text-sm text-gray-600">
//                               Group: {viewingSupplier.accountGroup}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-gray-500">Created On</div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {formatDate(viewingSupplier.createdAt)}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {formatTime(viewingSupplier.createdAt)}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Details Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Left Column */}
//                   <div className="space-y-4">
//                     {/* Location Information */}
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <span className="mr-2">📍</span>
//                         Location Information
//                       </h4>
//                       <div className="space-y-2">
//                         <DetailItem label="Place" value={viewingSupplier.place} />
//                         <DetailItem label="State" value={viewingSupplier.State ? viewingSupplier.State.state : 'N/A'} />
//                         <DetailItem label="Pincode" value={viewingSupplier.pincode} />
//                         <DetailItem label="Address" value={viewingSupplier.address} isMultiline />
//                         <DetailItem label="Delivery Address" value={viewingSupplier.deliveryAddress} isMultiline />
//                       </div>
//                     </div>

//                     {/* Contact Information */}
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <span className="mr-2">📞</span>
//                         Contact Information
//                       </h4>
//                       <div className="space-y-2">
//                         <DetailItem label="Phone No" value={viewingSupplier.phoneNo} />
//                         <DetailItem label="Cell No" value={viewingSupplier.cellNo} />
//                         <DetailItem label="Email" value={viewingSupplier.email} />
//                         <DetailItem label="Website" value={viewingSupplier.website} isLink />
//                         <DetailItem label="Contact Person" value={viewingSupplier.contactPerson} />
//                         <DetailItem label="Fax" value={viewingSupplier.fax} />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right Column */}
//                   <div className="space-y-4">
//                     {/* Tax & Legal Information */}
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <span className="mr-2">💳</span>
//                         Tax & Legal Information
//                       </h4>
//                       <div className="space-y-2">
//                         <DetailItem label="TIN No" value={viewingSupplier.tinNo} />
//                         <DetailItem label="CST No" value={viewingSupplier.cstNo} />
//                         <DetailItem label="GST No" value={viewingSupplier.gstNo} />
//                       </div>
//                     </div>

//                     {/* Financial Information */}
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <span className="mr-2">📄</span>
//                         Financial Information
//                       </h4>
//                       <div className="space-y-2">
//                         <DetailItem label="Account No" value={viewingSupplier.accountNo} />
//                         <DetailItem 
//                           label="Opening Credit" 
//                           value={viewingSupplier.openingCredit ? 
//                             `₹${parseFloat(viewingSupplier.openingCredit).toFixed(2)}` : 
//                             '₹0.00'
//                           } 
//                         />
//                         <DetailItem 
//                           label="Opening Debit" 
//                           value={viewingSupplier.openingDebit ? 
//                             `₹${parseFloat(viewingSupplier.openingDebit).toFixed(2)}` : 
//                             '₹0.00'
//                           } 
//                         />
//                       </div>
//                     </div>

//                     {/* Additional Details */}
//                     <div>
//                       <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
//                         <span className="mr-2">#</span>
//                         Additional Details
//                       </h4>
//                       <div className="space-y-2">
//                         <DetailItem 
//                           label="Last Updated" 
//                           value={
//                             viewingSupplier.updatedAt ? 
//                               `${formatDate(viewingSupplier.updatedAt)} ${formatTime(viewingSupplier.updatedAt)}` : 
//                               'N/A'
//                           } 
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Modal Footer */}
//                 <div className="flex items-center justify-between pt-6 border-t border-gray-200">
//                   <button
//                     onClick={() => {
//                       setShowViewModal(false);
//                       setViewingSupplier(null);
//                     }}
//                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                   >
//                     Close
//                   </button>
//                   <div className="flex space-x-3">
//                     <button
//                       onClick={() => {
//                         handleEdit(viewingSupplier);
//                         setShowViewModal(false);
//                       }}
//                       className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
//                     >
//                       <span className="mr-2">✏️</span>
//                       Edit Supplier
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Supplier;


import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import supplierService from '../../services/admin1/master/supplierService';
import stateService from '../../services/admin1/master/stateService';

// Helper component for detail items in view modal
const DetailItem = ({ label, value, isMultiline = false, isLink = false }) => {
  if (!value) return null;
  
  return (
    <div className={`${isMultiline ? '' : 'flex items-center justify-between'}`}>
      <span className="text-xs text-gray-500">{label}:</span>
      {isLink ? (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
        >
          {value}
        </a>
      ) : isMultiline ? (
        <div className="mt-1">
          <p className="text-sm text-gray-900 whitespace-pre-line">{value}</p>
        </div>
      ) : (
        <span className="text-sm font-medium text-gray-900 truncate ml-2">{value}</span>
      )}
    </div>
  );
};

const Supplier = () => {
  // States
  const [suppliers, setSuppliers] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  
  // Bulk import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    accountGroup: '',
    accountName: '',
    place: '',
    address: '',
    deliveryAddress: '',
    pincode: '',
    stateId: '',
    tinNo: '',
    cstNo: '',
    gstNo: '',
    phoneNo: '',
    cellNo: '',
    email: '',
    website: '',
    contactPerson: '',
    fax: '',
    accountNo: '',
    openingCredit: 0,
    openingDebit: 0
  });

  // Load suppliers and states on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchStates();
  }, []);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterState]);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await supplierService.getAll();
      
      // Extract suppliers array from response (response.data.suppliers)
      const suppliersData = Array.isArray(response) ? response : [];
      
      setSuppliers(suppliersData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
      setSuppliers([]);
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const response = await stateService.getAll();
      
      // Extract states array from response (response.data.states)
      const statesData = Array.isArray(response) ? response : [];
      
      setStates(statesData);
      setStatesLoading(false);
    } catch (err) {
      console.error('Failed to load states:', err);
      setStates([]);
      setStatesLoading(false);
    }
  };

  // Filter suppliers based on search and filter
  const filteredSuppliers = (() => {
    const suppliersArray = Array.isArray(suppliers) ? suppliers : [];
    
    return suppliersArray.filter(supplier => {
      if (!supplier || typeof supplier !== 'object') return false;
      
      const code = supplier.code || '';
      const accountName = supplier.accountName || '';
      const place = supplier.place || '';
      const accountGroup = supplier.accountGroup || '';
      const stateName = supplier.State ? supplier.State.state || '' : '';
      const gstNo = supplier.gstNo || '';
      const phoneNo = supplier.phoneNo || '';
      
      const matchesSearch = searchTerm === '' || 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gstNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesState = filterState === '' || 
        (supplier.State && supplier.State.id && supplier.State.id.toString() === filterState);
      
      return matchesSearch && matchesState;
    }).sort((a, b) => a.id - b.id); // Sort by ID
  })();

  // Calculate pagination data
  const paginationData = (() => {
    const totalItems = filteredSuppliers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    return { totalItems, totalPages, startIndex, endIndex, paginatedSuppliers };
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
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'stateId' ? (value === '' ? '' : parseInt(value) || value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.code || !formData.accountName || !formData.accountGroup) {
      setError('Code, Account Name, and Account Group are required');
      return;
    }

    try {
      if (editingSupplier) {
        // Update existing supplier
        await supplierService.update(editingSupplier.id, formData);
        setSuccess('Supplier updated successfully!');
      } else {
        // Create new supplier
        await supplierService.create(formData);
        setSuccess('Supplier created successfully!');
      }
      
      // Refresh suppliers list
      fetchSuppliers();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    if (!supplier || !supplier.id) {
      setError('Invalid supplier data');
      return;
    }
    
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code || '',
      accountGroup: supplier.accountGroup || '',
      accountName: supplier.accountName || '',
      place: supplier.place || '',
      address: supplier.address || '',
      deliveryAddress: supplier.deliveryAddress || '',
      pincode: supplier.pincode || '',
      stateId: supplier.stateId || '',
      tinNo: supplier.tinNo || '',
      cstNo: supplier.cstNo || '',
      gstNo: supplier.gstNo || '',
      phoneNo: supplier.phoneNo || '',
      cellNo: supplier.cellNo || '',
      email: supplier.email || '',
      website: supplier.website || '',
      contactPerson: supplier.contactPerson || '',
      fax: supplier.fax || '',
      accountNo: supplier.accountNo || '',
      openingCredit: supplier.openingCredit || 0,
      openingDebit: supplier.openingDebit || 0
    });
    setShowModal(true);
  };

  const handleView = (supplier) => {
    if (!supplier || !supplier.id) {
      setError('Invalid supplier data');
      return;
    }
    
    setViewingSupplier(supplier);
    setShowViewModal(true);
  };

  const handleDelete = async (id, supplierName) => {
    if (!id || !supplierName) {
      setError('Invalid supplier data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
      return;
    }

    try {
      await supplierService.delete(id);
      setSuccess('Supplier deleted successfully!');
      fetchSuppliers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      accountGroup: '',
      accountName: '',
      place: '',
      address: '',
      deliveryAddress: '',
      pincode: '',
      stateId: '',
      tinNo: '',
      cstNo: '',
      gstNo: '',
      phoneNo: '',
      cellNo: '',
      email: '',
      website: '',
      contactPerson: '',
      fax: '',
      accountNo: '',
      openingCredit: 0,
      openingDebit: 0
    });
    setEditingSupplier(null);
    setViewingSupplier(null);
  };

  const openCreateModal = async() => {
    resetForm();
    try {
        const nextCode = await supplierService.getNextCode();
        setFormData((prev) => ({
          ...prev,
          code: nextCode,
        }));
      } catch (error) {
        setError("Failed to generate supplier code");
      }
    
    setShowModal(true);
  };

  const exportSuppliers = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Code,Account Name,Account Group,Place,State,Phone,GST No,Email\n" +
        filteredSuppliers.map(s => 
          `${s.code},${s.accountName},${s.accountGroup},${s.place},${s.State ? s.State.state : 'N/A'},${s.phoneNo || ''},${s.gstNo || ''},${s.email || ''}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "suppliers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Suppliers exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export suppliers');
    }
  };

  // Handle bulk import file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!data || data.length < 3) {
          setImportError('No valid data rows found in spreadsheet.');
          return;
        }

        const dataRows = data.slice(2).filter(r => r && Array.isArray(r) && r[1] && String(r[1]).trim() !== '' && String(r[1]).toLowerCase() !== 'party name');
        
        const parsed = dataRows.map((r, idx) => {
          let partyName = String(r[1] || '').trim();
          let place = String(r[2] || '').trim() || 'N/A';
          let phoneNo = r[3] ? String(r[3]).trim() : '';
          let email = r[4] ? String(r[4]).trim() : '';
          let fax = r[5] ? String(r[5]).trim() : '';

          if (phoneNo === '-') phoneNo = '';
          if (email === '-' || !email.includes('@')) email = '';
          if (fax === '-') fax = '';

          return {
            srNo: idx + 1,
            partyName,
            place,
            phoneNo,
            email: email || null,
            fax
          };
        });

        setImportPreview(parsed);
      } catch (err) {
        setImportError(`Failed to parse file: ${err.message}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Confirm and submit bulk import
  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;

    setImporting(true);
    setImportError('');

    try {
      const res = await supplierService.bulkImport(importPreview);
      setSuccess(`Import complete: ${res.result?.importedCount || importPreview.length} suppliers added (${res.result?.skippedCount || 0} skipped duplicates).`);
      setShowImportModal(false);
      setImportPreview([]);
      fetchSuppliers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setImportError(err.response?.data?.message || err.message || 'Bulk import failed');
    } finally {
      setImporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterState('');
  };

  // Format code display
  const formatCode = (code) => {
    if (!code) return 'N/A';
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

  // Get unique states for filter dropdown
  const uniqueStates = [...new Set(suppliers
    .filter(s => s.State)
    .map(s => ({ id: s.State.id, name: s.State.state }))
  )].sort((a, b) => a.name.localeCompare(b.name));

  // Account group options
  const accountGroupOptions = ['Option A', 'Option B'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Supplier Management</h1>
            <p className="text-gray-600">Manage all suppliers and their details</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Add New Supplier
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
         <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          {/* <span className="mr-2 mt-0.5 flex-shrink-0">✓</span> */}
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span> */}
              <input
                type="text"
                placeholder="Search suppliers by code, name, place, GST, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* State Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚙️</span> */}
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              Clear Filters
            </button>
            <button
              onClick={exportSuppliers}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                setImportPreview([]);
                setImportError('');
                setShowImportModal(true);
              }}
              className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center font-medium"
            >
              <span className="mr-2">📤</span>
              Bulk Import
            </button>
            <button
              onClick={() => {
                fetchSuppliers();
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

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Suppliers ({paginationData.paginatedSuppliers.length}/{filteredSuppliers.length})
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
            <p className="text-gray-600">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">🚚</span>
            <p className="text-gray-600 mb-2">No suppliers found</p>
            {searchTerm || filterState ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first supplier
              </button>
            )}
          </div>
        ) : (
          /* Suppliers Table */
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th> */}
                    <th scope="col" className="px-16 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact & Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginationData.paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-gray-900">
                          {supplier.id}
                        </div>
                      </td> */}
                      <td className="px-16 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-gray-900">
                          {supplier.code}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{supplier.accountName}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600">{supplier.accountGroup}</div>
                          </div>
                          {supplier.gstNo && (
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500">GST: {supplier.gstNo}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600">{supplier.place}</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600">
                              {supplier.State ? supplier.State.state : 'N/A'}
                            </div>
                          </div>
                          {supplier.phoneNo && (
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500">{supplier.phoneNo}</div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(supplier.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(supplier.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(supplier)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id, supplier.accountName)}
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
            {filteredSuppliers.length > 0 && (
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
                  Showing {paginationData.startIndex + 1} to {Math.min(paginationData.endIndex, paginationData.totalItems)} of {paginationData.totalItems} suppliers
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

      {/* Create/Edit Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Code *
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span> */}
                          <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter supplier code"
                            disabled
                          />
                        </div>
                      </div>

                      {/* Account Group - Now with dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Group *
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span> */}
                          <select
                            name="accountGroup"
                            value={formData.accountGroup}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                          >
                            <option value="">Select Account Group</option>
                            <option value={'Creditars_cotton'}>Creditars_cotton</option>
                            <option value={'Debtors_others'}>Debtors_others</option>
                          </select>
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name *
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏢</span> */}
                          <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter supplier/company name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Location Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Place */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Place *
                        </label>
                        {/* <div className="relative"> */}
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📍</span> */}
                          <input
                            type="text"
                            name="place"
                            value={formData.place}
                            onChange={handleInputChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter city/town"
                          />
                        {/* </div> */}
                      </div>

                      {/* State Dropdown */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🌍</span> */}
                          {statesLoading ? (
                            <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                              <span className="w-4 h-4 text-gray-400 animate-spin inline-block mr-2">↻</span>
                              <span className="text-gray-500">Loading states...</span>
                            </div>
                          ) : (
                            <select
                              name="stateId"
                              value={formData.stateId}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                              <option value="">Select a state</option>
                              {states.map(state => (
                                <option key={state.id} value={state.id}>
                                  {state.code ? `${formatCode(state.code)} - ${state.state}` : state.state}
                                </option>
                              ))}
                            </select>
                          )}
                          {!statesLoading && states.length > 0 && (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                          )}
                        </div>
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter pincode"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter full address"
                        />
                      </div>

                      {/* Delivery Address */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Address
                        </label>
                        <textarea
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter delivery address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax & Legal Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Tax & Legal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* TIN No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TIN No
                        </label>
                        <input
                          type="text"
                          name="tinNo"
                          value={formData.tinNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter TIN number"
                        />
                      </div>

                      {/* CST No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CST No
                        </label>
                        <input
                          type="text"
                          name="cstNo"
                          value={formData.cstNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter CST number"
                        />
                      </div>

                      {/* GST No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GST No
                        </label>
                        <input
                          type="text"
                          name="gstNo"
                          value={formData.gstNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter GST number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Phone No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone No
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📞</span> */}
                          <input
                            type="text"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* Cell No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cell No
                        </label>
                        <input
                          type="text"
                          name="cellNo"
                          value={formData.cellNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter mobile number"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span> */}
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter website URL"
                        />
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person
                        </label>
                        <div className="relative">
                          {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span> */}
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter contact person name"
                          />
                        </div>
                      </div>

                      {/* Fax */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fax
                        </label>
                        <input
                          type="text"
                          name="fax"
                          value={formData.fax}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter fax number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4 border-b pb-2">Financial Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Account No */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account No
                        </label>
                        <input
                          type="text"
                          name="accountNo"
                          value={formData.accountNo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter account number"
                        />
                      </div>

                      {/* Opening Credit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Credit
                        </label>
                        <input
                          type="text"
                          name="openingCredit"
                          value={formData.openingCredit}
                          onChange={handleInputChange}
                          inputMode="decimal"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Opening Debit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Debit
                        </label>
                        <input
                          type="text"
                          name="openingDebit"
                          value={formData.openingDebit}
                          onChange={handleInputChange}
                          inputMode="decimal"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
                      >
                        {editingSupplier ? (
                          <>
                            Update Supplier
                          </>
                        ) : (
                          <>
                            <span className="mr-2">+</span>
                            Create Supplier
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Supplier Modal */}
      {showViewModal && viewingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Supplier Details</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {viewingSupplier.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingSupplier(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Supplier Details */}
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {viewingSupplier.accountName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm font-mono font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              ID: {viewingSupplier.id}
                            </span>
                            <span className="text-sm font-mono font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              Code: {viewingSupplier.code}
                            </span>
                            <span className="text-sm text-gray-600">
                              Group: {viewingSupplier.accountGroup}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Created On</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(viewingSupplier.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(viewingSupplier.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Location Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Location Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Place" value={viewingSupplier.place} />
                        <DetailItem label="State" value={viewingSupplier.State ? viewingSupplier.State.state : 'N/A'} />
                        <DetailItem label="Pincode" value={viewingSupplier.pincode} />
                        <DetailItem label="Address" value={viewingSupplier.address} isMultiline />
                        <DetailItem label="Delivery Address" value={viewingSupplier.deliveryAddress} isMultiline />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Phone No" value={viewingSupplier.phoneNo} />
                        <DetailItem label="Cell No" value={viewingSupplier.cellNo} />
                        <DetailItem label="Email" value={viewingSupplier.email} />
                        <DetailItem label="Website" value={viewingSupplier.website} isLink />
                        <DetailItem label="Contact Person" value={viewingSupplier.contactPerson} />
                        <DetailItem label="Fax" value={viewingSupplier.fax} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Tax & Legal Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Tax & Legal Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="TIN No" value={viewingSupplier.tinNo} />
                        <DetailItem label="CST No" value={viewingSupplier.cstNo} />
                        <DetailItem label="GST No" value={viewingSupplier.gstNo} />
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        Financial Information
                      </h4>
                      <div className="space-y-2">
                        <DetailItem label="Account No" value={viewingSupplier.accountNo} />
                        <DetailItem 
                          label="Opening Credit" 
                          value={viewingSupplier.openingCredit ? 
                            `₹${parseFloat(viewingSupplier.openingCredit).toFixed(2)}` : 
                            '₹0.00'
                          } 
                        />
                        <DetailItem 
                          label="Opening Debit" 
                          value={viewingSupplier.openingDebit ? 
                            `₹${parseFloat(viewingSupplier.openingDebit).toFixed(2)}` : 
                            '₹0.00'
                          } 
                        />
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <span className="mr-2">#</span>
                        Additional Details
                      </h4>
                      <div className="space-y-2">
                        <DetailItem 
                          label="Last Updated" 
                          value={
                            viewingSupplier.updatedAt ? 
                              `${formatDate(viewingSupplier.updatedAt)} ${formatTime(viewingSupplier.updatedAt)}` : 
                              'N/A'
                          } 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingSupplier(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleEdit(viewingSupplier);
                        setShowViewModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
                    >
                      <span className="mr-2">✏️</span>
                      Edit Supplier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Bulk Import Suppliers</h3>
                <p className="text-xs text-gray-500 mt-1">Upload an Excel (.xlsx / .xls) or CSV file containing Supplier records. Account Group defaults to "Creditars_cotton".</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  ⚠️ {importError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Spreadsheet File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {importPreview.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Preview Parsed Records ({importPreview.length})</span>
                    <span className="text-xs text-gray-500">Auto-incrementing Code starting from next sequence</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Party Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Place</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Account Group</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Phone</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {importPreview.map((row) => (
                          <tr key={row.srNo} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500">{row.srNo}</td>
                            <td className="px-3 py-2 font-medium text-gray-900">{row.partyName}</td>
                            <td className="px-3 py-2 text-gray-900">{row.place}</td>
                            <td className="px-3 py-2 text-blue-700 font-mono">Creditars_cotton</td>
                            <td className="px-3 py-2 text-gray-700">{row.phoneNo || '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{row.email || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing || importPreview.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center"
              >
                {importing ? (
                  <>
                    <span className="animate-spin mr-2">↻</span> Importing...
                  </>
                ) : (
                  `Confirm & Import (${importPreview.length} Records)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplier;