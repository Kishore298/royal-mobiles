import React from 'react';

const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'h-12 w-12 rounded-full',
    rectangular: 'h-32 w-full',
    card: 'h-48 w-full rounded-lg',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="p-4 border rounded-lg shadow-sm">
    <Skeleton variant="card" className="mb-4" />
    <div className="space-y-3">
      <Skeleton className="w-3/4" />
      <Skeleton className="w-1/2" />
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="space-y-3">
    <Skeleton className="h-8 w-full" />
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex space-x-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    ))}
  </div>
);

export default Skeleton; 