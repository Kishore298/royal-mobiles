import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, ArrowUpDown, ChevronLeft, ChevronRight, Boxes, Package } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { 
  getCategories,
  getSubcategories, 
  createSubcategory, 
  updateSubcategory, 
  deleteSubcategory, 
  uploadSubcategoryImage 
} from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Subcategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    subcategoryId: null,
    subcategoryName: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchSubcategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSubcategories({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy,
        sortOrder
      });
      setSubcategories(response.data.data || []);
      setTotalPages(Math.ceil(response.data.pagination.total / itemsPerPage));
    } catch (error) {
      toast.error('Failed to fetch subcategories');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubcategories();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const subcategoryData = {
        name: formData.name,
        description: formData.description,
        category: formData.category
      };
  
      if (selectedSubcategory) {
        await updateSubcategory(selectedSubcategory._id, subcategoryData);
        if (formData.image) {
          await uploadSubcategoryImage(selectedSubcategory._id, formData.image);
        }
        toast.success('Subcategory updated successfully');
      } else {
        const response = await createSubcategory(subcategoryData);
        if (formData.image) {
          await uploadSubcategoryImage(response.data.data._id, formData.image);
        }
        toast.success('Subcategory created successfully');
      }
  
      setIsModalOpen(false);
      setFormData({ name: '', description: '', category: '', image: null });
      fetchSubcategories();
    } catch (error) {
      toast.error(selectedSubcategory ? 'Failed to update subcategory' : 'Failed to create subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description,
      category: subcategory.category._id,
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    setDeleteModal({
      isOpen: true,
      subcategoryId: id,
      subcategoryName: name
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteSubcategory(deleteModal.subcategoryId);
      if (response.data.success) {
        toast.success('Subcategory deleted successfully');
        fetchSubcategories();
      } else {
        toast.error('Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete subcategory');
    } finally {
      setDeleteModal({ isOpen: false, subcategoryId: null, subcategoryName: '' });
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

  return (
    <div className="container mx-auto px-2 py-4 lg:px-4 lg:py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Subcategories</h1>
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
              placeholder="Search subcategories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className="flex items-center"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            {sortBy === 'name' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('createdAt')}
            className="flex items-center"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
            {sortBy === 'createdAt' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading && subcategories.length === 0 ? (
          Array(8).fill(0).map((_, index) => (
            <SubcategorySkeleton key={index} />
          ))
        ) : subcategories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Boxes className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Subcategories Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              There are no subcategories available. Click the "Add New" button to create your first subcategory.
            </p>
          </div>
        ) : (
          subcategories.map((subcategory) => (
            <div key={subcategory._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 sm:h-72 md:h-80">
                {subcategory.image ? (
                  <img
                    src={subcategory.image.url}
                    alt={subcategory.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(subcategory)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(subcategory._id, subcategory.name)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{subcategory.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{subcategory.description}</p>
                <p className="text-sm text-primary-600 mt-2">
                  Category: {subcategory.category?.name || 'Loading...'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {selectedSubcategory ? 'Update' : 'Create'}
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
        onClose={() => setDeleteModal({ isOpen: false, subcategoryId: null, subcategoryName: '' })}
        onConfirm={confirmDelete}
        title="Delete Subcategory"
        message={`Are you sure you want to delete the subcategory "${deleteModal.subcategoryName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Subcategories; 