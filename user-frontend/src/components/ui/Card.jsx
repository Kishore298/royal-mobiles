import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Edit2, Trash2, Image as ImageIcon, Plus, Minus, Check } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-gray-50 dark:bg-[#16221b] flex items-center justify-center`}>
        <ImageIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`relative ${className} bg-gray-50/60 dark:bg-[#152019] overflow-hidden flex items-center justify-center p-2.5`}>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        onError={() => setError(true)}
      />
      {/* Dynamic light sheen traversing on hover */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent skew-x-[-25deg] -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out pointer-events-none" />
    </div>
  );
};

export const CategoryCard = ({ image, title, subCategoryCount, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:border-primary-400/60 dark:hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer flex flex-col group relative overflow-hidden"
    >
      <div className="relative h-28 sm:h-44 md:h-52 w-full rounded-xl overflow-hidden mb-3">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full"
        />
        {subCategoryCount !== undefined && (
          <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-[#0c1410]/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-emerald-950/70 shadow-sm">
            {subCategoryCount} Subcategories
          </span>
        )}
      </div>
      <div className="p-1">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-200">
          <span>Explore collection</span>
          <span>→</span>
        </p>
      </div>
    </motion.div>
  );
};

export const SubcategoryCard = ({ image, title, productCount, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:border-primary-400/60 dark:hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer flex flex-col group relative overflow-hidden"
    >
      <div className="relative h-28 sm:h-44 md:h-52 w-full rounded-xl overflow-hidden mb-3">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full"
        />
        {productCount !== undefined && (
          <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-[#0c1410]/90 backdrop-blur-sm text-primary-700 dark:text-emerald-400 border border-primary-200 dark:border-emerald-950/70 shadow-sm">
            {productCount} Products
          </span>
        )}
      </div>
      <div className="p-1">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-200">
          <span>Browse items</span>
          <span>→</span>
        </p>
      </div>
    </motion.div>
  );
};

export const ProductCard = ({
  image,
  title,
  price,
  onAddToCart,
  onEdit,
  onDelete,
  onQuantityChange,
  quantity,
  stock,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAddWithFeedback = () => {
    if (stock === 0) return;
    onAddToCart && onAddToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const getStockStatus = () => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-bold bg-red-50/90 dark:bg-red-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/40 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />
          Out of Stock
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="inline-flex items-center text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-50/90 dark:bg-amber-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 shadow-sm">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          Only {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/90 dark:bg-emerald-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        In Stock
      </span>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/15 hover:border-primary-400/60 dark:hover:border-emerald-500/50 transition-colors duration-200 flex flex-col h-full group relative overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative h-32 sm:h-48 md:h-52 w-full rounded-xl overflow-hidden mb-3">
        <ImageWithFallback
          src={image?.url || image}
          alt={title}
          className="w-full h-full"
        />
        <div className="absolute top-2 left-2 z-10">
          {getStockStatus()}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow justify-between space-y-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-base sm:text-lg font-extrabold text-primary-600 dark:text-emerald-400">
              ₹{Number(price).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quantity and Add to Cart Section */}
        {onAddToCart && (
          <div className="pt-2 border-t border-gray-100 dark:border-emerald-950/60 space-y-2">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-[#16221b] rounded-xl p-1 border border-gray-200/60 dark:border-emerald-950/60">
              <motion.button
                type="button"
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuantityChange && onQuantityChange(Math.max(1, (quantity || 1) - 1));
                }}
                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-[#111914] rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f3024] active:scale-95 transition-all text-xs font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </motion.button>
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 w-8 text-center select-none">
                {quantity || 1}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.82 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if ((quantity || 1) < stock) {
                    onQuantityChange && onQuantityChange((quantity || 1) + 1);
                  }
                }}
                disabled={(quantity || 1) >= stock}
                className={`w-7 h-7 flex items-center justify-center bg-white dark:bg-[#111914] rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f3024] active:scale-95 transition-all text-xs font-bold ${
                  (quantity || 1) >= stock ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddWithFeedback();
              }}
              disabled={stock === 0}
              className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 flex items-center justify-center space-x-1.5 relative overflow-hidden ${
                stock === 0
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-200 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-emerald-950/60">
            {onEdit && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={onEdit}
                className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={onDelete}
                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
