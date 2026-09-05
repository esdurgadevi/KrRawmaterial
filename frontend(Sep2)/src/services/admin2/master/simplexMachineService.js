// src/services/admin2/master/simplexMachineService.js
// (or wherever you keep your API service files)

import axios from "axios";

const API_URL = "https://krexports.org/krerm/admin2/master/simplex-machines";
// Adjust port and base path if your backend uses something different

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Automatically add Bearer token from localStorage (same as your other services)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const DEFAULT_MACHINES = [
  { id: 1, mcNo: 'BD1', mcId: 'BD1', feedHank: 0.140 },
  { id: 2, mcNo: 'BD2', mcId: 'BD2', feedHank: 0.140 },
  { id: 3, mcNo: 'BD3', mcId: 'BD3', feedHank: 0.140 },
  { id: 4, mcNo: 'BD4', mcId: 'BD4', feedHank: 0.140 },
  { id: 5, mcNo: 'BD11', mcId: 'BD11', feedHank: 0.140 },
  { id: 6, mcNo: 'FD4', mcId: 'FD4', feedHank: 0.140 },
  { id: 7, mcNo: 'FD5', mcId: 'FD5', feedHank: 0.140 },
  { id: 8, mcNo: 'FD6', mcId: 'FD6', feedHank: 0.140 },
  { id: 9, mcNo: 'FD7', mcId: 'FD7', feedHank: 0.140 },
  { id: 10, mcNo: 'COMBER 1', mcId: 'COMBER 1', feedHank: 0.143 },
  { id: 11, mcNo: 'COMBER 2', mcId: 'COMBER 2', feedHank: 0.143 },
  { id: 12, mcNo: 'COMBER 13', mcId: 'COMBER 13', feedHank: 0.143 },
  { id: 13, mcNo: 'CA1', mcId: 'CA1', feedHank: 0.140 },
  { id: 14, mcNo: 'CA2', mcId: 'CA2', feedHank: 0.140 },
  { id: 15, mcNo: 'SIMPLEX1', mcId: 'SIMPLEX1', feedHank: 0.800 },
  { id: 16, mcNo: 'SIMPLEX2', mcId: 'SIMPLEX2', feedHank: 0.800 }
];

const simplexMachineService = {
  // Get all simplex machines
  getAll: async () => {
    try {
      const res = await api.get("/");
      const list = res.data?.simplexMachines || res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      console.warn("Could not fetch machines from API, using default list:", e);
    }
    return DEFAULT_MACHINES;
  },

  // Get one machine by ID
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data.simplexMachine;    // matches { simplexMachine: { ... } }
  },

  // Create new simplex machine
  create: async (data) => {
    const payload = {
      mcNo: data.mcNo.trim(),
      mcId: data.mcId.trim(),
      description: data.description ? data.description.trim() : null,
      feedHank: parseFloat(data.feedHank),
    };

    const res = await api.post("/", payload);
    return res.data.simplexMachine;
  },

  // Update existing machine (partial update — only send changed fields)
  update: async (id, data) => {
    const payload = {};

    if (data.mcNo !== undefined) {
      payload.mcNo = data.mcNo.trim();
    }
    if (data.mcId !== undefined) {
      payload.mcId = data.mcId.trim();
    }
    if ("description" in data) {
      payload.description = data.description ? data.description.trim() : null;
    }
    if (data.feedHank !== undefined) {
      payload.feedHank = parseFloat(data.feedHank);
    }

    const res = await api.put(`/${id}`, payload);
    return res.data.simplexMachine;
  },

  // Delete machine
  delete: async (id) => {
    await api.delete(`/${id}`);
    return true;
  },
};

export default simplexMachineService;
