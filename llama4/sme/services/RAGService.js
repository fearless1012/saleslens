const { LlamaAPI } = require('llama-api');
const KnowledgeGraphService = require('./KnowledgeGraphService');
const winston = require('winston');

class RAGService {
  constructor() {
    this.llamaAPI = new LlamaAPI(process.env.LLAMA_API_KEY);
    this.knowledgeGraph = new KnowledgeGraphService();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'rag-service' },
      transports: [
        new winston.transports.Console()
      ]
    });

    // System prompts for different conversation types
    this.systemPrompts = {
      expert: `You are a knowledgeable domain expert assistant. Use the provided context from the knowledge graph to answer questions accurately and comprehensively. 
               If the context doesn't contain enough information to answer the question, say so clearly. 
               Always cite relevant information from the context when possible.
               Maintain a professional but approachable tone.`,
      
      technical: `You are a technical expert assistant. Provide detailed, accurate technical information based on the knowledge graph context.
                  Include specific details, examples, and step-by-step explanations when appropriate.
                  If technical information is missing from the context, acknowledge this limitation.`,
      
      conversational: `You are a helpful conversational assistant. Use the knowledge graph context to provide informative yet accessible answers.
                       Explain complex concepts in simple terms when needed.
                       Feel free to ask clarifying questions if the user's intent is unclear.`
    };
  }

  // Generate response using RAG approach
  async generateResponse(userQuery, userId, conversationType = 'expert', maxTokens = 1000) {
    try {
      this.logger.info(`Generating RAG response for user: ${userId}`);
      
      // Step 1: Retrieve relevant context from knowledge graph
      const relevantDocs = await this.knowledgeGraph.queryKnowledgeGraph(userQuery, userId, 5);
      
      if (relevantDocs.length === 0) {
        return {
          response: "I don't have enough information in my knowledge base to answer your question. Could you provide more context or ask about a different topic?",
          sources: [],
          confidence: 0
        };
      }

      // Step 2: Prepare context for the LLM
      const context = this.prepareContext(relevantDocs);
      const systemPrompt = this.systemPrompts[conversationType] || this.systemPrompts.expert;
      
      // Step 3: Generate response using Llama API
      const prompt = this.buildPrompt(systemPrompt, context, userQuery);
      
      const response = await this.llamaAPI.run({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: `Context from knowledge graph:\n${context}\n\nUser question: ${userQuery}`
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false
      });

      // Step 4: Extract and format response
      const generatedText = response.choices[0].message.content;
      
      // Calculate confidence based on context relevance
      const confidence = this.calculateConfidence(relevantDocs, userQuery);
      
      // Log the interaction for learning
      await this.logInteraction(userId, userQuery, generatedText, relevantDocs, confidence);
      
      return {
        response: generatedText,
        sources: relevantDocs.map(doc => ({
          documentId: doc.documentId,
          sourceId: doc.sourceId,
          relevanceScore: doc.relevanceScore,
          relevantTerms: doc.relevantTerms.slice(0, 5), // Top 5 relevant terms
          relevantEntities: doc.relevantEntities.slice(0, 3) // Top 3 relevant entities
        })),
        confidence,
        metadata: {
          contextDocuments: relevantDocs.length,
          conversationType,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      this.logger.error('Error generating RAG response:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  // Prepare context from retrieved documents
  prepareContext(relevantDocs) {
    let context = '';
    
    relevantDocs.forEach((doc, index) => {
      context += `\n--- Source ${index + 1} ---\n`;
      context += `Content: ${doc.content}\n`;
      
      if (doc.relevantTerms.length > 0) {
        context += `Key terms: ${doc.relevantTerms.join(', ')}\n`;
      }
      
      if (doc.relevantEntities.length > 0) {
        context += `Entities: ${doc.relevantEntities.join(', ')}\n`;
      }
      
      if (doc.relevantConcepts.length > 0) {
        const concepts = doc.relevantConcepts
          .filter(c => c.subject && c.object)
          .map(c => `${c.subject} ${c.predicate} ${c.object}`)
          .slice(0, 3);
        if (concepts.length > 0) {
          context += `Relationships: ${concepts.join('; ')}\n`;
        }
      }
    });
    
    return context;
  }

  // Build the complete prompt for the LLM
  buildPrompt(systemPrompt, context, userQuery) {
    return `${systemPrompt}

Context Information:
${context}

User Question: ${userQuery}

Please provide a comprehensive answer based on the context provided. If the context doesn't contain sufficient information, please state this clearly.`;
  }

  // Calculate confidence score based on context relevance
  calculateConfidence(relevantDocs, userQuery) {
    if (relevantDocs.length === 0) return 0;
    
    const queryWords = userQuery.toLowerCase().split(/\s+/);
    let totalRelevance = 0;
    let maxPossibleRelevance = 0;
    
    relevantDocs.forEach(doc => {
      const relevantTermsMatch = doc.relevantTerms.filter(term => 
        queryWords.some(word => term.toLowerCase().includes(word))
      ).length;
      
      const relevantEntitiesMatch = doc.relevantEntities.filter(entity => 
        queryWords.some(word => entity.toLowerCase().includes(word))
      ).length;
      
      totalRelevance += (relevantTermsMatch + relevantEntitiesMatch + doc.relevanceScore);
      maxPossibleRelevance += (doc.relevantTerms.length + doc.relevantEntities.length + 10);
    });
    
    return Math.min(totalRelevance / Math.max(maxPossibleRelevance, 1), 1);
  }

  // Log interaction for learning and improvement
  async logInteraction(userId, query, response, sources, confidence) {
    try {
      // This will be used by the finetuning pipeline
      const interaction = {
        userId,
        query,
        response,
        sources: sources.map(s => s.documentId),
        confidence,
        timestamp: new Date()
      };
      
      // Store in MongoDB for finetuning data collection
      // This will be implemented in the InteractionModel
      this.logger.info(`Logged interaction for user ${userId} with confidence ${confidence}`);
      
    } catch (error) {
      this.logger.error('Error logging interaction:', error);
    }
  }

  // Provide feedback on response quality
  async provideFeedback(interactionId, feedback, userId) {
    try {
      // Update knowledge graph based on feedback
      const relevantDocs = await this.knowledgeGraph.queryKnowledgeGraph(
        `interaction:${interactionId}`, userId, 1
      );
      
      if (relevantDocs.length > 0) {
        await this.knowledgeGraph.updateKnowledgeGraph(
          relevantDocs[0].documentId,
          feedback,
          `interaction:${interactionId}`,
          'feedback_update'
        );
      }
      
      this.logger.info(`Feedback provided for interaction: ${interactionId}`);
      return true;
      
    } catch (error) {
      this.logger.error('Error providing feedback:', error);
      throw error;
    }
  }

  // Generate follow-up questions
  async generateFollowUpQuestions(context, previousQuery, response) {
    try {
      const prompt = `Based on the previous conversation context and response, generate 3 relevant follow-up questions that would help explore the topic further.

Previous Query: ${previousQuery}
Response: ${response.substring(0, 500)}...

Generate follow-up questions in JSON format:
{"questions": ["question1", "question2", "question3"]}`;

      const followUpResponse = await this.llamaAPI.run({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates relevant follow-up questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      try {
        const questions = JSON.parse(followUpResponse.choices[0].message.content);
        return questions.questions || [];
      } catch (parseError) {
        this.logger.warn('Could not parse follow-up questions JSON');
        return [];
      }
      
    } catch (error) {
      this.logger.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  // Get conversation history
  async getConversationHistory(userId, limit = 10) {
    try {
      // This would fetch from MongoDB
      // Implementation depends on the InteractionModel
      this.logger.info(`Fetching conversation history for user: ${userId}`);
      return [];
    } catch (error) {
      this.logger.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  // Cleanup resources
  async close() {
    await this.knowledgeGraph.close();
  }
}

module.exports = RAGService;
