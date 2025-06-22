import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LlamaAPIClient } from 'llama-api-client';

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

interface KnowledgeGraph {
  metadata: {
    product: string;
    totalTranscripts: number;
    successfulCount: number;
    unsuccessfulCount: number;
    generatedAt: string;
    llamaModel: string;
  };
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    properties: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    label: string;
    properties: Record<string, any>;
  }>;
  insights: {
    successFactors: string[];
    failureFactors: string[];
    keyPatterns: string[];
    recommendations: string[];
  };
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
  for (const file of files.slice(0, 5)) { // Test with first 5 files
    try {
      const filePath = path.join(transcriptsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`📖 Reading ${file}...`);
      
      // Debug: show first few lines of the file
      const previewLines = content.split('\n').slice(0, 10);
      console.log(`   🔍 File preview (first 10 lines):`);
      previewLines.forEach((line, index) => {
        console.log(`     ${index + 1}: "${line.trim()}"`);
      });
      
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
    }  }

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

async function generateKnowledgeGraphWithLlama(transcriptData: TranscriptData[]): Promise<KnowledgeGraph> {
  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    throw new Error('LLAMA_API_KEY not found in environment variables');
  }

  const client = new LlamaAPIClient({ apiKey });
  const model = process.env.LLAMA_MODEL || 'Llama-3.3-70B-Instruct';

  // Prepare data for Llama (excluding sensitive info)
  const cleanedData = transcriptData.map(item => ({
    result: item.result,
    context: item.context,
    transcriptText: item.transcriptText,
    product: item.product
  }));

  const prompt = `
You are an expert sales analyst. I will provide you with sales transcript data for the "${cleanedData[0]?.product || 'AI Analytics Platform'}" product. Your task is to create a comprehensive knowledge graph in JSON format that represents insights about successful vs unsuccessful sales interactions.

SALES TRANSCRIPT DATA:
${JSON.stringify(cleanedData, null, 2)}

Please analyze this data and create a knowledge graph that includes:

1. NODES representing:
   - Sales techniques used (e.g., "roi_demonstration", "pain_point_identification", "feature_presentation")
   - Customer objections (e.g., "price_concern", "budget_constraint", "technical_complexity")
   - Conversation patterns (e.g., "early_qualification", "demo_request", "competitor_comparison")
   - Outcomes (e.g., "successful_close", "lost_to_competitor", "budget_issues")

2. EDGES representing relationships:
   - Which techniques lead to success/failure
   - What objections are overcome by which approaches
   - Conversation flow patterns

3. INSIGHTS including:
   - Success factors (what leads to wins)
   - Failure factors (what leads to losses)
   - Key patterns observed
   - Actionable recommendations

Return ONLY a valid JSON object with this exact structure:
{
  "metadata": {
    "product": "product name",
    "totalTranscripts": number,
    "successfulCount": number,
    "unsuccessfulCount": number,
    "generatedAt": "ISO date string",
    "llamaModel": "${model}"
  },
  "nodes": [
    {
      "id": "unique_id",
      "type": "technique|objection|pattern|outcome",
      "label": "Human readable label",
      "properties": {
        "frequency": 0.0-1.0,
        "successRate": 0.0-1.0,
        "description": "detailed description"
      }
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "type": "leads_to|overcomes|correlates_with|causes",
      "label": "Human readable relationship",
      "properties": {
        "strength": 0.0-1.0,
        "confidence": 0.0-1.0,
        "description": "relationship description"
      }
    }
  ],
  "insights": {
    "successFactors": ["factor1", "factor2"],
    "failureFactors": ["factor1", "factor2"],
    "keyPatterns": ["pattern1", "pattern2"],
    "recommendations": ["recommendation1", "recommendation2"]
  }
}

Focus on actionable insights that sales teams can use to improve their performance. Make sure all node IDs are referenced correctly in edges.
`;

  console.log('🦙 Sending request to Llama API...');
  
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert sales analyst. Return only valid JSON responses without any markdown formatting or additional text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'KnowledgeGraph',
        schema: {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              properties: {
                product: { type: 'string' },
                totalTranscripts: { type: 'number' },
                successfulCount: { type: 'number' },
                unsuccessfulCount: { type: 'number' },
                generatedAt: { type: 'string' },
                llamaModel: { type: 'string' }
              },
              required: ['product', 'totalTranscripts', 'successfulCount', 'unsuccessfulCount', 'generatedAt', 'llamaModel']
            },            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  label: { type: 'string' },                  properties: { 
                    type: 'object',
                    properties: {
                      frequency: { type: 'number' },
                      successRate: { type: 'number' },
                      description: { type: 'string' }
                    },
                    required: ['frequency', 'successRate', 'description']
                  }
                },
                required: ['id', 'type', 'label', 'properties']
              }
            },
            edges: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  source: { type: 'string' },
                  target: { type: 'string' },
                  type: { type: 'string' },
                  label: { type: 'string' },                  properties: { 
                    type: 'object',
                    properties: {
                      strength: { type: 'number' },
                      confidence: { type: 'number' },
                      description: { type: 'string' }
                    },
                    required: ['strength', 'confidence', 'description']
                  }
                },
                required: ['id', 'source', 'target', 'type', 'label', 'properties']
              }
            },
            insights: {
              type: 'object',
              properties: {
                successFactors: { type: 'array', items: { type: 'string' } },
                failureFactors: { type: 'array', items: { type: 'string' } },
                keyPatterns: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              },
              required: ['successFactors', 'failureFactors', 'keyPatterns', 'recommendations']
            }
          },
          required: ['metadata', 'nodes', 'edges', 'insights']
        }
      }
    }  });
  
  // Extract content from Llama API response
  // Handle the response based on actual Llama API structure
  let content: string;
  
  if (typeof response === 'string') {
    content = response;
  } else {
    // Try different possible response structures
    content = (response as any).content || 
              (response as any).message || 
              (response as any).text || 
              (response as any).output ||
              JSON.stringify(response);
  }
  
  if (!content || content === '{}' || content === 'null') {
    console.error('Full response:', JSON.stringify(response, null, 2));
    throw new Error('No response content from Llama API');
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse Llama response as JSON:', content);
    throw new Error('Invalid JSON response from Llama API');
  }
}

async function saveKnowledgeGraph(knowledgeGraph: KnowledgeGraph, filename: string): Promise<string> {
  const outputDir = path.join(__dirname, '..', 'output');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, JSON.stringify(knowledgeGraph, null, 2));
  
  return outputPath;
}

async function runActualLlamaTest() {
  console.log('🧪 Starting ACTUAL Llama Knowledge Graph Generator Test...\n');
  console.log('🦙 This test will use the real Llama API to generate knowledge graphs\n');

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

    // Step 3: Generate knowledge graph with real Llama API
    console.log('🧠 Step 3: Generating knowledge graph with Llama API...');
    console.log('⏳ This may take a few moments...\n');
    
    const startTime = Date.now();
    const knowledgeGraph = await generateKnowledgeGraphWithLlama(transcriptData);
    const endTime = Date.now();
    
    console.log(`✅ Knowledge graph generated successfully in ${(endTime - startTime) / 1000}s\n`);

    // Step 4: Save the knowledge graph
    console.log('💾 Step 4: Saving knowledge graph to file...');
    const outputPath = await saveKnowledgeGraph(knowledgeGraph, 'actual_test_knowledge_graph.json');
    console.log(`✅ Knowledge graph saved to: ${outputPath}\n`);

    // Step 5: Display results
    console.log('📋 Step 5: Knowledge Graph Analysis Results:');
    console.log('='.repeat(50));
    
    console.log('📊 Metadata:');
    console.log(`   Product: ${knowledgeGraph.metadata.product}`);
    console.log(`   Total Transcripts: ${knowledgeGraph.metadata.totalTranscripts}`);
    console.log(`   Successful: ${knowledgeGraph.metadata.successfulCount}`);
    console.log(`   Unsuccessful: ${knowledgeGraph.metadata.unsuccessfulCount}`);
    console.log(`   Success Rate: ${((knowledgeGraph.metadata.successfulCount / knowledgeGraph.metadata.totalTranscripts) * 100).toFixed(1)}%`);
    
    if (knowledgeGraph.nodes) {
      console.log(`\n📊 Nodes: ${knowledgeGraph.nodes.length}`);
      const nodeTypes = knowledgeGraph.nodes.reduce((acc: any, node: any) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Node types:', Object.entries(nodeTypes).map(([type, count]) => `${type}: ${count}`).join(', '));
    }
    
    if (knowledgeGraph.edges) {
      console.log(`\n🔗 Relationships: ${knowledgeGraph.edges.length}`);
      const edgeTypes = knowledgeGraph.edges.reduce((acc: any, edge: any) => {
        acc[edge.type] = (acc[edge.type] || 0) + 1;
        return acc;
      }, {});
      console.log('   Relationship types:', Object.entries(edgeTypes).map(([type, count]) => `${type}: ${count}`).join(', '));
    }

    if (knowledgeGraph.insights) {
      console.log(`\n💡 Key Insights:`);
      console.log(`   Success Factors: ${knowledgeGraph.insights.successFactors.length}`);
      knowledgeGraph.insights.successFactors.slice(0, 3).forEach((factor, index) => {
        console.log(`     ${index + 1}. ${factor}`);
      });
      
      console.log(`   Failure Factors: ${knowledgeGraph.insights.failureFactors.length}`);
      knowledgeGraph.insights.failureFactors.slice(0, 3).forEach((factor, index) => {
        console.log(`     ${index + 1}. ${factor}`);
      });
      
      console.log(`   Recommendations: ${knowledgeGraph.insights.recommendations.length}`);
      knowledgeGraph.insights.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`     ${index + 1}. ${rec}`);
      });
    }

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
