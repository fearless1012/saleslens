import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useDispatch } from "react-redux";
import { getCookie, setCookie, removeCookie } from "@/Utils/cookies";
import { setIsAuthenticated, setUser, logout } from "@/state/authSlice";
import api from "@/api";
import { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  status: string;
  token: string;
  user: User;
}

interface AuthContextType {
  auth: boolean;
  setAuth: (auth: boolean) => void;
  isLoading: boolean;
  currentUser: User | null;
  handleUserLogin: (formData: LoginFormData) => Promise<{
    error: AxiosError | null;
    data: AuthResponse | null;
  }>;
  handleUserRegister: (formData: RegisterFormData) => Promise<{
    error: AxiosError | null;
    data: AuthResponse | null;
  }>;
  handleLogout: () => void;
  getCurrentUser: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const dispatch = useDispatch();

  // Cookie configuration
  const cookieConfig = useMemo(
    () => ({
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    }),
    []
  );

  // Get current user from API
  const getCurrentUser = async (): Promise<void> => {
    try {
      const token = getCookie("saleslensUserData");
      if (!token) {
        setCurrentUser(null);
        setAuth(false);
        return;
      }

      const response = await api.get("/auth/me");

      if (response.data?.status === "success" && response.data.user) {
        setCurrentUser(response.data.user);
        dispatch(setUser(response.data.user));
        dispatch(setIsAuthenticated(true));
        setAuth(true);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      handleLogout();
    }
  };

  // Handle user login
  const handleUserLogin = async (formData: LoginFormData) => {
    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data?.status === "success") {
        const { token, user } = response.data;

        // Store token in cookies
        const cookieOptions = formData.rememberMe
          ? { ...cookieConfig, expires: 30 } // 30 days if remember me
          : cookieConfig;

        setCookie("saleslensUserData", token, cookieOptions);

        // Update state
        setCurrentUser(user);
        dispatch(setUser(user));
        dispatch(setIsAuthenticated(true));
        setAuth(true);

        return { error: null, data: response.data };
      }

      return { error: new Error("Login failed") as AxiosError, data: null };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error as AxiosError, data: null };
    }
  };

  // Handle user registration
  const handleUserRegister = async (formData: RegisterFormData) => {
    try {
      console.log("AuthProvider: Starting registration process");
      console.log("AuthProvider: Registration data:", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        // Don't log password for security
      });

      const response = await api.post("/auth/register", formData);
      console.log("AuthProvider: Registration API response:", response.data);

      if (response.data?.status === "success") {
        const { token, user } = response.data;
        console.log(
          "AuthProvider: Registration successful, storing token and user"
        );

        // Store token in cookies
        setCookie("saleslensUserData", token, cookieConfig);

        // Update state
        setCurrentUser(user);
        dispatch(setUser(user));
        dispatch(setIsAuthenticated(true));
        setAuth(true);

        console.log("AuthProvider: State updated successfully");
        return { error: null, data: response.data };
      }

      console.log(
        "AuthProvider: Registration failed - invalid response format"
      );
      return {
        error: new Error("Registration failed") as AxiosError,
        data: null,
      };
    } catch (error) {
      console.error("AuthProvider: Registration error:", error);
      return { error: error as AxiosError, data: null };
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear cookies
    removeCookie("saleslensUserData");

    // Clear localStorage (if any additional data is stored)
    localStorage.removeItem("saleslensUserData");
    localStorage.removeItem("userRole");

    // Update state
    setCurrentUser(null);
    dispatch(logout());
    setAuth(false);

    // Redirect to login page
    window.location.href = "/login";
  };

  // Update user data
  const updateUserData = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      dispatch(setUser(updatedUser));
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookie("saleslensUserData");

      if (token && token !== "") {
        await getCurrentUser();
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth().finally(() => setIsLoading(false));
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        isLoading,
        currentUser,
        handleUserLogin,
        handleUserRegister,
        handleLogout,
        getCurrentUser,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
