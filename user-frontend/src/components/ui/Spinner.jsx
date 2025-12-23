import React from 'react';

const Spinner = ({ size = 'md', className = '', showLogo = true }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showLogo && (
        <img
          src="/royal-logo.png"
          alt="Logo"
          className="h-24 w-auto mb-4"
        />
      )}
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner; 