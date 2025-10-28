import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Seller from "../models/sellerModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let foundUser = await User.findById(decoded.id).select("-password");
      let role = "Customer"; // Default assume customer

      if (!foundUser) {
        foundUser = await Seller.findById(decoded.id).select("-password");
        if (foundUser) {
          role = "Seller";
        }
      }

      if (!foundUser) {
        res.cookie("token", "", {
          httpOnly: true,
          expires: new Date(0),
          sameSite: "strict",
        });
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // Ensure req.user is a plain object with necessary fields
      req.user = {
        _id: foundUser._id,
        email: foundUser.email, // Common field
        role: role, // *** Explicitly set role ***
        // Add other fields needed by subsequent middleware/controllers if necessary
        // e.g., name: foundUser.name, storeName: foundUser.storeName
      };
      // console.log('Protect Middleware: Attaching req.user:', req.user); // DEBUG LOG

      next();
    } catch (error) {
      console.error("Token verification failed:", error.name, error.message);
      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "strict",
      });

      if (error.name === "JsonWebTokenError")
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token" });
      if (error.name === "TokenExpiredError")
        return res
          .status(401)
          .json({ message: "Not authorized, token expired" });
      return res
        .status(500)
        .json({ message: "Server error during token verification" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

// isSeller checks the role attached by 'protect'
export const isSeller = (req, res, next) => {
  // console.log('isSeller Middleware: Checking req.user:', req.user); // DEBUG LOG
  if (req.user && req.user.role === "Seller") {
    next();
  } else {
    // Send 403 Forbidden if not a seller
    return res
      .status(403)
      .json({ message: "Not authorized, seller role required" });
  }
};
