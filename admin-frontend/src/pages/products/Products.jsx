import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, ArrowUpDown, Filter, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import {
  getAllCategories,
  getAllSubcategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../../services/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Products = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    subcategory: '',
    images: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    subcategory: '',
    inStock: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const fetchRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      setCategories([]);
    }
  }, []);

  const fetchSubcategories = async (categoryId = '') => {
    try {
      const response = await getAllSubcategories(categoryId);
      setSubcategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      setSubcategories([]);
    }
  };

  const fetchProducts = useCallback(async (pageNum = 1) => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    try {
      setIsLoading(true);
      const response = await getProducts({
        page: pageNum,
        limit,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...filters
      });

      if (!response?.data) {
        setProducts([]);
        return;
      }

      const { data: { products: newProducts } } = response.data;
      setProducts(newProducts || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
      fetchRef.current = false;
    }
  }, [searchQuery, sortBy, sortOrder, filters, limit]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounced Search and Filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, sortOrder, filters, limit]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProducts(newPage);
  };

  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    }
  }, [formData.category]);

  const handleSearch = (e) => {
    // Prevent default form submission but let state update handle the fetch via useEffect
    e.preventDefault();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    // Effect will handle fetch
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effect will handle fetch
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        subcategory: formData.subcategory,
      };

      if (selectedProduct) {
        await updateProduct(selectedProduct._id, productData);
        if (formData.images.length > 0) {
          if (typeof formData.images[0] !== 'string') { // Check if new files
            await uploadProductImages(selectedProduct._id, formData.images);
          }
        }
        toast.success('Product updated successfully');
      } else {
        const response = await createProduct(productData);
        if (formData.images.length > 0) {
          await uploadProductImages(response.data.data._id, formData.images);
        }
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        subcategory: '',
        images: []
      });
      // Fetch will happen automatically via useInfiniteScroll or we can manually trigger reset if needed,
      // but simpler to just reset page and let effect run if needed, or manually call fetch.
      // Since form submission doesn't change search/filters, effect won't run. Manual fetch needed.
      setCurrentPage(1);
      fetchProducts(1);
    } catch (error) {
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category._id,
      subcategory: product.subcategory._id,
      images: product.images.map(img => img.url), // Use URLs for preview
    });
    fetchSubcategories(product.category._id); // Prefetch subcategories
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name
    });
  };

  const openAddModal = async () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      subcategory: '',
      images: [],
    });
    await fetchCategories(); // Refresh categories to include any newly created ones
    setSubcategories([]); // Clear subcategories until category is selected
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteProduct(deleteModal.productId);
      if (response.status === 204 || response.data?.status === 'success') {
        toast.success('Product deleted successfully');
        setCurrentPage(1);
        fetchProducts(1);
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files] // Store files for upload
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );

  return (
    <div className="py-4 lg:py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button className="bg-primary-600 hover:bg-primary-700 text-sm lg:text-xl" onClick={openAddModal}>
          <Plus className="w-5 h-5 mr-2" />
          Add New
        </Button>
      </div>

      {/* Search, Sort, and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Sort Buttons Group */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleSort('name')}
                className="flex-1 sm:flex-none flex items-center justify-center"
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortBy === 'name' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSort('price')}
                className="flex-1 sm:flex-none flex items-center justify-center"
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortBy === 'price' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            </div>

            {/* Filters & Limit Group */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none flex items-center justify-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>

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
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={filters.subcategory}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Subcategories</option>
                  {subcategories
                    .filter(s => !filters.category || (s.category?._id || s.category) === filters.category)
                    .map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={filters.inStock}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.length === 0 && !isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Package className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              There are no products available. Click the "Add New" button to create your first product.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-24 sm:h-48 md:h-64 bg-white flex items-center justify-center p-2">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-4 flex flex-col">
                {/* Product Name */}
                <h3 className="text-md sm:text-lg font-semibold text-gray-900">{product.name}</h3>

                {/* Description */}
                <p className="text-sm sm:text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>

                {/* Price */}
                <div className="mt-1">
                  <span className="text-base sm:text-lg font-bold text-primary-600">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>

                {/* Stock */}
                <div>
                  <span className={`text-sm sm:text-md ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          Array(4).fill(0).map((_, index) => (
            <ProductSkeleton key={`skeleton-${index}`} />
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
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
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
                    <label className="block text-sm font-medium text-gray-700">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a subcategory</option>
                      {subcategories
                        .filter(s => !formData.category || (s.category?._id || s.category) === formData.category)
                        .map((subcategory) => (
                          <option key={subcategory._id} value={subcategory._id}>
                            {subcategory.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    required
                    minLength={10}
                    placeholder="Enter product description (minimum 10 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Images
                  </label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    className="w-full sm:ml-3 sm:w-auto"
                    isLoading={isLoading}
                  >
                    {selectedProduct ? 'Update' : 'Create'}
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
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete the product "${deleteModal.productName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Products;