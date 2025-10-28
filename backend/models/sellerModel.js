import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      // FIX: Using structured address for consistency
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
