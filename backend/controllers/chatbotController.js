const Chat = require("../models/Chat");
const Module = require("../models/Module");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize or get an existing chat
exports.initializeChat = async (req, res) => {
  try {
    const { moduleId } = req.body;

    // Verify module exists
    const module = await Module.findById(moduleId);

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      userId: req.user._id,
      moduleId,
    });

    // If no chat exists, create new one with welcome message
    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        moduleId,
        messages: [
          {
            sender: "ai",
            content: `Welcome to the ${module.title} support chat! How can I help you today?`,
          },
        ],
      });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message in the chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    // Find the chat
    let chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    // Verify that the user owns this chat
    if (chat.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to access this chat",
        });
    }

    // Add user message to chat
    chat.messages.push({
      sender: "user",
      content: message,
    });

    // Get the module to access its knowledge base
    const module = await Module.findById(chat.moduleId);

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Associated module not found" });
    }

    // Prepare context from knowledge base
    let knowledgeBaseContext = "";
    if (module.knowledgeBase && module.knowledgeBase.length > 0) {
      knowledgeBaseContext = "Knowledge base for this module:\n";
      module.knowledgeBase.forEach((item) => {
        knowledgeBaseContext += `Q: ${item.question}\nA: ${item.answer}\n\n`;
      });
    }

    // Extract the last few messages for context (limit to 10 for API efficiency)
    const recentMessages = chat.messages.slice(-10).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    // Prepare messages for OpenAI API
    const messages = [
      {
        role: "system",
        content: `You are a helpful AI assistant specializing in sales training. You help trainees learn about the sales techniques and concepts covered in their training modules.
        
        Module Title: ${module.title}
        Module Description: ${module.description}
        
        ${knowledgeBaseContext}
        
        Answer questions based on this knowledge base. If you don't know the answer, say so politely and suggest asking their trainer for more information. Be concise but informative.`,
      },
      ...recentMessages,
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to chat
    chat.messages.push({
      sender: "ai",
      content: aiResponse,
    });

    // Update chat with new messages
    chat = await chat.save();

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Find chat by module and user
    const chat = await Chat.findOne({
      userId: req.user._id,
      moduleId,
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "No chat found for this module" });
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
