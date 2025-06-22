import * as dotenv from 'dotenv';
import { MongoDBService } from './mongoService';
import { LlamaKnowledgeGraphService } from './llamaService';
import { FileService } from './fileService';
import { SalesTranscript } from './types';

// Load environment variables
dotenv.config();

interface Config {
  mongoUri: string;
  mongoDatabase: string;
  mongoCollection: string;
  llamaApiKey: string;
  llamaModel: string;
  outputFile?: string;
}

class KnowledgeGraphGenerator {
  private config: Config;
  private mongoService: MongoDBService;
  private llamaService: LlamaKnowledgeGraphService;

  constructor() {
    this.config = this.loadConfig();
    this.mongoService = new MongoDBService(
      this.config.mongoUri,
      this.config.mongoDatabase,
      this.config.mongoCollection
    );
    this.llamaService = new LlamaKnowledgeGraphService(
      this.config.llamaApiKey,
      this.config.llamaModel
    );
  }

  private loadConfig(): Config {
    const required = ['MONGODB_URI', 'LLAMA_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
      mongoUri: process.env.MONGODB_URI!,
      mongoDatabase: process.env.MONGODB_DATABASE || 'sales_database',
      mongoCollection: process.env.MONGODB_COLLECTION || 'sales_transcripts',
      llamaApiKey: process.env.LLAMA_API_KEY!,
      llamaModel: process.env.LLAMA_MODEL || 'Llama-3.3-70B-Instruct',
      outputFile: process.env.OUTPUT_FILE
    };
  }

  async generateKnowledgeGraphForProduct(product: string, useStreaming: boolean = false): Promise<any> {
    console.log(`\n=== Processing Product: ${product} ===`);
    
    try {
      // Fetch transcripts from MongoDB
      const transcripts = await this.mongoService.getTranscriptsByProduct(product);
      
      if (transcripts.length === 0) {
        throw new Error(`No transcripts found for product: ${product}`);
      }

      // Process transcripts for Llama (remove sensitive data)
      const processedTranscripts = this.mongoService.processTranscriptsForLlama(transcripts);
      
      console.log(`Processing ${processedTranscripts.length} transcripts...`);
      console.log(`Successful: ${processedTranscripts.filter(t => t.result === 'successful').length}`);
      console.log(`Unsuccessful: ${processedTranscripts.filter(t => t.result === 'unsuccessful').length}`);      // Generate knowledge graph using Llama
      const knowledgeGraph = await this.llamaService.generateKnowledgeGraph(processedTranscripts);

      return knowledgeGraph;
    } catch (error) {
      console.error(`Error processing product ${product}:`, error);
      throw error;
    }
  }

  async generateKnowledgeGraphsForAllProducts(useStreaming: boolean = false): Promise<any[]> {
    console.log('\n=== Generating Knowledge Graphs for All Products ===');
    
    try {
      await this.mongoService.connect();
      
      const products = await this.mongoService.getAllProducts();
      const results: any[] = [];

      for (const product of products) {
        try {
          const knowledgeGraph = await this.generateKnowledgeGraphForProduct(product, useStreaming);
          results.push(knowledgeGraph);
          
          // Save individual knowledge graph
          const outputPath = await FileService.saveKnowledgeGraphWithTimestamp(knowledgeGraph);
          await FileService.saveSummaryReport(knowledgeGraph, outputPath);
          
          console.log(`✅ Completed: ${product}`);
        } catch (error) {
          console.error(`❌ Failed: ${product} - ${error}`);
        }
      }

      return results;
    } finally {
      await this.mongoService.disconnect();
    }
  }

  async generateKnowledgeGraphForSpecificProduct(
    product: string, 
    useStreaming: boolean = false
  ): Promise<any> {
    console.log(`\n=== Generating Knowledge Graph for Product: ${product} ===`);
    
    try {
      await this.mongoService.connect();
      
      const knowledgeGraph = await this.generateKnowledgeGraphForProduct(product, useStreaming);
      
      // Save the knowledge graph
      const outputPath = this.config.outputFile 
        ? this.config.outputFile 
        : await FileService.saveKnowledgeGraphWithTimestamp(knowledgeGraph);
      
      if (this.config.outputFile) {
        await FileService.saveKnowledgeGraph(knowledgeGraph, outputPath);
      }
      
      await FileService.saveSummaryReport(knowledgeGraph, outputPath);
      
      console.log('✅ Knowledge graph generation completed successfully!');
      return knowledgeGraph;
    } finally {
      await this.mongoService.disconnect();
    }
  }

  async demonstrateWithSampleData(): Promise<void> {
    console.log('\n=== Demonstration Mode (Using Sample Data) ===');
    
    try {
      // Load sample transcript files
      const transcript1 = await FileService.loadTranscriptFile(
        'sythetic-data/former-sales-pitches/transcript_002.txt'
      );
      const transcript2 = await FileService.loadTranscriptFile(
        'sythetic-data/former-sales-pitches/transcript_011.txt'
      );

      // Create sample data
      const sampleTranscripts = [
        {
          result: 'successful' as const,
          context: 'Enterprise client seeking automation solution',
          transcriptText: transcript1
        },
        {
          result: 'unsuccessful' as const,
          context: 'Small business with budget constraints',
          transcriptText: transcript2
        }
      ];      console.log('Generating knowledge graph from sample data...');
      
      const knowledgeGraphJson = await this.llamaService.generateKnowledgeGraph(sampleTranscripts);
      const knowledgeGraph = JSON.parse(knowledgeGraphJson);

      const outputPath = await FileService.saveKnowledgeGraphWithTimestamp(knowledgeGraph, 'output/demo');
      await FileService.saveSummaryReport(knowledgeGraph, outputPath);
      
      console.log('✅ Demo completed successfully!');
      console.log(`📊 Generated graph with ${knowledgeGraph.nodes.length} nodes and ${knowledgeGraph.edges.length} edges`);
    } catch (error) {
      console.error('Demo failed:', error);
      throw error;
    }
  }
}

async function main() {
  try {
    const generator = new KnowledgeGraphGenerator();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const product = args[1];
    const useStreaming = args.includes('--stream');

    switch (command) {
      case 'product':
        if (!product) {
          console.error('Please specify a product name: npm run dev product "Product Name"');
          process.exit(1);
        }
        await generator.generateKnowledgeGraphForSpecificProduct(product, useStreaming);
        break;
        
      case 'all':
        await generator.generateKnowledgeGraphsForAllProducts(useStreaming);
        break;
        
      case 'demo':
        await generator.demonstrateWithSampleData();
        break;
        
      default:
        console.log(`
Llama Knowledge Graph Generator

Usage:
  npm run dev demo                     - Run demonstration with sample data
  npm run dev product "Product Name"  - Generate graph for specific product
  npm run dev all                     - Generate graphs for all products
  
Options:
  --stream                           - Use streaming API (slower but shows progress)

Examples:
  npm run dev demo
  npm run dev product "Llama AI Platform" --stream
  npm run dev all
        `);
        break;
    }
  } catch (error) {
    console.error('Application failed:', error);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

export { KnowledgeGraphGenerator };
