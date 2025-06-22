import { LlamaKnowledgeGraphService } from './llamaService';
import { ProcessedTranscript } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function loadSampleTranscripts(): Promise<ProcessedTranscript[]> {
  // Sample data for testing the LlamaService following Sales LMS patterns
  const sampleData: ProcessedTranscript[] = [
    {
      result: 'successful',
      context: 'Enterprise client needing predictive analytics',
      transcriptText: 'Sales Rep: Good morning! I understand you are looking for better analytics capabilities. Customer: Yes, we are struggling with customer churn analysis and need predictive insights. Sales Rep: That is exactly what our AI Analytics Platform addresses. It can process your transaction data, support tickets, and engagement metrics to predict churn risk weeks in advance. Customer: That sounds promising. How accurate are the predictions? Sales Rep: Our models typically achieve 85-92% accuracy, and we provide confidence scores for each prediction. Customer: Impressive! Can you show me a demo? Sales Rep: Absolutely! Let me walk you through a live demo with data similar to yours.'
    },
    {
      result: 'unsuccessful',
      context: 'Small business with budget constraints',
      transcriptText: 'Sales Rep: Hi there! Our platform has incredible capabilities - machine learning, natural language processing, advanced analytics. Customer: That sounds complex. We are a small team. How much does it cost? Sales Rep: Our enterprise package starts at $5,000 per month. Customer: That is way beyond our budget. We were thinking more like $200-500 monthly. Sales Rep: I understand, but you really need the full package to get value. The basic features will not give you the insights you need. Customer: We cannot justify that expense right now. Thanks for your time.'
    },
    {
      result: 'successful',
      context: 'Healthcare technology - urgent compliance need',
      transcriptText: 'Sales Rep: Dr. Williams, I understand you are facing challenges with the new HIPAA compliance requirements? Customer: Yes, it has been a nightmare. We need to upgrade our entire patient data system by next month or face significant penalties. Sales Rep: That timeline sounds stressful. What is your biggest concern right now? Customer: Honestly, we are worried about patient data security during the transition. Sales Rep: Those are valid concerns. We have helped several practices in similar situations. Dr. Peterson clinic had just 3 weeks to comply last year. Customer: That sounds promising. Sales Rep: We used our rapid deployment protocol - 48-hour data migration with zero downtime, plus we included a dedicated trainer. Customer: What is the investment? Sales Rep: $45,000 for the complete solution including training and support. Customer: Considering the potential fines... let us move forward.'
    }
  ];

  console.log(`✅ Loaded ${sampleData.length} sample transcript records`);
  return sampleData;
}

async function runLlamaServiceTest() {
  console.log('\n🎯 Testing LlamaKnowledgeGraphService...');
  console.log('🦙 Cost-optimized: Processing all transcripts in single API call');

  try {
    // Check API key following Sales LMS error handling patterns
    const apiKey = process.env.LLAMA_API_KEY;
    if (!apiKey) {
      console.error('❌ LLAMA_API_KEY not found in environment variables');
      console.log('Please set your LLAMA_API_KEY in the .env file');
      process.exit(1);
    }

    // Step 1: Load transcript data
    console.log('\n📊 Step 1: Loading sample transcript data...');
    const transcriptData = await loadSampleTranscripts();    // Step 2: Initialize the service following Sales LMS controller-service pattern
    console.log('\n🔧 Step 2: Initializing LlamaKnowledgeGraphService...');
    const llamaService = new LlamaKnowledgeGraphService(apiKey);

    // Step 3: Test basic knowledge graph generation
    console.log('\n🧠 Step 3: Testing generateKnowledgeGraph method...');
    console.log(`💰 Cost optimization: Processing ${transcriptData.length} conversations in 1 API call`);
    console.log('⏳ This may take a few moments...');

    const startTime = Date.now();
    const knowledgeGraphText = await llamaService.generateKnowledgeGraph(transcriptData);
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // Step 4: Validate response following Sales LMS validation patterns
    console.log('\n✅ Knowledge graph generated successfully!');
    console.log(`⚡ Processing time: ${processingTime.toFixed(2)} seconds`);
    
    // Parse and validate the JSON response
    let knowledgeGraph;
    try {
      knowledgeGraph = JSON.parse(knowledgeGraphText);
      console.log('✅ Valid JSON response received');
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw parseError;
    }

    // Step 5: Display analysis results
    console.log('\n📊 Analysis Results:');
    console.log(`   • Total transcripts analyzed: ${knowledgeGraph.metadata?.totalTranscripts || 'N/A'}`);
    console.log(`   • Successful conversations: ${knowledgeGraph.metadata?.successfulCount || 'N/A'}`);
    console.log(`   • Unsuccessful conversations: ${knowledgeGraph.metadata?.unsuccessfulCount || 'N/A'}`);
    console.log(`   • Knowledge graph nodes: ${knowledgeGraph.nodes?.length || 0}`);
    console.log(`   • Relationship edges: ${knowledgeGraph.edges?.length || 0}`);
    console.log(`   • Success factors identified: ${knowledgeGraph.insights?.successFactors?.length || 0}`);
    console.log(`   • Failure factors identified: ${knowledgeGraph.insights?.failureFactors?.length || 0}`);

    // Step 6: Test enhanced multi-stage method
    console.log('\n🚀 Step 4: Testing generateKnowledgeGraphMultiStage method...');
    const enhancedStartTime = Date.now();
    const enhancedKnowledgeGraphText = await llamaService.generateKnowledgeGraphMultiStage(transcriptData);
    const enhancedEndTime = Date.now();
    const enhancedProcessingTime = (enhancedEndTime - enhancedStartTime) / 1000;
    
    const enhancedKnowledgeGraph = JSON.parse(enhancedKnowledgeGraphText);
    console.log('✅ Enhanced knowledge graph generated successfully!');
    console.log(`⚡ Enhanced processing time: ${enhancedProcessingTime.toFixed(2)} seconds`);

    // Step 7: Save results for inspection (following Sales LMS file patterns)
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basicOutputPath = path.join(outputDir, `basic_knowledge_graph_${timestamp}.json`);
    const enhancedOutputPath = path.join(outputDir, `enhanced_knowledge_graph_${timestamp}.json`);
    
    fs.writeFileSync(basicOutputPath, knowledgeGraphText, 'utf8');
    fs.writeFileSync(enhancedOutputPath, enhancedKnowledgeGraphText, 'utf8');
    
    console.log(`\n💾 Results saved:`);
    console.log(`   • Basic: ${basicOutputPath}`);
    console.log(`   • Enhanced: ${enhancedOutputPath}`);

    // Step 8: Display sample insights for Sales LMS integration preview
    if (knowledgeGraph.insights?.successFactors?.length > 0) {
      console.log('\n🏆 Sample Success Factors:');
      knowledgeGraph.insights.successFactors.slice(0, 2).forEach((factor: string, index: number) => {
        console.log(`   ${index + 1}. ${factor}`);
      });
    }

    if (knowledgeGraph.insights?.recommendations?.length > 0) {
      console.log('\n💡 Sample Recommendations:');
      knowledgeGraph.insights.recommendations.slice(0, 2).forEach((rec: string, index: number) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Final summary following Sales LMS reporting patterns
    console.log('\n🎉 LlamaKnowledgeGraphService test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   • Analyzed ${transcriptData.length} conversations`);
    console.log(`   • Cost optimization: 1 API call instead of ${transcriptData.length} separate calls`);
    console.log(`   • Basic processing time: ${processingTime.toFixed(2)}s`);
    console.log(`   • Enhanced processing time: ${enhancedProcessingTime.toFixed(2)}s`);
    console.log(`   • Generated structured knowledge graphs as JSON strings`);
    console.log(`   • Ready for Sales LMS controller-service integration`);
    console.log(`   • No filesystem dependencies in service`);

  } catch (error) {
    // Error handling following Sales LMS patterns
    console.error('❌ Test failed with error:', error);
    
    if (error instanceof Error) {
      console.log('Error message:', error.message);
      
      // Provide helpful debugging information
      if (error.message.includes('API key') || error.message.includes('LLAMA_API_KEY')) {
        console.log('\n🔑 API Key Issue:');
        console.log('Please check that your LLAMA_API_KEY is set correctly in the .env file.');
      } else if (error.message.includes('timeout') || error.message.includes('Request timed out')) {
        console.log('\n⏱️ Timeout Issue:');
        console.log('The request took longer than expected. This can happen with large datasets.');
        console.log('The service includes a 5-minute timeout for processing.');
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        console.log('\n🐛 Parsing Issue:');
        console.log('The Llama API returned a response that could not be parsed as JSON.');
        console.log('This is usually due to response format issues.');
      }
    }
    
    process.exit(1);
  }
}

// Run the test following Sales LMS execution patterns
runLlamaServiceTest();
