import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Ensure sendOtp and verifyOtpAndRegister are imported correctly
import { sendOtp, verifyOtpAndRegister } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; // Make sure react-toastify is set up

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email/Role, 2: Details+OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    role: "Customer",
    storeName: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // Call the exported sendOtp function from api.js
      await sendOtp({ email: formData.email, role: formData.role });
      // --- END FIX ---
      toast.success("OTP sent to your email!");
      setStep(2); // Move to next step
    } catch (error) {
      console.error("Send OTP failed:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP & Register ---
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call the exported verifyOtpAndRegister function
      const userData = await verifyOtpAndRegister(formData);
      toast.success("Registration successful!");
      loginAction(userData); // Log the user in
      // Redirect is handled by loginAction
    } catch (error) {
      console.error("Verify OTP / Register failed:", error);
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- JSX for the form steps ---
  return (
    <div className='max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-lg border border-gray-100'>
      <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>
        Register
      </h1>

      {/* Step 1 Form: Enter Email & Role */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className='space-y-6'>
          {/* Role Select */}
          <div>
            <label className='block text-gray-700 mb-2 font-medium'>
              I am a
            </label>
            <select
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value='Customer'>Customer</option>
              <option value='Seller'>Seller</option>
            </select>
          </div>
          {/* Email Input */}
          <div>
            <label className='block text-gray-700 mb-2 font-medium'>
              Email Address
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              required
              placeholder='you@example.com'
            />
          </div>
          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center'
          >
            {loading
              ? // Simple loading text, add spinner if preferred
                "Sending..."
              : "Send Verification Code"}
          </button>
        </form>
      )}

      {/* Step 2 Form: Enter Details & OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className='space-y-6'>
          <p className='text-sm text-center text-gray-600 -mt-4 mb-4'>
            An OTP has been sent to <strong>{formData.email}</strong>. Enter it
            below along with your details.
          </p>
          {/* Name Input */}
          <div>
            <label className='block text-gray-700 mb-2 font-medium'>
              Full Name
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>
          {/* Store Name Input (Conditional) */}
          {formData.role === "Seller" && (
            <div>
              <label className='block text-gray-700 mb-2 font-medium'>
                Store Name
              </label>
              <input
                type='text'
                name='storeName'
                value={formData.storeName}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                required
              />
            </div>
          )}
          {/* Password Input */}
          <div>
            <label className='block text-gray-700 mb-2 font-medium'>
              Password (min 6 characters)
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              required
              minLength='6'
            />
          </div>
          {/* OTP Input */}
          <div>
            <label className='block text-gray-700 mb-2 font-medium'>
              Verification Code (OTP)
            </label>
            <input
              type='text'
              name='otp'
              value={formData.otp}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg tracking-widest text-center text-lg font-semibold' // Style for OTP
              required
              maxLength='6'
              placeholder='Enter 6-digit code'
            />
          </div>
          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex justify-center items-center'
          >
            {loading
              ? // Simple loading text
                "Verifying..."
              : "Verify & Register"}
          </button>
          {/* Go Back Button */}
          <button
            type='button'
            onClick={() => setStep(1)}
            disabled={loading}
            className='w-full text-sm text-center text-gray-600 hover:underline mt-2 disabled:opacity-50'
          >
            Go Back / Change Email?
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
//  fix this
