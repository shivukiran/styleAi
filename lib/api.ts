import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('styleai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('styleai_token');
      localStorage.removeItem('styleai_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth 
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
};

// ─── Wardrobe 
export const wardrobeApi = {
  getAll: () => api.get('/api/wardrobe'),
  search: (q: string) => api.get(`/api/wardrobe/search?q=${encodeURIComponent(q)}`),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/api/wardrobe/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addManual: (data: object) => api.post('/api/wardrobe/manual', data),
  update: (id: number, data: object) => api.put(`/api/wardrobe/${id}`, data),
  delete: (id: number) => api.delete(`/api/wardrobe/${id}`),
  stats: () => api.get('/api/wardrobe/stats'),
};

// ─── AI ────────────────────────────────────────────────
export const aiApi = {
  recommend: (query: string) => api.post('/api/ai/recommend', { query }),
  analyzeGaps: () => api.get('/api/ai/gaps'),
};
