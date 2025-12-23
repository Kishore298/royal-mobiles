import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, addToCart } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import useInfiniteScroll from '../hooks/useInfiniteScroll'; // Removed

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  // const [hasMore, setHasMore] = useState(true); // Removed
  const navigate = useNavigate();

  // Sync state with URL param if it changes externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Update URL to match local query state
      if (query !== initialQuery) {
        if (query.trim()) {
          setSearchParams({ q: query });
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, setSearchParams, initialQuery, limit]);

  // Fetch logic based on URL Query (Source of Truth)
  // We need to fetch when URL Query changes OR Page changes.
  // But wait, if we use Infinite Scroll, page is local state.
  // So we should rebuild fetch logic.

  const fetchSearchResults = async (pageNum = 1, searchQuery, reset = false) => {
    if (!searchQuery) return;
    try {
      if (pageNum === 1) setLoading(true);
      const params = {
        page: pageNum,
        limit: limit,
        // Add sort/filters if we want them here too, but start with basic search
      };

      const response = await searchProducts(searchQuery, params);
      const newProducts = response.data?.products || [];
      const total = response.data?.pagination?.total || 0;

      setProducts(newProducts);
      setTotalCount(total);

      // Pagination logic managed via state now
      // Check hasMore - removed
      /*
      if (response.data?.pagination) {
        setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
      } else {
        setHasMore(newProducts.length === 12);
      }
      */

    } catch (err) {
      setError('Failed to load search results');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // When URL Query changes, reset and fetch
  useEffect(() => {
    if (initialQuery) {
      setPage(1);
      fetchSearchResults(1, initialQuery, true);
    }
    if (initialQuery) {
      setPage(1);
      fetchSearchResults(1, initialQuery, true);
    }
  }, [initialQuery, limit]); // Added limit dependency logic handled in other effect but good to be safe or rely on debounced one.. 
  // Actually, the debounced effect handles Query changes. This effect handles initial load/URL sync.
  // If limit changes, we want to re-fetch. But limit change updates `limit` state.
  // We should make `handlePageChange` or usage of `limit` clear.
  // The debounced effect calls `fetchData`? No, it sets params.
  // Let's rely on explicit calls. This effect handles Initial Query.

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchSearchResults(newPage, initialQuery);
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

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Product added to cart');
  };

  return (
    <div className="py-4 lg:py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Search Results</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
          {/* Styled Limit Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-primary-100 hover:border-primary-300 transition-colors">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
                // Trigger fetch immediately or let effect? 
                // We should manually trigger because explicit interaction.
                // But wait, `fetchSearchResults` depends on `initialQuery` which comes from URL.
                // If we are just changing limit, `initialQuery` is same.
                fetchSearchResults(1, initialQuery);
              }}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-semibold bg-transparent outline-none"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Local Search Input for Refining */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {!initialQuery ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <Search className="h-16 w-16 mb-4" />
          <p>Please enter a search query</p>
        </div>
      ) : products.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <Package className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
          <p className="text-center">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <div key={product._id}>
              <ProductCard
                image={product.images?.[0]}
                title={product.name}
                description={product.description}
                price={product.price}
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
      {totalCount > 0 && products.length > 0 && (
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

export default SearchResults;