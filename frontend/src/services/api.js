import axios from 'axios';

const isProd = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
const defaultBaseURL = isProd ? '' : 'http://localhost:8000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('decarbx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if it's an authenticated endpoint
      if (localStorage.getItem('decarbx_token')) {
        localStorage.removeItem('decarbx_token');
        localStorage.removeItem('decarbx_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const downloadCsv = async (reportId) => {
  const response = await api.get(`/api/regulatory/download/${reportId}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Nexgile-DecarbX_${reportId}_2026.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default api;
