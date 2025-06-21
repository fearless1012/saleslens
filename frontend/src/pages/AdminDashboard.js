import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { getModules, deleteModule } from "../services/moduleService";

const AdminDashboard = () => {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModules();
        setModules(data.modules);
        setLoading(false);
      } catch (error) {
        setError("Failed to load modules");
        console.error("Modules loading error:", error);
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleDeleteClick = (module) => {
    setModuleToDelete(module);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteModule(moduleToDelete._id);

      // Update modules list
      setModules(modules.filter((m) => m._id !== moduleToDelete._id));

      // Close modal
      setShowDeleteModal(false);
      setModuleToDelete(null);
    } catch (error) {
      setError("Failed to delete module");
      console.error("Delete module error:", error);
    }
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
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage Sales Training Modules</p>
        </Col>
        <Col xs="auto">
          <Link to="/admin/create">
            <Button variant="primary">Create New Module</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {modules.length === 0 ? (
        <Alert variant="info">
          No training modules created yet. Click "Create New Module" to get
          started.
        </Alert>
      ) : (
        <Row>
          {modules.map((module) => (
            <Col md={4} className="mb-4" key={module._id}>
              <Card className="h-100 dashboard-card">
                <Card.Body>
                  <Card.Title>{module.title}</Card.Title>
                  <Card.Text>{module.description}</Card.Text>

                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      Created: {new Date(module.createdAt).toLocaleDateString()}
                    </small>

                    {module.knowledgeBase && (
                      <small className="text-muted">
                        Q&A: {module.knowledgeBase.length}
                      </small>
                    )}
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <div className="d-flex justify-content-between">
                    <Link to={`/admin/edit/${module._id}`}>
                      <Button variant="outline-primary">Edit</Button>
                    </Link>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(module)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {moduleToDelete && (
            <>
              <p>
                Are you sure you want to delete the module "
                {moduleToDelete.title}"?
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Module
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
