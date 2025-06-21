const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  sources: [{
    documentId: String,
    sourceId: String,
    relevanceScore: Number,
    relevantTerms: [String],
    relevantEntities: [String]
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  feedback: {
    type: String,
    enum: ['positive', 'negative', 'neutral', null],
    default: null
  },
  conversationType: {
    type: String,
    enum: ['expert', 'technical', 'conversational'],
    default: 'expert'
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  metadata: {
    contextDocuments: Number,
    maxTokens: Number,
    temperature: Number,
    followUpQuestions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
interactionSchema.index({ userId: 1, createdAt: -1 });
interactionSchema.index({ sessionId: 1, createdAt: -1 });
interactionSchema.index({ confidence: -1 });
interactionSchema.index({ feedback: 1 });

// Update the updatedAt field before saving
interactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for response quality assessment
interactionSchema.virtual('qualityScore').get(function() {
  let score = this.confidence * 0.6; // Base score from confidence
  
  if (this.feedback === 'positive') {
    score += 0.4;
  } else if (this.feedback === 'negative') {
    score -= 0.3;
  }
  
  // Factor in response time (faster is better, up to a point)
  if (this.responseTime > 0) {
    const timeScore = Math.max(0, 1 - (this.responseTime / 10000)); // Normalize to 10 seconds
    score += timeScore * 0.1;
  }
  
  return Math.max(0, Math.min(1, score));
});

// Static method to get interactions for finetuning
interactionSchema.statics.getTrainingData = function(userId, minQualityScore = 0.7, limit = 1000) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        feedback: { $ne: 'negative' },
        confidence: { $gte: minQualityScore }
      }
    },
    {
      $addFields: {
        qualityScore: {
          $add: [
            { $multiply: ['$confidence', 0.6] },
            {
              $switch: {
                branches: [
                  { case: { $eq: ['$feedback', 'positive'] }, then: 0.4 },
                  { case: { $eq: ['$feedback', 'negative'] }, then: -0.3 }
                ],
                default: 0
              }
            }
          ]
        }
      }
    },
    {
      $match: {
        qualityScore: { $gte: minQualityScore }
      }
    },
    {
      $sort: { qualityScore: -1, createdAt: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        query: 1,
        response: 1,
        sources: 1,
        confidence: 1,
        conversationType: 1,
        qualityScore: 1,
        createdAt: 1
      }
    }
  ]);
};

// Static method to get feedback statistics
interactionSchema.statics.getFeedbackStats = function(userId, days = 30) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: fromDate }
      }
    },
    {
      $group: {
        _id: '$feedback',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Interaction', interactionSchema);
