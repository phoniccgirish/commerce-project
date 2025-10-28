import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { cartItems, addToCart } = useCart();
  const { id } = useParams();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) {
    return (
      <div className='flex justify-center items-center h-screen text-gray-500 text-lg'>
        Loading product details...
      </div>
    );
  }

  const handleAddToCart = () => addToCart(product, 1);

  const itemInCart = cartItems.find((item) => item._id === product._id);
  const currentQuantityInCart = itemInCart ? itemInCart.qty : 0;
  const isOutOfStock = product.stock <= 0;
  const isCartMaxed = currentQuantityInCart >= product.stock;

  const images =
    product.images?.length > 0
      ? product.images
      : ["https://via.placeholder.com/600x400?text=No+Image"];

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4 md:px-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className='max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100'>
        <div className='flex flex-col md:flex-row'>
          {/* LEFT SECTION: Image Gallery */}
          <div className='md:w-1/2 bg-gray-100 p-6 flex flex-col items-center'>
            <div className='relative w-full h-96 rounded-2xl overflow-hidden shadow-md mb-5'>
              <AnimatePresence mode='wait'>
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  className='w-full h-full object-cover'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <div className='flex justify-center space-x-3 overflow-x-auto'>
                {images.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedImage
                        ? "border-blue-600 shadow-lg"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${index}`}
                      className='w-full h-full object-cover'
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SECTION: Product Info */}
          <div className='md:w-1/2 p-8 flex flex-col justify-center'>
            <motion.h1
              className='text-3xl md:text-4xl font-extrabold text-gray-900 mb-3'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {product.name}
            </motion.h1>

            <p className='text-sm text-gray-500 mb-2'>
              Sold by:{" "}
              <span className='font-medium text-gray-700'>
                {product.sellerId?.storeName || "Unknown Seller"}
              </span>
            </p>

            <p className='text-4xl font-bold text-blue-700 mb-4'>
              ₹{product.price}
            </p>

            {isOutOfStock ? (
              <p className='text-red-600 font-semibold mb-4'>Out of Stock</p>
            ) : (
              <p className='text-gray-600 mb-4'>
                Stock available: {product.stock}
              </p>
            )}

            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Description
            </h2>
            <p className='text-gray-700 leading-relaxed mb-6'>
              {product.description || "No description available."}
            </p>

            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isCartMaxed}
              whileHover={
                !(isOutOfStock || isCartMaxed)
                  ? { scale: 1.05, boxShadow: "0px 8px 15px rgba(0,0,0,0.1)" }
                  : {}
              }
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition-all shadow-md ${
                isOutOfStock || isCartMaxed
                  ? "bg-gray-400 cursor-not-allowed text-gray-100"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isCartMaxed
                ? "All Stock in Cart"
                : "Add to Cart"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
