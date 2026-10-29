import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { Package, Search as SearchIcon, Sparkles } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputQuery, setInputQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();

  const popularSearches = [
    'iPhone 15 Case',
    'Fast Charger',
    'Tempered Glass',
    'AirPods Cover',
    'USB-C Cable',
    'Power Bank',
  ];

  const fetchSearchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchProducts(searchTerm.trim());
      if (response?.data?.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setInputQuery(query);
    if (query) {
      fetchSearchResults(query);
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [query, fetchSearchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim() });
    }
  };

  const handleTagClick = (tag) => {
    setInputQuery(tag);
    setSearchParams({ q: tag });
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Search Header Form */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Search Accessories
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Find covers, adapters, audio gear, and screen protectors
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Search by model, accessory type, color..."
            className="w-full pl-11 pr-24 py-3 sm:py-3.5 rounded-2xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-md transition-all"
          />
          <SearchIcon className="absolute left-4 top-3.5 sm:top-4 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 sm:top-2.5 px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Popular:
          </span>
          {popularSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-[#141f18] text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-emerald-400 border border-gray-200/80 dark:border-emerald-950/70 shadow-sm transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      ) : query && products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm max-w-lg mx-auto">
          <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            No Results for "{query}"
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            We couldn't find any products matching your search. Try different keywords or browse our categories.
          </p>
        </div>
      ) : query && products.length > 0 ? (
        <div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Found <span className="font-extrabold text-primary-600 dark:text-emerald-400">{products.length}</span> results for "{query}"
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                image={product.images?.[0] || { url: '' }}
                title={product.name}
                description={product.description}
                price={product.price}
                stock={product.stock}
                quantity={quantities[product._id] || 1}
                onQuantityChange={(q) => handleQuantityChange(product._id, q)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Search;