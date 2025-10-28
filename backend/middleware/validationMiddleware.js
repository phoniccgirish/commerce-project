import { body, validationResult } from "express-validator";

// Middleware to run the validation check
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // Return only the first error message for simplicity
  return res
    .status(400)
    .json({ message: errors.array({ onlyFirstError: true })[0].msg });
};

// --- OTP STEP 1 VALIDATION (Send Email/Role) ---
export const validateSendOtp = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required to send OTP."),
  body("role")
    .optional()
    .isIn(["Customer", "Seller"])
    .withMessage("Invalid role specified."),
  validate,
];

// --- OTP STEP 2 VALIDATION (Verify OTP & Register Final Details) ---
export const validateVerifyAndRegister = [
  // Required fields for account creation
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().normalizeEmail().withMessage("Email must be valid."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits."),

  // Conditional validation for Store Name
  body("storeName")
    .if(body("role").equals("Seller"))
    .notEmpty()
    .withMessage("Store name is required for sellers."),
  validate,
];

// --- AUTH & LOGIN ---

// Note: This validateRegister block is largely redundant if the app only uses OTP flow,
// but is kept here for completeness of original features.
export const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("role")
    .optional()
    .isIn(["Customer", "Seller"])
    .withMessage("Invalid role."),
  body("storeName")
    .if(body("role").equals("Seller"))
    .notEmpty()
    .withMessage("Store name is required for sellers."),
  validate,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email."),
  body("password").notEmpty().withMessage("Password is required."),
  validate,
];

// --- ADDRESS ---
export const validateAddress = [
  body("street").trim().notEmpty().withMessage("Street is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("pincode")
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 10 })
    .withMessage("Valid pincode is required."),
  validate,
];

// --- PRODUCTS ---
export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("stock")
    .isInt({ gt: -1 })
    .withMessage("Stock must be a non-negative integer."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  validate,
];

// --- PAYMENT ---
export const validateCheckout = [
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be positive."),
  validate,
];

export const validatePaymentVerification = [
  body("razorpay_order_id")
    .notEmpty()
    .withMessage("Razorpay Order ID is required."),
  body("razorpay_payment_id")
    .notEmpty()
    .withMessage("Razorpay Payment ID is required."),
  body("razorpay_signature")
    .notEmpty()
    .withMessage("Razorpay Signature is required."),
  body("cartItems").isArray({ min: 1 }).withMessage("Cart items are required."),
  body("totalAmount")
    .isFloat({ gt: 0 })
    .withMessage("Total amount is required."),
  body("shippingAddress")
    .isObject()
    .withMessage("Shipping address is required."),
  body("shippingAddress.street").notEmpty().withMessage("Street is required."),
  body("shippingAddress.city").notEmpty().withMessage("City is required."),
  body("shippingAddress.pincode")
    .notEmpty()
    .withMessage("Pincode is required."),
  validate,
];
