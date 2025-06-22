import { LlamaKnowledgeGraphService } from './llamaService';
import { ProcessedTranscript } from './types';
import { FileService } from './fileService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMultiStageKnowledgeGraphGeneration() {
  console.log('🚀 Testing Multi-Stage Chain-of-Thought Knowledge Graph Generation...\n');

  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) {
    console.error('❌ LLAMA_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Sample processed transcript data for testing with few-shot examples
  const sampleTranscripts: ProcessedTranscript[] = [
    {
      result: 'successful',
      context: 'Enterprise SaaS sale to mid-market company',
      transcriptText: `Rep: "Good morning! I understand you're looking to streamline your customer support operations?"
Customer: "Yes, we're drowning in tickets and our response times are terrible."
Rep: "That sounds incredibly frustrating. What's the impact on your team morale?"
Customer: "Our support team is burned out. We've had three people quit this quarter."
Rep: "I can imagine. Let me share how TechCorp reduced their ticket volume by 40% in just 6 weeks. They had a similar situation - overwhelmed team, high turnover. Sound familiar?"
Customer: "Very familiar. How did they do it?"
Rep: "They implemented our AI-powered routing system that automatically categorizes and prioritizes tickets. But what really made the difference was our automated resolution feature for common issues. Should I show you how it works?"
Customer: "Absolutely."
Rep: "Great! Here's their dashboard... Notice how routine password resets and billing questions are now handled automatically? That freed up their team to focus on complex issues where they add real value."
Customer: "This is impressive. What kind of setup time are we talking about?"
Rep: "Most clients are seeing results within 2-3 weeks. TechCorp was actually live in 10 days because they had a dedicated implementation specialist - which we include in your package."
Customer: "What's the investment?"
Rep: "For a company your size, it's $2,500 monthly. But let me ask - what's the cost of losing another experienced support person?"
Customer: "Good point. Between recruiting, training, and lost productivity... easily $50K."
Rep: "Exactly. So this essentially pays for itself if it prevents just one departure per year. Plus, your remaining team becomes more effective and engaged. Should we start with a pilot program next week?"
Customer: "Yes, let's do it."`
    },
    {
      result: 'unsuccessful',
      context: 'Competitive displacement attempt in financial services',
      transcriptText: `Rep: "Hi Marcus, thanks for taking my call. I know you recently implemented Salesforce, but I wanted to show you some exciting new features in our platform."
Customer: "Look, Sarah, we just finished a year-long implementation. My team is finally getting comfortable with the system."
Rep: "I understand, but our AI analytics can provide insights that Salesforce simply can't match. We have machine learning algorithms that-"
Customer: "We're already using Einstein Analytics. What makes yours different?"
Rep: "Well, our algorithms are more advanced and we have better visualization tools."
Customer: "Can you be more specific? What kind of ROI are we talking about?"
Rep: "Our clients typically see 20-30% improvement in sales productivity."
Customer: "That's pretty generic. Do you have case studies in financial services?"
Rep: "I'd have to get back to you on specific case studies, but I'm confident we can deliver results."
Customer: "Look, Sarah, the technology might be great, but timing is everything. My team can't handle another implementation right now."
Rep: "But if you wait, you'll be missing out on potential revenue. Every day you delay costs you money."
Customer: "I really need to go. Thanks anyway."
Rep: "But I haven't shown you the best features yet! Can I call you tomorrow?"`
    },
    {
      result: 'successful',
      context: 'Healthcare technology - urgent compliance need',
      transcriptText: `Rep: "Dr. Williams, I understand you're facing some challenges with the new HIPAA compliance requirements?"
Customer: "Yes, it's been a nightmare. We need to upgrade our entire patient data system by next month or face significant penalties."
Rep: "That timeline sounds stressful. What's your biggest concern right now?"
Customer: "Honestly, we're worried about patient data security during the transition and whether we can train staff quickly enough."
Rep: "Those are absolutely valid concerns. Let me ask - what happens if you don't meet the deadline?"
Customer: "We could face fines up to $1.5 million and potentially lose our accreditation."
Rep: "That's serious. The good news is we've helped several practices in similar situations. Dr. Peterson's clinic had just 3 weeks to comply last year. Would you like to hear how we approached it?"
Customer: "Please."
Rep: "We used our rapid deployment protocol - 48-hour data migration with zero downtime, plus we included a dedicated trainer who worked with your staff during the transition. Dr. Peterson's team was fully operational in 5 days."
Customer: "That sounds almost too good to be true. What about security?"
Rep: "Every data transfer is encrypted and we provide real-time monitoring. Plus, we're already compliant with all current and upcoming HIPAA requirements."
Customer: "What's the investment for something like this?"
Rep: "Given your timeline and requirements, it would be $45,000 for the complete solution including training and support."
Customer: "That's significant, but considering the potential fines..."
Rep: "Exactly. And we guarantee compliance within your deadline or we refund the entire fee. Can we schedule the data audit for tomorrow?"
Customer: "Yes, let's move forward."`
    }
  ];

  try {
    const service = new LlamaKnowledgeGraphService(apiKey);

    console.log('🧠 Starting multi-stage chain-of-thought knowledge graph generation...');
    const knowledgeGraph = await service.generateKnowledgeGraphMultiStage('Advanced Sales Analytics Platform', sampleTranscripts);

    console.log('\n✅ Multi-Stage Knowledge Graph Generated Successfully!');
    console.log('📈 Analysis Components:');
    console.log(`   • Metadata: ${JSON.stringify(knowledgeGraph.metadata, null, 2)}`);
    console.log(`   • Nodes: ${knowledgeGraph.nodes?.length || 0}`);
    console.log(`   • Edges: ${knowledgeGraph.edges?.length || 0}`);
    console.log(`   • Success Factors: ${knowledgeGraph.insights?.successFactors?.length || 0}`);
    console.log(`   • Failure Factors: ${knowledgeGraph.insights?.failureFactors?.length || 0}`);

    // Save the multi-stage knowledge graph
    const outputPath = await FileService.saveKnowledgeGraph(knowledgeGraph, 'multi_stage_test');
    console.log(`💾 Multi-stage knowledge graph saved to: ${outputPath}`);

    // Generate summary report
    const report = FileService.generateSummaryReport(knowledgeGraph);
    console.log(`📋 Summary report generated with ${report.length} characters of insights`);

    // Display a preview of the rich analysis
    console.log('\n🔍 PREVIEW OF MULTI-STAGE ANALYSIS:');
    console.log('=================================');
    
    if (knowledgeGraph.insights?.successFactors?.length > 0) {
      console.log('\n🏆 TOP SUCCESS FACTORS:');
      knowledgeGraph.insights.successFactors.slice(0, 3).forEach((factor: string, index: number) => {
        console.log(`   ${index + 1}. ${factor}`);
      });
    }

    if (knowledgeGraph.insights?.failureFactors?.length > 0) {
      console.log('\n❌ TOP FAILURE FACTORS:');
      knowledgeGraph.insights.failureFactors.slice(0, 3).forEach((factor: string, index: number) => {
        console.log(`   ${index + 1}. ${factor}`);
      });
    }

    if (knowledgeGraph.insights?.recommendations?.length > 0) {
      console.log('\n💡 KEY RECOMMENDATIONS:');
      knowledgeGraph.insights.recommendations.slice(0, 3).forEach((rec: string, index: number) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n🎯 Multi-stage chain-of-thought analysis provides deeper insights through:');
    console.log('   • Individual conversation analysis with step-by-step reasoning');
    console.log('   • Pattern identification across multiple conversations');
    console.log('   • Success/failure factor synthesis with causal explanations');
    console.log('   • Actionable coaching recommendations');
    console.log('   • Comprehensive knowledge graph assembly');

  } catch (error) {
    console.error('❌ Error generating multi-stage knowledge graph:', error);
    console.error('❌ Test failed:', error);
  }
}

// Self-executing function
if (require.main === module) {
  testMultiStageKnowledgeGraphGeneration().catch(console.error);
}

export { testMultiStageKnowledgeGraphGeneration };
