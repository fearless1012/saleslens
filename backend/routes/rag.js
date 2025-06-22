const express = require('express');
const router = express.Router();
const RAGService = require('../services/RAGService');
const Interaction = require('../models/Interaction');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const ragService = new RAGService();

// Chat with domain expert using RAG
router.post('/chat', auth, async (req, res) => {
  try {
    const { 
      query, 
      sessionId = uuidv4(),
      conversationType = 'expert',
      maxTokens = 1000,
      includeFollowUp = true
    } = req.body;
    
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const startTime = Date.now();

    // Generate RAG response
    const ragResponse = await ragService.generateResponse(
      query, 
      userId, 
      conversationType, 
      maxTokens
    );

    const responseTime = Date.now() - startTime;

    // Generate follow-up questions if requested
    let followUpQuestions = [];
    if (includeFollowUp && ragResponse.confidence > 0.5) {
      try {
        followUpQuestions = await ragService.generateFollowUpQuestions(
          ragResponse.sources.map(s => s.sourceId).join(', '),
          query,
          ragResponse.response
        );
      } catch (followUpError) {
        console.warn('Could not generate follow-up questions:', followUpError);
      }
    }

    // Save interaction to database
    const interaction = new Interaction({
      userId,
      sessionId,
      query,
      response: ragResponse.response,
      sources: ragResponse.sources,
      confidence: ragResponse.confidence,
      conversationType,
      responseTime,
      metadata: {
        ...ragResponse.metadata,
        maxTokens,
        followUpQuestions
      }
    });

    await interaction.save();

    res.json({
      success: true,
      interactionId: interaction._id,
      sessionId,
      response: ragResponse.response,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources,
      followUpQuestions,
      metadata: {
        responseTime,
        contextDocuments: ragResponse.sources.length,
        conversationType
      }
    });

  } catch (error) {
    console.error('Error in RAG chat:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      message: error.message 
    });
  }
});

// Provide feedback on response
router.post('/feedback', auth, async (req, res) => {
  try {
    const { interactionId, feedback, comment } = req.body;
    const userId = req.user.id;

    if (!interactionId || !feedback) {
      return res.status(400).json({ error: 'InteractionId and feedback are required' });
    }

    if (!['positive', 'negative', 'neutral'].includes(feedback)) {
      return res.status(400).json({ 
        error: 'Feedback must be positive, negative, or neutral' 
      });
    }

    // Update interaction with feedback
    const interaction = await Interaction.findOneAndUpdate(
      { _id: interactionId, userId },
      { 
        feedback,
        $set: { 'metadata.comment': comment }
      },
      { new: true }
    );

    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    // Provide feedback to RAG service for learning
    await ragService.provideFeedback(interactionId, feedback, userId);

    res.json({
      success: true,
      message: 'Feedback recorded successfully',
      interaction: {
        id: interaction._id,
        feedback: interaction.feedback,
        confidence: interaction.confidence
      }
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get conversation history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      sessionId, 
      page = 1, 
      limit = 20,
      conversationType,
      minConfidence = 0
    } = req.query;

    const skip = (page - 1) * limit;
    
    const filter = { userId };
    
    if (sessionId) {
      filter.sessionId = sessionId;
    }
    
    if (conversationType) {
      filter.conversationType = conversationType;
    }
    
    if (minConfidence > 0) {
      filter.confidence = { $gte: parseFloat(minConfidence) };
    }

    const [interactions, total] = await Promise.all([
      Interaction.find(filter)
        .select('sessionId query response confidence feedback conversationType sources createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Interaction.countDocuments(filter)
    ]);

    // Group by session if no specific session requested
    let groupedInteractions = interactions;
    if (!sessionId) {
      const sessionGroups = {};
      interactions.forEach(interaction => {
        if (!sessionGroups[interaction.sessionId]) {
          sessionGroups[interaction.sessionId] = [];
        }
        sessionGroups[interaction.sessionId].push(interaction);
      });
      
      groupedInteractions = Object.entries(sessionGroups).map(([sessionId, sessionInteractions]) => ({
        sessionId,
        interactions: sessionInteractions,
        lastActivity: sessionInteractions[0].createdAt,
        totalInteractions: sessionInteractions.length,
        averageConfidence: sessionInteractions.reduce((sum, i) => sum + i.confidence, 0) / sessionInteractions.length
      }));
    }

    res.json({
      success: true,
      data: groupedInteractions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: interactions.length,
        totalInteractions: total
      }
    });

  } catch (error) {
    console.error('Error getting conversation history:', error);
    res.status(500).json({ error: 'Failed to get conversation history' });
  }
});

// Get analytics and statistics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(days));

    const [
      totalInteractions,
      feedbackStats,
      confidenceStats,
      conversationTypeStats,
      dailyStats
    ] = await Promise.all([
      Interaction.countDocuments({ userId, createdAt: { $gte: fromDate } }),
      
      Interaction.getFeedbackStats(userId, parseInt(days)),
      
      Interaction.aggregate([
        {
          $match: { userId, createdAt: { $gte: fromDate } }
        },
        {
          $group: {
            _id: null,
            avgConfidence: { $avg: '$confidence' },
            minConfidence: { $min: '$confidence' },
            maxConfidence: { $max: '$confidence' },
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ]),
      
      Interaction.aggregate([
        {
          $match: { userId, createdAt: { $gte: fromDate } }
        },
        {
          $group: {
            _id: '$conversationType',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        }
      ]),
      
      Interaction.aggregate([
        {
          $match: { userId, createdAt: { $gte: fromDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' },
            positiveCount: {
              $sum: { $cond: [{ $eq: ['$feedback', 'positive'] }, 1, 0] }
            },
            negativeCount: {
              $sum: { $cond: [{ $eq: ['$feedback', 'negative'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        summary: {
          totalInteractions,
          averageConfidence: confidenceStats[0]?.avgConfidence || 0,
          averageResponseTime: confidenceStats[0]?.avgResponseTime || 0
        },
        feedback: feedbackStats.reduce((acc, stat) => {
          acc[stat._id || 'neutral'] = {
            count: stat.count,
            avgConfidence: stat.avgConfidence,
            avgResponseTime: stat.avgResponseTime
          };
          return acc;
        }, {}),
        conversationTypes: conversationTypeStats,
        dailyActivity: dailyStats,
        period: {
          days: parseInt(days),
          from: fromDate.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

module.exports = router;
