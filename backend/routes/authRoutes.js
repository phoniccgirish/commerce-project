import express from "express";
import {
  sendOtp,
  verifyOtpAndRegister,
  login,
  googleLogin,
  getUserProfile,
  updateUserAddress,
  getAuthStatus,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateLogin,
  validateAddress,
  // 1. Add specific validators for OTP steps
  validateSendOtp,
  validateVerifyAndRegister,
} from "../middleware/validationMiddleware.js"; // Assume these new validators exist

const router = express.Router();

// --- OTP Registration ---
// Step 1: Validate email/role and send OTP
router.post("/send-otp", validateSendOtp, sendOtp);

// Step 2: Validate all user data, password, and OTP
router.post(
  "/verify-otp-register",
  validateVerifyAndRegister,
  verifyOtpAndRegister
);

// --- Standard Login ---
router.post("/login", validateLogin, login);

// --- Google Login ---
router.post("/google", googleLogin);

// --- Auth Status & Profile ---
router.get("/status", protect, getAuthStatus);
router.get("/profile", protect, getUserProfile);
router.put("/profile/address", protect, validateAddress, updateUserAddress);

export default router;
