import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Use the first image from the 'images' array, with optimization
  let imageUrl = product.images?.[0] || "https://via.placeholder.com/300";
  if (imageUrl.includes("res.cloudinary.com")) {
    imageUrl = imageUrl.replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_fill,w_300,h_300/"
    );
  }

  // --- GET SELLER NAME ---
  // Safely access storeName, provide a fallback
  const sellerName = product.sellerId?.storeName || "Unknown Seller";
  // --- END GET SELLER NAME ---

  return (
    <Link
      to={`/product/${product._id}`}
      className='group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100'
    >
      <div className='relative h-48 w-full overflow-hidden bg-gray-100'>
        <img
          src={imageUrl}
          alt={product.name}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {/* ... (stock badges) ... */}
      </div>
      <div className='p-4'>
        <h2
          className='text-lg font-semibold text-gray-800 mb-1 truncate'
          title={product.name}
        >
          {product.name}
        </h2>
        <p className='text-xl font-bold text-gray-900 mb-1'>₹{product.price}</p>
        <p className='text-sm text-gray-600'>Stock: {product.stock}</p>
        {/* --- DISPLAY SELLER NAME --- */}
        <p className='text-xs text-gray-500 italic mt-1'>
          Sold by: {sellerName}
        </p>
        {/* --- END DISPLAY --- */}
      </div>
    </Link>
  );
};

export default ProductCard;
