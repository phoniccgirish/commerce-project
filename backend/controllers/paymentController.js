import { instance } from "../config/razorpay.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import crypto from "crypto";

// Create Razorpay order
export const processPayment = async (req, res) => {
  // ... (no changes here)
  const { amount } = req.body;
  try {
    const options = { amount: Number(amount * 100), currency: "INR" };
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Verify payment and save order
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartItems,
    totalAmount,
    shippingAddress, // Now receiving this from frontend
  } = req.body;

  try {
    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // 2. Reduce Stock
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (product) {
        // Ensure stock doesn't go below zero (though frontend should prevent this)
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    // 3. Create Order using the REAL address
    await Order.create({
      userId: req.user._id,
      products: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.qty,
        price: item.price,
        name: item.name, // Good to store name/image at time of order
        image: item.images ? item.images[0] : "",
      })),
      totalAmount,
      shippingAddress, // Use the address sent from the cart
      paymentStatus: "Paid",
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    res.status(200).json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};
