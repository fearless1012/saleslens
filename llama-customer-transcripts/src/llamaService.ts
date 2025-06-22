import { LlamaAPIClient } from 'llama-api-client';
import { ProcessedTranscript, KnowledgeGraph, LlamaResponse } from './types';

export class LlamaKnowledgeGraphService {
  private client: LlamaAPIClient;
  private model: string;

  constructor(apiKey: string, model: string = 'Llama-3.3-70B-Instruct') {
    this.client = new LlamaAPIClient({ apiKey });
    this.model = model;
  }

  private createKnowledgeGraphPrompt(product: string, transcripts: ProcessedTranscript[]): string {
    const successfulCount = transcripts.filter(t => t.result === 'successful').length;
    const unsuccessfulCount = transcripts.filter(t => t.result === 'unsuccessful').length;

    return `You are an expert sales analyst tasked with creating a comprehensive knowledge graph from sales transcript data for the product "${product}".

TASK: Analyze ${transcripts.length} sales transcripts (${successfulCount} successful, ${unsuccessfulCount} unsuccessful) and create a structured knowledge graph that captures insights about what leads to successful vs unsuccessful sales interactions.

IMPORTANT INSTRUCTIONS:
1. Focus on PATTERNS, STRATEGIES, and BEHAVIORS - not individual people or dates
2. Create nodes for concepts like: conversation techniques, objection types, customer concerns, persuasion methods, emotional triggers, product benefits mentioned, etc.
3. Create edges that show relationships between these concepts and outcomes
4. Identify key success and failure factors
5. Extract actionable insights for sales training

KNOWLEDGE GRAPH STRUCTURE REQUIREMENTS:
- Nodes should represent concepts, not people (e.g., "Price Objection", "Technical Questions", "Urgency Creation")
- Edges should show causal or correlational relationships 
- Include success probability weights where relevant
- Categorize patterns by successful vs unsuccessful outcomes

SALES TRANSCRIPT DATA:
${JSON.stringify(transcripts, null, 2)}

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "knowledgeGraph": {
    "metadata": {
      "product": "${product}",
      "totalTranscripts": ${transcripts.length},
      "successfulCount": ${successfulCount},
      "unsuccessfulCount": ${unsuccessfulCount},
      "generatedAt": "${new Date().toISOString()}"
    },
    "nodes": [
      {
        "id": "unique_node_id",
        "type": "concept_category",
        "label": "Human readable label",
        "properties": {
          "frequency": number,
          "successRate": number,
          "description": "detailed description"
        }
      }
    ],
    "edges": [
      {
        "id": "unique_edge_id",
        "source": "source_node_id",
        "target": "target_node_id",
        "type": "relationship_type",
        "label": "Human readable relationship",
        "properties": {
          "strength": number,
          "confidence": number,
          "description": "relationship description"
        }
      }
    ],
    "insights": {
      "successFactors": ["factor1", "factor2", ...],
      "failureFactors": ["factor1", "factor2", ...],
      "keyPatterns": ["pattern1", "pattern2", ...],
      "recommendations": ["recommendation1", "recommendation2", ...]
    }
  }
}

Focus on extracting actionable sales intelligence that can be used to train sales representatives. Ensure the knowledge graph captures the essence of what makes conversations successful or unsuccessful for this specific product.`;
  }

  async generateKnowledgeGraph(product: string, transcripts: ProcessedTranscript[]): Promise<KnowledgeGraph> {
    try {
      console.log(`Generating knowledge graph for ${product} with ${transcripts.length} transcripts...`);
      
      const prompt = this.createKnowledgeGraphPrompt(product, transcripts);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales analyst and knowledge graph specialist. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent structure
        max_completion_tokens: 4000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'KnowledgeGraphResponse',
            schema: {
              type: 'object',
              properties: {
                knowledgeGraph: {
                  type: 'object',
                  properties: {
                    metadata: {
                      type: 'object',
                      properties: {
                        product: { type: 'string' },
                        totalTranscripts: { type: 'number' },
                        successfulCount: { type: 'number' },
                        unsuccessfulCount: { type: 'number' },
                        generatedAt: { type: 'string' }
                      },
                      required: ['product', 'totalTranscripts', 'successfulCount', 'unsuccessfulCount', 'generatedAt']
                    },
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',                        properties: {
                          id: { type: 'string' },
                          type: { type: 'string' },
                          label: { type: 'string' },                          properties: { 
                            type: 'object',
                            properties: {
                              frequency: { type: 'number' },
                              successRate: { type: 'number' },
                              description: { type: 'string' }
                            },
                            required: ['frequency', 'successRate', 'description']
                          }
                        },
                        required: ['id', 'type', 'label']
                      }
                    },
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',                        properties: {
                          id: { type: 'string' },
                          source: { type: 'string' },
                          target: { type: 'string' },
                          type: { type: 'string' },
                          label: { type: 'string' },                          properties: { 
                            type: 'object',
                            properties: {
                              strength: { type: 'number' },
                              confidence: { type: 'number' },
                              description: { type: 'string' }
                            },
                            required: ['strength', 'confidence', 'description']
                          }
                        },
                        required: ['id', 'source', 'target', 'type', 'label']
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
              },
              required: ['knowledgeGraph']
            }
          }
        }
      });

      if (response.completion_message?.content && typeof response.completion_message.content === 'object' && 'type' in response.completion_message.content && response.completion_message.content.type === 'text') {
        const responseData: LlamaResponse = JSON.parse(response.completion_message.content.text);
        console.log(`Knowledge graph generated successfully with ${responseData.knowledgeGraph.nodes.length} nodes and ${responseData.knowledgeGraph.edges.length} edges`);
        return responseData.knowledgeGraph;
      } else {
        throw new Error('Invalid response format from Llama API');
      }
    } catch (error) {
      console.error('Error generating knowledge graph:', error);
      throw error;
    }
  }

  async generateKnowledgeGraphStreaming(product: string, transcripts: ProcessedTranscript[]): Promise<KnowledgeGraph> {
    try {
      console.log(`Generating knowledge graph (streaming) for ${product} with ${transcripts.length} transcripts...`);
      
      const prompt = this.createKnowledgeGraphPrompt(product, transcripts);
      
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales analyst and knowledge graph specialist. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_completion_tokens: 4000,
        stream: true
      });

      let responseText = '';
      for await (const chunk of stream) {
        if (chunk.event.delta.type === 'text') {
          responseText += chunk.event.delta.text || '';
          process.stdout.write('.'); // Progress indicator
        }
      }
      console.log('\nStreaming completed.');

      const responseData: LlamaResponse = JSON.parse(responseText);
      console.log(`Knowledge graph generated successfully with ${responseData.knowledgeGraph.nodes.length} nodes and ${responseData.knowledgeGraph.edges.length} edges`);
      return responseData.knowledgeGraph;
    } catch (error) {
      console.error('Error generating knowledge graph (streaming):', error);
      throw error;
    }
  }
}
