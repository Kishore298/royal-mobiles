import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    navigate(`?${params.toString()}`);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: pagination.limit,
          sort: currentSort,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice
        };

        const response = await searchProducts(query, params);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (err) {
        setError('Failed to load search results');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, currentSort, currentMinPrice, currentMaxPrice, pagination.limit]);

  if (!query) {
    return (
      <div className="container mx-auto py-4 lg:py-8">
        <h1 className="text-3xl font-bold mb-8">Search Results</h1>
        <p className="text-gray-500">Please enter a search query</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found matching your search</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                image={product.images[0]}
                title={product.name}
                description={product.description}
                price={product.price}
                onEdit={() => {
                  // TODO: Implement edit functionality
                  toast.success('Edit product clicked');
                }}
                onDelete={() => {
                  // TODO: Implement delete functionality
                  toast.success('Delete product clicked');
                }}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md ${page === pagination.page
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults; 