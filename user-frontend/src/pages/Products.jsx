import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductsBySubcategory, getSubcategory } from '../services/api';
import { ProductCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const Products = () => {
  const { subcategoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, subcategoryRes] = await Promise.all([
          getProductsBySubcategory(subcategoryId),
          getSubcategory(subcategoryId)
        ]);

        console.log('Products response:', productsRes);
        console.log('Subcategory response:', subcategoryRes);

        // Check if products data exists in the correct structure
        if (productsRes?.data?.data?.products && Array.isArray(productsRes.data.data.products)) {
          setProducts(productsRes.data.data.products);
        } else {
          console.error('Products data is not in expected format:', productsRes);
          setProducts([]); // Set to empty array if data is not in expected format
          setError('No products found');
        }

        if (subcategoryRes?.data?.data) {
          setSubcategory(subcategoryRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch products');
        toast.error('Failed to fetch products');
        setProducts([]); // Ensure products is always an array
      } finally {
        setLoading(false);
      }
    };

    if (subcategoryId) {
      fetchData();
    }
  }, [subcategoryId]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Package className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
        <p className="text-center">There are no products available in this subcategory.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        {subcategory && (
          <p className="text-gray-600 mt-2">Subcategory: {subcategory.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            image={product.images?.[0] || { url: '' }}
            title={product.name}
            description={product.description}
            price={product.price}
            stock={product.stock}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default Products; 