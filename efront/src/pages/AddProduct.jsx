import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../services/api";
import { toast } from "react-toastify"; // ✅ Import toast

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  // const [error, setError] = useState(null); // 👈 Removed error state
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.warn("You can upload a maximum of 10 images."); // ✅ Use toast
      return;
    }
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    // setError(null); // 👈 Removed
  };

  // Revoke object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !stock || !category) {
      toast.warn("Please fill all fields."); // ✅ Use toast
      return;
    }
    if (images.length === 0) {
      toast.warn("Please upload at least one image."); // ✅ Use toast
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("category", category);
    images.forEach((img) => formData.append("images", img));

    try {
      await addProduct(formData);
      toast.success("Product added successfully!"); // ✅ Use toast
      setName("");
      setPrice("");
      setDescription("");
      setStock("");
      setCategory("");
      setImages([]);
      setImagePreviews([]);
      navigate("/seller/dashboard");
    } catch (err) {
      console.error("Failed to add product:", err);
      toast.error("Failed to add product. Please try again."); // ✅ Use toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg'>
      <h1 className='text-3xl font-bold text-center mb-6'>Add New Product</h1>

      {/* 👈 Removed error display paragraph */}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg'
          required
        />
        <input
          type='number'
          placeholder='Price'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg'
          required
        />
        <textarea
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg'
          rows='4'
          required
        />
        <input
          type='number'
          placeholder='Stock'
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg'
          required
        />
        <input
          type='text'
          placeholder='Category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg'
          required
        />

        <input
          type='file'
          accept='image/*'
          multiple
          onChange={handleImageChange}
          className='w-full'
        />

        {imagePreviews.length > 0 && (
          <div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
            {imagePreviews.map((preview, idx) => (
              <img
                key={idx}
                src={preview}
                alt={`Preview ${idx + 1}`}
                className='h-24 w-24 object-cover rounded-lg'
              />
            ))}
          </div>
        )}

        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded-lg'
          disabled={loading}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
