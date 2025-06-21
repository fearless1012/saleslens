import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ModuleCreator from "./pages/ModuleCreator";
import ModuleViewer from "./pages/ModuleViewer";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Navigation from "./components/Navigation";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {user && <Navigation />}
      <Container fluid className={user ? "p-0" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Trainee Routes */}
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="module/:id" element={<ModuleViewer />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create" element={<ModuleCreator />} />
            <Route path="edit/:id" element={<ModuleCreator />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
