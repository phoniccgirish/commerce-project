import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { getAuthStatus } from "../services/api";

const AuthContext = createContext();
function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAuthStatus();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.log(
        "Auth check failed (Not logged in):",
        error.response?.data?.message || error.message
      );
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

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
