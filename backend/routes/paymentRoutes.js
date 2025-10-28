import express from "express";
import {
  processPayment,
  verifyPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateCheckout,
  validatePaymentVerification,
} from "../middleware/validationMiddleware.js"; // Import validators

const router = express.Router();

router.post("/checkout", protect, validateCheckout, processPayment); // Added validation
router.post("/verify", protect, validatePaymentVerification, verifyPayment); // Added validation

export default router;
