import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsBySubcategory, getSubcategory, addToCart } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import useInfiniteScroll from '../hooks/useInfiniteScroll'; // Removed

const Products = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  // const [hasMore, setHasMore] = useState(true); // Removed
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: ''
  });

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchData(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, subcategoryId, limit]);

  const fetchData = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      const params = {
        page: pageNum,
        limit: limit,
        sort: filters.sort,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      };

      const [productsRes, subcategoryRes] = await Promise.all([
        getProductsBySubcategory(subcategoryId, params),
        reset ? getSubcategory(subcategoryId) : Promise.resolve(null)
      ]);

      const newProducts = productsRes?.data?.data?.products || [];
      const total = productsRes?.data?.data?.pagination?.total || 0;

      setProducts(newProducts);
      setTotalCount(total);

      if (subcategoryRes?.data?.data) {
        setSubcategory(subcategoryRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleAddToCart = (product) => {
    try {
      const quantity = quantities[product._id] || 1;
      addToCart({ ...product, quantity });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-bold mb-6">Filters</h2>

            <div className="space-y-6">


              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              {subcategory && (
                <p className="text-gray-600 mt-2">Subcategory: {subcategory.name}</p>
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

          {products.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 bg-white rounded-lg p-8">
              <Package className="h-16 w-16 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
              <p className="text-center">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {products.map((product) => (
                <div key={product._id}>
                  <ProductCard
                    image={product.images?.[0] || { url: '' }}
                    title={product.name}
                    description={product.description}
                    price={product.price}
                    stock={product.stock}
                    quantity={quantities[product._id] || 1}
                    onQuantityChange={(newQuantity) => handleQuantityChange(product._id, newQuantity)}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </div>
              ))}
              {loading && (
                Array(6).fill(0).map((_, index) => (
                  <ProductSkeleton key={`skeleton-${index}`} />
                ))
              )}
            </div>
          )}

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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show generic page numbers nicely if many pages, 
                    // for now simple window or just standard logic. 
                    // Let's keep it simple: if lots of pages, just show current and neighbors? 
                    // Or just a simple text input? 
                    // Let's implement a standard view: 1 .. current .. last?
                    // For simplicity and speed: Just show generic pagination or Page X of Y
                    // User requested "implement the pagination ... like we did for admin frontend"
                    // Admin frontend has "Page X of Y" and prev/next buttons.
                    // The code below duplicates that style but cleaner.
                    return null;
                  })}
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
      </div>
    </div>
  );
};

export default Products;