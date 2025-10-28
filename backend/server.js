import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// ✅ Security Middlewares
app.use(helmet());

// ✅ CORS Configuration (works locally & online)
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://commerce-project-rose.vercel.app", // Production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies
  })
);

// ✅ Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// ✅ Standard Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ API Routes
app.get("/", (req, res) => res.send("Backend is running ✅"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
