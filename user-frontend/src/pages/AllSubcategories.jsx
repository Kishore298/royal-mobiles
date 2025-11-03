import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSubcategories } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { FolderTree } from 'lucide-react';

const AllSubcategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSubcategories = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await getAllSubcategories({ page: pageNum, limit: 12 });
      const newSubcategories = response.data.data || [];
      
      if (pageNum === 1) {
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

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSubcategories(nextPage);
    }
  };

  const SubcategorySkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  if (subcategories.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <FolderTree className="h-16 w-16 mb-4" /> {/* Larger icon */}
        <h2 className="text-xl font-semibold mb-2">No Subcategories Found</h2>
        <p className="text-center">There are no subcategories available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Subcategories</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading && subcategories.length === 0 ? (
          Array(8).fill(0).map((_, index) => (
            <SubcategorySkeleton key={index} />
          ))
        ) : (
          subcategories.map((subcategory) => (
            <Link 
              key={subcategory._id} 
              to={`/subcategories/${subcategory._id}`}
            >
              <SubcategoryCard
                image={subcategory.image?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                title={subcategory.name}
                productCount={subcategory.products?.length || 0}
              />
            </Link>
          ))
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AllSubcategories; 