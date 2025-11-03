import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubcategoriesByCategory, getCategory } from '../services/api';
import { SubcategoryCard } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FolderTree } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subcategoriesRes, categoryRes] = await Promise.all([
          getSubcategoriesByCategory(categoryId),
          getCategory(categoryId)
        ]);

        if (subcategoriesRes?.data?.data) {
          setSubcategories(subcategoriesRes.data.data);
        } else {
          setError('No subcategories found');
        }

        if (categoryRes?.data?.data) {
          setCategory(categoryRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load subcategories');
        toast.error('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  const handleSubcategoryClick = (subcategoryId) => {
    navigate(`/products/${subcategoryId}`);
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

  if (subcategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <FolderTree className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Subcategories Found</h2>
        <p className="text-center">There are no subcategories available in this category.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subcategories</h1>
        {category && (
          <p className="text-gray-600 mt-2">Category: {category.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory._id}
            image={subcategory.image?.url}
            title={subcategory.name}
            productCount={subcategory.products?.length || 0}
            onClick={() => handleSubcategoryClick(subcategory._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Subcategories; 