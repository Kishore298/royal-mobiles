import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Categories from './pages/categories/Categories';
import Subcategories from './pages/subcategories/Subcategories';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return ( 
    <Router>
      <NotificationProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="" element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<Subcategories />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;