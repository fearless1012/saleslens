const express = require('express');
const router = express.Router();
const FinetuningService = require('../services/FinetuningService');
const auth = require('../middleware/auth');

const finetuningService = new FinetuningService();

// Collect training data
router.post('/collect-data', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      minQualityScore = 0.7,
      maxSamples = 1000,
      includeNegativeExamples = false,
      timeRange = 30
    } = req.body;

    const result = await finetuningService.collectTrainingData(userId, {
      minQualityScore,
      maxSamples,
      includeNegativeExamples,
      timeRange
    });

    res.json({
      success: true,
      message: 'Training data collected successfully',
      data: {
        filepath: result.filepath,
        sampleCount: result.sampleCount,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Error collecting training data:', error);
    res.status(500).json({ 
      error: 'Failed to collect training data',
      message: error.message 
    });
  }
});

// Start finetuning job
router.post('/start', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      trainingDataPath,
      modelName,
      epochs = 3,
      learningRate = 5e-5,
      batchSize = 4,
      validationSplit = 0.1
    } = req.body;

    if (!trainingDataPath) {
      return res.status(400).json({ error: 'Training data path is required' });
    }

    const result = await finetuningService.startFinetuning(userId, trainingDataPath, {
      modelName,
      epochs,
      learningRate,
      batchSize,
      validationSplit
    });

    res.json({
      success: true,
      message: 'Finetuning job started successfully',
      job: {
        jobId: result.jobId,
        modelName: result.modelName,
        status: result.status,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Error starting finetuning:', error);
    res.status(500).json({ 
      error: 'Failed to start finetuning',
      message: error.message 
    });
  }
});

// Check finetuning job status
router.get('/jobs/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;

    const status = await finetuningService.checkFinetuningStatus(jobId);

    res.json({
      success: true,
      job: status
    });

  } catch (error) {
    console.error('Error checking job status:', error);
    res.status(500).json({ 
      error: 'Failed to check job status',
      message: error.message 
    });
  }
});

// List all finetuning jobs for user
router.get('/jobs', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const jobs = await finetuningService.listFinetuningJobs(userId);

    res.json({
      success: true,
      jobs: jobs.map(job => ({
        jobId: job.jobId,
        modelName: job.modelName,
        status: job.status,
        trainingSize: job.trainingSize,
        validationSize: job.validationSize,
        hyperparameters: job.hyperparameters,
        startedAt: job.startedAt,
        lastChecked: job.lastChecked,
        fineTunedModel: job.fineTunedModel
      }))
    });

  } catch (error) {
    console.error('Error listing jobs:', error);
    res.status(500).json({ 
      error: 'Failed to list jobs',
      message: error.message 
    });
  }
});

// Evaluate model performance
router.post('/evaluate/:modelId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { modelId } = req.params;
    const { testDataPath } = req.body;

    const evaluation = await finetuningService.evaluateModel(modelId, userId, testDataPath);

    res.json({
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
    });

  } catch (error) {
    console.error('Error evaluating model:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate model',
      message: error.message 
    });
  }
});

// Get finetuning analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const jobs = await finetuningService.listFinetuningJobs(userId);
    
    const analytics = {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(j => j.status === 'succeeded').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      averageTrainingSize: jobs.length > 0 ? 
        jobs.reduce((sum, j) => sum + (j.trainingSize || 0), 0) / jobs.length : 0,
      lastJobDate: jobs.length > 0 ? jobs[0].startedAt : null,
      modelPerformance: jobs
        .filter(j => j.fineTunedModel)
        .map(j => ({
          jobId: j.jobId,
          modelName: j.modelName,
          fineTunedModel: j.fineTunedModel,
          trainingSize: j.trainingSize,
          startedAt: j.startedAt
        }))
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error getting finetuning analytics:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics',
      message: error.message 
    });
  }
});

module.exports = router;
