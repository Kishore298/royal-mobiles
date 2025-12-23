import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import { toast } from 'react-hot-toast';
import { Package } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();

  const fetchSearchResults = useCallback(async () => {
    if (!query) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await searchProducts(query);

      // Handle the updated response structure
      if (response?.data?.data) {
        setProducts(response.data.data);
      } else {
        console.error('Unexpected API response structure:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-4 lg:py-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Search Products</h1>
        <p className="text-gray-800">Please enter a search query to search products of your wish</p>
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>

      {!products || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="w-24 h-24 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500 text-center max-w-md">
            We couldn't find any products matching your search. Try different keywords or browse our categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              image={product.images[0]}
              title={product.name}
              description={product.description}
              price={product.price}
              quantity={quantities[product._id] || 1}
              onQuantityChange={(newQuantity) => handleQuantityChange(product._id, newQuantity)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;