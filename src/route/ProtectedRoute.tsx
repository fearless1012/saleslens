import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/Providers/AuthProvider";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuthLoading } from "@/state/authSlice";

interface ProtectedRouteProps {
  isAuthenticated?: boolean;
  redirectPath?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({
  isAuthenticated,
  redirectPath = "/login",
  requiredRole,
  fallback,
}: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const authState = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  // Use provided prop or fallback to auth state
  const isAuth = isAuthenticated !== undefined ? isAuthenticated : authState;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Check authentication
  if (!isAuth) {
    // Redirect to login with return URL
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
