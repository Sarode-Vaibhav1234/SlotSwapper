// src/utils/api.js
import axios from 'axios';

// 1. Create an Axios instance
const api = axios.create({
  baseURL: "https://slotswapper-2-nogh.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

// 2. Request Interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the Authorization header for protected routes
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Helper functions for Auth (using the /auth routes)
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

export default api;