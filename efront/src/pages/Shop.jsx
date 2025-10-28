// frontend/src/pages/Shop.jsx (Corrected Imports)
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
// --- Correct Import Paths ---
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton"; // This will now resolve
// --- End Correction ---
import { motion } from "framer-motion";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await fetchProducts(category);
      setProducts(productsData);
    } catch (err) {
      console.error(`Error loading products (category: ${category}):`, err);
      setError(
        err.response?.data?.message || err.message || "Failed to load products."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className='text-center py-10'>
          <p className='text-red-600 font-semibold mb-4'>{error}</p>
          <button
            onClick={loadProducts}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
          >
            Retry
          </button>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className='text-center py-10'>
          <h2 className='text-2xl font-semibold text-gray-500'>
            {category
              ? `No products found in ${category}`
              : "No products found."}
          </h2>
        </div>
      );
    }
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product) => (
          <motion.div
            key={product._id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {" "}
            {/* Simpler hover */}
            <ProductCard product={product} />{" "}
            {/* Use your ProductCard component */}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className='container mx-auto p-4 min-h-[calc(100vh-200px)]'>
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-2'>
        <h1 className='text-3xl font-bold text-gray-800'>
          {category
            ? `Shop: ${category.charAt(0).toUpperCase() + category.slice(1)}`
            : "Shop All Products"}
        </h1>
        {category && (
          <Link
            to='/shop'
            className='text-blue-600 hover:underline text-sm font-medium'
          >
            View All Products
          </Link>
        )}
      </div>
      {renderContent()}
    </div>
  );
}

export default Shop;
