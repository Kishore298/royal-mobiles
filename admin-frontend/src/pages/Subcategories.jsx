import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSubcategories, getCategory } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subcategoriesRes, categoryRes] = await Promise.all([
          getSubcategories({ category: categoryId }),
          getCategory(categoryId)
        ]);

        if (subcategoriesRes?.data?.data) {
          setSubcategories(subcategoriesRes.data.data);
        }
        
        if (categoryRes?.data?.data) {
          setCategory(categoryRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        toast.error('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

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

  return (
    <div className="container mx-auto py-4 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          {category && (
            <p className="text-gray-600 mt-1">Category: {category.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory._id}
            image={subcategory.image?.url}
            title={subcategory.name}
            productCount={subcategory.products?.length || 0}
          />
        ))}
      </div>
    </div>
  );
};

export default Subcategories; 