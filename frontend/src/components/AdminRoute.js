import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user } = useAuth();

  // Check if user is logged in and is an admin
  return user && user.role === "admin" ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
