import mongoose from "mongoose";

// Schema based on guide
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // [cite: 28]
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }, // [cite: 28]
  products: [
    // [cite: 28]
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
      price: { type: Number },
    },
  ],
  totalAmount: { type: Number, required: true }, // [cite: 28]
  status: { type: String, default: "Pending" }, // [cite: 28]
  paymentStatus: { type: String, default: "Pending" }, // [cite: 28]
  shippingAddress: { type: Object }, // [cite: 28]
  createdAt: { type: Date, default: Date.now }, // [cite: 28]
});

export default mongoose.model("Order", orderSchema);
