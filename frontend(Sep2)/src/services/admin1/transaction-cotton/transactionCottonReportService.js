import axios from "axios";

const api = axios.create({
  baseURL: "https://krexports.org/krerm/transaction-cotton/reports",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const transactionCottonReportService = {
  getReport: async ({ reportType, fromDate, toDate }) => {
    const response = await api.get("/", {
      params: { reportType, fromDate, toDate },
    });

    return response.data;
  },
};

export default transactionCottonReportService;
