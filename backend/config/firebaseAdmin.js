import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const absolutePath = path.resolve(process.cwd(), serviceAccountPath); // Assumes path is relative to project root

if (!serviceAccountPath) {
  console.error("FATAL ERROR: GOOGLE_APPLICATION_CREDENTIALS is not set.");
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(absolutePath),
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Firebase Admin initialization failed:", error.message);
  console.error("Attempted to load key from:", absolutePath);
  process.exit(1);
}

export default admin;
