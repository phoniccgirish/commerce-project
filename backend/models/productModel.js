import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    category: { type: String },

    // --- THIS IS THE CHANGE ---
    images: [{ type: String }], // Changed from 'image' to 'images' and is now an array
    // --- END OF CHANGE ---
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
