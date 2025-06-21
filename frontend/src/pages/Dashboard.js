import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getModules } from "../services/moduleService";
import { getTraineeProgress } from "../services/moduleService";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all modules
        const moduleData = await getModules();
        setModules(moduleData.modules);

        // Get trainee progress
        const progressData = await getTraineeProgress();
        setProgress(progressData.progress);

        setLoading(false);
      } catch (error) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find progress for a specific module
  const getModuleProgress = (moduleId) => {
    const moduleProgress = progress.find((p) => p.moduleId._id === moduleId);
    return moduleProgress ? moduleProgress.progress : 0;
  };

  // Check if a module is completed
  const isModuleCompleted = (moduleId) => {
    const moduleProgress = progress.find((p) => p.moduleId._id === moduleId);
    return moduleProgress ? moduleProgress.completed : false;
  };

  if (loading) {
    return (
      <Container className="dashboard-container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="main-content">
      <Row className="dashboard-title">
        <Col>
          <h2>Welcome, {user.name}</h2>
          <p className="text-muted">Your Sales Training Dashboard</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={12} className="mb-4">
          <h4>Your Training Modules</h4>
        </Col>
      </Row>

      {modules.length === 0 ? (
        <Alert variant="info">
          No training modules available at the moment. Please check back later.
        </Alert>
      ) : (
        <Row>
          {modules.map((module) => (
            <Col md={4} className="mb-4" key={module._id}>
              <Card className="h-100 dashboard-card">
                <Card.Body>
                  <Card.Title>{module.title}</Card.Title>
                  <Card.Text>{module.description}</Card.Text>

                  <div className="mb-3">
                    <small className="text-muted">Progress</small>
                    <ProgressBar
                      now={getModuleProgress(module._id)}
                      variant={
                        isModuleCompleted(module._id) ? "success" : "primary"
                      }
                      className="progress-bar"
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small>{getModuleProgress(module._id)}%</small>
                      {isModuleCompleted(module._id) && (
                        <Badge bg="success">Completed</Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Link to={`/module/${module._id}`}>
                    <Button variant="primary" className="w-100">
                      {getModuleProgress(module._id) > 0 ? "Continue" : "Start"}{" "}
                      Module
                    </Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;
