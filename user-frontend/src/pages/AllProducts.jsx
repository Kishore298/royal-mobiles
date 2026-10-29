import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAllProducts, getCategories } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { Package, Filter, Layers } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

const groupProductsByCategoryAndSubcategory = (products, categories = []) => {
  const catOrderMap = {};
  const catNameMap = {};
  categories.forEach((cat, index) => {
    catOrderMap[cat._id] = index;
    catNameMap[cat._id] = cat.name;
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
    let subName = 'General';

    if (product.subcategory) {
      if (typeof product.subcategory === 'object' && product.subcategory._id) {
        subId = product.subcategory._id;
        subName = product.subcategory.name || 'Subcategory';
      } else if (typeof product.subcategory === 'string') {
        subId = product.subcategory;
        subName = 'Subcategory';
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

const AllProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: '',
  });

  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategoriesList = async () => {
    try {
      const response = await getCategories({ limit: 100 });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = {
        limit: 500,
        sort: filters.sort,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      };

      const response = await getAllProducts(params);
      const newProducts = response.data.data || [];
      setProducts(newProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleAddToCart = (product) => {
    try {
      const quantity = quantities[product._id] || 1;
      addToCart({ ...product, quantity });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const groupedCategories = useMemo(() => {
    return groupProductsByCategoryAndSubcategory(products, categories);
  }, [products, categories]);

  const displayedCategories = useMemo(() => {
    if (selectedCategoryTab === 'all') return groupedCategories;
    return groupedCategories.filter((cat) => cat.id === selectedCategoryTab);
  }, [groupedCategories, selectedCategoryTab]);

  const scrollToCategory = (catId) => {
    setSelectedCategoryTab(catId);
    if (catId !== 'all') {
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse premium accessories organized by category and subcategory
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm"
        >
          <Filter className="w-3.5 h-3.5 text-primary-600 dark:text-emerald-400" />
          <span>Filters</span>
        </button>
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside
          className={`md:w-64 flex-shrink-0 ${
            showFilters ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm sticky top-28 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-950/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                Refine Search
              </h2>
              <button
                onClick={() => {
                  setFilters({ minPrice: '', maxPrice: '', sort: 'newest', search: '' });
                  setSelectedCategoryTab('all');
                }}
                className="text-xs text-primary-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Sort By
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500 cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full text-xs py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Grouped Product Grid */}
        <div className="flex-1 min-w-0 space-y-12">
          {isLoading && products.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Spinner size="lg" />
            </div>
          ) : displayedCategories.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
              <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Products Found</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try clearing or adjusting your search filters.
              </p>
            </div>
          ) : (
            displayedCategories.map((catGroup) => (
              <section
                key={catGroup.id}
                id={`category-${catGroup.id}`}
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
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    {catGroup.totalCount} {catGroup.totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Subcategories under this Category */}
                <div className="space-y-8 pl-1 sm:pl-3">
                  {catGroup.subcategories.map((subGroup) => (
                    <div
                      key={subGroup.id}
                      id={`subcategory-${subGroup.id}`}
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

                      {/* 3. Product Cards under this Subcategory */}
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
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5"
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
                          >
                            <ProductCard
                              key={product._id}
                              image={product.images?.[0] || { url: '' }}
                              title={product.name}
                              description={product.description}
                              price={product.price}
                              stock={product.stock}
                              quantity={quantities[product._id] || 1}
                              onQuantityChange={(q) =>
                                handleQuantityChange(product._id, q)
                              }
                              onAddToCart={() => handleAddToCart(product)}
                            />
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
      </div>
    </div>
  );
};

export default AllProducts;