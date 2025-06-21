const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

// Initialize or get a chat
router.post("/initialize", protect, chatbotController.initializeChat);

// Send a message
router.post("/message", protect, chatbotController.sendMessage);

// Get chat history for a specific module
router.get("/:moduleId", protect, chatbotController.getChatHistory);

module.exports = router;
