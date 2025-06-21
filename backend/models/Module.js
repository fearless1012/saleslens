const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  resources: [
    {
      title: String,
      fileUrl: String,
      type: String, // 'document', 'video', 'link', etc.
    },
  ],
  knowledgeBase: [
    {
      question: String,
      answer: String,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Module", moduleSchema);
