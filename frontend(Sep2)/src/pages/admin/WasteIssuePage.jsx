// import React, { useState, useEffect } from "react";
// import { wasteIssueService } from "../../services/admin1/transaction-process-stock/wasteIssueService";

// const WasteIssuePage = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     date: "",
//     issued: "",
//     realised: "",
//   });
//   const [showForm, setShowForm] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Fetch all records on mount
//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   // const fetchRecords = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const data = await wasteIssueService.getWasteIssues();
//   //     setRecords(data);
//   //     setError("");
//   //   } catch (err) {
//   //     setError("Failed to fetch records: " + err.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchRecords = async () => {
//   try {
//     setLoading(true);
//     console.log("Fetching waste issues...");
//     const response = await wasteIssueService.getWasteIssues();
//     console.log("Response:", response);
//     setRecords(response || []);
//     setError("");
//   } catch (err) {
//     console.error("Error fetching records:", err);
//     setError("Failed to fetch records: " + err.message);
//     setRecords([]);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.date || !formData.issued || !formData.realised) {
//       setError("All fields are required");
//       return;
//     }

//     if (isNaN(formData.issued) || isNaN(formData.realised)) {
//       setError("Issued and Realised must be numbers");
//       return;
//     }

//     try {
//       if (editingId) {
//         await wasteIssueService.updateWasteIssue(editingId, formData);
//         setSuccess("Record updated successfully");
//       } else {
//         await wasteIssueService.createWasteIssue(formData);
//         setSuccess("Record created successfully");
//       }

//       setFormData({ date: "", issued: "", realised: "" });
//       setEditingId(null);
//       setShowForm(false);
//       setError("");
//       fetchRecords();
//     } catch (err) {
//       setError("Failed to save record: " + err.message);
//     }
//   };

//   const handleEdit = (record) => {
//     setFormData({
//       date: record.date,
//       issued: record.issued,
//       realised: record.realised,
//     });
//     setEditingId(record.id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this record?")) {
//       try {
//         await wasteIssueService.deleteWasteIssue(id);
//         setSuccess("Record deleted successfully");
//         setError("");
//         fetchRecords();
//       } catch (err) {
//         setError("Failed to delete record: " + err.message);
//       }
//     }
//   };

//   const handleCancel = () => {
//     setFormData({ date: "", issued: "", realised: "" });
//     setEditingId(null);
//     setShowForm(false);
//     setError("");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Waste Issue</h1>
//           <p className="text-gray-600 mt-2">Manage waste issue records</p>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
//             {success}
//           </div>
//         )}

//         {/* Form Section */}
//         {showForm ? (
//           <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">
//               {editingId ? "Edit Waste Issue" : "Add New Waste Issue"}
//             </h2>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {/* Date Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Date *
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={formData.date}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Issued Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Issued *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     name="issued"
//                     value={formData.issued}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Realised Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Realised *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     name="realised"
//                     value={formData.realised}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               {/* Form Buttons */}
//               <div className="flex gap-4">
//                 <button
//                   type="submit"
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
//                 >
//                   {editingId ? "Update" : "Create"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         ) : (
//           <button
//             onClick={() => setShowForm(true)}
//             className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
//           >
//             + Add New Record
//           </button>
//         )}

//         {/* Table Section */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-100 border-b border-gray-200">
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                     ID
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                     Issued
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                     Realised
//                   </th>
//                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : records.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                       No records found
//                     </td>
//                   </tr>
//                 ) : (
//                   records.map((record) => (
//                     <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
//                       <td className="px-6 py-4 text-sm text-gray-900">{record.id}</td>
//                       <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
//                       <td className="px-6 py-4 text-sm text-gray-900">{record.issued}</td>
//                       <td className="px-6 py-4 text-sm text-gray-900">{record.realised}</td>
//                       <td className="px-6 py-4 text-sm space-x-2">
//                         <button
//                           onClick={() => handleEdit(record)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(record.id)}
//                           className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WasteIssuePage;


import React, { useState, useEffect } from "react";
import wasteIssueService from "../../services/admin1/transaction-process-stock/wasteIssueService";

const WasteIssuePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    issued: "",
    realised: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchDate, setSearchDate] = useState(""); // NEW: Date search state

  // Fetch all records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      console.log("Fetching waste issues...");
      const response = await wasteIssueService.getWasteIssues();
      console.log("Response:", response);
      setRecords(response || []);
      setError("");
    } catch (err) {
      console.error("Error fetching records:", err);
      setError("Failed to fetch records: " + err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Filter records by date
  const filteredRecords = (() => {
    if (!searchDate) {
      return records; // Show all if no search
    }
    return records.filter(record => {
      if (!record || !record.date) return false;
      return record.date.toString().includes(searchDate);
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.issued || !formData.realised) {
      setError("All fields are required");
      return;
    }

    if (isNaN(formData.issued) || isNaN(formData.realised)) {
      setError("Issued and Realised must be numbers");
      return;
    }

    try {
      if (editingId) {
        await wasteIssueService.updateWasteIssue(editingId, formData);
        setSuccess("Record updated successfully");
      } else {
        await wasteIssueService.createWasteIssue(formData);
        setSuccess("Record created successfully");
      }

      setFormData({ date: "", issued: "", realised: "" });
      setEditingId(null);
      setShowForm(false);
      setError("");
      fetchRecords();
    } catch (err) {
      setError("Failed to save record: " + err.message);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      date: record.date,
      issued: record.issued,
      realised: record.realised,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await wasteIssueService.deleteWasteIssue(id);
        setSuccess("Record deleted successfully");
        setError("");
        fetchRecords();
      } catch (err) {
        setError("Failed to delete record: " + err.message);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ date: "", issued: "", realised: "" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waste Issue</h1>
          <p className="text-gray-600 mt-2">Manage waste issue records</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        
         {/* Search Section with Add Button - NEW */}
        {!showForm && (
          <div className="mb-6 flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Search by date:
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium text-sm"
              >
                Clear Filter
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium whitespace-nowrap"
            >
              + Add New Record
            </button>
          </div>
        )}
        {/* Form Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Waste Issue" : "Add New Waste Issue"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Issued Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="issued"
                    value={formData.issued}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Realised Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Realised *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="realised"
                    value={formData.realised}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Realised
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{record.id}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {parseFloat(record.issued).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {parseFloat(record.realised).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteIssuePage;