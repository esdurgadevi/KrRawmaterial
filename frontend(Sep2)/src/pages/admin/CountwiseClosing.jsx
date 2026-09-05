import React, { useState, useEffect } from "react";
import countwiseClosingService from "../../services/admin1/transaction-process-stock/countwiseClosingService";
import productService from "../../services/admin1/transaction-process-stock/productService";

const CountwiseClosing = () => {
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    productName: "",
    closingKgs: "",
  });

  // useEffect(() => {
  //   fetchProducts();
  //   fetchRecords();
  // }, []);

  // const fetchProducts = async () => {
  //   try {
  //     const response = await countwiseClosingService.getProducts();
  //     const productsArray = Array.isArray(response) ? response : [];
  //     // Extract product names if response is an array of objects
  //     const productNames = productsArray.map(p => 
  //       typeof p === 'string' ? p : p.product_name || p.productName || p.name
  //     );
  //     setProducts(productNames);
  //   } catch (err) {
  //     console.error("Failed to load products:", err);
  //     setProducts([]);
  //   }
  // };

//   const fetchProducts = async () => {
//   try {
//     console.log("Fetching products...");
//     const response = await countwiseClosingService.getProducts();
//     console.log("✅ Raw response:", response);
    
//     const productsArray = Array.isArray(response) ? response : [];
//     console.log("📦 Products array:", productsArray);
//     console.log("   Count:", productsArray.length);
    
//     // Extract product names if response is an array of objects
//     const productNames = productsArray.map(p => 
//       typeof p === 'string' ? p : p.product_name || p.productName || p.name
//     );
//     console.log("📝 Product names:", productNames);
    
//     setProducts(productNames);
//   } catch (err) {
//     console.error("❌ Failed to load products:", err);
//     setProducts([]);
//   }
// };
  

 useEffect(() => {
    console.log("🚀 Component mounted");
    fetchProducts();
    fetchRecords();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("📦 Fetching products...");
      const response = await productService.getProducts();
      console.log("✅ Products received:", response);
      console.log("   Total count:", response?.length || 0);
      
      const productNames = (response || []).map(p => p.product_name || p.productName || p.name);
      console.log("📝 Product names extracted:", productNames);
      
      setProducts(productNames);
    } catch (err) {
      console.error("❌ Error in fetchProducts:", err);
      setProducts([]);
    }
  };
  
  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await countwiseClosingService.getAll();
      const recordsData = Array.isArray(response) ? response : [];
      setRecords(recordsData);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load records");
      setRecords([]);
      setLoading(false);
    }
  };

  const filteredRecords = (() => {
    const recordsArray = Array.isArray(records) ? records : [];

    return recordsArray.filter((record) => {
      if (!record || typeof record !== "object") return false;

      const date = record.date ? record.date.toString() : "";
      const productName = record.productName || "";
      const closingKgs = record.closingKgs ? record.closingKgs.toString() : "";

      return (
        searchDate === "" ||
        date.toLowerCase().includes(searchDate.toLowerCase()) ||
        productName.toLowerCase().includes(searchDate.toLowerCase()) ||
        closingKgs.toLowerCase().includes(searchDate.toLowerCase())
      );
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

    if (!formData.date || !formData.productName || !formData.closingKgs) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      if (editingRecord) {
        await countwiseClosingService.update(editingRecord.id, formData);
        setSuccess("Countwise Closing updated successfully");
      } else {
        await countwiseClosingService.create(formData);
        setSuccess("Countwise Closing created successfully");
      }

      setFormData({ date: "", productName: "", closingKgs: "" });
      setEditingRecord(null);
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      setError(err.message || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      productName: record.productName,
      closingKgs: record.closingKgs,
    });
    setShowModal(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true);
        await countwiseClosingService.delete(id);
        setSuccess("Countwise Closing deleted successfully");
        fetchRecords();
      } catch (err) {
        setError(err.message || "Failed to delete record");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData({ date: "", productName: "", closingKgs: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({ date: "", productName: "", closingKgs: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Countwise Closing</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage countwise closing records
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button
            className="float-right"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
          <button
            className="float-right"
            onClick={() => setSuccess("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Add Button */}
      {!showModal && (
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Search by date:
          </label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onClick={handleAddNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Add New Record
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No records found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Product Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Closing KGs
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {record.id}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {record.date}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {record.productName}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {parseFloat(record.closingKgs).toLocaleString("en-IN", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })}
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleView(record)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(record)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {editingRecord ? "Edit Countwise Closing" : "Add Countwise Closing"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description
                </label>
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing KGs
                </label>
                <input
                  type="number"
                  name="closingKgs"
                  step="0.001"
                  value={formData.closingKgs}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingRecord ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Countwise Closing Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="text-lg font-semibold">{viewingRecord.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold">{viewingRecord.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Product Description</p>
                <p className="text-lg font-semibold">{viewingRecord.productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Closing KGs</p>
                <p className="text-lg font-semibold">
                  {parseFloat(viewingRecord.closingKgs).toLocaleString("en-IN", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountwiseClosing;
