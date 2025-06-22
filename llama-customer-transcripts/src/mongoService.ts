import { MongoClient, Db, Collection } from 'mongodb';
import { SalesTranscript, ProcessedTranscript } from './types';

export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private collection: Collection<SalesTranscript> | null = null;

  constructor(private connectionUri: string, private databaseName: string, private collectionName: string) {
    this.client = new MongoClient(connectionUri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.collection = this.db.collection<SalesTranscript>(this.collectionName);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  async getTranscriptsByProduct(product: string): Promise<SalesTranscript[]> {
    if (!this.collection) {
      throw new Error('MongoDB connection not established');
    }

    try {
      const transcripts = await this.collection
        .find({ Product: product })
        .toArray();
      
      console.log(`Retrieved ${transcripts.length} transcripts for product: ${product}`);
      return transcripts;
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<string[]> {
    if (!this.collection) {
      throw new Error('MongoDB connection not established');
    }

    try {
      const products = await this.collection
        .distinct('Product');
      
      console.log(`Found ${products.length} unique products`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  processTranscriptsForLlama(transcripts: SalesTranscript[]): ProcessedTranscript[] {
    return transcripts.map(transcript => ({
      result: transcript.Result,
      context: transcript.Context,
      transcriptText: transcript.TranscriptText
      // Intentionally excluding Date, Customer, SalesRep for privacy
    }));
  }
}
