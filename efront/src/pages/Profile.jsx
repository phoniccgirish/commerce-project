import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion"; // 👈 We don't need this anymore
import { toast } from "react-toastify"; // 👈 Import toast
import { useAuth } from "../context/AuthContext";
import { updateUserAddress } from "../services/api";

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [address, setAddress] = useState({ street: "", city: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  // const [alert, setAlert] = useState(null); // 👈 Removed

  useEffect(() => {
    if (user && user.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: updatedUser } = await updateUserAddress(address);
      updateUserState(updatedUser);

      // ✅ Show success toast
      toast.success("Address updated successfully!");
    } catch (err) {
      console.error("Failed to update address:", err);
      // ✅ Show error toast
      toast.error("Failed to update address. Please try again.");
    } finally {
      setLoading(false);

      // 👇 We don't need this anymore, react-toastify handles it
      // setTimeout(() => setAlert(null), 3000);
    }
  };

  if (!user) {
    return <p className='text-center p-10'>Loading profile...</p>;
  }

  return (
    <div className='container mx-auto p-4 max-w-lg relative'>
      <h1 className='text-3xl font-bold mb-6'>My Profile</h1>

      {/* 👇 The entire AnimatePresence block is no longer needed */}
      {/* <AnimatePresence> ... </AnimatePresence> */}

      <div className='bg-white p-6 shadow rounded-lg mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Account Details</h2>
        <p>
          <span className='font-medium'>Name:</span> {user.name}
        </p>
        <p>
          <span className='font-medium'>Email:</span> {user.email}
        </p>
        <p>
          <span className='font-medium'>Role:</span> {user.role}
        </p>
      </div>

      <div className='bg-white p-6 shadow rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>Shipping Address</h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* ...your form inputs (no changes here) ... */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Street
            </label>
            <input
              type='text'
              name='street'
              value={address.street || ""}
              onChange={handleChange}
              required
              className='mt-1 block w-full px-3 py-2 border rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              City
            </label>
            <input
              type='text'
              name='city'
              value={address.city || ""}
              onChange={handleChange}
              required
              className='mt-1 block w-full px-3 py-2 border rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Pincode
            </label>
            <input
              type='text'
              name='pincode'
              value={address.pincode || ""}
              onChange={handleChange}
              required
              className='mt-1 block w-full px-3 py-2 border rounded-md'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400'
          >
            {loading ? "Saving..." : "Update Address"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
