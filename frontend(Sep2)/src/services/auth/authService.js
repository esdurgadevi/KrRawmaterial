import axios from 'axios';

// API Configuration - Easy to change
const API_BASE = 'https://krexports.org/krerm';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Login Service
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    //if (response.data.status === 'success') {
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        role: user.role ? user.role.toLowerCase() : 'user'
      }));
      return {
        ...user,
        role: user.role ? user.role.toLowerCase() : 'user'
      };
    //} else {
      //throw new Error(response.data.message || 'Login failed');
    //}
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Invalid email or password'
    );
  }
};

// Register Service
export const register = async (userData) => {
  try {
    const { name, email, password, role } = userData;
    console.log(userData);
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role: role ? role.toLowerCase() : 'user',
    //   Deptid,
    //   staffId: staffId ? parseInt(staffId) : null,
    });
    
    if (response.data.status === 'success') {
      const { user, token } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        role: user.role ? user.role.toLowerCase() : 'user'
      }));
      
      return {
        ...user,
        role: user.role ? user.role.toLowerCase() : 'user'
      };
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Registration failed'
    );
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('email');
};

// Optional: Keep axios instance export if needed elsewhere
export { api };
