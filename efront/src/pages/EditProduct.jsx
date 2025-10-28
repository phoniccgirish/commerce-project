import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, updateProduct } from "../services/api";
import { toast } from "react-toastify"; // ✅ Import toast

const EditProduct = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    category: "",
  });
  const [existingImages, setExistingImages] = useState([]); // To display current images
  const [newImages, setNewImages] = useState([]); // For new file uploads
  const [newImagePreviews, setNewImagePreviews] = useState([]); // For new image previews
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null); // 👈 Removed error state

  // 1. Fetch existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const { data } = await fetchProductById(id);
        // Populate the form with existing data
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
          category: data.category,
        });
        setExistingImages(data.images || []);
        // setError(null); // 👈 Removed
      } catch (err) {
        console.error("Failed to fetch product:", err);
        toast.error("Failed to load product data."); // ✅ Use toast
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  // 2. Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 3. Handle new image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      toast.warn("You can only upload a maximum of 10 images."); // ✅ Use toast
      return;
    }

    setNewImages(files); // Store the file objects
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(previews); // Store the preview URLs
    // setError(null); // 👈 Removed
  };

  // 4. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(null); // 👈 Removed

    const dataToSend = new FormData();
    // Append all text data
    dataToSend.append("name", formData.name);
    dataToSend.append("price", formData.price);
    dataToSend.append("description", formData.description);
    dataToSend.append("stock", formData.stock);
    dataToSend.append("category", formData.category);

    // Only append new images if the user selected some
    if (newImages.length > 0) {
      newImages.forEach((image) => {
        dataToSend.append("images", image);
      });
    }

    try {
      // Call the update API
      await updateProduct(id, dataToSend);
      setLoading(false);
      toast.success("Product updated successfully!"); // ✅ Use toast
      navigate("/seller/dashboard"); // Go back to dashboard
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Failed to update product. Please try again."); // ✅ Use toast
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <p className='text-center p-10'>Loading product details...</p>;
  }

  return (
    <div className='max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg'>
      <h1 className='text-3xl font-bold text-center mb-6'>Edit Product</h1>

      {/* 👈 Removed error display paragraph */}

      {/* --- Display Existing Images --- */}
      {existingImages.length > 0 && newImagePreviews.length === 0 && (
        <div className='mb-4'>
          {/* ... (no changes in this block) ... */}
          <label className='block text-gray-700 mb-2'>Current Images</label>
          <div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
            {existingImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Current product ${index + 1}`}
                className='h-24 w-24 object-cover rounded-lg'
              />
            ))}
          </div>
        </div>
      )}

      {/* --- Display New Image Previews --- */}
      {newImagePreviews.length > 0 && (
        <div className='mb-4'>
          {/* ... (no changes in this block) ... */}
          <label className='block text-gray-700 mb-2'>
            New Images (Will Replace Old)
          </label>
          <div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
            {newImagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`New preview ${index + 1}`}
                className='h-24 w-24 object-cover rounded-lg'
              />
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* ... (no changes to form inputs) ... */}
        <div>
          <label className='block text-gray-700 mb-2'>Product Name</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='w-full px-3 py-2 border rounded-lg'
            required
          />
        </div>
        <div>
          <label className='block text-gray-700 mb-2'>Price</label>
          <input
            type='number'
            name='price'
            value={formData.price}
            onChange={handleChange}
            className='w-full px-3 py-2 border rounded-lg'
            required
          />
        </div>
        <div>
          <label className='block text-gray-700 mb-2'>Description</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            className='w-full px-3 py-2 border rounded-lg'
            rows='4'
          />
        </div>
        <div>
          <label className='block text-gray-700 mb-2'>Stock Quantity</label>
          <input
            type='number'
            name='stock'
            value={formData.stock}
            onChange={handleChange}
            className='w-full px-3 py-2 border rounded-lg'
            required
          />
        </div>
        <div>
          <label className='block text-gray-700 mb-2'>Category</label>
          <input
            type='text'
            name='category'
            value={formData.category}
            onChange={handleChange}
            className='w-full px-3 py-2 border rounded-lg'
          />
        </div>

        {/* --- New Image Upload --- */}
        <div>
          <label className='block text-gray-700 mb-2'>
            Upload New Images (Optional: Replaces all old images)
          </label>
          <input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageChange}
            className='w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100'
          />
        </div>

        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400'
          disabled={loading}
        >
          {loading ? "Updating Product..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
