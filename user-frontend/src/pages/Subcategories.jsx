import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubcategoriesByCategory, getCategory } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit };
        const [subcategoriesRes, categoryRes] = await Promise.all([
          getSubcategoriesByCategory(categoryId, params),
          getCategory(categoryId),
        ]);

        if (subcategoriesRes?.data?.data) {
          setSubcategories(subcategoriesRes.data.data);
          setTotalCount(subcategoriesRes.data.pagination?.total || 0);
        } else {
          setError('No subcategories found');
        }

        if (categoryRes?.data?.data) {
          setCategory(categoryRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load subcategories');
        toast.error('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId, page, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/products/${subcategoryId}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200">
          {category?.name || 'Subcategories'}
        </span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {category?.name || 'Subcategories'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose a subcategory to browse products
          </p>
        </div>

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

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
          <FolderTree className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Subcategories Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            There are no subcategories available in this category currently.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {subcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory._id}
              image={subcategory.image?.url}
              title={subcategory.name}
              productCount={subcategory.products?.length || 0}
              onClick={() => handleSubcategoryClick(subcategory._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalCount > 0 && subcategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-emerald-950/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> subcategories
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

export default Subcategories;