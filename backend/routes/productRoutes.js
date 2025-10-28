import express from "express";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";
import { validateProduct } from "../middleware/validationMiddleware.js";
import {
  addProduct,
  getAllProducts,
  getSellerProducts, // Make sure this is imported
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// --- ROUTE ORDER FIX ---
// Specific routes MUST come BEFORE parameterized routes

// GET /api/products/seller (Seller-specific)
router.get("/seller", protect, isSeller, getSellerProducts);

// GET /api/products/:id (Single product by ID)
router.get("/:id", getProductById);
// --- END ROUTE ORDER FIX ---

// GET /api/products (All products - public)
router.get("/", getAllProducts);

// Seller-only modification routes
router.post(
  "/",
  protect,
  isSeller,
  upload.array("images", 10),
  validateProduct,
  addProduct
);
router.put(
  "/:id",
  protect,
  isSeller,
  upload.array("images", 10),
  validateProduct,
  updateProduct
);
router.delete("/:id", protect, isSeller, deleteProduct);

export default router;
