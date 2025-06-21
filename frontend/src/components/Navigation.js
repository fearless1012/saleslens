import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={2} className="sidebar p-0">
          <div className="sidebar-brand">{process.env.REACT_APP_NAME}</div>
          <Nav className="flex-column">
            {user.role === "admin" ? (
              // Admin navigation links
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/create"
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  Create Module
                </NavLink>
              </>
            ) : (
              // Trainee navigation links
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  My Dashboard
                </NavLink>
              </>
            )}
            <hr className="bg-secondary" />
            <div
              className="sidebar-link"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              Logout
            </div>
          </Nav>
        </Col>
      </Row>
    </Container>
  );
};

export default Navigation;
