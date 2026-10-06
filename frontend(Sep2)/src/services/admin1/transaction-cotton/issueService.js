// services/issueService.js
import axios from "axios";

// ✅ Backend base URL
//const API_URL = "http://localhost:5000/api/issues";
const API_URL = "http://localhost:5000/api/issues";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const issueService = {
  // ➕ Create Issue
  create: async (data) => {
    console.log(data);
    const response = await api.post("/", data);
    return response.data.issue;
  },

  // 📄 Get All Issues
  getAll: async (page = 1, limit = 10, search = "") => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;
    const response = await api.get("/", { params });
    return response.data;
  },

  // 🔍 Get Issue By ID
  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.issue;
  },

  // ❌ Delete Issue
  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // 🔢 Get Next Issue Number
  getNextIssueNo: async () => {
    const response = await api.get("/next-issue-no");
    return response.data.nextIssueNo;
  },

  // ✏️ Update Issue
  update: async (id, data) => {
    const response = await api.put(`/${id}`, data);
    return response.data.issue;
  },

  // 📄 Get Daily Issue Report
  getDailyIssueReport: async (startDate, endDate) => {
    const response = await api.get(`/report/daily`, {
      params: { startDate, endDate }
    });
    return response.data.issues;
  },
};

export default issueService;
