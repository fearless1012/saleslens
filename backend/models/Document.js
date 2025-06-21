const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sourceId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  originalData: {
    type: String, // Store the original raw data
    required: true
  },
  knowledgeGraphId: {
    type: String, // Neo4j graph ID
    index: true
  },
  metadata: {
    wordCount: Number,
    sentenceCount: Number,
    extractedEntities: {
      people: [String],
      places: [String],
      organizations: [String],
      topics: [String],
      concepts: [String]
    },
    importantTerms: [{
      term: String,
      score: Number,
      stemmed: String
    }],
    relationships: [{
      subject: String,
      predicate: String,
      object: String,
      confidence: Number
    }]
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  usage: {
    queriesCount: {
      type: Number,
      default: 0
    },
    lastQueried: Date,
    averageRelevanceScore: {
      type: Number,
      default: 0
    },
    feedbackStats: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 }
    }
  },
  version: {
    type: Number,
    default: 1
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

// Indexes for efficient querying
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ sourceId: 1 });
documentSchema.index({ knowledgeGraphId: 1 });
documentSchema.index({ processingStatus: 1 });
documentSchema.index({ 'usage.queriesCount': -1 });
documentSchema.index({ 'usage.averageRelevanceScore': -1 });

// Text index for content search
documentSchema.index({ 
  title: 'text', 
  content: 'text',
  'metadata.extractedEntities.people': 'text',
  'metadata.extractedEntities.organizations': 'text',
  'metadata.extractedEntities.topics': 'text'
});

// Update the updatedAt field before saving
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for content preview
documentSchema.virtual('contentPreview').get(function() {
  return this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
});

// Virtual for usage score
documentSchema.virtual('usageScore').get(function() {
  const queriesWeight = Math.min(this.usage.queriesCount / 100, 1) * 0.4; // Normalize queries to 100
  const relevanceWeight = this.usage.averageRelevanceScore * 0.4;
  const feedbackWeight = this.calculateFeedbackScore() * 0.2;
  
  return queriesWeight + relevanceWeight + feedbackWeight;
});

// Method to calculate feedback score
documentSchema.methods.calculateFeedbackScore = function() {
  const total = this.usage.feedbackStats.positive + 
                this.usage.feedbackStats.negative + 
                this.usage.feedbackStats.neutral;
  
  if (total === 0) return 0.5; // Neutral score for no feedback
  
  const positiveRatio = this.usage.feedbackStats.positive / total;
  const negativeRatio = this.usage.feedbackStats.negative / total;
  
  return positiveRatio - (negativeRatio * 0.5); // Negative feedback has less impact
};

// Method to update usage statistics
documentSchema.methods.updateUsage = function(relevanceScore, feedback = null) {
  this.usage.queriesCount += 1;
  this.usage.lastQueried = new Date();
  
  // Update average relevance score
  const currentAvg = this.usage.averageRelevanceScore || 0;
  const count = this.usage.queriesCount;
  this.usage.averageRelevanceScore = ((currentAvg * (count - 1)) + relevanceScore) / count;
  
  // Update feedback statistics
  if (feedback) {
    this.usage.feedbackStats[feedback] += 1;
  }
  
  return this.save();
};

// Static method to get most relevant documents
documentSchema.statics.getMostRelevant = function(userId, limit = 10) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        processingStatus: 'completed'
      }
    },
    {
      $addFields: {
        usageScore: {
          $add: [
            { $multiply: [{ $min: [{ $divide: ['$usage.queriesCount', 100] }, 1] }, 0.4] },
            { $multiply: ['$usage.averageRelevanceScore', 0.4] },
            { $multiply: [
              {
                $cond: {
                  if: { $eq: [{ $add: ['$usage.feedbackStats.positive', '$usage.feedbackStats.negative', '$usage.feedbackStats.neutral'] }, 0] },
                  then: 0.5,
                  else: {
                    $subtract: [
                      { $divide: ['$usage.feedbackStats.positive', { $add: ['$usage.feedbackStats.positive', '$usage.feedbackStats.negative', '$usage.feedbackStats.neutral'] }] },
                      { $multiply: [
                        { $divide: ['$usage.feedbackStats.negative', { $add: ['$usage.feedbackStats.positive', '$usage.feedbackStats.negative', '$usage.feedbackStats.neutral'] }] },
                        0.5
                      ]}
                    ]
                  }
                }
              }, 0.2
            ]}
          ]
        }
      }
    },
    {
      $sort: { usageScore: -1, createdAt: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get processing statistics
documentSchema.statics.getProcessingStats = function(userId) {
  return this.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $group: {
        _id: '$processingStatus',
        count: { $sum: 1 },
        avgWordCount: { $avg: '$metadata.wordCount' },
        totalQueries: { $sum: '$usage.queriesCount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Document', documentSchema);
