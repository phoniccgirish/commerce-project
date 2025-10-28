import Product from "../models/productModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import mongoose from 'mongoose'; // <-- ADD THIS LINE

// --- Add Product ---
export const addProduct = async (req, res) => {
  // Note: Input validation (name, price, stock, etc.) is assumed to be handled
  // by middleware (like express-validator) before this controller runs.
  try {
    const { name, price, description, stock, category } = req.body;
    const files = req.files;

    // Middleware should handle basic validation, but double-check files
    if (!files || files.length === 0) {
      // This might indicate a frontend/middleware issue if validation passed
      console.warn("addProduct: No files received despite validation passing.");
      return res.status(400).json({ message: "Image file(s) are required." });
    }



    // import Product from "../models/productModel.js";
// ... other imports

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file.buffer);
        if (!result || !result.secure_url) {
          throw new Error("Cloudinary upload did not return a secure URL.");
        }
        imageUrls.push(result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload failed for one image:", uploadError);
        // Decide: stop all or continue? Stop seems safer.
        return res
          .status(500)
          .json({ message: `Image upload failed: ${uploadError.message}` });
      }
    }

    // Create and save the product
    const product = new Product({
      sellerId: req.user._id, // Assumes 'protect' middleware adds req.user
      name,
      price: Number(price), // Ensure price is stored as a number
      description,
      stock: Number(stock), // Ensure stock is stored as a number
      category,
      images: imageUrls,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error("Error in addProduct controller:", err);
    res.status(500).json({ message: "Server error creating product." });
  }
};



// Fetch All Products (Public) - Now with Category Filter
export const getAllProducts = async (req, res) => {
  try {
    // --- CATEGORY FILTER ---
    const queryFilter = {}; // Start with an empty filter
    if (req.query.category) {
      // If a category is provided in the URL query (?category=...)
      // Make the filter case-insensitive
      queryFilter.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }
    // --- END FILTER ---

    // Apply the filter when finding products
    const products = await Product.find(queryFilter) // Use the filter object
      .populate("sellerId", "storeName")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ message: "Server error fetching products." });
  }
};

// --- Fetch Single Product by ID (Public) ---
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "storeName"
    ); // Show seller name

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    // Handle potential CastError if ID format is invalid
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    res.status(500).json({ message: "Server error fetching product." });
  }
};

// --- Update Product (Seller Only) ---
export const updateProduct = async (req, res) => {
  // Assumes 'protect' and 'isSeller' middleware have run
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Authorization check: Ensure logged-in seller owns the product
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product." });
    }

    const { name, price, description, stock, category } = req.body;

    // Update fields if they are provided in the request body
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price); // Ensure number
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = Number(stock); // Ensure number
    if (category !== undefined) product.category = category;

    // Handle optional new image uploads (replaces old images)
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      // TODO: Optionally delete old images from Cloudinary here
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          if (!result || !result.secure_url)
            throw new Error("Cloudinary error.");
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error("Cloudinary upload failed during update:", uploadError);
          return res
            .status(500)
            .json({ message: `Image upload failed: ${uploadError.message}` });
        }
      }
      product.images = imageUrls; // Replace existing images array
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error(`Error updating product ${req.params.id}:`, err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    // Handle potential validation errors during save if schema rules are complex
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: "Server error updating product." });
  }
};

// --- Delete Product (Seller Only) ---
export const deleteProduct = async (req, res) => {
  // Assumes 'protect' and 'isSeller' middleware have run
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Authorization check
    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product." });
    }

    // TODO: Delete images associated with this product from Cloudinary before deleting DB record

    await product.deleteOne(); // Correct method
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    console.error(`Error deleting product ${req.params.id}:`, err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    res.status(500).json({ message: "Server error deleting product." });
  }
};

// Fetch all products for the logged-in seller
export const getSellerProducts = async (req, res) => {
  // console.log('getSellerProducts called. req.user:', req.user); // DEBUG LOG
  try {
    // --- ADDED CHECK ---
    // Ensure user ID exists and is a valid MongoDB ObjectId format
    if (!req.user?._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      console.error(
        "getSellerProducts: Invalid or missing Seller ID in req.user:",
        req.user?._id
      );
      // Send 400 Bad Request because the ID format derived from the token is unusable
      return res
        .status(400)
        .json({ message: "Invalid user identifier provided." });
    }
    // --- END CHECK ---

    const sellerId = req.user._id;
    // console.log(`Querying products for sellerId: ${sellerId}`); // DEBUG LOG

    const products = await Product.find({ sellerId: sellerId }).sort({
      createdAt: -1,
    });

    // console.log(`Found ${products.length} products for seller ${sellerId}`); // DEBUG LOG
    res.json(products);
  } catch (err) {
    console.error("Error fetching seller products:", err);
    res.status(500).json({ message: "Server error fetching seller products." });
  }
};
