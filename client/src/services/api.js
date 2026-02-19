import axios from 'axios';

// setup our base url and some default headers
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// add the token to every request if we have it
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => {
  return Promise.reject(err);
});

// handling api errors in one place
export const handleApiError = (err) => {
  if (err.response) {
    // fix: extra check to make sure we always return a string, never an object
    const data = err.response.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      return data.error || data.message || JSON.stringify(data);
    }
    return 'server error (' + err.response.status + ')';
  } else if (err.request) {
    return 'network error - check connection';
  } else {
    return err.message || 'unknown error';
  }
};

// auth routes
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  resetPassword: (id) => api.post(`/auth/reset-password/${id}`)
};

// employee routes
export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getHierarchy: () => api.get('/employees/hierarchy'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  updateManager: (id, managerId) => api.put(`/employees/${id}/manager`, { managerId }),
  delete: (id) => api.delete(`/employees/${id}`),
  export: () => api.get('/employees/export')
};

export default api;
