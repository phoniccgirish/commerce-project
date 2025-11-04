import axios from "axios";

// --- URL Setup ---
const PRODUCTION_URL = import.meta.env.VITE_PROD_API;
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API || "/api";

const baseURL =
  import.meta.env.MODE === "development" ? LOCAL_API_URL : PRODUCTION_URL;

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// --- AUTH ---
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const getAuthStatus = () => API.get("/auth/status");
export const getUserProfile = () => API.get("/auth/profile");
export const updateUserAddress = (addressData) =>
  API.put("/auth/profile/address", addressData);

export const sendOtp = async (emailData) => {
  try {
    const response = await API.post("/auth/send-otp", emailData);
    return response.data; // Return success data
  } catch (error) {
    throw error;
  }
};
export const verifyOtpAndRegister = async (registrationData) => {
  try {
    const response = await API.post(
      "/auth/verify-otp-register",
      registrationData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const googleLoginApi = (tokenData) =>
  API.post("/auth/google", tokenData);

export const fetchProducts = async () => {
  try {
    const res = await API.get("/products");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    return [];
  }
};
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const getSellerProducts = () => API.get("/products/seller");
export const addProduct = (formData) => API.post("/products", formData);
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// --- ORDERS/PAYMENT ---
export const viewOrders = () => API.get("/orders");
export const getSellerOrders = () => API.get("/orders/seller");
export const createRazorpayOrder = (orderData) =>
  API.post("/payment/checkout", orderData);
export const verifyPayment = (paymentData) =>
  API.post("/payment/verify", paymentData);

export default API;
