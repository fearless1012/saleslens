import React, { lazy, Suspense } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "@/components/Home";
import NotFound from "@/components/NotFound";
import { useAuth } from "@/Providers/AuthProvider";
import LayoutFallback from "@/components/LayoutFallback";
import Dashboard from "@/apps/Dashboard/Dashboard";
import DomainModule from "@/apps/DomainModule/DomainModule";
import CustomerProfile from "@/apps/CustomerProfile/CustomerProfile";
import Pitches from "@/apps/Pitches/Pitches";
import Practice from "@/apps/Practice/Practice";
import Training from "@/apps/Training/Training";
import LLAMASimulation from "@/apps/LLAMASimulation/LLAMASimulation";
import ProtectedRoute from "./ProtectedRoute";
import LoginNew from "@/components/LoginNew";
import RegisterNew from "@/components/RegisterNew";

const Unauthorized = lazy(() => import("@/components/Unauthorized"));

function AllRoutes() {
  const { auth } = useAuth();

  return (
    <React.Fragment>
      <Suspense fallback={<LayoutFallback />}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginNew />} />
            <Route path="/register" element={<RegisterNew />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route element={<ProtectedRoute isAuthenticated={auth} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/domain-module" element={<DomainModule />} />
              <Route path="/customer-profile" element={<CustomerProfile />} />
              <Route path="/pitches" element={<Pitches />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/training" element={<Training />} />
              <Route path="/simulation" element={<LLAMASimulation />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </React.Fragment>
  );
}

export default AllRoutes;
