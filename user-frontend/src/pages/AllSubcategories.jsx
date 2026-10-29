import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSubcategories } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { FolderTree, Search, X } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

const AllSubcategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubcategories();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchSubcategories = async () => {
    try {
      setIsLoading(true);
      const response = await getAllSubcategories({ limit: 100, search });
      const newSubcategories = response.data.data || [];
      setSubcategories(newSubcategories);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            All Subcategories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse device models and specific accessory categories
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategories..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading && subcategories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : subcategories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
          <FolderTree className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Subcategories Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search terms.
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
              onClick={() => navigate(`/products/${subcategory._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSubcategories;