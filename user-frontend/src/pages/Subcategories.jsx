import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubcategoriesByCategory, getCategory } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit };
        const [subcategoriesRes, categoryRes] = await Promise.all([
          getSubcategoriesByCategory(categoryId, params),
          getCategory(categoryId)
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

  const totalPages = Math.ceil(totalCount / limit);

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/products/${subcategoryId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (subcategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <FolderTree className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Subcategories Found</h2>
        <p className="text-center">There are no subcategories available in this category.</p>
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Subcategories</h1>
          {category && (
            <p className="text-gray-600 mt-2">Category: {category.name}</p>
          )}
        </div>

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
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* Pagination Controls */}
      {totalCount > 0 && (
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

export default Subcategories; 