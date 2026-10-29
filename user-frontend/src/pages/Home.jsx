import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories } from '../services/api';
import { CategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;
  const navigate = useNavigate();

  const fetchCategories = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      const response = await getCategories({ page: pageNum, limit, search });
      const newCategories = response.data.data || [];
      const total = response.data.pagination?.total || 0;

      setTotalCount(total);
      setCategories((prev) => {
        const next = pageNum === 1 ? newCategories : [...prev, ...newCategories];
        setHasMore(next.length < total);
        return next;
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      pageRef.current = 1;
      fetchCategories(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      pageRef.current += 1;
      fetchCategories(pageRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasMore]);

  const lastElementRef = useInfiniteScroll(handleLoadMore, hasMore, loading || loadingMore);

  const handleCategoryClick = (categoryId) => {
    navigate(`/subcategories/${categoryId}`);
  };

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

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6">
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold shadow-sm">
            <Spinner size="sm" />
            <span>Loading more categories...</span>
          </div>
        </div>
      )}

      {/* End of collection indicator */}
      {!hasMore && categories.length > 0 && (
        <div className="text-center py-6 border-t border-gray-100 dark:border-emerald-950/60">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            You've explored all {totalCount} collections
          </p>
        </div>
      )}

      {/* Sentinel node for intersection observer */}
      <div ref={lastElementRef} className="h-4 w-full" />
    </div>
  );
};

export default Home;