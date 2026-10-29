import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Subcategories from './pages/Subcategories';
import Products from './pages/Products';
import Cart from './pages/Cart';
import AllProducts from './pages/AllProducts';
import AllSubcategories from './pages/AllSubcategories';
import Search from './pages/Search';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ContactUs from './pages/ContactUs';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-[#15231a] dark:text-slate-100 dark:border dark:border-emerald-500/20',
            }}
          />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="subcategories/:categoryId" element={<Subcategories />} />
              <Route path="products/:subcategoryId" element={<Products />} />
              <Route path="cart" element={<Cart />} />
              <Route path="all-products" element={<AllProducts />} />
              <Route path="all-subcategories" element={<AllSubcategories />} />
              <Route path="search" element={<Search />} />
              <Route path="contact-us" element={<ContactUs />} />
            </Route>
          </Routes>
        </CartProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;