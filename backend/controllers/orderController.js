import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import sendEmail from "../utils/sendEmail.js";
// Import Razorpay instance [cite: 49]
import { instance } from "../config/razorpay.js";

// @desc    Create a new order
// @route   POST /api/orders
export const placeOrder = async (req, res) => {
  const { orderItems, shippingAddress, totalAmount, paymentMethod } = req.body;

  // This is a simplified version. A real app would:
  // 1. Create a Razorpay order ID [cite: 50]
  // 2. Send order ID to frontend
  // 3. Frontend opens Razorpay checkout
  // 4. On payment success, frontend sends payment_id [cite: 51]
  // 5. A separate '/api/orders/verify-payment' route would then create the order in the DB [cite: 52]

  try {
    // Simplified: Create order directly
    const order = new Order({
      userId: req.user._id, // From authMiddleware
      products: orderItems.map((item) => ({
        productId: item._id,
        quantity: item.qty,
        price: item.price,
        // sellerId: ... // Need to get sellerId from product
      })),
      totalAmount,
      shippingAddress,
      paymentStatus: "Paid", // Assuming payment success for this demo
      // ... other fields
    });

    const createdOrder = await order.save();

    // Send email notifications [cite: 55, 56]
    // await sendEmail(req.user.email, 'Order Placed', `Your order ${createdOrder._id} has been placed.`);
    // await sendEmail(sellerEmail, 'New Order', `You have a new order ${createdOrder._id}.`);

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
export const viewOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order && order.userId.toString() === req.user._id.toString()) {
      order.status = "Cancelled";
      const updatedOrder = await order.save();

      // Send cancellation email [cite: 57, 67]
      // await sendEmail(req.user.email, 'Order Cancelled', `Your order ${order._id} has been cancelled.`);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found or not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
