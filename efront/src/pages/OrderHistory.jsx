import React, { useState, useEffect } from "react";
import { viewOrders } from "../services/api"; // Uncommented this import

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function now fetches real data
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await viewOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders(); // Function is now called
  }, []); // Empty array ensures this runs once on mount

  if (loading) {
    return (
      <div className='container mx-auto p-4'>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <p className='text-red-600'>{error}</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>Order History</h1>
      {orders.length === 0 ? (
        <p className='text-gray-600'>You have no past orders.</p>
      ) : (
        <div className='space-y-4'>
          {/* Replaced the hardcoded block with a .map() loop */}
          {orders.map((order) => (
            <div
              key={order._id}
              className='p-4 bg-white shadow rounded-lg border'
            >
              <div className='flex justify-between items-center mb-2'>
                <p className='font-semibold text-lg'>Order ID: #{order._id}</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className='text-gray-600'>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className='text-gray-800 font-bold mt-1'>
                Total: ${order.totalAmount.toFixed(2)}
              </p>
              {/* You can add more details here, like mapping order.products */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
