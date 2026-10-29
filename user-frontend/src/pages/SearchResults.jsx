import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts, addToCart } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import Spinner from '../components/ui/Spinner';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state with URL param if it changes externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery && query.trim()) {
        setSearchParams({ q: query });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, setSearchParams, initialQuery]);

  const fetchSearchResults = useCallback(async (pageNum = 1, searchQuery) => {
    if (!searchQuery) {
      setLoading(false);
      return;
    }
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const params = {
        page: pageNum,
        limit: 20,
      };

      const response = await searchProducts(searchQuery, params);
      const incomingProducts = response.data?.products || response.data?.data?.products || [];
      const total = response.data?.pagination?.total || response.data?.data?.pagination?.total || 0;
      const totalPages = response.data?.pagination?.totalPages || response.data?.data?.pagination?.totalPages || Math.ceil(total / 20);

      setTotalCount(total);
      if (pageNum === 1) {
        setProducts(incomingProducts);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNew = incomingProducts.filter(p => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore(pageNum < totalPages && (pageNum * 20 < total));
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to load search results');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // When initialQuery changes, reset and fetch page 1
  useEffect(() => {
    if (initialQuery) {
      pageRef.current = 1;
      fetchSearchResults(1, initialQuery);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [initialQuery, fetchSearchResults]);

  // Infinite scroll callback
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && initialQuery) {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      fetchSearchResults(nextPage, initialQuery);
    }
  }, [loading, loadingMore, hasMore, initialQuery, fetchSearchResults]);

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-[#121a15] rounded-2xl shadow-sm border border-gray-100 dark:border-emerald-950/70 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 pt-2" />
      </div>
    </div>
  );

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Product added to cart');
  };

  return (
    <div className="py-4 lg:py-8 space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Search Results
          </h1>
          {initialQuery && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing results for <span className="font-semibold text-primary-600 dark:text-emerald-400">"{initialQuery}"</span> ({totalCount} items found)
            </p>
          )}
        </div>

        {/* Local Search Input for Refining */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Refine search query..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {!initialQuery ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 dark:text-gray-400">
          <Search className="h-14 w-14 mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">Please enter a search query above</p>
        </div>
      ) : products.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
          <Package className="h-16 w-16 mb-3 text-gray-300 dark:text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Products Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search query.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                image={product.images?.[0]}
                title={product.name}
                description={product.description}
                price={product.price}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
            {loading && (
              Array(8).fill(0).map((_, index) => (
                <ProductSkeleton key={`skeleton-${index}`} />
              ))
            )}
          </div>

          {/* Infinite Scroll Sentinel and Loaders */}
          <div ref={lastElementRef} className="py-8 flex flex-col items-center justify-center min-h-[60px]">
            {loadingMore && (
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white dark:bg-[#121a15] border border-gray-200 dark:border-emerald-950/80 shadow-md">
                <Spinner size="sm" />
                <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-emerald-300">
                  Discovering more items...
                </span>
              </div>
            )}
            {!hasMore && products.length > 0 && !loading && (
              <div className="text-center pt-4">
                <p className="text-xs font-medium tracking-wide uppercase text-gray-400 dark:text-gray-500">
                  — You've seen all {products.length} matching products —
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;