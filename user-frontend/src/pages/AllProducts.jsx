import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllProducts } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { Package, Filter } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

const AllProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: '',
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {
        limit: 100,
        sort: filters.sort,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      };

      const response = await getAllProducts(params);
      const newProducts = response.data.data || [];
      setProducts(newProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = (product) => {
    try {
      const quantity = quantities[product._id] || 1;
      addToCart({ ...product, quantity });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore our complete catalog of mobile accessories
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm"
        >
          <Filter className="w-3.5 h-3.5 text-primary-600 dark:text-emerald-400" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside
          className={`md:w-64 flex-shrink-0 ${
            showFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm sticky top-28 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-950/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Refine Search
              </h2>
              <button
                onClick={() => setFilters({ minPrice: '', maxPrice: '', sort: 'newest', search: '' })}
                className="text-xs text-primary-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Sort By
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {isLoading && products.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
              <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Products Found</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try clearing or adjusting your search filters.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 }
                }
              }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5"
            >
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                  }}
                >
                  <ProductCard
                    key={product._id}
                    image={product.images?.[0] || { url: '' }}
                    title={product.name}
                    description={product.description}
                    price={product.price}
                    stock={product.stock}
                    quantity={quantities[product._id] || 1}
                    onQuantityChange={(q) => handleQuantityChange(product._id, q)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;