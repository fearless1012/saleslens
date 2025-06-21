import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "trainee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      setError("");

      // Remove confirmPassword from data sent to API
      const userData = { name, email, password, role };
      const result = await register(userData);

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Failed to register. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <h2 className="auth-title">Register for Sales LMS</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} className="auth-form">
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select name="role" value={role} onChange={handleChange}>
            <option value="trainee">Trainee</option>
            <option value="admin">Admin</option>
          </Form.Select>
          <Form.Text className="text-muted">
            Select "Admin" if you are creating training modules, or "Trainee" if
            you are taking the training.
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mt-3"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </Form>

      <div className="auth-link">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </Container>
  );
};

export default Register;
