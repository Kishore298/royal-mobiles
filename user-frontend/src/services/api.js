import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://royal-mobiles-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
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

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const getCategory = (id) => api.get(`/categories/${id}`);

// Subcategories
export const getSubcategories = (params) => api.get('/subcategories', { params });
export const getAllSubcategories = (params) => api.get('/subcategories/all', { params });
export const getSubcategoriesByCategory = (categoryId, params) =>
  api.get(`/subcategories`, { params: { category: categoryId, ...params } });
export const getSubcategory = (id) => api.get(`/subcategories/${id}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getAllProducts = (params) => api.get('/products/all', { params });
export const getProductsBySubcategory = (subcategoryId, params) =>
  api.get(`/products`, { params: { subcategory: subcategoryId, ...params } });
export const getProduct = (id) => api.get(`/products/${id}`);
export const searchProducts = (query, params) =>
  api.get('/products/search', { params: { query, ...params } });

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);

// Cart (local storage based)
export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item._id === product._id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter(item => item._id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

export const updateCartItemQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item._id === productId);

  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  return cart;
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  return [];
};

// Reviews
export const createReview = (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData);
export const getReviews = (productId) => api.get(`/products/${productId}/reviews`);

export default api; 