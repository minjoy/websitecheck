import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ======================
// Auth API
// ======================
export const authAPI = {
  signup: (email: string, password: string) =>
    api.post('/api/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get('/api/auth/me'),
};

// ======================
// User API
// ======================
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),

  updateProfile: (data: any) => api.put('/api/user/profile', data),

  profilePopupDecision: (decision: 'LATER' | 'NEVER_SHOW_AGAIN') =>
    api.post('/api/user/profile-popup/decision', { decision }),

  getFavorites: () => api.get('/api/user/favorites'),

  getKeywordAlerts: () => api.get('/api/user/keyword-alerts'),

  createKeywordAlert: (keyword: string) =>
    api.post('/api/user/keyword-alerts', { keyword }),

  deleteKeywordAlert: (id: string) =>
    api.delete(`/api/user/keyword-alerts/${id}`),
};

// ======================
// Product API
// ======================
export const productAPI = {
  getProducts: (params?: any) => api.get('/api/products', { params }),

  getProductById: (id: string) => api.get(`/api/products/${id}`),

  createProduct: (data: any) => api.post('/api/products', data),

  updateProduct: (id: string, data: any) => api.put(`/api/products/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),

  toggleFavorite: (id: string) => api.post(`/api/products/${id}/favorite`),
};

export default api;
