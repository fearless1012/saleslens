import { LlamaKnowledgeGraphService } from './llamaService';
import { ProcessedTranscript } from './types';
import { FileService } from './fileService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testChainOfThoughtAnalysis() {
  console.log('🧠 Testing Chain-of-Thought Individual Analysis...\n');

  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    console.error('❌ LLAMA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Single conversation for focused chain-of-thought analysis
  const sampleTranscript: ProcessedTranscript = {
    result: 'successful',
    context: 'Enterprise SaaS sale with competitive pressure',
    transcriptText: `Rep: "Good morning! I understand you're evaluating solutions to improve your customer support operations?"
Customer: "Yes, we're currently using HelpDesk Pro, but we're having some performance issues."
Rep: "I see. Before I tell you about our solution, can you help me understand what specific performance issues you're experiencing?"
Customer: "The system is slow, and it doesn't integrate well with our CRM. Plus, our agents spend too much time on routine tickets."
Rep: "That must be frustrating for your team. How is this affecting your customer satisfaction scores?"
Customer: "Our CSAT has dropped from 4.2 to 3.8 over the past six months. Management is not happy."
Rep: "That's a significant decline. What's the cost if this trend continues?"
Customer: "We could lose major clients. Our biggest client already mentioned concerns about response times."
Rep: "I understand the urgency. Let me share how a similar company, TechFlow, improved their CSAT from 3.6 to 4.5 in just 8 weeks. Their situation sounds very similar to yours - outdated system, poor CRM integration, overwhelmed agents."
Customer: "How did they do it?"
Rep: "They implemented our AI-powered platform that automates routine ticket resolution and seamlessly integrates with Salesforce. But here's the key - we didn't just implement technology. We redesigned their entire workflow."
Customer: "That sounds complex. How long does implementation take?"
Rep: "Great question. TechFlow was live in 3 weeks with full functionality. We use a phased approach - critical integrations first, then optimization."
Customer: "What about training? Our agents are already overwhelmed."
Rep: "We include white-glove training as part of the implementation. TechFlow's agents were fully productive in 5 days because the interface is intuitive and we provide hands-on coaching."
Customer: "What's the investment?"
Rep: "For your volume, it's $4,200 monthly. But let me put this in perspective - what's the cost of losing your biggest client?"
Customer: "Easily $2 million annually."
Rep: "Exactly. This solution pays for itself if it prevents losing just one major client. Plus, happier agents mean lower turnover. Should we schedule a technical review with your IT team next week?"
Customer: "Yes, let's move forward with that."`
  };

  try {
    const service = new LlamaKnowledgeGraphService(apiKey);

    console.log('🔍 Performing individual conversation analysis with chain-of-thought reasoning...');
    
    // Test just the individual analysis stage for clarity
    const analysis = await (service as any).stageOneIndividualAnalysis([sampleTranscript]);

    console.log('\n✅ Chain-of-Thought Analysis Completed!');
    console.log('📊 Analysis Results:');
    
    if (analysis && analysis.length > 0) {
      const result = analysis[0];
      console.log(`\n🎯 Conversation ID: ${result.conversationId || 'N/A'}`);
      console.log(`📈 Outcome: ${result.outcome || 'N/A'}`);
      console.log(`🔢 Confidence Score: ${result.confidenceScore || 'N/A'}`);
      
      if (result.chainOfThoughtAnalysis) {
        console.log('\n🧠 CHAIN-OF-THOUGHT ANALYSIS:');
        console.log('================================');
        console.log(`\n1️⃣ OPENING ANALYSIS:`);
        console.log(`   ${result.chainOfThoughtAnalysis.openingAnalysis || 'N/A'}`);
        
        console.log(`\n2️⃣ PROBLEM DISCOVERY:`);
        console.log(`   ${result.chainOfThoughtAnalysis.problemDiscovery || 'N/A'}`);
        
        console.log(`\n3️⃣ OBJECTION HANDLING:`);
        console.log(`   ${result.chainOfThoughtAnalysis.objectionHandling || 'N/A'}`);
        
        console.log(`\n4️⃣ CRITICAL MOMENTS:`);
        if (result.chainOfThoughtAnalysis.criticalMoments) {
          result.chainOfThoughtAnalysis.criticalMoments.forEach((moment: string, index: number) => {
            console.log(`   ${index + 1}. ${moment}`);
          });
        }
        
        console.log(`\n5️⃣ COUNTERFACTUAL REASONING:`);
        console.log(`   ${result.chainOfThoughtAnalysis.counterfactualReasoning || 'N/A'}`);
      }
      
      if (result.keyInsights && result.keyInsights.length > 0) {
        console.log('\n💡 KEY INSIGHTS:');
        result.keyInsights.forEach((insight: string, index: number) => {
          console.log(`   ${index + 1}. ${insight}`);
        });
      }
    }

    // Save the analysis
    const outputPath = await FileService.saveKnowledgeGraph(analysis, 'chain_of_thought_analysis');
    console.log(`\n💾 Chain-of-thought analysis saved to: ${outputPath}`);

    console.log('\n🎯 This demonstrates the power of chain-of-thought reasoning:');
    console.log('   • Step-by-step analysis of each conversation phase');
    console.log('   • Evidence-based insights with specific examples');
    console.log('   • Counterfactual reasoning for learning opportunities');
    console.log('   • Higher quality insights through systematic thinking');

  } catch (error) {
    console.error('❌ Error in chain-of-thought analysis:', error);
  }
}

// Self-executing function
if (require.main === module) {
  testChainOfThoughtAnalysis().catch(console.error);
}

export { testChainOfThoughtAnalysis };
