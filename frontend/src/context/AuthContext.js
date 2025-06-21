import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // Set authorization header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get user profile
          const response = await axios.get("/api/auth/profile");

          if (response.data.success) {
            const userData = {
              ...response.data.user,
              token,
            };
            setUser(userData);
          } else {
            logout();
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Authentication check failed:", error);
        logout();
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);

      if (response.data.success) {
        const { user } = response.data;
        localStorage.setItem("token", user.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);

      if (response.data.success) {
        const { user } = response.data;
        localStorage.setItem("token", user.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
