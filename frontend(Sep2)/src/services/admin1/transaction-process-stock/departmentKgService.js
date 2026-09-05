// // import axios from "axios";

// // const API_URL = "http://localhost:5000/api/department-kgs";

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

// // const departmentKgService = {
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
// //       department: data.department,
// //       kgs: parseFloat(data.kgs),
// //     };
// //     const response = await api.post("/", payload);
// //     return response.data.record;
// //   },

// //   update: async (id, data) => {
// //     const payload = {
// //       date: data.date,
// //       department: data.department,
// //       kgs: parseFloat(data.kgs),
// //     };
// //     const response = await api.put(`/${id}`, payload);
// //     return response.data.record;
// //   },

// //   delete: async (id) => {
// //     const response = await api.delete(`/${id}`);
// //     return response.data;
// //   },

// //   getDepartments: async () => {
// //     const response = await api.get("/departments/list");
// //     return response.data.departments;
// //   },
// // };

// // export default departmentKgService;


// import axios from "axios";

// const API_URL = "http://localhost:5000/api/department-kgs";

// const api = axios.create({
//   baseURL: API_URL,
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

// const departmentKgService = {
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
//       department: data.department,
//       kgs: parseFloat(data.kgs),
//     };
//     const response = await api.post("/", payload);
//     return response.data.record;
//   },

//   update: async (id, data) => {
//     const payload = {
//       date: data.date,
//       department: data.department,
//       kgs: parseFloat(data.kgs),
//     };
//     const response = await api.put(`/${id}`, payload);
//     return response.data.record;
//   },

//   delete: async (id) => {
//     const response = await api.delete(`/${id}`);
//     return response.data;
//   },

//   getDepartments: async () => {
//     const response = await api.get("/departments/list");
//     return response.data.departments;
//   },
//     getDepartmentKgReport: async (startDate, endDate) => {
//     try {
//       const response = await api.get(`/reports/department-kg?startDate=${startDate}&endDate=${endDate}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || "Failed to fetch department kg report");
//     }
//   },
// };

// export default departmentKgService;

import axios from "axios";

const API_URL = "https://krexports.org/krerm/department-kgs";

const api = axios.create({
  baseURL: API_URL,
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

const departmentKgService = {
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
      department: data.department,
      kgs: parseFloat(data.kgs),
    };
    const response = await api.post("/", payload);
    return response.data.record;
  },

  update: async (id, data) => {
    const payload = {
      date: data.date,
      department: data.department,
      kgs: parseFloat(data.kgs),
    };
    const response = await api.put(`/${id}`, payload);
    return response.data.record;
  },

  delete: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get("/departments/list");
    return response.data.departments;
  },

  // ✅ FIXED: Accept fromDate and toDate, map to startDate and endDate
  getDepartmentKgReport: async (fromDate, toDate) => {
    try {
      const response = await api.get(
        `/reports/department-kg?startDate=${fromDate}&endDate=${toDate}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch department kg report"
      );
    }
  },
};

export default departmentKgService;
