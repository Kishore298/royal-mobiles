import React, { useState, useEffect, useCallback } from 'react';
import { getAllProducts, addToCart } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { PackageX } from 'lucide-react';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const AllProducts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: ''
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      const params = {
        page: pageNum,
        limit: 12,
        sort: filters.sort,
        search: filters.search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      };

      const response = await getAllProducts(params);
      const newProducts = response.data.data || [];

      if (pageNum === 1 || reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === 12);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
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
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  }, [page]);

  const lastProductRef = useInfiniteScroll(loadMore, hasMore, isLoading);

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
          <h1 className="text-3xl font-bold mb-8">All Products</h1>

          {products.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 bg-white rounded-lg p-8">
              <PackageX className="h-16 w-16 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
              <p className="text-center">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {products.map((product, index) => {
                const isLast = products.length === index + 1;
                return (
                  <div key={product._id} ref={isLast ? lastProductRef : null}>
                    <ProductCard
                      image={product.images[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      title={product.name}
                      description={product.description}
                      price={product.price}
                      quantity={quantities[product._id] || 1}
                      onQuantityChange={(newQuantity) => handleQuantityChange(product._id, newQuantity)}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </div>
                );
              })}
              {isLoading && (
                Array(6).fill(0).map((_, index) => (
                  <ProductSkeleton key={`skeleton-${index}`} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;