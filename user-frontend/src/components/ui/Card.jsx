import React from 'react';
import { ShoppingCart, Edit2, Trash2, Image } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = React.useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <Image className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-cover`}
      onError={() => setError(true)}
    />
  );
};

export const CategoryCard = ({ image, title, subCategoryCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-36 sm:h-48 md:h-64 w-full">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{subCategoryCount} subcategories</p>
      </div>
    </div>
  );
};

export const SubcategoryCard = ({ image, title, productCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-36 sm:h-48 md:h-64 w-full">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{productCount} products</p>
      </div>
    </div>
  );
};

export const ProductCard = ({ image, title, description, price, onAddToCart, onEdit, onDelete, onQuantityChange, quantity, stock }) => {
  const getStockStatus = () => {
    if (stock === 0) {
      return <span className="text-red-600 font-semibold">Out of Stock</span>;
    }
    if (stock < 10) {
      return <span className="text-red-600 font-semibold">Hurry! Only {stock} left</span>;
    }
    return <span className="text-green-600 font-semibold">{stock} in stock</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="relative h-36 sm:h-48 md:h-64 w-full">
        <ImageWithFallback
          src={image?.url || image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 ml-2">{description}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-primary-600">₹{price}</span>
          {onAddToCart && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange && onQuantityChange(quantity - 1);
                }}
                className="w-4 sm:w-8 h-6 sm:h-8 flex items-center justify-center hover:bg-gray-200 rounded-md transition-colors"
              >
                -
              </button>
              <span className="w-4 sm:w-8 text-center font-medium">{quantity || 1}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange && onQuantityChange(quantity + 1);
                }}
                className="w-4 sm:w-8 h-6 sm:h-8 flex items-center justify-center hover:bg-gray-200 rounded-md transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="mb-2">
          {getStockStatus()}
        </div>
        
        {onAddToCart && (
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={stock === 0}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors duration-300 ${
                stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        )}
        
        {(onEdit || onDelete) && (
          <div className="flex justify-end space-x-2 mt-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-300"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-600 hover:text-red-600 transition-colors duration-300"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Cards = {
  CategoryCard,
  SubcategoryCard,
  ProductCard
};

export default Cards; 