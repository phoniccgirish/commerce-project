import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // 1. Import useAuth
import { loginUser } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { loginAction } = useAuth(); // 2. Get loginAction from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await loginUser({ email, password });

      // 3. Call loginAction with the user data
      loginAction(data);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className='max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg'>
      <h1 className='text-2xl font-bold text-center mb-6'>Login</h1>

      {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label className='block text-gray-700 mb-2'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full px-3 py-2 border rounded-lg'
            required
          />
        </div>
        <div className='mb-6'>
          <label className='block text-gray-700 mb-2'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-2 border rounded-lg'
            required
          />
        </div>
        <button
          type='submit'
          className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700'
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
