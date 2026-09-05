// // import axios from "axios";

// // const API_URL = "http://localhost:5000/api/countwise-closing";

// // const api = axios.create({
// //   baseURL: API_URL,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

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

// // const countwiseClosingService = {
// //   getAll: async () => {
// //     const response = await api.get("/");
// //     return response.data.records;
// //   },

// //   getById: async (id) => {
// //     const response = await api.get(`/${id}`);
// //     return response.data.record;
// //   },

// //   create: async (data) => {
// //     const payload = {
// //       date: data.date,
// //       productName: data.productName,
// //       closingKgs: parseFloat(data.closingKgs),
// //     };
// //     const response = await api.post("/", payload);
// //     return response.data.record;
// //   },

// //   update: async (id, data) => {
// //     const payload = {
// //       date: data.date,
// //       productName: data.productName,
// //       closingKgs: parseFloat(data.closingKgs),
// //     };
// //     const response = await api.put(`/${id}`, payload);
// //     return response.data.record;
// //   },

// //   delete: async (id) => {
// //     const response = await api.delete(`/${id}`);
// //     return response.data;
// //   },

// //   getProducts: async () => {
// //   try {
// //     const response = await externalApi.get("https://krexports.org/kres/products");
// //     return response.data.products;
// //   } catch (error) {
// //     console.error("Error fetching products:", error);
// //     throw error;
// //   }
// // }
// // };

// // export default countwiseClosingService;

// import axios from "axios";

// const API_URL = "http://localhost:5000/api/countwise-closing";

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Separate axios instance for external APIs (without baseURL and without auth)
// const externalApi = axios.create({
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

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

// const countwiseClosingService = {
//   getAll: async () => {
//     const response = await api.get("/");
//     return response.data.records;
//   },

//   getById: async (id) => {
//     const response = await api.get(`/${id}`);
//     return response.data.record;
//   },

//   create: async (data) => {
//     const payload = {
//       date: data.date,
//       productName: data.productName,
//       closingKgs: parseFloat(data.closingKgs),
//     };
//     const response = await api.post("/", payload);
//     return response.data.record;
//   },

//   update: async (id, data) => {
//     const payload = {
//       date: data.date,
//       productName: data.productName,
//       closingKgs: parseFloat(data.closingKgs),
//     };
//     const response = await api.put(`/${id}`, payload);
//     return response.data.record;
//   },

//   delete: async (id) => {
//     const response = await api.delete(`/${id}`);
//     return response.data;
//   },

//   getProducts: async () => {
//   try {
//     const response = await api.get("http://localhost:5000/api/products/external");
//     // Backend returns { success: true, products: [...] }
//     return response.data.products; // Extract the products array
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     throw new Error("Failed to fetch products");
//   }
// },
//   getCountwiseClosingReport: async (startDate, endDate) => {
//     try {
//       const response = await api.get(`/reports/countwise-closing?startDate=${startDate}&endDate=${endDate}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to fetch countwise closing report");
//     }
//   },

//   getProductStockReport: async (startDate, endDate) => {
//     try {
//       const response = await api.get(`/reports/product-stock?startDate=${startDate}&endDate=${endDate}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to fetch product stock report");
//     }
//   },
// };

// export default countwiseClosingService;

import axios from "axios";

const API_URL = "http://localhost:5000/api/countwise-closing";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate axios instance for external APIs (without baseURL and without auth)
const externalApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

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

const countwiseClosingService = {
  getAll: async () => {
    const response = await api.get("/");
    return response.data.records;
  },

  getById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data.record;
  },

  create: async (data) => {
    const payload = {
      date: data.date,
      productName: data.productName,
      closingKgs: parseFloat(data.closingKgs),
    };
    const response = await api.post("/", payload);
    return response.data.record;
  },

  update: async (id, data) => {
    const payload = {
      date: data.date,
      productName: data.productName,
      closingKgs: parseFloat(data.closingKgs),
    };
    const response = await api.put(`/${id}`, payload);
    return response.data.record;
  },

  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  getProducts: async () => {
    try {
      const response = await api.get("http://localhost:5000/api/products/external");
      // Backend returns { success: true, products: [...] }
      return response.data.products; // Extract the products array
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  // ✅ FIXED: Accept fromDate and toDate, map to startDate and endDate
  getCountwiseClosingReport: async (fromDate, toDate) => {
    try {
      const response = await api.get(
        `/reports/countwise-closing?startDate=${fromDate}&endDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch countwise closing report"
      );
    }
  },

  // ✅ FIXED: Accept fromDate and toDate, map to startDate and endDate
  getProductStockReport: async (fromDate, toDate) => {
    try {
      const response = await api.get(
        `/reports/product-stock?startDate=${fromDate}&endDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product stock report"
      );
    }
  },
};

export default countwiseClosingService;
