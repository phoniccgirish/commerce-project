import multer from "multer";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

export default upload;
