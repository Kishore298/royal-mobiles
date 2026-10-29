import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, ArrowUpDown, Package, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Spinner from '../../components/ui/Spinner';

const Categories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: '',
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
        sortOrder,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCategories(1);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, sortOrder, limit]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchCategories(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

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
    try {
      setIsLoading(true);

      let imageId = selectedCategory?.image?._id;
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        const uploadRes = await uploadCategoryImage(imageFormData);
        if (!uploadRes.data.success) {
          throw new Error('Image upload failed');
        }
        imageId = uploadRes.data.data._id;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
        ...(imageId && { image: imageId }),
      };

      if (selectedCategory) {
        await updateCategory(selectedCategory._id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(categoryData);
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', image: null });
      fetchCategories(currentPage);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name,
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize products into main store collections.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedCategory(null);
            setFormData({ name: '', description: '', image: null });
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSort('name')}
            className="flex-1 sm:flex-none"
          >
            Name
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
            {sortBy === 'name' && (
              <span className="ml-1 text-xs text-primary-600 dark:text-emerald-400 font-bold">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </Button>

          <div className="flex items-center bg-white dark:bg-[#121a15] px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 shadow-sm text-sm">
            <span className="text-gray-500 dark:text-gray-400 text-xs mr-2 font-medium">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-200 border-none outline-none cursor-pointer p-0 pr-4"
            >
              <option value={25} className="dark:bg-[#121a15]">25</option>
              <option value={50} className="dark:bg-[#121a15]">50</option>
              <option value={100} className="dark:bg-[#121a15]">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {categories.length === 0 && !isLoading ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
            <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Categories Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Click "+ Add Category" to create your first collection.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-md hover:border-primary-400/50 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col group relative overflow-hidden"
            >
              <div className="relative h-28 sm:h-44 rounded-xl bg-gray-50 dark:bg-[#16221b] flex items-center justify-center p-2 overflow-hidden mb-3">
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt={category.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                )}
                <div className="absolute top-2 right-2 flex space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 bg-white/90 dark:bg-[#111914]/90 backdrop-blur-sm rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-emerald-400 shadow-sm transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="p-1.5 bg-white/90 dark:bg-[#111914]/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base leading-snug truncate">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Pagination Bar */}
      {totalCount > 0 && categories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-emerald-950/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> categories
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2 text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className="bg-white dark:bg-[#111914] rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-emerald-950/70 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Back Covers, Chargers"
                  className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of products in this category..."
                  className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-emerald-950/60 dark:file:text-emerald-300 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading}
                >
                  {selectedCategory ? 'Update Category' : 'Save Category'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

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