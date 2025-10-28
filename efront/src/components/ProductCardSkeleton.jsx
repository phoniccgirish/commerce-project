// frontend/src/components/ProductCardSkeleton.jsx
import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className='border rounded-lg shadow-lg overflow-hidden bg-white animate-pulse'>
      {/* Image Placeholder */}
      <div className='h-48 w-full bg-gray-300'></div>
      {/* Text Placeholders */}
      <div className='p-4 space-y-3'>
        <div className='h-5 bg-gray-300 rounded w-3/4'></div> {/* Name */}
        <div className='h-5 bg-gray-300 rounded w-1/4'></div> {/* Price */}
        <div className='h-4 bg-gray-300 rounded w-1/3'></div> {/* Stock */}
        <div className='h-4 bg-gray-300 rounded w-1/2'></div> {/* Seller */}
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
