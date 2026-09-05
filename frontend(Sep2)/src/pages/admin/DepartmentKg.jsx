import React, { useState, useEffect } from "react";
import departmentKgService from "../../services/admin1/transaction-process-stock/departmentKgService";

const DepartmentKg = () => {
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    department: "",
    kgs: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchRecords();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentKgService.getDepartments();
      const deptsArray = Array.isArray(response) ? response : [];
      setDepartments(deptsArray);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setDepartments([]);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await departmentKgService.getAll();
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
      const department = record.department || "";
      const kgs = record.kgs ? record.kgs.toString() : "";

      return (
        searchTerm === "" ||
        date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kgs.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (!formData.date || !formData.department || !formData.kgs) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      if (editingRecord) {
        await departmentKgService.update(editingRecord.id, formData);
        setSuccess("Department KG updated successfully");
      } else {
        await departmentKgService.create(formData);
        setSuccess("Department KG created successfully");
      }

      setFormData({ date: "", department: "", kgs: "" });
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
      department: record.department,
      kgs: record.kgs,
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
        await departmentKgService.delete(id);
        setSuccess("Department KG deleted successfully");
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
    setFormData({ date: "", department: "", kgs: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({ date: "", department: "", kgs: "" });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Department KGs</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage department kilogram entries
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

      {/* Controls */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by date, department, or kgs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddNew}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add New
        </button>
      </div>

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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  KGs
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
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
                    {record.department}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {parseFloat(record.kgs).toLocaleString("en-IN", {
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
              {editingRecord ? "Edit Department KG" : "Add Department KG"}
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
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KGs
                </label>
                <input
                  type="number"
                  name="kgs"
                  step="0.001"
                  value={formData.kgs}
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
            <h2 className="text-xl font-bold mb-4">Department KG Details</h2>
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
                <p className="text-sm text-gray-600">Department</p>
                <p className="text-lg font-semibold">{viewingRecord.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">KGs</p>
                <p className="text-lg font-semibold">
                  {parseFloat(viewingRecord.kgs).toLocaleString("en-IN", {
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

export default DepartmentKg;