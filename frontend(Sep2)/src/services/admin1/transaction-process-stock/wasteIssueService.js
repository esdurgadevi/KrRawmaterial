// // // // import api from "../../../utils/api";

// // // // const BASE_URL = "/admin1/transaction-process-stock/waste-issue";

// // // // export const wasteIssueService = {
// // // //   // Get all waste issues
// // // //   getWasteIssues: async () => {
// // // //     try {
// // // //       const response = await api.get(BASE_URL);
// // // //       return response.data.wasteIssues;
// // // //     } catch (error) {
// // // //       throw new Error(error.response?.data?.message || "Failed to fetch waste issues");
// // // //     }
// // // //   },

// // // //   // Create new waste issue
// // // //   createWasteIssue: async (data) => {
// // // //     try {
// // // //       const response = await api.post(BASE_URL, data);
// // // //       return response.data;
// // // //     } catch (error) {
// // // //       throw new Error(error.response?.data?.message || "Failed to create waste issue");
// // // //     }
// // // //   },

// // // //   // Update waste issue
// // // //   updateWasteIssue: async (id, data) => {
// // // //     try {
// // // //       const response = await api.put(`${BASE_URL}/${id}`, data);
// // // //       return response.data;
// // // //     } catch (error) {
// // // //       throw new Error(error.response?.data?.message || "Failed to update waste issue");
// // // //     }
// // // //   },

// // // //   // Delete waste issue
// // // //   deleteWasteIssue: async (id) => {
// // // //     try {
// // // //       const response = await api.delete(`${BASE_URL}/${id}`);
// // // //       return response.data;
// // // //     } catch (error) {
// // // //       throw new Error(error.response?.data?.message || "Failed to delete waste issue");
// // // //     }
// // // //   },
// // // // };


// // // import axios from "axios";

// // // const API_URL = "http://localhost:5000/api/waste-issue";

// // // const api = axios.create({
// // //   baseURL: API_URL,
// // //   headers: {
// // //     "Content-Type": "application/json",
// // //   },
// // // });

// // // // Add token to every request
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem("token");
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`;
// // //     }
// // //     return config;
// // //   },
// // //   (error) => Promise.reject(error)
// // // );

// // // export const wasteIssueService = {
// // //   getWasteIssues: async () => {
// // //     try {
// // //       const response = await api.get("");
// // //       return response.data.wasteIssues;
// // //     } catch (error) {
// // //       throw new Error(error.response?.data?.message || "Failed to fetch waste issues");
// // //     }
// // //   },

// // //   createWasteIssue: async (data) => {
// // //     try {
// // //       const response = await api.post("", data);
// // //       return response.data;
// // //     } catch (error) {
// // //       throw new Error(error.response?.data?.message || "Failed to create waste issue");
// // //     }
// // //   },

// // //   updateWasteIssue: async (id, data) => {
// // //     try {
// // //       const response = await api.put(`/${id}`, data);
// // //       return response.data;
// // //     } catch (error) {
// // //       throw new Error(error.response?.data?.message || "Failed to update waste issue");
// // //     }
// // //   },

// // //   deleteWasteIssue: async (id) => {
// // //     try {
// // //       const response = await api.delete(`/${id}`);
// // //       return response.data;
// // //     } catch (error) {
// // //       throw new Error(error.response?.data?.message || "Failed to delete waste issue");
// // //     }
// // //   },
// // // };


// // import axios from "axios";

// // const API_URL = "http://localhost:5000/api/waste-issue";

// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// // // Add token to every request
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // const wasteIssueService = {
// //   getWasteIssues: async () => {
// //     try {
// //       const response = await api.get("");
// //       return response.data.wasteIssues;
// //     } catch (error) {
// //       throw new Error(error.response?.data?.message || "Failed to fetch waste issues");
// //     }
// //   },

// //   createWasteIssue: async (data) => {
// //     try {
// //       const response = await api.post("", data);
// //       return response.data;
// //     } catch (error) {
// //       throw new Error(error.response?.data?.message || "Failed to create waste issue");
// //     }
// //   },

// //   updateWasteIssue: async (id, data) => {
// //     try {
// //       const response = await api.put(`/${id}`, data);
// //       return response.data;
// //     } catch (error) {
// //       throw new Error(error.response?.data?.message || "Failed to update waste issue");
// //     }
// //   },

// //   deleteWasteIssue: async (id) => {
// //     try {
// //       const response = await api.delete(`/${id}`);
// //       return response.data;
// //     } catch (error) {
// //       throw new Error(error.response?.data?.message || "Failed to delete waste issue");
// //     }
// //   },

// //   getWasteIssueReport: async (startDate, endDate) => {
// //     try {
// //       const response = await api.get(`/reports/waste-issue?startDate=${startDate}&endDate=${endDate}`);
// //       return response.data;
// //     } catch (error) {
// //       throw new Error(error.response?.data?.message || "Failed to fetch waste issue report");
// //     }
// //   },
// // };

// // export default wasteIssueService;

// import axios from "axios";

// const API_URL = "http://localhost:5000/api/waste-issue";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Add token to every request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const wasteIssueService = {
//   getWasteIssues: async () => {
//     try {
//       const response = await api.get("");
//       return response.data.wasteIssues;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to fetch waste issues");
//     }
//   },

//   createWasteIssue: async (data) => {
//     try {
//       const response = await api.post("", data);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to create waste issue");
//     }
//   },

//   updateWasteIssue: async (id, data) => {
//     try {
//       const response = await api.put(`/${id}`, data);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to update waste issue");
//     }
//   },

//   deleteWasteIssue: async (id) => {
//     try {
//       const response = await api.delete(`/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to delete waste issue");
//     }
//   },
//     getWasteIssueReport: async (startDate, endDate) => {
//     try {
//       const response = await api.get(`/reports/waste-issue?startDate=${startDate}&endDate=${endDate}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to fetch waste issue report");
//     }
//   },
// };

// export default wasteIssueService;

import axios from "axios";

const API_URL = "http://localhost:5000/api/waste-issue";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
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

const wasteIssueService = {
  getWasteIssues: async () => {
    try {
      const response = await api.get("");
      return response.data.wasteIssues;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch waste issues"
      );
    }
  },

  createWasteIssue: async (data) => {
    try {
      const response = await api.post("", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create waste issue"
      );
    }
  },

  updateWasteIssue: async (id, data) => {
    try {
      const response = await api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update waste issue"
      );
    }
  },

  deleteWasteIssue: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete waste issue"
      );
    }
  },

  // ✅ FIXED: Accept fromDate and toDate, map to startDate and endDate
  getWasteIssueReport: async (fromDate, toDate) => {
    try {
      const response = await api.get(
        `/reports/waste-issue?startDate=${fromDate}&endDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch waste issue report"
      );
    }
  },
};

export default wasteIssueService;
