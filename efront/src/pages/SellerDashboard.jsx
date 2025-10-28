import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSellerProducts, deleteProduct } from "../services/api";
import { toast } from "react-toastify"; // ✅ Import toast
import { useAuth } from "../context/AuthContext";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // const [error, setError] = useState(null); // 👈 Removed error state
  const navigate = useNavigate();
  const { user } = useAuth();

  // 2. Function to load this seller's products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getSellerProducts();
      setProducts(data);
      // setError(null); // 👈 Removed
    } catch (err) {
      console.error("Failed to fetch seller products:", err);
      toast.error("Failed to load products."); // ✅ Use toast
    } finally {
      setLoading(false);
    }
  };

  // 3. Load products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // 4. Handle the delete button click
  const handleDelete = async (productId) => {
    // Note: window.confirm is different from alert. We can change this next.
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        // Remove the product from the state to update the UI instantly
        setProducts(products.filter((p) => p._id !== productId));
        toast.success("Product deleted successfully"); // ✅ Use toast
      } catch (err) {
        console.error("Failed to delete product:", err);
        toast.error("Failed to delete product."); // ✅ Use toast
      }
    }
  };

  // 5. Handle the edit button click
  const handleEdit = (productId) => {
    navigate(`/seller/product/edit/${productId}`);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        {user && user.role === "Seller" && (
          <h1 className='text-3xl font-bold'>
            Seller Dashboard, {user.storeName}{" "}
            {/* CORRECT & Simpler: Variable inside curly braces */}
          </h1>
        )}
        <Link
          to='/seller/product/new'
          className='bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 inline-block w-full sm:w-auto text-center'
        >
          + Add New Product
        </Link>
      </div>

      {/* Product List Section */}
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Manage My Products</h2>
        {loading && <p>Loading your products...</p>}
        {/* 👈 Removed error display paragraph */}

        <div className='space-y-4'>
          {products.length === 0 && !loading && (
            <p className='text-gray-500'>
              You have not added any products yet.
            </p>
          )}

          {/* 6. Map over the products and display them */}
          {products.map((product) => (
            <div
              key={product._id}
              className='flex flex-col sm:flex-row items-center bg-white p-4 shadow rounded-lg'
            >
              {/* ... (product display logic remains the same) ... */}
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "https://via.placeholder.com/100"
                }
                alt={product.name}
                className='w-24 h-24 object-cover rounded mr-0 sm:mr-4 mb-4 sm:mb-0'
              />
              <div className='flex-1 text-center sm:text-left'>
                <h3 className='text-lg font-semibold'>{product.name}</h3>
                <p className='text-gray-700'>₹{product.price}</p>
                <p className='text-sm text-gray-500'>Stock: {product.stock}</p>
              </div>
              <div className='flex space-x-2 mt-4 sm:mt-0'>
                <button
                  onClick={() => handleEdit(product._id)}
                  className='bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600 text-sm'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className='bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 text-sm'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
