const { LlamaAPI } = require('llama-api');
const Interaction = require('../models/Interaction');
const Document = require('../models/Document');
const KnowledgeGraphService = require('./KnowledgeGraphService');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

class FinetuningService {
  constructor() {
    this.llamaAPI = new LlamaAPI(process.env.LLAMA_API_KEY);
    this.knowledgeGraph = new KnowledgeGraphService();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'finetuning' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/finetuning.log' })
      ]
    });

    this.trainingDataPath = path.join(__dirname, '..', 'training_data');
    this.modelsPath = path.join(__dirname, '..', 'models', 'finetuned');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.trainingDataPath, { recursive: true });
      await fs.mkdir(this.modelsPath, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating directories:', error);
    }
  }

  // Collect training data from interactions and knowledge graph
  async collectTrainingData(userId, options = {}) {
    const {
      minQualityScore = 0.7,
      maxSamples = 1000,
      includeNegativeExamples = false,
      timeRange = 30 // days
    } = options;

    try {
      this.logger.info(`Collecting training data for user: ${userId}`);
      
      // Get high-quality interactions
      const interactions = await Interaction.getTrainingData(userId, minQualityScore, maxSamples);
      
      // Get knowledge graph data for context enhancement
      const kgStats = await this.knowledgeGraph.getGraphStatistics(userId);
      
      const trainingData = {
        metadata: {
          userId,
          collectedAt: new Date().toISOString(),
          totalInteractions: interactions.length,
          qualityThreshold: minQualityScore,
          knowledgeGraphStats: kgStats
        },
        samples: []
      };

      // Process interactions into training format
      for (const interaction of interactions) {
        const sample = await this.processInteractionForTraining(interaction, userId);
        if (sample) {
          trainingData.samples.push(sample);
        }
      }

      // Add negative examples if requested
      if (includeNegativeExamples) {
        const negativeExamples = await this.generateNegativeExamples(userId, Math.floor(maxSamples * 0.2));
        trainingData.samples.push(...negativeExamples);
      }

      // Save training data
      const filename = `training_data_${userId}_${Date.now()}.json`;
      const filepath = path.join(this.trainingDataPath, filename);
      await fs.writeFile(filepath, JSON.stringify(trainingData, null, 2));

      this.logger.info(`Training data collected: ${trainingData.samples.length} samples saved to ${filename}`);
      return {
        filepath,
        metadata: trainingData.metadata,
        sampleCount: trainingData.samples.length
      };

    } catch (error) {
      this.logger.error('Error collecting training data:', error);
      throw error;
    }
  }

  // Process interaction into training format
  async processInteractionForTraining(interaction, userId) {
    try {
      // Get enhanced context from knowledge graph
      const relevantDocs = await this.knowledgeGraph.queryKnowledgeGraph(
        interaction.query, userId, 3
      );

      // Build enhanced context
      const context = this.buildEnhancedContext(relevantDocs, interaction.sources);
      
      // Create training sample in chat format
      const sample = {
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable domain expert assistant. Use the provided context to answer questions accurately and comprehensively."
          },
          {
            role: "user",
            content: `Context: ${context}\n\nQuestion: ${interaction.query}`
          },
          {
            role: "assistant",
            content: interaction.response
          }
        ],
        metadata: {
          interactionId: interaction._id,
          originalConfidence: interaction.confidence,
          qualityScore: interaction.qualityScore,
          conversationType: interaction.conversationType,
          sourceCount: relevantDocs.length,
          feedback: interaction.feedback
        }
      };

      return sample;

    } catch (error) {
      this.logger.error('Error processing interaction for training:', error);
      return null;
    }
  }

  // Build enhanced context from knowledge graph
  buildEnhancedContext(relevantDocs, originalSources = []) {
    let context = '';
    
    relevantDocs.forEach((doc, index) => {
      context += `Document ${index + 1}:\n`;
      context += `Content: ${doc.content}\n`;
      
      if (doc.relevantTerms?.length > 0) {
        context += `Key Terms: ${doc.relevantTerms.slice(0, 5).join(', ')}\n`;
      }
      
      if (doc.relevantEntities?.length > 0) {
        context += `Entities: ${doc.relevantEntities.slice(0, 3).join(', ')}\n`;
      }
      
      if (doc.relevantConcepts?.length > 0) {
        const concepts = doc.relevantConcepts
          .filter(c => c.subject && c.object)
          .map(c => `${c.subject} ${c.predicate} ${c.object}`)
          .slice(0, 2);
        if (concepts.length > 0) {
          context += `Relationships: ${concepts.join('; ')}\n`;
        }
      }
      
      context += '\n';
    });
    
    return context.trim();
  }

  // Generate negative examples for contrastive learning
  async generateNegativeExamples(userId, count = 100) {
    try {
      this.logger.info(`Generating ${count} negative examples for user: ${userId}`);
      
      // Get random interactions with low confidence or negative feedback
      const negativeInteractions = await Interaction.find({
        userId,
        $or: [
          { confidence: { $lt: 0.5 } },
          { feedback: 'negative' }
        ]
      }).limit(count);

      const negativeExamples = [];

      for (const interaction of negativeInteractions) {
        // Create negative example by pairing query with incorrect or low-quality response
        const negativeExample = {
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable domain expert assistant. Use the provided context to answer questions accurately and comprehensively."
            },
            {
              role: "user",
              content: `Question: ${interaction.query}`
            },
            {
              role: "assistant",
              content: "I don't have enough information to answer this question accurately. Please provide more specific details or context."
            }
          ],
          metadata: {
            type: 'negative_example',
            originalInteractionId: interaction._id,
            originalConfidence: interaction.confidence,
            reason: 'low_confidence_or_negative_feedback'
          }
        };

        negativeExamples.push(negativeExample);
      }

      return negativeExamples;

    } catch (error) {
      this.logger.error('Error generating negative examples:', error);
      return [];
    }
  }

  // Start finetuning process
  async startFinetuning(userId, trainingDataPath, options = {}) {
    const {
      modelName = `sme-model-${userId}-${Date.now()}`,
      epochs = 3,
      learningRate = 5e-5,
      batchSize = 4,
      validationSplit = 0.1
    } = options;

    try {
      this.logger.info(`Starting finetuning for user: ${userId}`);
      
      // Load training data
      const trainingData = JSON.parse(await fs.readFile(trainingDataPath, 'utf8'));
      
      if (trainingData.samples.length < 10) {
        throw new Error('Insufficient training data. Need at least 10 samples.');
      }

      // Split data into training and validation
      const shuffled = this.shuffleArray([...trainingData.samples]);
      const validationCount = Math.floor(shuffled.length * validationSplit);
      const validationData = shuffled.slice(0, validationCount);
      const trainData = shuffled.slice(validationCount);

      // Prepare data in Llama format
      const trainFile = await this.prepareTrainingFile(trainData, 'train');
      const validFile = await this.prepareTrainingFile(validationData, 'validation');

      // Start finetuning job using Llama API
      const finetuningJob = await this.llamaAPI.createFineTuningJob({
        training_file: trainFile,
        validation_file: validFile,
        model: "llama-3.1-8b-instruct", // Base model
        suffix: modelName,
        hyperparameters: {
          n_epochs: epochs,
          learning_rate_multiplier: learningRate,
          batch_size: batchSize
        }
      });

      // Log finetuning job
      const jobMetadata = {
        userId,
        jobId: finetuningJob.id,
        modelName,
        trainingDataPath,
        trainingSize: trainData.length,
        validationSize: validationData.length,
        hyperparameters: {
          epochs,
          learningRate,
          batchSize,
          validationSplit
        },
        status: 'started',
        startedAt: new Date().toISOString()
      };

      const jobLogPath = path.join(this.modelsPath, `job_${finetuningJob.id}.json`);
      await fs.writeFile(jobLogPath, JSON.stringify(jobMetadata, null, 2));

      this.logger.info(`Finetuning job started: ${finetuningJob.id}`);
      
      return {
        jobId: finetuningJob.id,
        modelName,
        status: 'started',
        metadata: jobMetadata
      };

    } catch (error) {
      this.logger.error('Error starting finetuning:', error);
      throw error;
    }
  }

  // Prepare training file in JSONL format
  async prepareTrainingFile(samples, type = 'train') {
    try {
      const filename = `${type}_${Date.now()}.jsonl`;
      const filepath = path.join(this.trainingDataPath, filename);
      
      const jsonlContent = samples
        .map(sample => JSON.stringify(sample))
        .join('\n');
      
      await fs.writeFile(filepath, jsonlContent);
      
      this.logger.info(`Prepared ${type} file with ${samples.length} samples: ${filename}`);
      return filepath;

    } catch (error) {
      this.logger.error(`Error preparing ${type} file:`, error);
      throw error;
    }
  }

  // Check finetuning job status
  async checkFinetuningStatus(jobId) {
    try {
      const job = await this.llamaAPI.retrieveFineTuningJob(jobId);
      
      // Update job metadata
      const jobLogPath = path.join(this.modelsPath, `job_${jobId}.json`);
      try {
        const existingMetadata = JSON.parse(await fs.readFile(jobLogPath, 'utf8'));
        existingMetadata.status = job.status;
        existingMetadata.lastChecked = new Date().toISOString();
        
        if (job.fine_tuned_model) {
          existingMetadata.fineTunedModel = job.fine_tuned_model;
        }
        
        if (job.training_files) {
          existingMetadata.trainingFiles = job.training_files;
        }
        
        await fs.writeFile(jobLogPath, JSON.stringify(existingMetadata, null, 2));
      } catch (metadataError) {
        this.logger.warn('Could not update job metadata:', metadataError);
      }

      return {
        jobId: job.id,
        status: job.status,
        fineTunedModel: job.fine_tuned_model,
        createdAt: job.created_at,
        finishedAt: job.finished_at,
        resultFiles: job.result_files,
        trainingFiles: job.training_files
      };

    } catch (error) {
      this.logger.error('Error checking finetuning status:', error);
      throw error;
    }
  }

  // List all finetuning jobs for a user
  async listFinetuningJobs(userId) {
    try {
      const files = await fs.readdir(this.modelsPath);
      const jobFiles = files.filter(f => f.startsWith('job_') && f.endsWith('.json'));
      
      const jobs = [];
      
      for (const file of jobFiles) {
        try {
          const jobData = JSON.parse(await fs.readFile(path.join(this.modelsPath, file), 'utf8'));
          if (jobData.userId === userId) {
            jobs.push(jobData);
          }
        } catch (fileError) {
          this.logger.warn(`Could not read job file ${file}:`, fileError);
        }
      }

      return jobs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    } catch (error) {
      this.logger.error('Error listing finetuning jobs:', error);
      throw error;
    }
  }

  // Evaluate model performance
  async evaluateModel(modelId, userId, testDataPath = null) {
    try {
      this.logger.info(`Evaluating model: ${modelId} for user: ${userId}`);
      
      let testData;
      
      if (testDataPath) {
        testData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
      } else {
        // Generate test data from recent interactions
        const recentInteractions = await Interaction.find({
          userId,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          feedback: 'positive'
        }).limit(50);

        testData = { samples: [] };
        for (const interaction of recentInteractions) {
          const sample = await this.processInteractionForTraining(interaction, userId);
          if (sample) {
            testData.samples.push(sample);
          }
        }
      }

      if (testData.samples.length === 0) {
        throw new Error('No test data available');
      }

      const results = {
        modelId,
        testSamples: testData.samples.length,
        evaluatedAt: new Date().toISOString(),
        metrics: {
          totalQuestions: 0,
          correctAnswers: 0,
          averageConfidence: 0,
          responseQuality: 0
        },
        details: []
      };

      // Evaluate each test sample
      for (const sample of testData.samples.slice(0, 20)) { // Limit to 20 for cost control
        const userMessage = sample.messages.find(m => m.role === 'user');
        const expectedResponse = sample.messages.find(m => m.role === 'assistant');
        
        if (!userMessage || !expectedResponse) continue;

        try {
          // Generate response using finetuned model
          const response = await this.llamaAPI.run({
            model: modelId,
            messages: sample.messages.slice(0, -1), // Exclude expected response
            max_tokens: 500,
            temperature: 0.3
          });

          const actualResponse = response.choices[0].message.content;
          
          // Calculate similarity between expected and actual response
          const similarity = this.calculateResponseSimilarity(expectedResponse.content, actualResponse);
          
          results.metrics.totalQuestions++;
          if (similarity > 0.7) {
            results.metrics.correctAnswers++;
          }
          
          results.details.push({
            question: userMessage.content,
            expected: expectedResponse.content,
            actual: actualResponse,
            similarity,
            metadata: sample.metadata
          });

        } catch (evaluationError) {
          this.logger.warn('Error evaluating sample:', evaluationError);
        }
      }

      // Calculate final metrics
      if (results.metrics.totalQuestions > 0) {
        results.metrics.accuracy = results.metrics.correctAnswers / results.metrics.totalQuestions;
        results.metrics.averageConfidence = results.details.reduce((sum, d) => sum + (d.similarity || 0), 0) / results.details.length;
      }

      // Save evaluation results
      const evaluationPath = path.join(this.modelsPath, `evaluation_${modelId}_${Date.now()}.json`);
      await fs.writeFile(evaluationPath, JSON.stringify(results, null, 2));

      this.logger.info(`Model evaluation completed. Accuracy: ${(results.metrics.accuracy * 100).toFixed(2)}%`);
      return results;

    } catch (error) {
      this.logger.error('Error evaluating model:', error);
      throw error;
    }
  }

  // Calculate similarity between two responses
  calculateResponseSimilarity(expected, actual) {
    // Simple implementation using Jaccard similarity on words
    const expectedWords = new Set(expected.toLowerCase().split(/\s+/));
    const actualWords = new Set(actual.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...expectedWords].filter(word => actualWords.has(word)));
    const union = new Set([...expectedWords, ...actualWords]);
    
    return intersection.size / union.size;
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Cleanup old training data and models
  async cleanup(retentionDays = 30) {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      // Clean up training data files
      const trainingFiles = await fs.readdir(this.trainingDataPath);
      for (const file of trainingFiles) {
        const filePath = path.join(this.trainingDataPath, file);
        const stats = await fs.stat(filePath);
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          this.logger.info(`Cleaned up old training file: ${file}`);
        }
      }

      // Clean up old job metadata
      const modelFiles = await fs.readdir(this.modelsPath);
      for (const file of modelFiles) {
        if (file.startsWith('job_') || file.startsWith('evaluation_')) {
          const filePath = path.join(this.modelsPath, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            this.logger.info(`Cleaned up old metadata file: ${file}`);
          }
        }
      }

      this.logger.info('Cleanup completed');

    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}

module.exports = FinetuningService;
