import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubcategoriesByCategory, getCategory } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 24;
  const navigate = useNavigate();

  const fetchData = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = { page: pageNum, limit };
      const [subcategoriesRes, categoryRes] = await Promise.all([
        getSubcategoriesByCategory(categoryId, params),
        pageNum === 1 ? getCategory(categoryId) : Promise.resolve(null),
      ]);

      if (subcategoriesRes?.data?.data) {
        const newSubs = subcategoriesRes.data.data;
        const total = subcategoriesRes.data.pagination?.total || 0;
        setTotalCount(total);
        setSubcategories((prev) => {
          const next = pageNum === 1 ? newSubs : [...prev, ...newSubs];
          setHasMore(next.length < total);
          return next;
        });
      } else if (pageNum === 1) {
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
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      pageRef.current = 1;
      fetchData(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      pageRef.current += 1;
      fetchData(pageRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingMore, hasMore, categoryId]);

  const lastElementRef = useInfiniteScroll(handleLoadMore, hasMore, loading || loadingMore);

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

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6">
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold shadow-sm">
            <Spinner size="sm" />
            <span>Loading more subcategories...</span>
          </div>
        </div>
      )}

      {/* End of list reached */}
      {!hasMore && subcategories.length > 0 && (
        <div className="text-center py-6 border-t border-gray-100 dark:border-emerald-950/60">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            All {totalCount} subcategories loaded
          </p>
        </div>
      )}

      {/* Sentinel node for intersection observer */}
      <div ref={lastElementRef} className="h-4 w-full" />
    </div>
  );
};

export default Subcategories;