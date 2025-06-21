import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getModule, updateProgress } from "../services/moduleService";
import {
  initializeChat,
  sendMessage,
  getChatHistory,
} from "../services/chatbotService";

const ModuleViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get module data
        const moduleData = await getModule(id);

        if (moduleData.success) {
          setModule(moduleData.module);

          // Mark that user has started the module
          await updateModuleProgress(10);

          // Initialize chat
          await initializeChatForModule();
        }

        setLoading(false);
      } catch (error) {
        setError("Failed to load module data");
        console.error("Module loading error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Initialize chat for this module
  const initializeChatForModule = async () => {
    try {
      // First try to get existing chat history
      const chatHistory = await getChatHistory(id);

      if (chatHistory.success) {
        setChat(chatHistory.chat);
      } else {
        // If no chat exists, initialize new chat
        const newChat = await initializeChat(id);

        if (newChat.success) {
          setChat(newChat.chat);
        }
      }
    } catch (error) {
      console.error("Chat initialization error:", error);
      // We don't set the error here to not block the module content
    }
  };

  // Update module progress
  const updateModuleProgress = async (newProgress) => {
    try {
      const isCompleted = newProgress >= 100;

      const result = await updateProgress(id, {
        progress: newProgress,
        completed: isCompleted,
      });

      if (result.success) {
        setProgress(result.progress.progress);
        setCompleted(result.progress.completed);
      }
    } catch (error) {
      console.error("Progress update error:", error);
    }
  };

  // Handle progress button click
  const handleProgressClick = async () => {
    // Calculate new progress - incrementing by 25% each click, up to 100%
    const newProgress = Math.min(progress + 25, 100);
    await updateModuleProgress(newProgress);
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSendingMessage(true);

      const response = await sendMessage(chat._id, message);

      if (response.success) {
        setChat(response.chat);
        setMessage("");

        // Scroll to the bottom of the chat
        if (chatMessagesRef.current) {
          setTimeout(() => {
            chatMessagesRef.current.scrollTop =
              chatMessagesRef.current.scrollHeight;
          }, 100);
        }
      }
    } catch (error) {
      setError("Failed to send message");
      console.error("Message sending error:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chat?.messages?.length]);

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

  if (!module) {
    return (
      <Container className="dashboard-container">
        <Alert variant="danger">
          Module not found. It may have been deleted or you don't have access.
        </Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="main-content">
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-primary"
            onClick={() => navigate("/")}
            className="mb-3"
          >
            &larr; Back to Dashboard
          </Button>

          <div className="module-header">
            <h2>{module.title}</h2>
            <p className="text-muted mb-3">{module.description}</p>

            <div className="d-flex justify-content-between align-items-center">
              <div className="progress-container" style={{ width: "70%" }}>
                <ProgressBar
                  now={progress}
                  variant={completed ? "success" : "primary"}
                  className="progress-bar"
                />
                <small>{progress}% complete</small>
              </div>

              <Button
                variant={completed ? "success" : "primary"}
                onClick={handleProgressClick}
                disabled={progress === 100}
              >
                {progress === 0
                  ? "Start Module"
                  : progress < 100
                  ? "Mark Progress"
                  : "Completed"}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8} className="module-container">
          <Card>
            <Card.Body>
              <div dangerouslySetInnerHTML={{ __html: module.content }} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Ask Questions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {chat ? (
                <>
                  <div className="chat-messages" ref={chatMessagesRef}>
                    {chat.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message ${
                          msg.sender === "user" ? "user-message" : "ai-message"
                        }`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ))}
                  </div>

                  <Form onSubmit={handleSendMessage} className="chat-input">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your question here..."
                      disabled={sendingMessage}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={!message.trim() || sendingMessage}
                    >
                      {sendingMessage ? "Sending..." : "Send"}
                    </Button>
                  </Form>
                </>
              ) : (
                <div className="p-3 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading chat...</span>
                  </div>
                  <p className="mt-3">Loading chatbot assistant...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModuleViewer;
