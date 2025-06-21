const mongoose = require('mongoose');
const KnowledgeGraphService = require('../services/KnowledgeGraphService');
const Document = require('../models/Document');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'kg-migration' },
  transports: [
    new winston.transports.Console()
  ]
});

async function migrateKnowledgeGraph() {
  const knowledgeGraph = new KnowledgeGraphService();
  
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const action = args[0] || 'migrate';
    const userId = args[1];
    
    logger.info(`Starting knowledge graph action: ${action}`);

    switch (action) {
      case 'migrate':
        await migrateAllDocuments(knowledgeGraph, userId);
        break;
        
      case 'rebuild':
        await rebuildKnowledgeGraph(knowledgeGraph, userId);
        break;
        
      case 'export':
        await exportKnowledgeGraph(knowledgeGraph, userId, args[2]);
        break;
        
      case 'import':
        await importKnowledgeGraph(knowledgeGraph, userId, args[2]);
        break;
        
      case 'validate':
        await validateKnowledgeGraph(knowledgeGraph, userId);
        break;
        
      default:
        console.error(`Unknown action: ${action}`);
        console.error('Available actions: migrate, rebuild, export, import, validate');
        process.exit(1);
    }

  } catch (error) {
    logger.error('Knowledge graph script error:', error);
    process.exit(1);
  } finally {
    await knowledgeGraph.close();
  }
}

async function migrateAllDocuments(knowledgeGraph, userId = null) {
  try {
    logger.info('Starting knowledge graph migration...');
    
    const filter = { processingStatus: 'pending' };
    if (userId) {
      filter.userId = userId;
    }
    
    const pendingDocuments = await Document.find(filter);
    
    console.log(`📊 Found ${pendingDocuments.length} pending documents to migrate`);
    
    if (pendingDocuments.length === 0) {
      console.log('✅ No pending documents found. Migration complete.');
      return;
    }
    
    let processed = 0;
    let failed = 0;
    
    for (const doc of pendingDocuments) {
      try {
        console.log(`🔄 Processing document: ${doc._id} (${doc.title})`);
        
        // Update status to processing
        doc.processingStatus = 'processing';
        await doc.save();
        
        // Create knowledge graph
        const result = await knowledgeGraph.createKnowledgeGraph(
          doc.originalData, 
          doc.sourceId, 
          doc.userId
        );
        
        // Update document with knowledge graph information
        doc.knowledgeGraphId = result.graphId;
        doc.metadata = {
          wordCount: result.extracted.metadata.wordCount,
          sentenceCount: result.extracted.metadata.sentenceCount,
          extractedEntities: result.extracted.entities,
          importantTerms: result.extracted.entities.importantTerms || [],
          relationships: result.extracted.relationships || []
        };
        doc.processingStatus = 'completed';
        
        await doc.save();
        processed++;
        
        console.log(`✅ Successfully processed document: ${doc._id}`);
        
      } catch (docError) {
        logger.error(`Error processing document ${doc._id}:`, docError);
        
        doc.processingStatus = 'failed';
        doc.processingError = docError.message;
        await doc.save();
        failed++;
        
        console.log(`❌ Failed to process document: ${doc._id}`);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total documents: ${pendingDocuments.length}`);
    console.log(`   Successfully processed: ${processed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success rate: ${((processed / pendingDocuments.length) * 100).toFixed(2)}%`);

  } catch (error) {
    logger.error('Error in migration:', error);
    throw error;
  }
}

async function rebuildKnowledgeGraph(knowledgeGraph, userId) {
  try {
    if (!userId) {
      console.error('User ID is required for rebuild action');
      process.exit(1);
    }
    
    logger.info(`Rebuilding knowledge graph for user: ${userId}`);
    
    // Get all completed documents for user
    const documents = await Document.find({ 
      userId, 
      processingStatus: 'completed' 
    });
    
    console.log(`📊 Found ${documents.length} documents to rebuild`);
    
    if (documents.length === 0) {
      console.log('✅ No documents found for rebuild.');
      return;
    }
    
    let rebuilt = 0;
    let failed = 0;
    
    for (const doc of documents) {
      try {
        console.log(`🔄 Rebuilding knowledge graph for: ${doc._id}`);
        
        // Create new knowledge graph
        const result = await knowledgeGraph.createKnowledgeGraph(
          doc.originalData, 
          doc.sourceId, 
          doc.userId
        );
        
        // Update document with new knowledge graph information
        doc.knowledgeGraphId = result.graphId;
        doc.metadata = {
          wordCount: result.extracted.metadata.wordCount,
          sentenceCount: result.extracted.metadata.sentenceCount,
          extractedEntities: result.extracted.entities,
          importantTerms: result.extracted.entities.importantTerms || [],
          relationships: result.extracted.relationships || []
        };
        doc.version = (doc.version || 1) + 1;
        
        await doc.save();
        rebuilt++;
        
        console.log(`✅ Successfully rebuilt: ${doc._id}`);
        
      } catch (docError) {
        logger.error(`Error rebuilding document ${doc._id}:`, docError);
        failed++;
        console.log(`❌ Failed to rebuild: ${doc._id}`);
      }
    }
    
    console.log(`\n📊 Rebuild Summary:`);
    console.log(`   Total documents: ${documents.length}`);
    console.log(`   Successfully rebuilt: ${rebuilt}`);
    console.log(`   Failed: ${failed}`);

  } catch (error) {
    logger.error('Error in rebuild:', error);
    throw error;
  }
}

async function exportKnowledgeGraph(knowledgeGraph, userId, outputPath) {
  try {
    if (!userId) {
      console.error('User ID is required for export action');
      process.exit(1);
    }
    
    if (!outputPath) {
      outputPath = `knowledge_graph_export_${userId}_${Date.now()}.json`;
    }
    
    logger.info(`Exporting knowledge graph for user: ${userId}`);
    
    // Get statistics
    const stats = await knowledgeGraph.getGraphStatistics(userId);
    
    // Get all documents
    const documents = await Document.find({ 
      userId, 
      processingStatus: 'completed' 
    }).select('_id sourceId title knowledgeGraphId metadata createdAt');
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      statistics: stats,
      documents: documents.map(doc => ({
        id: doc._id,
        sourceId: doc.sourceId,
        title: doc.title,
        knowledgeGraphId: doc.knowledgeGraphId,
        metadata: doc.metadata,
        createdAt: doc.createdAt
      })),
      metadata: {
        totalDocuments: documents.length,
        version: '1.0'
      }
    };
    
    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Knowledge graph exported successfully:`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Documents: ${documents.length}`);
    console.log(`   Statistics:`, stats);

  } catch (error) {
    logger.error('Error in export:', error);
    throw error;
  }
}

async function importKnowledgeGraph(knowledgeGraph, userId, inputPath) {
  try {
    if (!userId) {
      console.error('User ID is required for import action');
      process.exit(1);
    }
    
    if (!inputPath) {
      console.error('Input file path is required for import action');
      process.exit(1);
    }
    
    logger.info(`Importing knowledge graph for user: ${userId}`);
    
    // Read import file
    const importData = JSON.parse(await fs.readFile(inputPath, 'utf8'));
    
    console.log(`📊 Import file contains ${importData.documents.length} documents`);
    console.log(`   Exported at: ${importData.exportedAt}`);
    console.log(`   Original user: ${importData.userId}`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const docData of importData.documents) {
      try {
        // Check if document already exists
        const existingDoc = await Document.findOne({
          userId,
          sourceId: docData.sourceId
        });
        
        if (existingDoc) {
          console.log(`⏭️  Skipping existing document: ${docData.sourceId}`);
          skipped++;
          continue;
        }
        
        // Create new document (this would require the original data)
        console.log(`⚠️  Cannot fully import document ${docData.sourceId} - original data not available in export`);
        console.log(`   Consider using a full backup that includes document content`);
        
      } catch (docError) {
        logger.error(`Error importing document ${docData.sourceId}:`, docError);
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total documents in export: ${importData.documents.length}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Note: Full import requires original document content`);

  } catch (error) {
    logger.error('Error in import:', error);
    throw error;
  }
}

async function validateKnowledgeGraph(knowledgeGraph, userId) {
  try {
    if (!userId) {
      console.error('User ID is required for validate action');
      process.exit(1);
    }
    
    logger.info(`Validating knowledge graph for user: ${userId}`);
    
    // Get statistics
    const stats = await knowledgeGraph.getGraphStatistics(userId);
    
    // Get all documents
    const documents = await Document.find({ userId });
    
    const validation = {
      totalDocuments: documents.length,
      completedDocuments: documents.filter(d => d.processingStatus === 'completed').length,
      failedDocuments: documents.filter(d => d.processingStatus === 'failed').length,
      pendingDocuments: documents.filter(d => d.processingStatus === 'pending').length,
      documentsWithoutKnowledgeGraph: documents.filter(d => !d.knowledgeGraphId).length,
      knowledgeGraphStats: stats
    };
    
    console.log(`📊 Knowledge Graph Validation Results:`);
    console.log(`   Total documents: ${validation.totalDocuments}`);
    console.log(`   Completed: ${validation.completedDocuments}`);
    console.log(`   Failed: ${validation.failedDocuments}`);
    console.log(`   Pending: ${validation.pendingDocuments}`);
    console.log(`   Without knowledge graph: ${validation.documentsWithoutKnowledgeGraph}`);
    console.log(`\n   Knowledge Graph Statistics:`);
    console.log(`   - Documents: ${stats.documents}`);
    console.log(`   - Entities: ${stats.entities}`);
    console.log(`   - Terms: ${stats.terms}`);
    console.log(`   - Concepts: ${stats.concepts}`);
    console.log(`   - Interactions: ${stats.interactions}`);
    
    // Check for inconsistencies
    const issues = [];
    
    if (validation.documentsWithoutKnowledgeGraph > 0) {
      issues.push(`${validation.documentsWithoutKnowledgeGraph} documents missing knowledge graph`);
    }
    
    if (validation.failedDocuments > 0) {
      issues.push(`${validation.failedDocuments} documents failed processing`);
    }
    
    if (validation.pendingDocuments > 0) {
      issues.push(`${validation.pendingDocuments} documents pending processing`);
    }
    
    if (issues.length > 0) {
      console.log(`\n⚠️  Issues found:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log(`\n💡 Run migration to fix pending/failed documents:`);
      console.log(`   node scripts/knowledgeGraph.js migrate ${userId}`);
    } else {
      console.log(`\n✅ Knowledge graph validation passed - no issues found!`);
    }

  } catch (error) {
    logger.error('Error in validation:', error);
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
  migrateKnowledgeGraph();
}

module.exports = {
  migrateKnowledgeGraph,
  migrateAllDocuments,
  rebuildKnowledgeGraph,
  exportKnowledgeGraph,
  importKnowledgeGraph,
  validateKnowledgeGraph
};
