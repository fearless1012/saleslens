import { LlamaAPIClient } from 'llama-api-client';
import { ProcessedTranscript } from './types';
import { FileService } from './fileService';
import * as path from 'path';

export class LlamaKnowledgeGraphService {
  private client: LlamaAPIClient;
  private model: string;
  private fileService: FileService;
  
  constructor(apiKey: string, model: string = 'Llama-3.3-70B-Instruct') {
    this.client = new LlamaAPIClient({ 
      apiKey,
      timeout: 180000 // 3 minutes timeout for large responses
    });
    this.model = model;
    this.fileService = new FileService();
  }

  // Multi-stage processing pipeline
  async generateKnowledgeGraphMultiStage(product: string, transcripts: ProcessedTranscript[]): Promise<any> {
    console.log(`🚀 Starting multi-stage knowledge graph generation for ${product} with ${transcripts.length} transcripts...`);
    
    try {
      // Stage 1: Individual conversation analysis with chain-of-thought
      console.log('\n📊 STAGE 1: Individual Conversation Analysis...');
      const individualAnalyses = await this.stageOneIndividualAnalysis(transcripts);
      
      // Stage 2: Pattern identification across conversations
      console.log('\n🔍 STAGE 2: Cross-Conversation Pattern Analysis...');
      const patterns = await this.stageTwoPatternAnalysis(individualAnalyses, product);
      
      // Stage 3: Success/failure factor synthesis
      console.log('\n⚖️ STAGE 3: Success/Failure Factor Synthesis...');
      const factors = await this.stageThreeFactorSynthesis(patterns, individualAnalyses);
      
      // Stage 4: Coaching recommendations generation
      console.log('\n🎯 STAGE 4: Coaching Recommendations Generation...');
      const recommendations = await this.stageFourCoachingRecommendations(factors, patterns);
      
      // Stage 5: Final knowledge graph assembly
      console.log('\n🔧 STAGE 5: Knowledge Graph Assembly...');
      const knowledgeGraph = await this.stageFiveFinalAssembly(product, transcripts, individualAnalyses, patterns, factors, recommendations);
      
      console.log('\n✅ Multi-stage knowledge graph generation completed successfully!');
      return knowledgeGraph;
      
    } catch (error) {
      console.error('❌ Error in multi-stage processing:', error);
      throw error;
    }
  }

  // Stage 1: Individual conversation analysis with chain-of-thought reasoning
  private async stageOneIndividualAnalysis(transcripts: ProcessedTranscript[]): Promise<any[]> {
    const analyses = [];
    
    for (let i = 0; i < transcripts.length; i++) {
      const transcript = transcripts[i];
      console.log(`   Analyzing conversation ${i + 1}/${transcripts.length}...`);
      
      const prompt = this.createChainOfThoughtAnalysisPrompt(transcript, i + 1);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a world-class sales psychology expert. Analyze this single conversation step-by-step using chain-of-thought reasoning. Think through each phase of the conversation methodically.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_completion_tokens: 2000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "individual_analysis",
            schema: this.getIndividualAnalysisSchema()
          }
        }
      });

      const rawContent = this.extractResponseContent(response);
      const analysis = await this.saveRawOutputAndParse(rawContent, `stage1_conv_${i + 1}`);
      analyses.push({ conversationIndex: i, ...analysis });
    }
    
    return analyses;
  }

  // Chain-of-thought prompts
  private createChainOfThoughtAnalysisPrompt(transcript: ProcessedTranscript, index: number): string {
    return `Analyze this sales conversation step-by-step using chain-of-thought reasoning.

CONVERSATION ${index}:
Result: ${transcript.result}
Context: ${transcript.context}
Transcript: ${transcript.transcriptText}

Think through this conversation systematically:

1. OPENING ANALYSIS: How did the salesperson open the conversation? What was the customer's initial state?

2. PROBLEM DISCOVERY: How effectively did the salesperson uncover the customer's pain points? What techniques were used?

3. SOLUTION PRESENTATION: How was the solution presented? Was it tailored to the discovered problems?

4. OBJECTION HANDLING: What objections arose? How were they addressed? What worked or didn't work?

5. EMOTIONAL DYNAMICS: What emotional triggers were present? How did emotions evolve throughout the conversation?

6. TRUST BUILDING: What trust-building or trust-breaking moments occurred?

7. CLOSING ANALYSIS: How did the conversation conclude? What closing techniques were attempted?

8. CRITICAL MOMENTS: What were the 2-3 most critical moments that determined the outcome?

9. COUNTERFACTUAL REASONING: If this was unsuccessful, what specific changes could have led to success? If successful, what could have gone wrong?

Provide detailed, evidence-based analysis for each step.`;
  }

  // JSON Schemas for each stage
  private getIndividualAnalysisSchema() {
    return {
      type: "object",
      properties: {
        conversationId: { type: "string" },
        outcome: { type: "string", enum: ["successful", "unsuccessful"] },
        chainOfThoughtAnalysis: {
          type: "object",
          properties: {
            openingAnalysis: { type: "string" },
            problemDiscovery: { type: "string" },
            solutionPresentation: { type: "string" },
            objectionHandling: { type: "string" },
            emotionalDynamics: { type: "string" },
            trustBuilding: { type: "string" },
            closingAnalysis: { type: "string" },
            criticalMoments: {
              type: "array",
              items: { type: "string" }
            },
            counterfactualReasoning: { type: "string" }
          },
          required: ["openingAnalysis", "problemDiscovery", "solutionPresentation", "objectionHandling", "emotionalDynamics", "trustBuilding", "closingAnalysis", "criticalMoments", "counterfactualReasoning"]
        },        keyInsights: {
          type: "array",
          items: { type: "string" }
        },
        confidenceScore: { type: "number" }
      },
      required: ["conversationId", "outcome", "chainOfThoughtAnalysis", "keyInsights", "confidenceScore"]
    };
  }

  // Stage 2: Pattern identification across conversations
  private async stageTwoPatternAnalysis(individualAnalyses: any[], product: string): Promise<any> {
    const prompt = this.createPatternAnalysisPrompt(individualAnalyses, product);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a sales strategy expert. Analyze multiple conversation analyses to identify patterns, trends, and recurring themes. Think step-by-step about what makes conversations successful vs unsuccessful.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 2500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pattern_analysis",
          schema: this.getPatternAnalysisSchema()
        }
      }
    });

    const rawContent = this.extractResponseContent(response);
    return await this.saveRawOutputAndParse(rawContent, 'stage2_patterns');
  }

  // Stage 3: Success/failure factor synthesis
  private async stageThreeFactorSynthesis(patterns: any, individualAnalyses: any[]): Promise<any> {
    const prompt = this.createFactorSynthesisPrompt(patterns, individualAnalyses);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a sales performance analyst. Synthesize patterns and individual analyses to identify the key factors that drive success and failure. Reason through cause-and-effect relationships.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 2000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "factor_synthesis",
          schema: this.getFactorSynthesisSchema()
        }
      }
    });

    const rawContent = this.extractResponseContent(response);
    return await this.saveRawOutputAndParse(rawContent, 'stage3_factors');
  }

  // Stage 4: Coaching recommendations generation
  private async stageFourCoachingRecommendations(factors: any, patterns: any): Promise<any> {
    const prompt = this.createCoachingRecommendationsPrompt(factors, patterns);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a sales coach and trainer. Create actionable coaching recommendations based on success/failure factors and patterns. Think about practical training interventions and skill development.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_completion_tokens: 2000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_recommendations",
          schema: this.getCoachingRecommendationsSchema()
        }
      }
    });

    const rawContent = this.extractResponseContent(response);
    return await this.saveRawOutputAndParse(rawContent, 'stage4_coaching');
  }

  // Stage 5: Final knowledge graph assembly
  private async stageFiveFinalAssembly(product: string, transcripts: ProcessedTranscript[], individualAnalyses: any[], patterns: any, factors: any, recommendations: any): Promise<any> {
    const prompt = this.createFinalAssemblyPrompt(product, transcripts, individualAnalyses, patterns, factors, recommendations);
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a knowledge graph architect. Assemble all previous analyses into a comprehensive, structured knowledge graph that captures insights, relationships, and actionable intelligence for sales teams.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_completion_tokens: 4000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "final_knowledge_graph",
          schema: this.getFinalKnowledgeGraphSchema()
        }
      }
    });

    const rawContent = this.extractResponseContent(response);
    return await this.saveRawOutputAndParse(rawContent, 'stage5_final_graph');
  }

  // Additional prompt methods
  private createPatternAnalysisPrompt(individualAnalyses: any[], product: string): string {
    return `Analyze patterns across multiple conversation analyses for ${product}.

INDIVIDUAL CONVERSATION ANALYSES:
${JSON.stringify(individualAnalyses, null, 2)}

Think step-by-step about patterns:

1. SUCCESS PATTERN IDENTIFICATION: What consistent patterns appear in successful conversations? Look for:
   - Common opening strategies that work
   - Effective problem discovery techniques
   - Solution presentation approaches that resonate
   - Successful objection handling patterns
   - Trust-building behaviors that succeed

2. FAILURE PATTERN IDENTIFICATION: What patterns appear in unsuccessful conversations? Look for:
   - Opening mistakes that create resistance
   - Problem discovery failures
   - Solution presentation mistakes
   - Poor objection handling
   - Trust-breaking behaviors

3. CONTEXT DEPENDENCY: How do patterns vary by:
   - Customer context/industry
   - Problem complexity
   - Competitive landscape
   - Timing factors

4. EMOTIONAL PATTERN ANALYSIS: What emotional patterns correlate with success vs failure?

5. SEQUENTIAL PATTERNS: Are there conversation flow patterns that predict outcomes?

Identify the most significant patterns with supporting evidence from the analyses.`;
  }

  private createFactorSynthesisPrompt(patterns: any, individualAnalyses: any[]): string {
    return `Synthesize success and failure factors from patterns and individual analyses.

IDENTIFIED PATTERNS:
${JSON.stringify(patterns, null, 2)}

INDIVIDUAL ANALYSES SUMMARY:
${individualAnalyses.length} conversations analyzed

Think through factor synthesis:

1. PRIMARY SUCCESS FACTORS: What are the top 5 factors that most strongly predict success?
   - Rank by impact strength
   - Provide evidence from multiple conversations
   - Explain cause-and-effect relationships

2. PRIMARY FAILURE FACTORS: What are the top 5 factors that most strongly predict failure?
   - Rank by impact strength
   - Show evidence patterns
   - Explain why these factors cause failure

3. INTERACTION EFFECTS: How do factors interact with each other?
   - Which combinations amplify success?
   - Which combinations guarantee failure?
   - What synergistic effects exist?

4. CONTEXTUAL MODIFIERS: How do context factors change the importance of other factors?

5. COUNTER-INTUITIVE INSIGHTS: What unexpected relationships did you discover?

Provide quantified insights where possible (e.g., "Factor X appears in 80% of successful conversations").`;
  }

  private createCoachingRecommendationsPrompt(factors: any, patterns: any): string {
    return `Create actionable coaching recommendations based on success/failure factors and patterns.

SUCCESS/FAILURE FACTORS:
${JSON.stringify(factors, null, 2)}

IDENTIFIED PATTERNS:
${JSON.stringify(patterns, null, 2)}

Think through coaching strategy:

1. SKILL DEVELOPMENT PRIORITIES: What are the top 5 skills to develop?
   - Rank by impact on success rate
   - Provide specific training approaches
   - Include practice scenarios

2. BEHAVIORAL INTERVENTIONS: What specific behaviors should sales reps:
   - Start doing (new behaviors)
   - Stop doing (harmful behaviors)  
   - Do differently (modifications)

3. PERSONALIZED COACHING PATHS: How should coaching vary by:
   - Experience level (junior vs senior reps)
   - Personality type
   - Current skill gaps
   - Product knowledge level

4. REAL-TIME COACHING CUES: What in-the-moment coaching cues can help during live conversations?

5. MEASUREMENT FRAMEWORK: How should progress be measured and tracked?

6. ROLE-PLAY SCENARIOS: What specific practice scenarios would be most valuable?

Make recommendations specific, actionable, and measurable.`;
  }

  private createFinalAssemblyPrompt(product: string, transcripts: ProcessedTranscript[], individualAnalyses: any[], patterns: any, factors: any, recommendations: any): string {
    return `Assemble a comprehensive knowledge graph from all previous analyses.

PRODUCT: ${product}
TOTAL CONVERSATIONS: ${transcripts.length}

ANALYSIS COMPONENTS:
- Individual Analyses: ${individualAnalyses.length} conversations
- Patterns: ${JSON.stringify(patterns, null, 1)}
- Success/Failure Factors: ${JSON.stringify(factors, null, 1)}  
- Coaching Recommendations: ${JSON.stringify(recommendations, null, 1)}

Create a comprehensive knowledge graph that includes:

1. METADATA: Product info, analysis scope, confidence metrics

2. SUCCESS PATTERNS: Distilled success factors with confidence scores

3. FAILURE PATTERNS: Key failure modes with frequency data

4. INSIGHTS: Counter-intuitive and contextual insights

5. NODES AND EDGES: Create a graph structure showing:
   - Technique nodes (opening, objection handling, closing, etc.)
   - Outcome nodes (successful close, lost to competitor, etc.)
   - Pattern nodes (early qualification, demo request, etc.)
   - Objection nodes (price concern, budget constraint, etc.)
   - Relationships between all elements

6. ACTIONABLE INTELLIGENCE: Specific recommendations for sales teams

Ensure the knowledge graph follows the exact structure with nodes and edges that can be visualized.`;
  }

  // Additional schema methods
  private getPatternAnalysisSchema() {
    return {
      type: "object",
      properties: {
        successPatterns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pattern: { type: "string" },
              frequency: { type: "number" },
              evidenceCount: { type: "number" },
              description: { type: "string" }
            },
            required: ["pattern", "frequency", "evidenceCount", "description"]
          }
        },
        failurePatterns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pattern: { type: "string" },
              frequency: { type: "number" },
              evidenceCount: { type: "number" },
              description: { type: "string" }
            },
            required: ["pattern", "frequency", "evidenceCount", "description"]
          }
        },
        contextualPatterns: {
          type: "array",
          items: { type: "string" }
        },
        emotionalPatterns: {
          type: "array",
          items: { type: "string" }
        },
        sequentialPatterns: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["successPatterns", "failurePatterns", "contextualPatterns", "emotionalPatterns", "sequentialPatterns"]
    };
  }

  private getFactorSynthesisSchema() {
    return {
      type: "object",
      properties: {        primarySuccessFactors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              factor: { type: "string" },
              impactStrength: { type: "number" },
              evidenceCount: { type: "number" },
              causalExplanation: { type: "string" }
            },
            required: ["factor", "impactStrength", "evidenceCount", "causalExplanation"]
          }
        },        primaryFailureFactors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              factor: { type: "string" },
              impactStrength: { type: "number" },
              evidenceCount: { type: "number" },
              causalExplanation: { type: "string" }
            },
            required: ["factor", "impactStrength", "evidenceCount", "causalExplanation"]
          }
        },
        interactionEffects: {
          type: "array",
          items: { type: "string" }
        },
        contextualModifiers: {
          type: "array",
          items: { type: "string" }
        },
        counterIntuitiveInsights: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["primarySuccessFactors", "primaryFailureFactors", "interactionEffects", "contextualModifiers", "counterIntuitiveInsights"]
    };
  }

  private getCoachingRecommendationsSchema() {
    return {
      type: "object",
      properties: {
        skillDevelopmentPriorities: {
          type: "array",
          items: {
            type: "object",            properties: {
              skill: { type: "string" },
              priority: { type: "number" },
              trainingApproach: { type: "string" },
              practiceScenarios: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["skill", "priority", "trainingApproach", "practiceScenarios"]
          }
        },
        behavioralInterventions: {
          type: "object",
          properties: {
            startDoing: {
              type: "array",
              items: { type: "string" }
            },
            stopDoing: {
              type: "array",
              items: { type: "string" }
            },
            doDifferently: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["startDoing", "stopDoing", "doDifferently"]
        },
        personalizedCoachingPaths: {
          type: "array",
          items: { type: "string" }
        },
        realTimeCoachingCues: {
          type: "array",
          items: { type: "string" }
        },
        measurementFramework: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["skillDevelopmentPriorities", "behavioralInterventions", "personalizedCoachingPaths", "realTimeCoachingCues", "measurementFramework"]
    };
  }

  private getFinalKnowledgeGraphSchema() {
    return {
      type: "object",
      properties: {
        metadata: {
          type: "object",
          properties: {
            product: { type: "string" },            totalTranscripts: { type: "number" },
            successfulCount: { type: "number" },
            unsuccessfulCount: { type: "number" },
            analysisDate: { type: "string" },
            confidenceScore: { type: "number" }
          },
          required: ["product", "totalTranscripts", "successfulCount", "unsuccessfulCount", "analysisDate", "confidenceScore"]
        },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              label: { type: "string" },
              properties: {
                type: "object",
                properties: {
                  frequency: { type: "number" },
                  successRate: { type: "number" },
                  description: { type: "string" }
                },
                required: ["frequency", "successRate", "description"]
              }
            },
            required: ["id", "type", "label", "properties"]
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
              properties: {
                type: "object",
                properties: {
                  strength: { type: "number" },
                  confidence: { type: "number" },
                  description: { type: "string" }
                },
                required: ["strength", "confidence", "description"]
              }
            },
            required: ["id", "source", "target", "type", "label", "properties"]
          }
        },
        insights: {
          type: "object",
          properties: {
            successFactors: {
              type: "array",
              items: { type: "string" }
            },
            failureFactors: {
              type: "array",
              items: { type: "string" }
            },
            keyPatterns: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["successFactors", "failureFactors", "keyPatterns", "recommendations"]
        }
      },
      required: ["metadata", "nodes", "edges", "insights"]
    };
  }

  // Legacy method for backward compatibility
  async generateKnowledgeGraph(product: string, transcripts: ProcessedTranscript[]): Promise<any> {
    // Use the new multi-stage method as the default
    return await this.generateKnowledgeGraphMultiStage(product, transcripts);
  }

  // Utility methods
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

  private async saveRawOutputAndParse(rawContent: string, prefix: string = 'llama_output'): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rawFileName = `${prefix}_${timestamp}.txt`;
    
    try {
      await FileService.saveRawOutput(rawFileName, rawContent);
      console.log(`📝 Raw output saved: raw_outputs/${rawFileName}`);

      let cleanContent = rawContent.trim();
      
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }

      const parsedData = JSON.parse(cleanContent);
      console.log('✅ Successfully parsed response as JSON');
      return parsedData;
      
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      
      const errorFileName = `parse_error_${timestamp}.txt`;
      const errorDetails = `Parse Error: ${parseError}\n\nRaw Content Length: ${rawContent.length}\n\nRaw Content:\n${rawContent}`;
      await FileService.saveRawOutput(errorFileName, errorDetails);
      
      throw new Error(`Failed to parse Llama response as JSON. Raw output saved to raw_outputs/${rawFileName}, error details in raw_outputs/${errorFileName}`);
    }
  }
}
