import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories } from '../services/api';
import { CategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, Search, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCategories(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, limit]);

  const fetchCategories = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getCategories({ page: pageNum, limit, search });
      const newCategories = response.data.data || [];
      const total = response.data.pagination?.total || 0;

      setCategories(newCategories);
      setTotalCount(total);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/subcategories/${categoryId}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCategories(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Luxury Hero Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none animate-float-gentle" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-emerald-100 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Store Collection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Premium Accessories for Every Device
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Discover precision cases, ultra-fast charging adapters, acoustic headphones, and protective glass engineered for your lifestyle.
          </p>
        </div>
      </div>

      {/* Control Bar: Title, Search, Limit */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Product Categories
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Select a category to browse models and accessories
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          {/* Limit Selector */}
          <div className="flex items-center bg-white dark:bg-[#121a15] px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 shadow-sm text-sm w-full sm:w-auto justify-between sm:justify-start">
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

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter categories..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : error && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : categories.length === 0 && !loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
          <FolderTree className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Categories Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try searching for another device type or keyword.
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
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
        >
          {categories.map((category) => (
            <motion.div
              key={category._id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
            >
              <CategoryCard
                image={category.image?.url}
                title={category.name}
                subCategoryCount={category.subcategories?.length || 0}
                onClick={() => handleCategoryClick(category._id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination Controls */}
      {totalCount > 0 && categories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-emerald-950/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> collections
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
  );
};

export default Home;