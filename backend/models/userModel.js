import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: {
      type: String,
      required: false, // Made optional for Google/Social login
    },
    role: {
      type: String,
      required: true,
      default: "Customer",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    // --- New Fields ---
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    // --- End New Fields ---
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
