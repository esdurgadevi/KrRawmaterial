import axios from "axios";

const api = axios.create({ 
  baseURL: "https://krexports.org/krerm/transaction-cotton/report-catalog" 
});

api.interceptors.request.use((config) => { 
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config; 
});

export const getDefinitions = async () => {
  const response = await api.get("/definitions");
  return response.data.reports;
};

export const getOptions = async (source) => {
  const response = await api.get(`/options/${source}`);
  return response.data.options;
};

export const getReport = async (reportId, params) => {
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
  const response = await api.get(`/${reportId}`, { params: formattedParams });
  return response.data;
};
