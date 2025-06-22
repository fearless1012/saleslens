import * as dotenv from 'dotenv';
import { LlamaAPIClient } from 'llama-api-client';
import { ProcessedTranscript } from './types';

// Load environment variables
dotenv.config();

export class LlamaKnowledgeGraphService {
  private client: LlamaAPIClient;
  private model: string;

  constructor(apiKey?: string, model: string = 'Llama-3.3-70B-Instruct') {
    const llamaApiKey = apiKey || process.env.LLAMA_API_KEY;
    if (!llamaApiKey) {
      throw new Error('LLAMA_API_KEY not found in environment variables');
    }
    
    this.client = new LlamaAPIClient({ 
      apiKey: llamaApiKey,
      timeout: 300000 // 5 minutes timeout for large responses
    });
    this.model = model;
  }

  // Main method: Generate knowledge graph from all transcripts in single API call
  async generateKnowledgeGraph(transcripts: ProcessedTranscript[]): Promise<string> {
    try {
      console.log(`🧠 Generating knowledge graph for ${transcripts.length} transcripts in single API call...`);
      console.log('💰 Cost-optimized: Processing all conversations together');
      
      // Create combined analysis prompt with all transcripts
      const combinedPrompt = this.createCombinedAnalysisPrompt(transcripts);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class sales psychology expert and knowledge graph architect. Analyze ALL provided sales conversations together in a single comprehensive analysis to generate a knowledge graph with actionable insights for sales training. Process the entire dataset to identify patterns, relationships, and insights across all conversations.'
          },
          {
            role: 'user',
            content: combinedPrompt
          }
        ],
        temperature: 0.4,
        max_completion_tokens: 6000, // Increased for processing multiple transcripts together
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'comprehensive_knowledge_graph',
            schema: this.getEnhancedKnowledgeGraphSchema()
          }
        }
      });

      const rawContent = this.extractResponseContent(response);
      const knowledgeGraph = this.parseResponse(rawContent);
      
      console.log('✅ Knowledge graph generated successfully from combined analysis');
      console.log(`📊 Processed ${transcripts.length} conversations in 1 API call instead of ${transcripts.length} separate calls`);
      return JSON.stringify(knowledgeGraph, null, 2);
      
    } catch (error) {
      console.error('❌ Error generating knowledge graph:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate knowledge graph: ${errorMessage}`);
    }
  }

  // Simplified multi-stage: still uses combined processing but with enhanced analysis
  async generateKnowledgeGraphMultiStage(transcripts: ProcessedTranscript[]): Promise<string> {
    try {
      console.log(`🚀 Starting enhanced single-call analysis for ${transcripts.length} transcripts...`);
      console.log('💰 Cost-optimized: Using enhanced single API call instead of multi-stage');
      
      // Enhanced combined analysis with chain-of-thought instructions
      const enhancedPrompt = this.createEnhancedCombinedPrompt(transcripts);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class sales psychology expert. Perform deep chain-of-thought analysis on ALL provided conversations together. Think systematically about patterns, success factors, failure triggers, and relationships across the entire dataset. Provide comprehensive insights equivalent to multi-stage analysis in a single response.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3,
        max_completion_tokens: 8000, // Maximum for comprehensive analysis
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'enhanced_knowledge_graph',
            schema: this.getEnhancedKnowledgeGraphSchema()
          }
        }
      });

      const rawContent = this.extractResponseContent(response);
      const knowledgeGraph = this.parseResponse(rawContent);
      
      console.log('✅ Enhanced knowledge graph generated from single comprehensive analysis');
      return JSON.stringify(knowledgeGraph, null, 2);
      
    } catch (error) {
      console.error('❌ Error in enhanced processing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Enhanced processing failed: ${errorMessage}`);
    }
  }

  // Create combined analysis prompt for all transcripts
  private createCombinedAnalysisPrompt(transcripts: ProcessedTranscript[]): string {
    const successful = transcripts.filter(t => 
      t.result.toLowerCase().includes('successful') || 
      t.result.toLowerCase().includes('won') ||
      t.result.toLowerCase().includes('sale')
    );
    
    const unsuccessful = transcripts.filter(t => 
      t.result.toLowerCase().includes('failed') || 
      t.result.toLowerCase().includes('lost') ||
      t.result.toLowerCase().includes('unsuccessful')
    );    // Create numbered conversations for easier reference
    const numberedConversations = transcripts.map((transcript, index) => ({
      conversationId: `CONV_${index + 1}`,
      result: transcript.result,
      context: transcript.context,
      transcript: transcript.transcriptText
    }));

    return `Analyze this COMPLETE dataset of ${transcripts.length} sales conversations (${successful.length} successful, ${unsuccessful.length} unsuccessful) to create a comprehensive knowledge graph.

COMPLETE CONVERSATION DATASET:
${JSON.stringify(numberedConversations, null, 2)}

Perform a comprehensive analysis across ALL conversations to identify:

1. **SUCCESS PATTERNS**: What techniques, approaches, and behaviors consistently lead to successful outcomes across multiple conversations?

2. **FAILURE PATTERNS**: What mistakes, missed opportunities, and poor strategies repeatedly cause failures?

3. **CONVERSATION FLOW ANALYSIS**: How does the structure and sequence of successful conversations differ from unsuccessful ones?

4. **OBJECTION HANDLING MASTERY**: Analyze how different objection types are handled across all conversations and identify best practices.

5. **EMOTIONAL INTELLIGENCE PATTERNS**: What emotional dynamics, trust-building moments, and rapport techniques correlate with success?

6. **CRITICAL DECISION MOMENTS**: Identify the key turning points across conversations that determine outcomes.

7. **CONTEXTUAL SUCCESS FACTORS**: How do different customer contexts, industries, and situations affect success strategies?

8. **CROSS-CONVERSATION INSIGHTS**: What patterns emerge when looking at the entire dataset that wouldn't be visible in individual analysis?

Create a knowledge graph with nodes representing techniques, objections, outcomes, and patterns, with edges showing relationships and success probabilities. Include comprehensive insights and actionable recommendations for sales training.`;
  }
  // Enhanced prompt for multi-stage equivalent analysis
  private createEnhancedCombinedPrompt(transcripts: ProcessedTranscript[]): string {
    const numberedConversations = transcripts.map((transcript, index) => ({
      conversationId: `CONV_${index + 1}`,
      result: transcript.result,
      context: transcript.context,
      transcript: transcript.transcriptText
    }));

    return `Perform DEEP CHAIN-OF-THOUGHT ANALYSIS on this complete dataset of ${transcripts.length} sales conversations. Think systematically through multiple analytical layers:

COMPLETE DATASET:
${JSON.stringify(numberedConversations, null, 2)}

SYSTEMATIC ANALYSIS FRAMEWORK:

**LAYER 1: Individual Conversation Understanding**
For each conversation, consider:
- Opening effectiveness and customer initial state
- Problem discovery depth and technique quality
- Solution presentation alignment with discovered needs
- Objection handling competency and recovery strategies
- Emotional dynamics and trust-building moments
- Closing approach and commitment escalation
- Critical turning points that determined outcome

**LAYER 2: Cross-Conversation Pattern Recognition**
Across all conversations, identify:
- Recurring success techniques that appear in multiple wins
- Common failure modes that appear in multiple losses
- Emotional patterns that correlate with outcomes
- Sequential conversation patterns that predict success
- Contextual factors that modify success probabilities

**LAYER 3: Causal Relationship Analysis**
Determine what CAUSES what:
- Which behaviors directly lead to specific outcomes?
- What are the cause-and-effect chains in successful vs unsuccessful conversations?
- How do early conversation choices affect later outcomes?
- What intervention points could change trajectory?

**LAYER 4: Synthesis and Knowledge Graph Construction**
Create comprehensive knowledge representation with:
- Technique nodes with success rates and usage frequency
- Objection nodes with handling effectiveness patterns
- Outcome nodes showing probability relationships
- Pattern nodes representing multi-step sequences
- Rich edge relationships showing causation and correlation

**LAYER 5: Actionable Intelligence Generation**
Provide specific, trainable insights:
- What should sales reps start doing more of?
- What should they stop doing immediately?
- What skills need development priority?
- What practice scenarios would be most valuable?

Think through each layer systematically and provide comprehensive analysis equivalent to detailed multi-stage processing.`;
  }
  // Simplified schema to avoid depth limit issues
  private getEnhancedKnowledgeGraphSchema() {
    return {
      type: "object",
      properties: {
        metadata: {
          type: "object",
          properties: {
            totalTranscripts: { type: "number" },
            successfulCount: { type: "number" },
            unsuccessfulCount: { type: "number" },
            analysisDate: { type: "string" },
            confidenceScore: { type: "number" }
          },
          required: ["totalTranscripts", "successfulCount", "unsuccessfulCount"]
        },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              label: { type: "string" },
              frequency: { type: "number" },
              successRate: { type: "number" },
              description: { type: "string" }
            },
            required: ["id", "type", "label", "description"]
          }
        },
        edges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              source: { type: "string" },
              target: { type: "string" },
              type: { type: "string" },
              label: { type: "string" },
              strength: { type: "number" },
              description: { type: "string" }
            },
            required: ["id", "source", "target", "type", "label"]
          }
        },
        insights: {
          type: "object",
          properties: {
            successFactors: { type: "array", items: { type: "string" } },
            failureFactors: { type: "array", items: { type: "string" } },
            keyPatterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          },
          required: ["successFactors", "failureFactors", "keyPatterns", "recommendations"]
        }
      },
      required: ["metadata", "nodes", "edges", "insights"]
    };
  }

  // Utility methods remain the same
  private extractResponseContent(response: any): string {
    if (response.completion_message?.content && typeof response.completion_message.content === 'object' && 'type' in response.completion_message.content && response.completion_message.content.type === 'text') {
      return response.completion_message.content.text;
    }
    
    if (typeof response === 'string') {
      return response;
    }
    
    const content = (response as any).content || 
                   (response as any).message || 
                   (response as any).text || 
                   (response as any).output;
    
    if (content) {
      return typeof content === 'string' ? content : JSON.stringify(content);
    }
    
    throw new Error('Could not extract content from Llama API response');
  }

  private parseResponse(rawContent: string): any {
    try {
      let cleanContent = rawContent.trim();
      
      // Remove markdown formatting
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Extract JSON if wrapped in other text
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }

      return JSON.parse(cleanContent);
      
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.error('Raw content preview:', rawContent.substring(0, 500));
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse Llama response: ${errorMessage}`);
    }
  }
}
