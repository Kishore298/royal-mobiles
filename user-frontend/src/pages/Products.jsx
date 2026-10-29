import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductsBySubcategory, getSubcategory } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { Package, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

const Products = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
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
      setPage(1);
      fetchData(1, true);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, subcategoryId, limit]);

  const fetchData = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      const params = {
        page: pageNum,
        limit: limit,
        sort: filters.sort,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      };

      const [productsRes, subcategoryRes] = await Promise.all([
        getProductsBySubcategory(subcategoryId, params),
        reset ? getSubcategory(subcategoryId) : Promise.resolve(null),
      ]);

      const newProducts = productsRes?.data?.data?.products || [];
      const total = productsRes?.data?.data?.pagination?.total || 0;

      setProducts(newProducts);
      setTotalCount(total);

      if (subcategoryRes?.data?.data) {
        setSubcategory(subcategoryRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
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
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <Link to="/" className="text-primary-600 dark:text-emerald-400 hover:underline">
          Home
        </Link>
        <span>/</span>
        {subcategory?.category && (
          <>
            <Link
              to={`/subcategories/${subcategory.category._id || subcategory.category}`}
              className="text-primary-600 dark:text-emerald-400 hover:underline"
            >
              {subcategory.category.name || 'Category'}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-800 dark:text-gray-200">
          {subcategory?.name || 'Products'}
        </span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {subcategory?.name || 'Products'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse premium accessories and device-compatible models
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Filter Toggle on Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-primary-600 dark:text-emerald-400" />
            <span>Filters</span>
          </button>

          {/* Show Limit */}
          <div className="flex items-center bg-white dark:bg-[#121a15] px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 shadow-sm text-sm">
            <span className="text-gray-500 dark:text-gray-400 text-xs mr-2 font-medium">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-200 border-none outline-none cursor-pointer p-0 pr-4"
            >
              <option value={12} className="dark:bg-[#121a15]">12</option>
              <option value={24} className="dark:bg-[#121a15]">24</option>
              <option value={48} className="dark:bg-[#121a15]">48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout with Filters Panel & Product Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar on Desktop, Collapsible on Mobile */}
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

            {/* Sort Options */}
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

            {/* Price Range */}
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

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
              <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Products Found</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try adjusting your price range or search terms.
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

          {/* Pagination */}
          {totalCount > 0 && products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-emerald-950/60 mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of{' '}
                <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> items
              </p>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="p-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#16221b] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-semibold px-2 text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  className="p-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#16221b] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;