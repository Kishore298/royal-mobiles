import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, ArrowUpDown, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Categories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });
  const fetchRef = useRef(false);

  const fetchCategories = useCallback(async (pageNum = 1) => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    try {
      setIsLoading(true);
      const response = await getCategories({
        page: pageNum,
        limit,
        search: searchQuery,
        sortBy,
        sortOrder
      });
      setCategories(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
      fetchRef.current = false;
    }
  }, [searchQuery, sortBy, sortOrder, limit]);

  // Debounced Search and Sort effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, sortOrder, limit]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCategories(newPage);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description
      };

      if (selectedCategory) {
        await updateCategory(selectedCategory._id, categoryData);
        if (formData.image) {
          await uploadCategoryImage(selectedCategory._id, formData.image);
        }
        toast.success('Category updated successfully');
      } else {
        const formDataPayload = new FormData();
        formDataPayload.append('name', formData.name);
        formDataPayload.append('description', formData.description);
        if (formData.image) {
          formDataPayload.append('image', formData.image);
        }

        await createCategory(formDataPayload);
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
      setFormData({ name: '', description: '', image: null });
      setCurrentPage(1);
      fetchCategories(1, true);
    } catch (error) {
      toast.error(selectedCategory ? 'Failed to update category' : 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteCategory(deleteModal.categoryId);
      if (response.data.success) {
        toast.success('Category deleted successfully');
        setCurrentPage(1);
        fetchCategories(1);
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button className="bg-primary-600 hover:bg-primary-700 text-sm lg:text-xl" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add New
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* Mobile-aligned controls */}
        <div className="flex flex-row w-full sm:w-auto gap-2">
          {/* Name Sort Button */}
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className="flex-1 sm:flex-none flex items-center justify-center whitespace-nowrap"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            {sortBy === 'name' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </Button>

          {/* Limit Selector */}
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-primary-100 hover:border-primary-300 transition-colors relative min-w-[120px]">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-semibold bg-transparent outline-none py-0 pl-1 pr-6 appearance-none w-full"
              style={{ backgroundImage: 'none' }}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.length === 0 && !isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Package className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              There are no categories available. Click the "Add New" button to create your first category.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-24 sm:h-48 md:h-64 bg-white flex items-center justify-center p-2">
                {category.image ? (
                  <img
                    src={category.image.url}
                    alt={category.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          Array(4).fill(0).map((_, index) => (
            <CategorySkeleton key={`skeleton-${index}`} />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    className="w-full sm:ml-3 sm:w-auto"
                    isLoading={isLoading}
                  >
                    {selectedCategory ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deleteModal.categoryName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Categories;