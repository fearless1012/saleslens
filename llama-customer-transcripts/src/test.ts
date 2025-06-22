import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LlamaKnowledgeGraphService } from './llamaService';
import { FileService } from './fileService';
import { ProcessedTranscript } from './types';

// Load environment variables
dotenv.config();

interface TranscriptData {
  date: string;
  customer: string;
  salesRep: string;
  product: string;
  result: string;
  context: string;
  transcriptText: string;
}

async function loadTranscriptFiles(): Promise<TranscriptData[]> {
  const transcriptData: TranscriptData[] = [];
  const transcriptsDir = path.join(__dirname, '..', 'sythetic-data', 'former-sales-pitches');
  
  console.log(`📁 Loading transcript files from: ${transcriptsDir}`);
  
  if (!fs.existsSync(transcriptsDir)) {
    throw new Error(`Transcripts directory not found: ${transcriptsDir}`);
  }

  const files = fs.readdirSync(transcriptsDir).filter(file => file.endsWith('.txt'));
  console.log(`📄 Found ${files.length} transcript files`);
  
  for (const file of files.slice(0, 10)) { // Test with first 10 files
    try {
      const filePath = path.join(transcriptsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`📖 Reading ${file}...`);
      
      // Parse the transcript file format
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      let date = '', customer = '', salesRep = '', product = '', result = '', context = '', transcriptText = '';
      let isTranscript = false;
      let transcriptLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('Date:')) {
          date = line.replace('Date:', '').trim();
        } else if (line.startsWith('Customer:')) {
          customer = line.replace('Customer:', '').trim();
        } else if (line.startsWith('Sales Rep:')) {
          salesRep = line.replace('Sales Rep:', '').trim();
        } else if (line.startsWith('Product:')) {
          product = line.replace('Product:', '').trim();
        } else if (line.startsWith('Call Result:')) {
          result = line.replace('Call Result:', '').trim();
        } else if (line.startsWith('Context:')) {
          context = line.replace('Context:', '').trim();
        } else if (line === 'Transcript:' || line.startsWith('Transcript:')) {
          isTranscript = true;
        } else if (isTranscript && line.trim()) {
          transcriptLines.push(line);
        }
      }

      transcriptText = transcriptLines.join(' ');

      console.log(`   📋 Parsed data: Customer="${customer}", Result="${result}", Transcript length=${transcriptText.length}`);

      if (transcriptText && result && customer) {
        transcriptData.push({
          date: date || new Date().toISOString().split('T')[0],
          customer,
          salesRep: salesRep || 'Unknown Rep',
          product: product || 'AI Analytics Platform', // Default product
          result,
          context: context || 'No context provided',
          transcriptText
        });
        console.log(`✅ Parsed ${file}: ${customer} - ${result}`);
      } else {
        console.warn(`⚠️ Incomplete data in ${file}: missing customer, result, or transcript`);
        console.warn(`   Customer: ${customer ? 'Yes' : 'No'}, Result: ${result ? 'Yes' : 'No'}, Transcript: ${transcriptText ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse ${file}:`, error);
    }
  }

  // If no data was loaded, add some sample data for testing
  if (transcriptData.length === 0) {
    console.log('⚠️ No transcript files were parsed successfully. Adding sample data for testing...');
    transcriptData.push(
      {
        date: '2024-01-15',
        customer: 'TechCorp Solutions',
        salesRep: 'John Smith',
        product: 'AI Analytics Platform',
        result: 'Successful Sale',
        context: 'Enterprise client looking for data analytics solution',
        transcriptText: 'Sales Rep: Good morning! I understand you\'re looking for an analytics solution. Customer: Yes, we need something that can handle large datasets and provide real-time insights. Sales Rep: Our AI Analytics Platform is perfect for that. It processes data 10x faster than traditional tools. Customer: That sounds impressive. What about integration with our existing systems? Sales Rep: We have pre-built connectors for over 200 platforms. Customer: Perfect! Let\'s move forward with this.'
      },
      {
        date: '2024-01-16',
        customer: 'SmallBiz Inc',
        salesRep: 'Jane Doe',
        product: 'AI Analytics Platform',
        result: 'Failed Sale',
        context: 'Small business with budget constraints',
        transcriptText: 'Sales Rep: Hi there! Our platform has incredible capabilities - machine learning, natural language processing, advanced analytics. Customer: That sounds complex. How much does it cost? Sales Rep: Our enterprise package starts at $5,000 per month. Customer: That\'s way beyond our budget. We were thinking more like $200-500 monthly. Sales Rep: I understand, but you really need the full package to get value. Customer: I don\'t think this is for us then. Thanks for your time.'
      }
    );
    console.log(`✅ Added ${transcriptData.length} sample records for testing`);
  }

  return transcriptData;
}

function convertToProcessedTranscripts(transcriptData: TranscriptData[]): ProcessedTranscript[] {
  return transcriptData.map(item => ({
    result: item.result.toLowerCase().includes('successful') ? 'successful' : 'unsuccessful',
    context: item.context,
    transcriptText: item.transcriptText
  }));
}

async function runActualLlamaTest() {
  console.log('🧪 Starting ACTUAL Llama Knowledge Graph Generator Test...\n');
  console.log('🦙 This test will use the LlamaKnowledgeGraphService to generate knowledge graphs\n');

  try {
    // Step 1: Load real transcript data
    console.log('📊 Step 1: Loading transcript data from files...');
    const transcriptData = await loadTranscriptFiles();
    
    if (transcriptData.length === 0) {
      throw new Error('No transcript data loaded');
    }
    
    console.log(`✅ Loaded ${transcriptData.length} transcript records`);
    console.log('Sample data preview:');
    transcriptData.forEach((data, index) => {
      console.log(`  ${index + 1}. ${data.customer} - ${data.result}`);
    });
    console.log();

    // Step 2: Verify API key
    console.log('🔑 Step 2: Verifying Llama API configuration...');
    const apiKey = process.env.LLAMA_API_KEY;
    if (!apiKey) {
      throw new Error('LLAMA_API_KEY not found in .env file');
    }
    console.log(`✅ API key found (${apiKey.substring(0, 10)}...)`);
    console.log(`✅ Model: ${process.env.LLAMA_MODEL || 'Llama-3.3-70B-Instruct'}\n`);

    // Step 3: Convert data and initialize service
    console.log('🔄 Step 3: Converting data and initializing LlamaService...');
    const processedTranscripts = convertToProcessedTranscripts(transcriptData);
    const product = transcriptData[0]?.product || 'AI Analytics Platform';
    
    const llamaService = new LlamaKnowledgeGraphService(
      apiKey, 
      process.env.LLAMA_MODEL
    );
    console.log(`✅ Service initialized for product: ${product}\n`);

    // Step 4: Generate knowledge graph using the service
    console.log('🧠 Step 4: Generating knowledge graph with LlamaKnowledgeGraphService...');
    console.log('⏳ This may take a few moments...\n');
    
    const startTime = Date.now();
    const knowledgeGraph = await llamaService.generateKnowledgeGraph(product, processedTranscripts);
    const endTime = Date.now();
    
    console.log(`✅ Knowledge graph generated successfully in ${(endTime - startTime) / 1000}s\n`);

    // Step 5: Save the knowledge graph using FileService
    console.log('💾 Step 5: Saving knowledge graph to file...');
    const outputPath = await FileService.saveKnowledgeGraphWithTimestamp(knowledgeGraph, 'actual_test_knowledge_graph.json');
    console.log(`✅ Knowledge graph saved to: ${outputPath}\n`);

    // Final output
    console.log('\n🎉 ACTUAL Llama API test completed successfully!');
    console.log(`📁 Full results saved to: ${outputPath}`);
    
    // Preview the raw JSON (first 1000 characters)
    console.log('\n📄 Knowledge Graph JSON Preview:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(knowledgeGraph, null, 2).substring(0, 1000) + '...');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      // Check if it's an API key issue
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.error('\n🔑 This appears to be an API key authentication issue.');
        console.error('Please verify your LLAMA_API_KEY in the .env file.');
        console.error('Make sure the API key is valid and has the correct permissions.');
      }
      
      // Check if it's a network issue
      if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        console.error('\n🌐 This appears to be a network connectivity issue.');
        console.error('Please check your internet connection.');
      }
      
      // Check if it's a model issue
      if (error.message.includes('model') || error.message.includes('not found')) {
        console.error('\n🤖 This appears to be a model availability issue.');
        console.error('Please check if the specified model is available in your API plan.');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
runActualLlamaTest();
