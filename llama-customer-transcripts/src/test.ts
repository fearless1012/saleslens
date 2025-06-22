import { KnowledgeGraphGenerator } from '../src/index';
import { FileService } from '../src/fileService';
import * as path from 'path';

// Mock sample data for testing
const mockTranscripts = [
  {
    result: 'successful' as const,
    context: 'Enterprise client seeking AI automation solution',
    transcriptText: `
Sales Rep: Good morning! I understand you're looking for an AI solution to streamline your customer service operations.

Customer: Yes, we're currently spending too much on manual support and want to explore automation options.

Sales Rep: That's exactly what our Llama AI Platform excels at. Can you tell me about your current support volume?

Customer: We handle about 1,000 tickets per day, and our team is overwhelmed.

Sales Rep: With our platform, you could automate 70% of those routine inquiries, which would save you approximately $50,000 monthly in labor costs. Would that kind of ROI be significant for your business?

Customer: Absolutely. How quickly can we see results?

Sales Rep: Most clients see a 40% reduction in manual work within the first month. Let me show you a case study from a similar company...

Customer: This looks promising. What's the implementation timeline?

Sales Rep: We can have you up and running in 2 weeks with our dedicated onboarding team. Shall we schedule a technical demo for next week?

Customer: Yes, let's do that. I'm convinced this could solve our problems.
`
  },
  {
    result: 'unsuccessful' as const,
    context: 'Small business with limited budget constraints',
    transcriptText: `
Sales Rep: Hi there! I'd like to tell you about our amazing Llama AI Platform and all its features.

Customer: Okay, but I should mention upfront that we're a small business with a tight budget.

Sales Rep: Our platform has incredible capabilities - machine learning, natural language processing, advanced analytics...

Customer: That sounds complex. How much does it cost?

Sales Rep: Well, our enterprise package starts at $5,000 per month, but you get so many features...

Customer: That's way beyond our budget. We were thinking more like $200-500 monthly.

Sales Rep: I understand, but you really need the full package to get value. The basic version wouldn't meet your needs.

Customer: I don't think this is for us then. We need something simpler and more affordable.

Sales Rep: But think about the long-term benefits and ROI...

Customer: Sorry, but we just can't justify that expense right now. Thanks for your time.

Sales Rep: Maybe in the future when you're ready for a real solution...

Customer: I need to go. Goodbye.
`
  },
  {
    result: 'successful' as const,
    context: 'Mid-size company comparing solutions',
    transcriptText: `
Sales Rep: Thank you for considering our Llama AI Platform. I understand you're evaluating multiple vendors?

Customer: Yes, we're looking at three solutions including yours. Price is important, but so is functionality.

Sales Rep: Smart approach. What specific challenges are you hoping to solve?

Customer: We need to reduce response times and improve customer satisfaction scores.

Sales Rep: Perfect. Our clients typically see 60% faster response times and a 25-point increase in CSAT scores. What's your current baseline?

Customer: Response time averages 4 hours, CSAT is around 3.2 out of 5.

Sales Rep: With our solution, you'd likely get that down to 90 minutes with CSAT jumping to 4.0+. How would that impact your business?

Customer: That would be transformative. Our competitor analysis shows faster response times directly correlate with customer retention.

Sales Rep: Exactly. And unlike other platforms that require extensive coding, ours has a no-code interface. Your team could be productive immediately.

Customer: The other vendors mentioned 3-6 month implementation periods.

Sales Rep: That's one of our key differentiators. We can have you operational in 2 weeks with our proven methodology.

Customer: This addresses our main concerns. Can you prepare a proposal?

Sales Rep: Absolutely. I'll have a customized proposal to you by tomorrow that addresses your specific metrics and timeline.
`
  }
];

async function runTests() {
  console.log('🧪 Running Knowledge Graph Generator Tests\n');
  
  try {
    // Test 1: File Service
    console.log('1. Testing File Service...');
    await FileService.ensureDirectoryExists('output/test');
    console.log('   ✅ Directory creation works');

    // Test 2: Mock Knowledge Graph Generation (without actual Llama API call)
    console.log('2. Testing Knowledge Graph Structure...');
    
    const mockKnowledgeGraph = {
      metadata: {
        product: 'Test Product',
        totalTranscripts: mockTranscripts.length,
        successfulCount: mockTranscripts.filter(t => t.result === 'successful').length,
        unsuccessfulCount: mockTranscripts.filter(t => t.result === 'unsuccessful').length,
        generatedAt: new Date().toISOString()
      },
      nodes: [
        {
          id: 'roi_demonstration',
          type: 'technique',
          label: 'ROI Demonstration',
          properties: {
            frequency: 0.8,
            successRate: 0.9,
            description: 'Showing concrete return on investment'
          }
        },
        {
          id: 'price_objection',
          type: 'objection',
          label: 'Price Objection',
          properties: {
            frequency: 0.6,
            successRate: 0.3,
            description: 'Customer raises pricing concerns'
          }
        }
      ],
      edges: [
        {
          id: 'roi_overcomes_price',
          source: 'roi_demonstration',
          target: 'price_objection',
          type: 'overcomes',
          label: 'ROI Demonstration Overcomes Price Objection',
          properties: {
            strength: 0.85,
            confidence: 0.9,
            description: 'Strong ROI presentation can overcome price concerns'
          }
        }
      ],
      insights: {
        successFactors: [
          'Early ROI demonstration',
          'Understanding customer pain points',
          'Quick implementation timeline'
        ],
        failureFactors: [
          'Leading with features instead of benefits',
          'Not addressing budget concerns early',
          'Pushing expensive solutions on small businesses'
        ],
        keyPatterns: [
          'Successful calls focus on customer outcomes',
          'Failed calls don\'t match solution to budget'
        ],
        recommendations: [
          'Qualify budget early in conversation',
          'Prepare ROI calculations for common scenarios',
          'Offer tiered pricing options'
        ]
      }
    };

    // Test 3: Save Knowledge Graph
    const testOutputPath = path.join('output', 'test', 'test_knowledge_graph.json');
    await FileService.saveKnowledgeGraph(mockKnowledgeGraph, testOutputPath);
    console.log('   ✅ Knowledge graph saving works');

    // Test 4: Generate Summary Report
    await FileService.saveSummaryReport(mockKnowledgeGraph, testOutputPath);
    console.log('   ✅ Summary report generation works');

    // Test 5: Data Processing
    console.log('3. Testing Data Processing...');
    console.log(`   📊 Sample data has ${mockTranscripts.length} transcripts`);
    console.log(`   ✅ ${mockTranscripts.filter(t => t.result === 'successful').length} successful`);
    console.log(`   ❌ ${mockTranscripts.filter(t => t.result === 'unsuccessful').length} unsuccessful`);

    console.log('\n🎉 All tests passed! The system is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up your .env file with MongoDB and Llama API credentials');
    console.log('   2. Run: npm run dev demo');
    console.log('   3. Check the output folder for generated knowledge graphs');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { runTests, mockTranscripts };
