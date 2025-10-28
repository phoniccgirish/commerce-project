import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
// 1. Import getAuthStatus instead of getUserProfile
import { getAuthStatus /*, logoutUser */ } from "../services/api";

// Create context
const AuthContext = createContext();

// Define the hook
function useAuth() {
  // Using function declaration
  return useContext(AuthContext);
}

// Define the provider
function AuthProvider({ children }) {
  // Using function declaration
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Renamed function for clarity
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 2. Call the correct endpoint: getAuthStatus()
      const { data } = await getAuthStatus();
      // If successful, data contains { _id, email, role }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data)); // Store for display
    } catch (error) {
      // Any error from /status means not authenticated
      console.log(
        "Auth check failed (Not logged in):",
        error.response?.data?.message || error.message
      );
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency array is empty

  useEffect(() => {
    checkAuthStatus(); // Call the corrected check function
  }, [checkAuthStatus]); // useEffect depends on the stable checkAuthStatus function

  const loginAction = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate(userData.role === "Seller" ? "/seller/dashboard" : "/");
  };

  const logoutAction = () => {
    // TODO: Call backend logout API: await logoutUser();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
  };

  const updateUserState = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    loginAction,
    logoutAction,
    updateUserState,
  };

  // Important: Render children only after loading is false
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export using named exports
export { AuthProvider, useAuth };
