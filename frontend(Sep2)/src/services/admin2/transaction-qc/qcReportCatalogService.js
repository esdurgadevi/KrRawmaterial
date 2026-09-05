import axios from "axios";

const API_BASE_URL = "https://krexports.org/krerm/admin2/transaction-qc/qc-reports";
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getQCDefinitions = async () => {
  const response = await API.get("/definitions");
  return response.data.reports || [];
};

export const getQCOptions = async (source) => {
  const response = await API.get(`/options/${source}`);
  return response.data.options || [];
};

export const getQCReport = async (reportId, params = {}) => {
  const formattedParams = {};
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        if (val.length > 0) formattedParams[key] = val.join(",");
      } else if (val !== null && val !== undefined && val !== "") {
        formattedParams[key] = val;
      }
    });
  }
  const response = await API.get(`/${reportId}`, { params: formattedParams });
  return response.data;
};
