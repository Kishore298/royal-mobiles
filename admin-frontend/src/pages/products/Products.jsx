import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  ArrowUpDown,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
} from 'lucide-react';
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
import Spinner from '../../components/ui/Spinner';

const groupProductsByCategoryAndSubcategory = (products, categories = [], subcategories = []) => {
  const catOrderMap = {};
  const catNameMap = {};
  categories.forEach((cat, index) => {
    catOrderMap[cat._id] = index;
    catNameMap[cat._id] = cat.name;
  });

  const subNameMap = {};
  subcategories.forEach((sub) => {
    subNameMap[sub._id] = sub.name;
  });

  const categoryMap = {};

  products.forEach((product) => {
    let catId = 'uncategorized';
    let catName = 'Other Accessories';

    if (product.category) {
      if (typeof product.category === 'object' && product.category._id) {
        catId = product.category._id;
        catName = product.category.name || catNameMap[catId] || 'Category';
      } else if (typeof product.category === 'string') {
        catId = product.category;
        catName = catNameMap[catId] || 'Category';
      }
    }

    let subId = 'general';
    let subName = 'General Inventory';

    if (product.subcategory) {
      if (typeof product.subcategory === 'object' && product.subcategory._id) {
        subId = product.subcategory._id;
        subName = product.subcategory.name || subNameMap[subId] || 'Subcategory';
      } else if (typeof product.subcategory === 'string') {
        subId = product.subcategory;
        subName = subNameMap[subId] || 'Subcategory';
      }
    }

    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        id: catId,
        name: catName,
        order: catOrderMap[catId] !== undefined ? catOrderMap[catId] : 9999,
        subcategories: {},
        totalCount: 0,
      };
    }

    if (!categoryMap[catId].subcategories[subId]) {
      categoryMap[catId].subcategories[subId] = {
        id: subId,
        name: subName,
        products: [],
      };
    }

    categoryMap[catId].subcategories[subId].products.push(product);
    categoryMap[catId].totalCount += 1;
  });

  return Object.values(categoryMap)
    .sort((a, b) => a.order - b.order)
    .map((catGroup) => ({
      ...catGroup,
      subcategories: Object.values(catGroup.subcategories),
    }));
};

const Products = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
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
  const [limit, setLimit] = useState(100);
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
    productName: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      setCategories([]);
    }
  }, []);

  const fetchAllSubcategories = useCallback(async () => {
    try {
      const response = await getAllSubcategories();
      setAllSubcategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch all subcategories', error);
      setAllSubcategories([]);
    }
  }, []);

  const fetchSubcategories = useCallback(async (catId) => {
    try {
      const response = await getAllSubcategories(catId);
      setSubcategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch subcategories');
      setSubcategories([]);
    }
  }, []);

  const fetchProducts = useCallback(
    async (pageNum = 1) => {
      try {
        setIsLoading(true);
        const params = {
          page: pageNum,
          limit,
          search: searchQuery,
          sortBy,
          sortOrder,
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.category && { category: filters.category }),
          ...(filters.subcategory && { subcategory: filters.subcategory }),
          ...(filters.inStock && { inStock: filters.inStock }),
        };

        const response = await getProducts(params);
        const { data: { products: newProducts } } = response.data;
        setProducts(newProducts || []);
        setTotalCount(response.data.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, sortBy, sortOrder, filters, limit]
  );

  useEffect(() => {
    fetchCategories();
    fetchAllSubcategories();
  }, [fetchCategories, fetchAllSubcategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, sortOrder, filters, limit]);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    }
  }, [formData.category, fetchSubcategories]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchProducts(newPage);
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

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        subcategory: formData.subcategory,
      };

      const newImages = formData.images.filter((img) => img instanceof File);
      let uploadedImages = [];

      if (newImages.length > 0) {
        const imageFormData = new FormData();
        newImages.forEach((img) => imageFormData.append('images', img));
        const uploadRes = await uploadProductImages(imageFormData);
        uploadedImages = uploadRes.data.data;
      }

      const existingImages = formData.images.filter((img) => !(img instanceof File));
      productData.images = [...existingImages, ...uploadedImages];

      if (selectedProduct) {
        await updateProduct(selectedProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }

      setIsModalOpen(false);
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
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
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
      category: product.category?._id || product.category || '',
      subcategory: product.subcategory?._id || product.subcategory || '',
      images: product.images || [],
    });
    if (product.category) {
      fetchSubcategories(product.category?._id || product.category);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteProduct(deleteModal.productId);
      if (response.data.success) {
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

  const groupedCategories = useMemo(() => {
    return groupProductsByCategoryAndSubcategory(products, categories, allSubcategories);
  }, [products, categories, allSubcategories]);

  const displayedCategories = useMemo(() => {
    if (selectedCategoryTab === 'all') return groupedCategories;
    return groupedCategories.filter((cat) => cat.id === selectedCategoryTab);
  }, [groupedCategories, selectedCategoryTab]);

  const scrollToCategory = (catId) => {
    setSelectedCategoryTab(catId);
    if (catId !== 'all') {
      const el = document.getElementById(`admin-category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Products Catalog
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage inventory, pricing, and product media organized by category and subcategory.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
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
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Search, Sort & Filter Row */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title..."
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
              onClick={() => handleSort('price')}
              className="flex-1 sm:flex-none"
            >
              Price
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
              {sortBy === 'price' && (
                <span className="ml-1 text-xs text-primary-600 dark:text-emerald-400 font-bold">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>

            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filters
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
                <option value={500} className="dark:bg-[#121a15]">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="₹0"
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="₹10000"
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={filters.inStock}
                  onChange={handleFilterChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <span className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Quick Category Jump Bar */}
      {groupedCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => scrollToCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
              selectedCategoryTab === 'all'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/20'
                : 'bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-950/70 hover:border-emerald-500/40'
            }`}
          >
            All Categories ({products.length})
          </button>
          {groupedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                selectedCategoryTab === cat.id
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/20'
                  : 'bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-emerald-950/70 hover:border-emerald-500/40'
              }`}
            >
              {cat.name} ({cat.totalCount})
            </button>
          ))}
        </div>
      )}

      {/* Grouped Products by Category and Subcategory */}
      <div className="space-y-12">
        {products.length === 0 && !isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
            <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Products Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add products or clear filters to view inventory.
            </p>
          </div>
        ) : (
          displayedCategories.map((catGroup) => (
            <section
              key={catGroup.id}
              id={`admin-category-${catGroup.id}`}
              className="space-y-6 pt-2 scroll-mt-24"
            >
              {/* 1. Category Heading */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-emerald-500/20 dark:border-emerald-500/30">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-emerald-500 to-green-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                      Category
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                      {catGroup.name}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {catGroup.totalCount} {catGroup.totalCount === 1 ? 'item' : 'items'}
                  </span>
                  {catGroup.id !== 'uncategorized' && (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setFormData({
                          name: '',
                          description: '',
                          price: '',
                          stock: '',
                          category: catGroup.id,
                          subcategory: '',
                          images: [],
                        });
                        fetchSubcategories(catGroup.id);
                        setIsModalOpen(true);
                      }}
                      className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#16221b] hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-gray-700 dark:text-gray-300 transition-colors"
                      title="Add product to this category"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to {catGroup.name}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories under this Category */}
              <div className="space-y-8 pl-1 sm:pl-3">
                {catGroup.subcategories.map((subGroup) => (
                  <div
                    key={subGroup.id}
                    id={`admin-subcategory-${subGroup.id}`}
                    className="space-y-4"
                  >
                    {/* 2. Subcategory Heading */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                          {subGroup.name}
                        </h3>
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                          ({subGroup.products.length})
                        </span>
                      </div>
                    </div>

                    {/* 3. Product Cards Grid under this Subcategory */}
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.03 },
                        },
                      }}
                      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
                    >
                      {subGroup.products.map((product) => (
                        <motion.div
                          key={product._id}
                          variants={{
                            hidden: { opacity: 0, y: 14 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: { duration: 0.28 },
                            },
                          }}
                          whileHover={{ y: -5, scale: 1.01 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/15 hover:border-primary-400/60 dark:hover:border-emerald-500/50 transition-colors duration-200 flex flex-col group relative overflow-hidden"
                        >
                          <div className="relative h-32 sm:h-48 rounded-xl bg-gray-50 dark:bg-[#16221b] flex items-center justify-center p-2.5 overflow-hidden mb-3">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            )}

                            {/* Light sheen sweeping across image on hover */}
                            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent skew-x-[-25deg] -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out pointer-events-none" />

                            <div className="absolute top-2 right-2 flex space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleEdit(product)}
                                className="p-1.5 bg-white/90 dark:bg-[#111914]/90 backdrop-blur-sm rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-emerald-400 shadow-sm transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleDelete(product._id, product.name)}
                                className="p-1.5 bg-white/90 dark:bg-[#111914]/90 backdrop-blur-sm rounded-lg text-red-500 hover:text-red-700 shadow-sm transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-emerald-400 transition-colors">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm sm:text-base font-extrabold text-primary-600 dark:text-emerald-400">
                                  ₹{Number(product.price).toFixed(2)}
                                </span>
                                <span
                                  className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    product.stock > 10
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                      : product.stock > 0
                                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                      : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                  }`}
                                >
                                  {product.stock > 10 && (
                                    <span className="relative flex h-1.5 w-1.5 mr-1">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                    </span>
                                  )}
                                  {product.stock > 0 && product.stock <= 10 && (
                                    <span className="relative flex h-1.5 w-1.5 mr-1">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                                    </span>
                                  )}
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-emerald-950/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> products
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

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#111914] rounded-2xl max-w-2xl w-full p-6 border border-gray-100 dark:border-emerald-950/70 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. MagSafe Clear Case"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Price (INR ₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 499"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product specifications..."
                  className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-emerald-950/60 dark:file:text-emerald-300 cursor-pointer"
                />

                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-emerald-950/70 aspect-square bg-gray-50 dark:bg-black/40">
                        <img
                          src={img?.url || (img instanceof File ? URL.createObjectURL(img) : img)}
                          alt="preview"
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {selectedProduct ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Products;