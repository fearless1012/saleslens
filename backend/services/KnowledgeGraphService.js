const neo4j = require('neo4j-driver');
const natural = require('natural');
const compromise = require('compromise');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

class KnowledgeGraphService {
  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'knowledge-graph' },
      transports: [
        new winston.transports.Console()
      ]
    });

    // Initialize NLP tools
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  async close() {
    await this.driver.close();
  }

  // Extract entities and relationships from text data
  extractEntitiesAndRelationships(text) {
    try {
      const doc = compromise(text);
      
      // Extract entities
      const people = doc.people().out('array');
      const places = doc.places().out('array');
      const organizations = doc.organizations().out('array');
      const topics = doc.topics().out('array');
      const nouns = doc.nouns().out('array');
      
      // Extract key phrases and concepts
      const sentences = doc.sentences().out('array');
      const concepts = [];
      
      sentences.forEach(sentence => {
        const sentenceDoc = compromise(sentence);
        const subjects = sentenceDoc.match('#Noun').out('array');
        const verbs = sentenceDoc.match('#Verb').out('array');
        const objects = sentenceDoc.match('#Noun').out('array');
        
        if (subjects.length > 0 && verbs.length > 0 && objects.length > 0) {
          concepts.push({
            subject: subjects[0],
            predicate: verbs[0],
            object: objects[objects.length - 1],
            sentence: sentence
          });
        }
      });

      // Calculate TF-IDF for important terms
      this.tfidf.addDocument(text);
      const terms = this.tokenizer.tokenize(text.toLowerCase());
      const importantTerms = [];
      
      terms.forEach(term => {
        const tfidfScore = this.tfidf.tfidf(term, 0);
        if (tfidfScore > 0.1) { // Threshold for importance
          importantTerms.push({
            term: term,
            score: tfidfScore,
            stemmed: this.stemmer.stem(term)
          });
        }
      });

      return {
        entities: {
          people,
          places,
          organizations,
          topics,
          nouns: nouns.slice(0, 20), // Limit to top 20
          importantTerms: importantTerms.sort((a, b) => b.score - a.score).slice(0, 10)
        },
        relationships: concepts,
        metadata: {
          wordCount: terms.length,
          sentenceCount: sentences.length,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Error extracting entities:', error);
      throw error;
    }
  }

  // Create knowledge graph from extracted data
  async createKnowledgeGraph(data, sourceId, userId) {
    const session = this.driver.session();
    
    try {
      const extracted = this.extractEntitiesAndRelationships(data);
      const graphId = uuidv4();
      
      // Create document node
      await session.run(
        `CREATE (d:Document {
          id: $graphId,
          sourceId: $sourceId,
          userId: $userId,
          content: $data,
          wordCount: $wordCount,
          sentenceCount: $sentenceCount,
          createdAt: datetime(),
          updatedAt: datetime()
        })`,
        {
          graphId,
          sourceId,
          userId,
          data: data.substring(0, 1000), // Store first 1000 chars
          wordCount: extracted.metadata.wordCount,
          sentenceCount: extracted.metadata.sentenceCount
        }
      );

      // Create entity nodes and relationships
      for (const entityType of Object.keys(extracted.entities)) {
        if (entityType === 'importantTerms') {
          for (const term of extracted.entities[entityType]) {
            await session.run(
              `MATCH (d:Document {id: $graphId})
               MERGE (t:Term {name: $term, stemmed: $stemmed})
               ON CREATE SET t.id = randomUUID(), t.createdAt = datetime()
               MERGE (d)-[:CONTAINS_TERM {score: $score}]->(t)`,
              {
                graphId,
                term: term.term,
                stemmed: term.stemmed,
                score: term.score
              }
            );
          }
        } else {
          for (const entity of extracted.entities[entityType]) {
            if (entity && entity.trim()) {
              await session.run(
                `MATCH (d:Document {id: $graphId})
                 MERGE (e:Entity {name: $entity, type: $type})
                 ON CREATE SET e.id = randomUUID(), e.createdAt = datetime()
                 MERGE (d)-[:CONTAINS_ENTITY]->(e)`,
                {
                  graphId,
                  entity: entity.trim(),
                  type: entityType
                }
              );
            }
          }
        }
      }

      // Create concept relationships
      for (const concept of extracted.relationships) {
        if (concept.subject && concept.predicate && concept.object) {
          await session.run(
            `MATCH (d:Document {id: $graphId})
             MERGE (s:Concept {name: $subject})
             ON CREATE SET s.id = randomUUID(), s.createdAt = datetime()
             MERGE (o:Concept {name: $object})
             ON CREATE SET o.id = randomUUID(), o.createdAt = datetime()
             MERGE (s)-[:RELATES_TO {
               predicate: $predicate,
               sentence: $sentence,
               documentId: $graphId
             }]->(o)
             MERGE (d)-[:CONTAINS_CONCEPT]->(s)
             MERGE (d)-[:CONTAINS_CONCEPT]->(o)`,
            {
              graphId,
              subject: concept.subject,
              predicate: concept.predicate,
              object: concept.object,
              sentence: concept.sentence
            }
          );
        }
      }

      this.logger.info(`Knowledge graph created with ID: ${graphId}`);
      return { graphId, extracted };
      
    } catch (error) {
      this.logger.error('Error creating knowledge graph:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Query knowledge graph for RAG retrieval
  async queryKnowledgeGraph(query, userId, limit = 10) {
    const session = this.driver.session();
    
    try {
      const queryTerms = this.tokenizer.tokenize(query.toLowerCase());
      const stemmedTerms = queryTerms.map(term => this.stemmer.stem(term));
      
      // Search for relevant documents and entities
      const result = await session.run(
        `MATCH (d:Document)-[:CONTAINS_TERM]->(t:Term)
         WHERE d.userId = $userId 
         AND (ANY(term IN $queryTerms WHERE t.name CONTAINS term)
              OR ANY(stem IN $stemmedTerms WHERE t.stemmed CONTAINS stem))
         WITH d, t, COUNT(*) as relevanceScore
         OPTIONAL MATCH (d)-[:CONTAINS_ENTITY]->(e:Entity)
         WHERE ANY(term IN $queryTerms WHERE e.name CONTAINS term)
         WITH d, t, e, relevanceScore + COUNT(e) as totalScore
         OPTIONAL MATCH (d)-[:CONTAINS_CONCEPT]->(c:Concept)-[r:RELATES_TO]->(c2:Concept)
         WHERE ANY(term IN $queryTerms WHERE c.name CONTAINS term OR c2.name CONTAINS term)
         RETURN DISTINCT d.id as documentId, d.content as content, d.sourceId as sourceId,
                totalScore, 
                COLLECT(DISTINCT t.name) as relevantTerms,
                COLLECT(DISTINCT e.name) as relevantEntities,
                COLLECT(DISTINCT {subject: c.name, predicate: r.predicate, object: c2.name}) as relevantConcepts
         ORDER BY totalScore DESC
         LIMIT $limit`,
        {
          userId,
          queryTerms,
          stemmedTerms,
          limit: neo4j.int(limit)
        }
      );

      const documents = result.records.map(record => ({
        documentId: record.get('documentId'),
        content: record.get('content'),
        sourceId: record.get('sourceId'),
        relevanceScore: record.get('totalScore'),
        relevantTerms: record.get('relevantTerms'),
        relevantEntities: record.get('relevantEntities'),
        relevantConcepts: record.get('relevantConcepts')
      }));

      this.logger.info(`Found ${documents.length} relevant documents for query`);
      return documents;
      
    } catch (error) {
      this.logger.error('Error querying knowledge graph:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Update knowledge graph based on feedback
  async updateKnowledgeGraph(documentId, feedback, userQuery, response) {
    const session = this.driver.session();
    
    try {
      // Record interaction for learning
      await session.run(
        `MATCH (d:Document {id: $documentId})
         CREATE (i:Interaction {
           id: randomUUID(),
           userQuery: $userQuery,
           response: $response,
           feedback: $feedback,
           timestamp: datetime()
         })
         CREATE (d)-[:HAS_INTERACTION]->(i)`,
        {
          documentId,
          userQuery,
          response,
          feedback
        }
      );

      // If positive feedback, strengthen relationships
      if (feedback === 'positive') {
        await session.run(
          `MATCH (d:Document {id: $documentId})-[:CONTAINS_TERM]->(t:Term)
           SET t.positiveInteractions = COALESCE(t.positiveInteractions, 0) + 1`,
          { documentId }
        );
      } else if (feedback === 'negative') {
        await session.run(
          `MATCH (d:Document {id: $documentId})-[:CONTAINS_TERM]->(t:Term)
           SET t.negativeInteractions = COALESCE(t.negativeInteractions, 0) + 1`,
          { documentId }
        );
      }

      this.logger.info(`Knowledge graph updated with feedback for document: ${documentId}`);
      return true;
      
    } catch (error) {
      this.logger.error('Error updating knowledge graph:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get graph statistics
  async getGraphStatistics(userId) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `MATCH (d:Document {userId: $userId})
         OPTIONAL MATCH (d)-[:CONTAINS_ENTITY]->(e:Entity)
         OPTIONAL MATCH (d)-[:CONTAINS_TERM]->(t:Term)
         OPTIONAL MATCH (d)-[:CONTAINS_CONCEPT]->(c:Concept)
         OPTIONAL MATCH (d)-[:HAS_INTERACTION]->(i:Interaction)
         RETURN COUNT(DISTINCT d) as documentCount,
                COUNT(DISTINCT e) as entityCount,
                COUNT(DISTINCT t) as termCount,
                COUNT(DISTINCT c) as conceptCount,
                COUNT(DISTINCT i) as interactionCount`,
        { userId }
      );

      const stats = result.records[0];
      return {
        documents: stats.get('documentCount').toNumber(),
        entities: stats.get('entityCount').toNumber(),
        terms: stats.get('termCount').toNumber(),
        concepts: stats.get('conceptCount').toNumber(),
        interactions: stats.get('interactionCount').toNumber()
      };
      
    } catch (error) {
      this.logger.error('Error getting graph statistics:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = KnowledgeGraphService;
