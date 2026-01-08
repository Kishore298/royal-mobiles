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
    <div className={`relative ${className} bg-white overflow-hidden flex items-center justify-center p-2`}>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
};

export const CategoryCard = ({ image, title, subCategoryCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-24 sm:h-48 md:h-64 w-full">
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
      <div className="relative h-24 sm:h-48 md:h-64 w-full">
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
      return <span className="text-[10px] sm:text-xs text-red-500 font-medium">Out of Stock</span>;
    }
    if (stock < 10) {
      return <span className="text-[10px] sm:text-xs text-orange-500 font-medium whitespace-nowrap">Only {stock} left</span>;
    }
    return <span className="text-[10px] sm:text-xs text-green-500 font-medium">In Stock</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 flex flex-col h-full">
      <div className="relative h-32 sm:h-48 md:h-56 w-full flex-shrink-0 bg-gray-50">
        <ImageWithFallback
          src={image?.url || image}
          alt={title}
          className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-2 sm:p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xs sm:text-base font-medium text-gray-900 leading-tight mb-1 overflow-hidden">
            {title}
          </h3>
          <div className="mb-1 sm:mb-2">
            <span className="text-sm sm:text-lg font-bold text-gray-900">₹{price}</span>
          </div>
        </div>

        {getStockStatus()}

        {onAddToCart && (
          <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50">
            {/* Quantity and Add to Cart Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuantityChange && onQuantityChange(quantity - 1);
                  }}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 text-gray-600"
                >
                  -
                </button>
                <span className="text-sm font-medium w-6 text-center">{quantity || 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (quantity < stock) {
                      onQuantityChange && onQuantityChange(quantity + 1);
                    }
                  }}
                  disabled={quantity >= stock}
                  className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 text-gray-600 ${quantity >= stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  +
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                disabled={stock === 0}
                className={`w-full py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium shadow-sm transition-all duration-300 active:scale-95 ${stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                  }`}
              >
                {stock === 0 ? 'No Stock' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-50">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-600 hover:text-red-600 transition-colors duration-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

