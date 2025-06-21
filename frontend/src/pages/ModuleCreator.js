import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Spinner,
  Card,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createModule,
  getModule,
  updateModule,
  generateModuleContent,
} from "../services/moduleService";

const ModuleCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    knowledgeBase: [],
  });
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // If in edit mode, fetch the module data
    if (isEditMode) {
      const fetchModule = async () => {
        try {
          setLoading(true);
          const data = await getModule(id);

          if (data.success) {
            setFormData({
              title: data.module.title,
              description: data.module.description,
              content: data.module.content,
              knowledgeBase: data.module.knowledgeBase || [],
            });
          }

          setLoading(false);
        } catch (error) {
          setError("Failed to load module data");
          console.error("Module loading error:", error);
          setLoading(false);
        }
      };

      fetchModule();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleKnowledgeBaseChange = (index, field, value) => {
    const updatedKnowledgeBase = [...formData.knowledgeBase];
    updatedKnowledgeBase[index] = {
      ...updatedKnowledgeBase[index],
      [field]: value,
    };

    setFormData({ ...formData, knowledgeBase: updatedKnowledgeBase });
  };

  const addKnowledgeBaseItem = () => {
    setFormData({
      ...formData,
      knowledgeBase: [...formData.knowledgeBase, { question: "", answer: "" }],
    });
  };

  const removeKnowledgeBaseItem = (index) => {
    const updatedKnowledgeBase = [...formData.knowledgeBase];
    updatedKnowledgeBase.splice(index, 1);

    setFormData({ ...formData, knowledgeBase: updatedKnowledgeBase });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      let response;

      if (isEditMode) {
        response = await updateModule(id, formData);
      } else {
        response = await createModule(formData);
      }

      if (response.success) {
        setSuccess(
          `Module ${isEditMode ? "updated" : "created"} successfully!`
        );

        // Navigate back to admin dashboard after a short delay
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        setError("Failed to save module");
      }
    } catch (error) {
      setError(`Failed to ${isEditMode ? "update" : "create"} module`);
      console.error("Module save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!topic) {
      return setError("Please provide a topic for generation");
    }

    try {
      setGenerating(true);
      setError("");

      const data = await generateModuleContent({
        topic,
        keyPoints: keyPoints || undefined,
        targetAudience: targetAudience || undefined,
      });

      if (data.success) {
        setFormData({
          title: data.module.title || topic,
          description: data.module.description || "",
          content: data.module.content || "",
          knowledgeBase: data.module.knowledgeBase || [],
        });

        setSuccess("Content generated successfully!");
      } else {
        setError("Failed to generate content");
      }
    } catch (error) {
      setError("Failed to generate content");
      console.error("Content generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading && isEditMode) {
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
          <h2>{isEditMode ? "Edit Module" : "Create New Module"}</h2>
          <p className="text-muted">
            {isEditMode
              ? "Update the training module content"
              : "Create a new training module for sales team"}
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/admin")}
          >
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>AI Content Generator</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Topic</Form.Label>
                <Form.Control
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., Cold Calling Techniques"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Key Points to Include (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                      placeholder="Enter key points separated by commas"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Audience (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="E.g., New Sales Representatives"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                onClick={handleGenerateContent}
                disabled={generating || !topic}
                className="mt-2"
              >
                {generating ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label>Module Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter module title"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label>Module Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a brief description"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Module Content</Form.Label>
          <div className="editor-container">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
            />
          </div>
        </Form.Group>

        <h5 className="mb-3">Knowledge Base Q&A</h5>
        <p className="text-muted mb-4">
          Add questions and answers to build the module's knowledge base. This
          helps the AI chatbot assist trainees.
        </p>

        {formData.knowledgeBase.map((item, index) => (
          <div key={index} className="knowledge-base-item mb-4">
            <Row>
              <Col md={11}>
                <Form.Group className="mb-3">
                  <Form.Label>Question {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={item.question}
                    onChange={(e) =>
                      handleKnowledgeBaseChange(
                        index,
                        "question",
                        e.target.value
                      )
                    }
                    placeholder="Enter a question"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Answer</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={item.answer}
                    onChange={(e) =>
                      handleKnowledgeBaseChange(index, "answer", e.target.value)
                    }
                    placeholder="Enter the answer"
                  />
                </Form.Group>
              </Col>
              <Col
                md={1}
                className="d-flex align-items-center justify-content-center"
              >
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeKnowledgeBaseItem(index)}
                >
                  &times;
                </Button>
              </Col>
            </Row>
          </div>
        ))}

        <Button
          variant="outline-primary"
          className="mb-4"
          onClick={addKnowledgeBaseItem}
        >
          + Add Q&A Item
        </Button>

        <div className="d-grid gap-2 mt-4">
          <Button variant="primary" type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : isEditMode ? (
              "Update Module"
            ) : (
              "Create Module"
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ModuleCreator;
