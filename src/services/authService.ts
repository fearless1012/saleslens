import api from "@/api";
import { getCookie, setCookie, removeCookie } from "@/Utils/cookies";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: User;
}

export interface BaseResponse {
  status: string;
  message?: string;
}

// Authentication API functions
export const authAPI = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<{ status: string; user: User }> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<BaseResponse> => {
    const response = await api.put("/auth/profile", userData);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<BaseResponse> => {
    const response = await api.put("/auth/change-password", passwordData);
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<BaseResponse> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (resetData: {
    token: string;
    newPassword: string;
  }): Promise<BaseResponse> => {
    const response = await api.post("/auth/reset-password", resetData);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear authentication data regardless of API response
      removeCookie("saleslensUserData");
      localStorage.removeItem("saleslensUserData");
      localStorage.removeItem("userRole");
    }
  },

  /**
   * Verify token validity
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      const token = getCookie("saleslensUserData");
      if (!token) return false;

      await api.get("/auth/verify-token");
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<{ token: string } | null> => {
    try {
      const response = await api.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  },
};

// Utility functions for token management
export const tokenUtils = {
  /**
   * Store authentication token
   */
  storeToken: (token: string, rememberMe: boolean = false): void => {
    const cookieOptions = {
      expires: rememberMe ? 30 : 7, // 30 days if remember me, 7 days otherwise
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    setCookie("saleslensUserData", token, cookieOptions);

    if (rememberMe) {
      localStorage.setItem("saleslensUserData", token);
    }
  },

  /**
   * Get stored authentication token
   */
  getToken: (): string | null => {
    return (
      getCookie("saleslensUserData") ||
      localStorage.getItem("saleslensUserData")
    );
  },

  /**
   * Clear authentication token
   */
  clearToken: (): void => {
    removeCookie("saleslensUserData");
    localStorage.removeItem("saleslensUserData");
    localStorage.removeItem("userRole");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = tokenUtils.getToken();
    return !!token;
  },
};

export default authAPI;
