import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// Category APIs
// Category APIs
export const getCategories = (params) => api.get('/categories', { params });
export const getAllCategories = () => api.get('/categories', { params: { limit: 1000 } }); // For dropdowns - fetch all
export const getCategory = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => {
  if (data instanceof FormData) {
    return api.post('/categories', data);
  }
  return api.post('/categories', data);
};
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const uploadCategoryImage = (id, image) => {
  const formData = new FormData();
  formData.append('image', image);
  return api.put(`/categories/${id}/image`, formData);
};

// Subcategory APIs
export const getSubcategories = (params) => api.get('/subcategories', { params });
export const getAllSubcategories = (categoryId) => api.get('/subcategories', {
  params: { limit: 1000, ...(categoryId && { category: categoryId }) }
}); // For dropdowns - fetch all
export const getSubcategory = (id) => api.get(`/subcategories/${id}`);
export const createSubcategory = (data) => {
  if (data instanceof FormData) {
    return api.post('/subcategories', data);
  }
  return api.post('/subcategories', data);
};
export const updateSubcategory = (id, data) => api.put(`/subcategories/${id}`, data);
export const deleteSubcategory = (id) => api.delete(`/subcategories/${id}`);
export const uploadSubcategoryImage = (id, image) => {
  const formData = new FormData();
  formData.append('image', image);
  return api.put(`/subcategories/${id}/image`, formData);
};

// Product APIs
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
  if (data instanceof FormData) {
    return api.post('/products', data);
  }
  return api.post('/products', data);
};
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadProductImages = (id, images) => {
  const formData = new FormData();
  images.forEach((image) => formData.append('images', image));
  return api.put(`/products/${id}/images`, formData);
};

// Order APIs
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getOrderStats = () => api.get('/orders/stats');

// Notification APIs
export const getNotifications = (params) => api.get('/notifications', { params });
export const createNotification = (data) => api.post('/notifications', data);
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api; 