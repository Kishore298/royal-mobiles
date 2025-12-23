import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllSubcategories } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { FolderTree, Search } from 'lucide-react';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const AllSubcategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSubcategories(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSubcategories = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      // Assuming getAllSubcategories accepts search param
      const response = await getAllSubcategories({ page: pageNum, limit: 12, search });
      const newSubcategories = response.data.data || [];

      if (pageNum === 1 || reset) {
        setSubcategories(newSubcategories);
      } else {
        setSubcategories(prev => [...prev, ...newSubcategories]);
      }

      setHasMore(newSubcategories.length === 12);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSubcategories(nextPage);
  }, [page]);

  const lastSubcategoryRef = useInfiniteScroll(loadMore, hasMore, isLoading);

  const SubcategorySkeleton = () => (
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
        <h1 className="text-3xl font-bold">All Subcategories</h1>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategories..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {subcategories.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <FolderTree className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Subcategories Found</h2>
          <p className="text-center">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {subcategories.map((subcategory, index) => {
            const isLast = subcategories.length === index + 1;
            return (
              <div key={subcategory._id} ref={isLast ? lastSubcategoryRef : null}>
                <Link to={`/subcategories/${subcategory._id}`}>
                  <SubcategoryCard
                    image={subcategory.image?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    title={subcategory.name}
                    productCount={subcategory.products?.length || 0}
                  />
                </Link>
              </div>
            );
          })}
          {isLoading && (
            Array(4).fill(0).map((_, index) => (
              <SubcategorySkeleton key={`skeleton-${index}`} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AllSubcategories;