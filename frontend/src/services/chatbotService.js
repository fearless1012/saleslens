import axios from "axios";

// Initialize or get a chat
export const initializeChat = async (moduleId) => {
  try {
    const response = await axios.post("/api/chatbot/initialize", { moduleId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send a message
export const sendMessage = async (chatId, message) => {
  try {
    const response = await axios.post("/api/chatbot/message", {
      chatId,
      message,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get chat history for a specific module
export const getChatHistory = async (moduleId) => {
  try {
    const response = await axios.get(`/api/chatbot/${moduleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
