import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-500 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;