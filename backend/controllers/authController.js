import User from "../models/userModel.js";
import Seller from "../models/sellerModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js"; // Default Import
import admin from "../config/firebaseAdmin.js"; // Firebase Admin instance
import otpGenerator from "otp-generator";

// --- Helper Functions ---

// 1. JWT Generation
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
    process.exit(1);
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const sendTokenResponse = (user, statusCode, res, roleSpecificData) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      _id: user._id,
      email: user.email,
      ...roleSpecificData,
    });
};

// --- OTP Registration Step 2: Verify OTP & Register ---
export const verifyOtpAndRegister = async (req, res) => {
  const { name, email, password, otp, role = "Customer", storeName } = req.body;

  if (
    !email ||
    !password ||
    !otp ||
    !name ||
    (role === "Seller" && !storeName) // Ensure storeName is present for Seller
  ) {
    return res
      .status(400)
      .json({ message: "All required fields not provided." });
  }

  try {
    const Model = role === "Seller" ? Seller : User;

    // Explicitly select ALL fields needed for validation and password hashing.
    let userRecord = await Model.findOne({ email }).select(
      "+otp +otpExpiry +isVerified +password"
    );

    // 1. Check if record exists (must have been created in sendOtp)
    if (!userRecord) {
      return res
        .status(400)
        .json({ message: "Email not found or OTP process not initiated." });
    }

    // 2. Validate Expiry (Time check must come first)
    const now = new Date().getTime();
    if (userRecord.otpExpiry && userRecord.otpExpiry.getTime() < now) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // 3. Validate OTP match
    if (userRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // 4. Validate if already verified (Should not be possible here, but good safeguard)
    if (userRecord.isVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    // --- OTP is valid - Finalize Registration ---

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user record
    userRecord.password = hashedPassword;
    userRecord.name = name;
    userRecord.isVerified = true;
    userRecord.otp = undefined; // Clear OTP fields
    userRecord.otpExpiry = undefined;

    if (role === "Seller") {
      userRecord.storeName = storeName; // Set the provided storeName
      userRecord.role = "Seller";
    } else {
      userRecord.role = "Customer";
    }

    await userRecord.save();

    // Log the user in
    let roleSpecificData = {};
    if (role === "Seller") {
      roleSpecificData = { storeName: userRecord.storeName, role: "Seller" };
    } else {
      roleSpecificData = {
        name: userRecord.name,
        role: userRecord.role,
        address: userRecord.address,
      };
    }
    sendTokenResponse(userRecord, 201, res, roleSpecificData);
  } catch (error) {
    console.error("VERIFY OTP & REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed." });
  }
};

// --- OTP Registration Step 1: Send OTP ---
export const sendOtp = async (req, res) => {
  const { email, role = "Customer" } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const Model = role === "Seller" ? Seller : User;
    let existingUser = await Model.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already registered and verified." });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    // Determine fields required for insertion ($setOnInsert) if the document does not exist
    let onInsertFields = {
      role: role,
      // Password is required by both schemas, but will be overwritten later.
      // We set a temporary value here to pass upsert validation.
      password: "TEMPORARY_PASSWORD_TO_PASS_VALIDATION_ON_INSERT",
    };

    // Satisfy the *other* required fields depending on the model
    if (role === "Seller") {
      onInsertFields.storeName = "Temporary Store"; // Required by Seller schema
    } else {
      onInsertFields.name = "Temporary User"; // Required by User schema
    }

    // Use upsert to either update an existing unverified user or create a new temporary record
    await Model.findOneAndUpdate(
      { email }, // Query: Find the record by email
      {
        // $set updates OTP/verification status
        $set: {
          otp: otp,
          otpExpiry: otpExpiry,
          isVerified: false,
        },
        // $setOnInsert runs ONLY when a new document is created, satisfying required fields
        $setOnInsert: onInsertFields,
      },
      options
    );

    // ... (rest of sendEmail logic) ...
    const subject = "Your Verification Code for Exoticc Store";
    const text = `Your One-Time Password (OTP) is: ${otp}\nIt is valid for 10 minutes.`;
    await sendEmail(email, subject, text);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
};
// --- Standard Login (Requires Email Verification) ---
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let userRecord = await User.findOne({ email });
    let isSeller = false;
    if (!userRecord) {
      userRecord = await Seller.findOne({ email });
      isSeller = true;
    }

    if (!userRecord)
      return res.status(401).json({ message: "Invalid credentials" });
    if (!userRecord.password)
      return res
        .status(401)
        .json({ message: "Account setup incomplete or uses social login." });

    if (!userRecord.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please complete OTP verification.",
      });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    let roleSpecificData = {};
    if (isSeller)
      roleSpecificData = { storeName: userRecord.storeName, role: "Seller" };
    else
      roleSpecificData = {
        name: userRecord.name,
        role: userRecord.role,
        address: userRecord.address,
      };

    sendTokenResponse(userRecord, 200, res, roleSpecificData);
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// --- Google Login/Registration ---
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(400).json({ message: "Google ID Token required." });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;

    let user = await User.findOne({ email });
    let roleSpecificData = {};

    if (user) {
      user.googleId = uid;
      await user.save();
      console.log(`Google Login: Existing user found for ${email}`);
      roleSpecificData = {
        name: user.name,
        role: user.role,
        address: user.address,
      };
      sendTokenResponse(user, 200, res, roleSpecificData);
    } else {
      console.log(`Google Login: Creating new user for ${email}`);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: null,
        role: "Customer",
        googleId: uid,
        isVerified: true,
        address: { street: "", city: "", pincode: "" },
      });
      roleSpecificData = {
        name: user.name,
        role: "Customer",
        address: user.address,
      };
      sendTokenResponse(user, 201, res, roleSpecificData);
    }
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error during Google authentication." });
  }
};

// --- Get Auth Status ---
export const getAuthStatus = async (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

// --- Get User Profile ---
export const getUserProfile = async (req, res) => {
  if (req.user && req.user.role === "Customer") {
    const userProfile = await User.findById(req.user._id).select("-password");
    if (userProfile) {
      res.json({
        _id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        address: userProfile.address,
      });
    } else {
      res.status(404).json({ message: "User profile not found" });
    }
  } else {
    res.status(403).json({ message: "Sellers do not have a customer profile" });
  }
};

// --- Update User Address ---
export const updateUserAddress = async (req, res) => {
  if (!req.user || req.user.role !== "Customer") {
    return res
      .status(403)
      .json({ message: "Only customers can update their address." });
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.address = {
      street: req.body.street || user.address?.street || "",
      city: req.body.city || user.address?.city || "",
      pincode: req.body.pincode || user.address?.pincode || "",
    };
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address,
    });
  } catch (error) {
    console.error("ADDRESS UPDATE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
