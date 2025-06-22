const express = require('express');
const router = express.Router();
const KnowledgeGraphService = require('../services/KnowledgeGraphService');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const knowledgeGraph = new KnowledgeGraphService();

// Create knowledge graph from text data
router.post('/create', auth, async (req, res) => {
  try {
    const { data, sourceId, title } = req.body;
    const userId = req.user.id;

    if (!data || !sourceId) {
      return res.status(400).json({ error: 'Data and sourceId are required' });
    }

    // Create document record
    const document = new Document({
      userId,
      sourceId,
      title: title || `Document ${sourceId}`,
      content: data.substring(0, 5000), // Store first 5000 chars for search
      originalData: data,
      processingStatus: 'processing'
    });

    await document.save();

    try {
      // Create knowledge graph
      const result = await knowledgeGraph.createKnowledgeGraph(data, sourceId, userId);
      
      // Update document with knowledge graph information
      document.knowledgeGraphId = result.graphId;
      document.metadata = {
        wordCount: result.extracted.metadata.wordCount,
        sentenceCount: result.extracted.metadata.sentenceCount,
        extractedEntities: result.extracted.entities,
        importantTerms: result.extracted.entities.importantTerms || [],
        relationships: result.extracted.relationships || []
      };
      document.processingStatus = 'completed';
      
      await document.save();

      res.json({
        success: true,
        documentId: document._id,
        knowledgeGraphId: result.graphId,
        metadata: document.metadata
      });

    } catch (processingError) {
      document.processingStatus = 'failed';
      document.processingError = processingError.message;
      await document.save();
      
      throw processingError;
    }

  } catch (error) {
    console.error('Error creating knowledge graph:', error);
    res.status(500).json({ error: 'Failed to create knowledge graph' });
  }
});

// Query knowledge graph
router.post('/query', auth, async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await knowledgeGraph.queryKnowledgeGraph(query, userId, limit);
    
    // Update usage statistics for returned documents
    for (const result of results) {
      try {
        await Document.findOne({ knowledgeGraphId: result.documentId })
          ?.updateUsage(result.relevanceScore);
      } catch (updateError) {
        console.warn('Could not update document usage:', updateError);
      }
    }

    res.json({
      success: true,
      query,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Error querying knowledge graph:', error);
    res.status(500).json({ error: 'Failed to query knowledge graph' });
  }
});

// Provide feedback on knowledge graph
router.post('/feedback', auth, async (req, res) => {
  try {
    const { documentId, feedback, userQuery, response } = req.body;
    const userId = req.user.id;

    if (!documentId || !feedback || !userQuery || !response) {
      return res.status(400).json({ 
        error: 'DocumentId, feedback, userQuery, and response are required' 
      });
    }

    if (!['positive', 'negative', 'neutral'].includes(feedback)) {
      return res.status(400).json({ 
        error: 'Feedback must be positive, negative, or neutral' 
      });
    }

    await knowledgeGraph.updateKnowledgeGraph(documentId, feedback, userQuery, response);
    
    // Update document feedback stats
    const document = await Document.findOne({ knowledgeGraphId: documentId });
    if (document) {
      await document.updateUsage(0, feedback); // 0 relevance score for feedback-only updates
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get knowledge graph statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [graphStats, docStats] = await Promise.all([
      knowledgeGraph.getGraphStatistics(userId),
      Document.getProcessingStats(userId)
    ]);

    res.json({
      success: true,
      knowledgeGraph: graphStats,
      documents: docStats
    });

  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// List user's documents
router.get('/documents', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status = 'completed' } = req.query;

    const skip = (page - 1) * limit;
    
    const filter = { userId };
    if (status !== 'all') {
      filter.processingStatus = status;
    }

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .select('title sourceId processingStatus metadata usage createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Document.countDocuments(filter)
    ]);

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        sourceId: doc.sourceId,
        status: doc.processingStatus,
        wordCount: doc.metadata?.wordCount || 0,
        queriesCount: doc.usage?.queriesCount || 0,
        averageRelevance: doc.usage?.averageRelevanceScore || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: documents.length,
        totalDocuments: total
      }
    });

  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

module.exports = router;
