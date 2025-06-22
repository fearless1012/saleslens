import { LlamaKnowledgeGraphService } from './llamaService';
import { ProcessedTranscript } from './types';
import { FileService } from './fileService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testKnowledgeGraphGeneration() {
  console.log('🚀 Testing Enhanced Knowledge Graph Generation...\n');

  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    console.error('❌ LLAMA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Simplified sample data to avoid timeouts
  const sampleTranscripts: ProcessedTranscript[] = [
    {
      result: 'successful',
      context: 'SaaS Enterprise Sale',
      transcriptText: `Rep: "I understand you're struggling with support ticket volume?"
Customer: "Yes, our team is overwhelmed."
Rep: "What's the biggest impact on your business?"
Customer: "We've lost three team members this quarter."
Rep: "That's costly. TechCorp had the same issue - reduced tickets 40% in 6 weeks with our AI routing."
Customer: "How quickly can we implement?"
Rep: "Most clients see results in 2-3 weeks. For your size, investment is $2,500 monthly."
Customer: "That's less than the cost of one replacement hire."
Rep: "Exactly. Should we start with a pilot next week?"
Customer: "Yes, let's do it."`
    },
    {
      result: 'unsuccessful',
      context: 'SaaS Cold Call',
      transcriptText: `Rep: "Hi! I have an amazing AI solution that will revolutionize your business!"
Customer: "I'm not interested."
Rep: "But wait! You haven't heard about our incredible features yet!"
Customer: "I really don't have time."
Rep: "Just give me 5 minutes! Our ROI is 300%!"
Customer: "Please remove me from your list."
Rep: "Can I call back tomorrow?"
Customer: "No." [hangs up]`
    }
  ];

  try {
    const service = new LlamaKnowledgeGraphService(apiKey);

    console.log('📊 Generating knowledge graph with enhanced analysis...');
    const knowledgeGraph = await service.generateKnowledgeGraph('SaaS Support Platform', sampleTranscripts);

    console.log('\n✅ Knowledge Graph Generated Successfully!');
    console.log('📈 Analysis Structure:', Object.keys(knowledgeGraph));

    // Save the knowledge graph
    const outputPath = await FileService.saveKnowledgeGraph(knowledgeGraph, 'enhanced_test');
    console.log(`💾 Knowledge graph saved to: ${outputPath}`);

    // Generate summary report
    const report = FileService.generateSummaryReport(knowledgeGraph);
    console.log(`📋 Summary report generated (${report.length} chars)`);

    // Display preview of insights
    console.log('\n🔍 PREVIEW OF ANALYSIS:');
    console.log('======================');
    
    if (knowledgeGraph.successPatterns) {
      console.log('\n✅ SUCCESS PATTERNS:');
      console.log('- Psychological Triggers:', knowledgeGraph.successPatterns.psychologicalTriggers?.slice(0, 2));
      console.log('- Trust Building:', knowledgeGraph.successPatterns.trustBuilding?.slice(0, 2));
    }

    if (knowledgeGraph.failurePatterns) {
      console.log('\n❌ FAILURE PATTERNS:');
      console.log('- Red Flags:', knowledgeGraph.failurePatterns.redFlags?.slice(0, 2));
      console.log('- Trust Breakers:', knowledgeGraph.failurePatterns.trustBreakers?.slice(0, 2));
    }

    if (knowledgeGraph.insights) {
      console.log('\n💡 KEY INSIGHTS:');
      console.log('- Counter-intuitive:', knowledgeGraph.insights.counterIntuitive?.slice(0, 2));
      console.log('- Coaching Tips:', knowledgeGraph.insights.coaching?.slice(0, 2));
    }

    if (knowledgeGraph.ragNodes) {
      console.log(`\n🧠 RAG NODES: ${knowledgeGraph.ragNodes.length} searchable insights created`);
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testKnowledgeGraphGeneration();
