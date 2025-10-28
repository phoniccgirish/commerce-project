import express from "express";
// 1. Import controllers and middleware
import {
  placeOrder,
  viewOrders,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/orders (Place order)
router.post("/", protect, placeOrder);

// PUT /api/orders/:id/cancel (Cancel order)
router.put("/:id/cancel", protect, cancelOrder);

// 2. This is the route you need to fix
// GET /api/orders (View orders)
router.get("/", protect, viewOrders);

export default router;
