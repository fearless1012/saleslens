const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0, // Percentage of completion
    min: 0,
    max: 100,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Compound index to ensure unique user-module combinations
progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
