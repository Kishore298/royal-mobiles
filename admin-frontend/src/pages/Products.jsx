import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: pagination.limit,
          sort: currentSort,
          minPrice: currentMinPrice,
          maxPrice: currentMaxPrice
        };

        const response = await getProducts(params);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (err) {
        setError('Failed to load products');
        console.error('Products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, currentSort, currentMinPrice, currentMaxPrice, pagination.limit]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', e.target.value);
    params.set('page', '1'); // Reset to first page when changing sort
    setSearchParams(params);
  };

  const handlePriceFilter = (e) => {
    const params = new URLSearchParams(searchParams);
    const { name, value } = e.target;
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set('page', '1'); // Reset to first page when changing filters
    setSearchParams(params);
  };

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
    <div className="container mx-auto py-4 lg:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Products</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={currentMinPrice || ''}
              onChange={handlePriceFilter}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-32"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={currentMaxPrice || ''}
              onChange={handlePriceFilter}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-32"
            />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found</p>
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

export default Products; 