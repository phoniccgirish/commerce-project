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

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middlewares
app.use(helmet());

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://commerce-project-kappa.vercel.app", // production frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) =>
  res.send("✅ Backend is running successfully on Vercel!")
);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// 🔹 Local development mode only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

// 🔹 Export the app for Vercel serverless
export default app;
