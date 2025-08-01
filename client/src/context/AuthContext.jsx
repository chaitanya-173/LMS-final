import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // gates ProtectedRoute

  /* ----------------------------------------
   * Verify token with backend (/auth/check-auth)
   * -------------------------------------- */
  const verifyUser = useCallback(async () => {
    const storedToken =
      sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

    // No token -> unauthenticated
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/auth/check-auth", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const freshUser = res.data?.user;
      if (freshUser) {
        setUser(freshUser);
        setToken(storedToken);

        // sync storages
        sessionStorage.setItem("accessToken", storedToken);
        localStorage.setItem("accessToken", storedToken);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } else {
        throw new Error("No user in response");
      }
    } catch (err) {
      console.error("check-auth failed:", err?.response?.data || err.message);
      // wipe broken auth
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
      toast.error("Session expired. Please log in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ----------------------------------------
   * Initial boot: try local data, then verify
   * -------------------------------------- */
  useEffect(() => {
    // Preload whatever we have so UI doesn't flash empty name
    const storedUser = localStorage.getItem("user");
    const storedToken =
      sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    // Always verify with server (will correct stale data / expired token)
    verifyUser();
  }, [verifyUser]);

  /* ----------------------------------------
   * Login
   * -------------------------------------- */
  const loginUser = async (credentials, navigate) => {
    try {
      const res = await axios.post("/auth/login", credentials);
      const { accessToken, user } = res.data?.data || {};

      // persist both
      sessionStorage.setItem("accessToken", accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setToken(accessToken);

      navigate(user.role === "instructor" ? "/instructor/dashboard" : "/home");
      toast.success("Logged in successfully");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      console.error("Login error:", message);
      toast.error(message);
    }
  };

  /* ----------------------------------------
   * Register -> auto login
   * -------------------------------------- */
  const registerUser = async (formData, navigate) => {
    try {
      const res = await axios.post("/auth/register", formData);
      if (res.data.success) {
        await loginUser(
          { email: formData.email, password: formData.password },
          navigate
        );
      } else {
        throw new Error("Registration failed");
      }
    } catch (err) {
      console.error("Registration failed:", err.message);
      toast.error("Signup failed");
    }
  };

  /* ----------------------------------------
   * Logout
   * -------------------------------------- */
  const logoutUser = () => {
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setUser,
        setToken,
        loginUser,
        registerUser,
        logoutUser,
        refreshAuth: verifyUser, // expose manual re-check
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
