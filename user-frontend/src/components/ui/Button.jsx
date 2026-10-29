import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus:ring-primary-500',
    secondary: 'bg-gray-100 dark:bg-[#16221b] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1c2e23] focus:ring-gray-500',
    outline: 'border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#18241d] focus:ring-primary-500 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm shadow-red-500/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${(disabled || isLoading) ? disabledClasses : ''}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;