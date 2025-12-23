import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/api';
import { CategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, Search } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import useInfiniteScroll from '../hooks/useInfiniteScroll'; // Removed
import { toast } from 'react-hot-toast';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  // const [hasMore, setHasMore] = useState(true); // Removed
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCategories(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, limit]);

  const fetchCategories = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      const response = await getCategories({ page: pageNum, limit, search });
      const newCategories = response.data.data || [];
      const total = response.data.pagination?.total || 0;

      setCategories(newCategories);
      setTotalCount(total);

      // Infinite scroll logic removed in favor of pagination
      // if (pageNum === 1 || reset) {
      //   setCategories(newCategories);
      // } else {
      //   setCategories(prev => [...prev, ...newCategories]);
      // }
      // setHasMore(newCategories.length === 12);
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

  const totalPages = Math.ceil(totalCount / limit);

  const CategorySkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="py-4 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Categories</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
          {/* Styled Limit Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-primary-100 hover:border-primary-300 transition-colors">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-semibold bg-transparent outline-none"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      ) : error && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-500">{error}</p>
        </div>
      ) : categories.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <FolderTree className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Categories Found</h2>
          <p className="text-center">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {categories.map((category) => (
            <div key={category._id}>
              <CategoryCard
                image={category.image?.url}
                title={category.name}
                subCategoryCount={category.subcategories?.length || 0}
                onClick={() => handleCategoryClick(category._id)}
              />
            </div>
          ))}
          {loading && (
            Array(4).fill(0).map((_, index) => (
              <CategorySkeleton key={`skeleton-${index}`} />
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > 0 && categories.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className={`p-2 rounded-md border ${page === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {page} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className={`p-2 rounded-md border ${page === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;