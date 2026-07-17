import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const apiService = {
  // ============== PUBLIC ENDPOINTS ==============
  
  getStates: async () => {
    const response = await api.get('/api/v1/states');
    return response.data.data;
  },


  getDistricts: async (stateId) => {
    const response = await api.get(`/api/v1/states/${stateId}/districts`);
    return response.data.data;
  },


  getSubDistricts: async (districtId) => {
    const response = await api.get(`/api/v1/districts/${districtId}/subdistricts`);
    return response.data.data;
  },

  getVillages: async (subDistrictId, page = 1, limit = 50) => {
    const response = await api.get(`/api/v1/subdistricts/${subDistrictId}/villages?page=${page}&limit=${limit}`);
    return response.data;
  },
