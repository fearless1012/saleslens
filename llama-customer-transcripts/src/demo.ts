import { LlamaKnowledgeGraphService } from './llamaService';
import { ProcessedTranscript } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

async function demonstrateImprovements() {
  console.log('🎯 DEMONSTRATION: Chain-of-Thought & Multi-Stage Processing Improvements\n');
  console.log('========================================================================\n');

  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    console.log('❌ LLAMA_API_KEY not found. This is a demonstration of capabilities.\n');
    showCapabilities();
    return;
  }

  console.log('✅ LLAMA_API_KEY found. Running live demonstration...\n');

  // Sample conversation for demonstration
  const sampleConversation: ProcessedTranscript = {
    result: 'successful',
    context: 'Enterprise software sale with urgency',
    transcriptText: `Rep: "Hi Sarah, thanks for taking the time. I understand you're evaluating solutions for your customer support challenges?"
Customer: "Yes, our current system is causing major issues. Response times are terrible and our team is overwhelmed."
Rep: "That sounds incredibly stressful. What's the impact on your customers and team morale?"
Customer: "Our CSAT scores have dropped significantly, and we've had several agents quit. Management is pushing for a solution."
Rep: "I can imagine the pressure. Let me share how a similar company solved this exact problem..."
Customer: "I'd like to hear about that."
Rep: "TechCorp was in a similar situation - declining CSAT, high agent turnover. Within 6 weeks of implementing our solution, they saw a 40% reduction in ticket volume and CSAT improved from 3.2 to 4.6."
Customer: "How is that possible?"
Rep: "AI-powered ticket routing and automated resolution for routine issues. But here's the key - it freed up your agents to focus on complex problems where they add real value."
Customer: "What kind of implementation timeline are we looking at?"
Rep: "Most clients see results in 2-3 weeks. TechCorp was live in 10 days. We include dedicated implementation specialists."
Customer: "And the investment?"
Rep: "For your volume, $2,500 monthly. But let me ask - what's the cost of losing another experienced agent?"
Customer: "Between recruiting and training, easily $50K per person."
Rep: "Exactly. This pays for itself preventing just one departure. Should we schedule a technical review next week?"
Customer: "Yes, let's move forward."`
  };

  try {
    const service = new LlamaKnowledgeGraphService(apiKey);
    
    console.log('🧠 Performing Chain-of-Thought Analysis...\n');
    
    // Demonstrate individual conversation analysis
    const analysis = await (service as any).stageOneIndividualAnalysis([sampleConversation]);
    
    if (analysis && analysis.length > 0) {
      const result = analysis[0];
      
      console.log('✅ CHAIN-OF-THOUGHT ANALYSIS COMPLETE!\n');
      console.log('📊 Key Improvements Demonstrated:\n');
      
      console.log('1️⃣ SYSTEMATIC ANALYSIS:');
      console.log(`   • Opening Analysis: ${result.chainOfThoughtAnalysis?.openingAnalysis?.substring(0, 100) || 'N/A'}...`);
      console.log(`   • Problem Discovery: ${result.chainOfThoughtAnalysis?.problemDiscovery?.substring(0, 100) || 'N/A'}...`);
      console.log(`   • Objection Handling: ${result.chainOfThoughtAnalysis?.objectionHandling?.substring(0, 100) || 'N/A'}...`);
      
      console.log('\n2️⃣ CRITICAL MOMENTS IDENTIFIED:');
      if (result.chainOfThoughtAnalysis?.criticalMoments) {
        result.chainOfThoughtAnalysis.criticalMoments.forEach((moment: string, index: number) => {
          console.log(`   ${index + 1}. ${moment.substring(0, 80)}...`);
        });
      }
      
      console.log('\n3️⃣ COUNTERFACTUAL REASONING:');
      console.log(`   ${result.chainOfThoughtAnalysis?.counterfactualReasoning?.substring(0, 120) || 'N/A'}...`);
      
      console.log(`\n4️⃣ CONFIDENCE SCORE: ${result.confidenceScore || 'N/A'}`);
      
      console.log('\n5️⃣ KEY INSIGHTS EXTRACTED:');
      if (result.keyInsights) {
        result.keyInsights.forEach((insight: string, index: number) => {
          console.log(`   ${index + 1}. ${insight.substring(0, 80)}...`);
        });
      }
    }
    
    console.log('\n🎯 This demonstrates the power of our improvements:');
    console.log('   ✅ Step-by-step reasoning instead of generic analysis');
    console.log('   ✅ Evidence-based insights with specific examples');
    console.log('   ✅ Counterfactual thinking for learning opportunities');
    console.log('   ✅ Higher confidence and actionable recommendations');
    
  } catch (error) {
    console.error('❌ Demonstration error:', error);
    console.log('\nFalling back to capability overview...\n');
    showCapabilities();
  }
}

function showCapabilities() {
  console.log('🌟 KEY CAPABILITIES IMPLEMENTED:\n');
  
  console.log('🧠 CHAIN-OF-THOUGHT REASONING:');
  console.log('   • Systematic 9-step analysis of each conversation');
  console.log('   • Evidence-based insights with specific examples');
  console.log('   • Counterfactual reasoning for learning opportunities');
  console.log('   • Critical moment identification');
  
  console.log('\n🚀 MULTI-STAGE PROCESSING:');
  console.log('   • Stage 1: Individual conversation analysis');
  console.log('   • Stage 2: Cross-conversation pattern identification');
  console.log('   • Stage 3: Success/failure factor synthesis');
  console.log('   • Stage 4: Coaching recommendation generation');
  console.log('   • Stage 5: Knowledge graph assembly');
  
  console.log('\n📊 ENHANCED SALES INTELLIGENCE:');
  console.log('   • Psychological trigger analysis');
  console.log('   • Conversation flow optimization');
  console.log('   • Trust building/breaking identification');
  console.log('   • Objection handling mastery');
  console.log('   • Competitive positioning insights');
  
  console.log('\n🎯 ACTIONABLE COACHING OUTPUTS:');
  console.log('   • Personalized skill development priorities');
  console.log('   • Behavioral interventions (start/stop/change)');
  console.log('   • Real-time coaching cues');
  console.log('   • Role-play scenarios');
  console.log('   • Measurement frameworks');
  
  console.log('\n🔬 TECHNICAL IMPROVEMENTS:');
  console.log('   • JSON schema validation for structured responses');
  console.log('   • Enhanced prompting with few-shot learning');
  console.log('   • Performance optimization with extended timeouts');
  console.log('   • Raw output debugging capabilities');
  
  console.log('\n📋 AVAILABLE TESTS:');
  console.log('   • npm run test:cot (Chain-of-thought analysis)');
  console.log('   • npm run test:multistage (Full pipeline)');
  console.log('   • npm run test (Basic knowledge graph)');
  
  console.log('\n🎉 READY FOR SALES LMS INTEGRATION!');
  console.log('   This provides world-class conversation analysis');
  console.log('   that can transform sales training and coaching.');
}

// Self-executing demonstration
if (require.main === module) {
  demonstrateImprovements().catch(console.error);
}

export { demonstrateImprovements };
