import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white p-4 shadow rounded-lg animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const SkeletonText = ({ width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

export const SkeletonImage = ({ height = 'h-48' }) => (
  <div className={`${height} bg-gray-200 rounded-lg animate-pulse`}></div>
);

export const SkeletonProductGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonCartItem = () => (
  <div className="flex items-center space-x-4 py-4 animate-pulse">
    <div className="h-24 w-24 bg-gray-200 rounded-lg"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);