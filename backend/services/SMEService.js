const KnowledgeGraphService = require('./KnowledgeGraphService');
const RAGService = require('./RAGService');
const FinetuningService = require('./FinetuningService');
const Document = require('../models/Document');
const Interaction = require('../models/Interaction');
const winston = require('winston');

class SMEService {
  constructor() {
    this.knowledgeGraph = new KnowledgeGraphService();
    this.rag = new RAGService();
    this.finetuning = new FinetuningService();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'sme-service' },
      transports: [
        new winston.transports.Console()
      ]
    });
  }

  // Knowledge Graph Methods
  async createKnowledgeGraph(data, sourceId, userId, title = null) {
    try {
      this.logger.info(`Creating knowledge graph for user: ${userId}, source: ${sourceId}`);
      
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
        const result = await this.knowledgeGraph.createKnowledgeGraph(data, sourceId, userId);
        
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

        return {
          success: true,
          documentId: document._id,
          knowledgeGraphId: result.graphId,
          metadata: document.metadata
        };

      } catch (processingError) {
        document.processingStatus = 'failed';
        document.processingError = processingError.message;
        await document.save();
        
        throw processingError;
      }

    } catch (error) {
      this.logger.error('Error creating knowledge graph:', error);
      throw new Error(`Failed to create knowledge graph: ${error.message}`);
    }
  }

  async queryKnowledgeGraph(query, userId, limit = 10) {
    try {
      this.logger.info(`Querying knowledge graph for user: ${userId}`);
      
      const results = await this.knowledgeGraph.queryKnowledgeGraph(query, userId, limit);
      
      // Update usage statistics for returned documents
      for (const result of results) {
        try {
          await Document.findOne({ knowledgeGraphId: result.documentId })
            ?.updateUsage(result.relevanceScore);
        } catch (updateError) {
          this.logger.warn('Could not update document usage:', updateError);
        }
      }

      return {
        success: true,
        query,
        results,
        count: results.length
      };

    } catch (error) {
      this.logger.error('Error querying knowledge graph:', error);
      throw new Error(`Failed to query knowledge graph: ${error.message}`);
    }
  }

  async provideKnowledgeGraphFeedback(documentId, feedback, userQuery, response, userId) {
    try {
      await this.knowledgeGraph.updateKnowledgeGraph(documentId, feedback, userQuery, response);
      
      // Update document feedback stats
      const document = await Document.findOne({ knowledgeGraphId: documentId, userId });
      if (document) {
        await document.updateUsage(0, feedback);
      }

      return { success: true, message: 'Feedback recorded successfully' };

    } catch (error) {
      this.logger.error('Error providing knowledge graph feedback:', error);
      throw new Error(`Failed to record feedback: ${error.message}`);
    }
  }

  async getKnowledgeGraphStats(userId) {
    try {
      const [graphStats, docStats] = await Promise.all([
        this.knowledgeGraph.getGraphStatistics(userId),
        Document.getProcessingStats(userId)
      ]);

      return {
        success: true,
        knowledgeGraph: graphStats,
        documents: docStats
      };

    } catch (error) {
      this.logger.error('Error getting knowledge graph statistics:', error);
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // RAG Methods
  async chatWithExpert(query, userId, options = {}) {
    try {
      const {
        sessionId,
        conversationType = 'expert',
        maxTokens = 1000,
        includeFollowUp = true
      } = options;

      this.logger.info(`Starting RAG chat for user: ${userId}`);
      
      const startTime = Date.now();

      // Generate RAG response
      const ragResponse = await this.rag.generateResponse(
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
          followUpQuestions = await this.rag.generateFollowUpQuestions(
            ragResponse.sources.map(s => s.sourceId).join(', '),
            query,
            ragResponse.response
          );
        } catch (followUpError) {
          this.logger.warn('Could not generate follow-up questions:', followUpError);
        }
      }

      // Save interaction to database if sessionId provided
      let interactionId = null;
      if (sessionId) {
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
        interactionId = interaction._id;
      }

      return {
        success: true,
        interactionId,
        response: ragResponse.response,
        confidence: ragResponse.confidence,
        sources: ragResponse.sources,
        followUpQuestions,
        metadata: {
          responseTime,
          contextDocuments: ragResponse.sources.length,
          conversationType
        }
      };

    } catch (error) {
      this.logger.error('Error in RAG chat:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async provideRAGFeedback(interactionId, feedback, userId, comment = null) {
    try {
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
        throw new Error('Interaction not found');
      }

      // Provide feedback to RAG service for learning
      await this.rag.provideFeedback(interactionId, feedback, userId);

      return {
        success: true,
        message: 'Feedback recorded successfully',
        interaction: {
          id: interaction._id,
          feedback: interaction.feedback,
          confidence: interaction.confidence
        }
      };

    } catch (error) {
      this.logger.error('Error providing RAG feedback:', error);
      throw new Error(`Failed to record feedback: ${error.message}`);
    }
  }

  async getConversationHistory(userId, options = {}) {
    try {
      const {
        sessionId,
        page = 1,
        limit = 20,
        conversationType,
        minConfidence = 0
      } = options;

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

      return {
        success: true,
        data: interactions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: interactions.length,
          totalInteractions: total
        }
      };

    } catch (error) {
      this.logger.error('Error getting conversation history:', error);
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }
  }

  // Finetuning Methods
  async collectTrainingData(userId, options = {}) {
    try {
      const result = await this.finetuning.collectTrainingData(userId, options);
      
      return {
        success: true,
        message: 'Training data collected successfully',
        data: {
          filepath: result.filepath,
          sampleCount: result.sampleCount,
          metadata: result.metadata
        }
      };

    } catch (error) {
      this.logger.error('Error collecting training data:', error);
      throw new Error(`Failed to collect training data: ${error.message}`);
    }
  }

  async startFinetuning(userId, trainingDataPath, options = {}) {
    try {
      const result = await this.finetuning.startFinetuning(userId, trainingDataPath, options);
      
      return {
        success: true,
        message: 'Finetuning job started successfully',
        job: {
          jobId: result.jobId,
          modelName: result.modelName,
          status: result.status,
          metadata: result.metadata
        }
      };

    } catch (error) {
      this.logger.error('Error starting finetuning:', error);
      throw new Error(`Failed to start finetuning: ${error.message}`);
    }
  }

  async checkFinetuningStatus(jobId) {
    try {
      const status = await this.finetuning.checkFinetuningStatus(jobId);
      return { success: true, job: status };

    } catch (error) {
      this.logger.error('Error checking finetuning status:', error);
      throw new Error(`Failed to check job status: ${error.message}`);
    }
  }

  async listFinetuningJobs(userId) {
    try {
      const jobs = await this.finetuning.listFinetuningJobs(userId);
      return { success: true, jobs };

    } catch (error) {
      this.logger.error('Error listing finetuning jobs:', error);
      throw new Error(`Failed to list jobs: ${error.message}`);
    }
  }

  async evaluateModel(modelId, userId, testDataPath = null) {
    try {
      const evaluation = await this.finetuning.evaluateModel(modelId, userId, testDataPath);
      
      return {
        success: true,
        evaluation: {
          modelId: evaluation.modelId,
          testSamples: evaluation.testSamples,
          metrics: evaluation.metrics,
          evaluatedAt: evaluation.evaluatedAt,
          summary: {
            accuracy: `${(evaluation.metrics.accuracy * 100).toFixed(2)}%`,
            averageConfidence: evaluation.metrics.averageConfidence.toFixed(3),
            totalQuestions: evaluation.metrics.totalQuestions,
            correctAnswers: evaluation.metrics.correctAnswers
          }
        }
      };

    } catch (error) {
      this.logger.error('Error evaluating model:', error);
      throw new Error(`Failed to evaluate model: ${error.message}`);
    }
  }

  // Utility Methods
  async getDocuments(userId, options = {}) {
    try {
      const { page = 1, limit = 20, status = 'completed' } = options;
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

      return {
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
      };

    } catch (error) {
      this.logger.error('Error getting documents:', error);
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  // Cleanup resources
  async close() {
    try {
      await this.knowledgeGraph.close();
      await this.rag.close();
    } catch (error) {
      this.logger.error('Error closing SME service:', error);
    }
  }
}

module.exports = SMEService;
