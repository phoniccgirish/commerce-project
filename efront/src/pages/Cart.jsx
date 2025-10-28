import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createRazorpayOrder,
  verifyPayment,
  updateUserAddress,
} from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import AlertBox from "../components/AlertBox.jsx";

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    pincode: "",
  });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Load saved user address
  useEffect(() => {
    if (user && user.address) setShippingAddress(user.address);
  }, [user]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 4000); // auto hide after 4 sec
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    setLoadingAddress(true);
    try {
      const res = await updateUserAddress(shippingAddress);
      updateUserState(res.data);
      showAlert("success", "Address saved successfully!");
    } catch (err) {
      console.error("Address update failed:", err);
      showAlert("error", "Failed to save address.");
    } finally {
      setLoadingAddress(false);
    }
  };

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  const checkoutHandler = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.pincode.trim()
    ) {
      showAlert("error", "Please fill in all shipping address fields.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await createRazorpayOrder({ amount: totalAmount });
      const order = res.data.order;

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RYnEGL5YU2c53r";

      if (!window.Razorpay) {
        showAlert("error", "Razorpay SDK not loaded.");
        setCheckoutLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "E-Commerce Store",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          const verificationData = {
            ...response,
            totalAmount,
            cartItems,
            shippingAddress,
          };
          try {
            const verifyRes = await verifyPayment(verificationData);
            if (verifyRes.data.success) {
              showAlert("success", "Payment successful!");
              clearCart();
              navigate("/orders");
            } else {
              showAlert("error", "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            showAlert("error", "Payment verification failed.");
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout failed:", error);
      showAlert("error", "Checkout failed. Try again.");
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className='container mx-auto p-8 text-center'>
        <h2 className='text-2xl font-semibold mb-4'>Your cart is empty 🛒</h2>
        <Link
          to='/'
          className='text-blue-600 hover:underline font-medium text-lg'
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      {/* Alert Box */}
      <AlertBox
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <h1 className='text-3xl font-bold mb-6'>Shopping Cart</h1>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Left: Address + Cart Items */}
        <div className='lg:w-2/3 space-y-6'>
          {/* Address Form */}
          <div className='bg-white p-6 shadow rounded-lg'>
            <h2 className='text-2xl font-semibold mb-4'>Shipping Address</h2>
            <form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Street
                </label>
                <input
                  type='text'
                  name='street'
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
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
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
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
                  value={shippingAddress.pincode}
                  onChange={handleAddressChange}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <button
                type='button'
                onClick={handleSaveAddress}
                disabled={loadingAddress}
                className='w-full text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-50 disabled:opacity-50'
              >
                {loadingAddress ? "Saving..." : "Save Address to Profile"}
              </button>
            </form>
          </div>

          {/* Cart Items */}
          <div className='space-y-4'>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className='flex items-center justify-between bg-white p-4 shadow rounded-lg'
              >
                <div className='flex items-center space-x-4'>
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className='w-20 h-20 object-cover rounded'
                  />
                  <div>
                    <h3 className='font-semibold text-lg'>{item.name}</h3>
                    <p className='text-gray-600'>₹{item.price}</p>
                    <div className='flex items-center mt-2 space-x-3'>
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                        className='px-2 py-1 border rounded'
                      >
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => increaseQuantity(item._id)}
                        className='px-2 py-1 border rounded'
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className='text-red-500 hover:underline'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className='lg:w-1/3'>
          <div className='bg-white p-6 shadow rounded-lg sticky top-24'>
            <h2 className='text-2xl font-semibold mb-4'>Order Summary</h2>
            <div className='flex justify-between mb-2'>
              <span>Subtotal:</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className='flex justify-between mb-4'>
              <span>Shipping:</span>
              <span>₹0</span>
            </div>
            <div className='flex justify-between font-semibold text-lg mb-4'>
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>
            <button
              onClick={checkoutHandler}
              disabled={checkoutLoading}
              className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400'
            >
              {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
