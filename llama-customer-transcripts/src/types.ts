export interface SalesTranscript {
  Date: string;
  Customer: string;
  SalesRep: string;
  Product: string;
  Result: 'successful' | 'unsuccessful';
  Context: string;
  TranscriptText: string;
}

export interface ProcessedTranscript {
  result: 'successful' | 'unsuccessful';
  context: string;
  transcriptText: string;
  // Removed: Date, Customer, SalesRep for privacy
}

export interface KnowledgeGraphNode {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  metadata: {
    product: string;
    totalTranscripts: number;
    successfulCount: number;
    unsuccessfulCount: number;
    generatedAt: string;
  };
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  insights: {
    successFactors: string[];
    failureFactors: string[];
    keyPatterns: string[];
    recommendations: string[];
  };
}

export interface LlamaResponse {
  knowledgeGraph: KnowledgeGraph;
}
