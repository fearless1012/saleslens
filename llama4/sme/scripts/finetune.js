const FinetuningService = require('../services/FinetuningService');
const Interaction = require('../models/Interaction');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'finetune-script' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/finetune-script.log' })
  ]
});

async function runFinetuning() {
  const finetuningService = new FinetuningService();
  
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const userId = args[0];
    const action = args[1] || 'collect';
    
    if (!userId) {
      console.error('Usage: node scripts/finetune.js <userId> [action]');
      console.error('Actions: collect, train, evaluate, status, cleanup');
      process.exit(1);
    }

    logger.info(`Starting finetuning action: ${action} for user: ${userId}`);

    switch (action) {
      case 'collect':
        await collectTrainingData(finetuningService, userId);
        break;
        
      case 'train':
        await startTraining(finetuningService, userId, args[2]);
        break;
        
      case 'evaluate':
        await evaluateModel(finetuningService, userId, args[2]);
        break;
        
      case 'status':
        await checkStatus(finetuningService, userId, args[2]);
        break;
        
      case 'cleanup':
        await cleanup(finetuningService, parseInt(args[2]) || 30);
        break;
        
      case 'auto':
        await autoFinetuning(finetuningService, userId);
        break;
        
      default:
        console.error(`Unknown action: ${action}`);
        process.exit(1);
    }

  } catch (error) {
    logger.error('Finetuning script error:', error);
    process.exit(1);
  }
}

async function collectTrainingData(finetuningService, userId) {
  try {
    logger.info('Collecting training data...');
    
    const result = await finetuningService.collectTrainingData(userId, {
      minQualityScore: 0.7,
      maxSamples: 1000,
      includeNegativeExamples: true,
      timeRange: 30
    });

    console.log(`✅ Training data collected:`);
    console.log(`   File: ${result.filepath}`);
    console.log(`   Samples: ${result.sampleCount}`);
    console.log(`   Quality threshold: ${result.metadata.qualityThreshold}`);
    console.log(`   Knowledge graph stats:`, result.metadata.knowledgeGraphStats);

  } catch (error) {
    logger.error('Error collecting training data:', error);
    throw error;
  }
}

async function startTraining(finetuningService, userId, trainingDataPath) {
  try {
    if (!trainingDataPath) {
      console.error('Training data path is required for training action');
      process.exit(1);
    }

    logger.info('Starting finetuning job...');
    
    const result = await finetuningService.startFinetuning(userId, trainingDataPath, {
      modelName: `sme-model-${userId}-${Date.now()}`,
      epochs: 3,
      learningRate: 5e-5,
      batchSize: 4,
      validationSplit: 0.1
    });

    console.log(`✅ Finetuning job started:`);
    console.log(`   Job ID: ${result.jobId}`);
    console.log(`   Model name: ${result.modelName}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Training size: ${result.metadata.trainingSize}`);
    console.log(`   Validation size: ${result.metadata.validationSize}`);

  } catch (error) {
    logger.error('Error starting training:', error);
    throw error;
  }
}

async function evaluateModel(finetuningService, userId, modelId) {
  try {
    if (!modelId) {
      console.error('Model ID is required for evaluation action');
      process.exit(1);
    }

    logger.info('Evaluating model...');
    
    const evaluation = await finetuningService.evaluateModel(modelId, userId);

    console.log(`✅ Model evaluation completed:`);
    console.log(`   Model ID: ${evaluation.modelId}`);
    console.log(`   Test samples: ${evaluation.testSamples}`);
    console.log(`   Accuracy: ${(evaluation.metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`   Average confidence: ${evaluation.metrics.averageConfidence.toFixed(3)}`);
    console.log(`   Correct answers: ${evaluation.metrics.correctAnswers}/${evaluation.metrics.totalQuestions}`);

  } catch (error) {
    logger.error('Error evaluating model:', error);
    throw error;
  }
}

async function checkStatus(finetuningService, userId, jobId) {
  try {
    if (jobId) {
      // Check specific job status
      const status = await finetuningService.checkFinetuningStatus(jobId);
      
      console.log(`📊 Job status:`);
      console.log(`   Job ID: ${status.jobId}`);
      console.log(`   Status: ${status.status}`);
      console.log(`   Fine-tuned model: ${status.fineTunedModel || 'Not available'}`);
      console.log(`   Created: ${new Date(status.createdAt * 1000).toISOString()}`);
      
      if (status.finishedAt) {
        console.log(`   Finished: ${new Date(status.finishedAt * 1000).toISOString()}`);
      }
      
    } else {
      // List all jobs for user
      const jobs = await finetuningService.listFinetuningJobs(userId);
      
      console.log(`📊 All finetuning jobs for user ${userId}:`);
      if (jobs.length === 0) {
        console.log('   No finetuning jobs found.');
      } else {
        jobs.forEach((job, index) => {
          console.log(`   ${index + 1}. Job ID: ${job.jobId}`);
          console.log(`      Model: ${job.modelName}`);
          console.log(`      Status: ${job.status}`);
          console.log(`      Started: ${job.startedAt}`);
          console.log(`      Training size: ${job.trainingSize || 'Unknown'}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    logger.error('Error checking status:', error);
    throw error;
  }
}

async function cleanup(finetuningService, retentionDays) {
  try {
    logger.info(`Cleaning up files older than ${retentionDays} days...`);
    
    await finetuningService.cleanup(retentionDays);
    
    console.log(`✅ Cleanup completed. Removed files older than ${retentionDays} days.`);

  } catch (error) {
    logger.error('Error during cleanup:', error);
    throw error;
  }
}

async function autoFinetuning(finetuningService, userId) {
  try {
    logger.info('Starting automated finetuning pipeline...');
    
    // Check if user has enough interactions
    const interactionCount = await Interaction.countDocuments({ 
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    console.log(`📊 Found ${interactionCount} interactions in the last 30 days`);
    
    if (interactionCount < 100) {
      console.log('⚠️  Insufficient interactions for automated finetuning (minimum: 100)');
      return;
    }
    
    // Collect training data
    console.log('🔄 Step 1: Collecting training data...');
    const trainingResult = await finetuningService.collectTrainingData(userId, {
      minQualityScore: 0.8,
      maxSamples: 1000,
      includeNegativeExamples: true,
      timeRange: 30
    });
    
    if (trainingResult.sampleCount < 50) {
      console.log('⚠️  Insufficient high-quality samples for finetuning (minimum: 50)');
      return;
    }
    
    console.log(`✅ Collected ${trainingResult.sampleCount} training samples`);
    
    // Start finetuning
    console.log('🔄 Step 2: Starting finetuning job...');
    const finetuningResult = await finetuningService.startFinetuning(userId, trainingResult.filepath, {
      modelName: `auto-sme-model-${userId}-${Date.now()}`,
      epochs: 3,
      learningRate: 5e-5,
      batchSize: 4,
      validationSplit: 0.1
    });
    
    console.log(`✅ Automated finetuning pipeline completed:`);
    console.log(`   Job ID: ${finetuningResult.jobId}`);
    console.log(`   Model name: ${finetuningResult.modelName}`);
    console.log(`   Training samples: ${trainingResult.sampleCount}`);
    console.log(`   Status: ${finetuningResult.status}`);
    console.log('');
    console.log(`💡 Monitor progress with: node scripts/finetune.js ${userId} status ${finetuningResult.jobId}`);

  } catch (error) {
    logger.error('Error in automated finetuning:', error);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  runFinetuning();
}

module.exports = {
  runFinetuning,
  collectTrainingData,
  startTraining,
  evaluateModel,
  checkStatus,
  cleanup,
  autoFinetuning
};
