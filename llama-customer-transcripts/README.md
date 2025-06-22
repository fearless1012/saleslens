# Llama Knowledge Graph Generator

A sophisticated Sales LMS component that leverages Llama API best practices to generate comprehensive knowledge graphs from sales conversation transcripts. This system transforms raw sales data into actionable coaching insights using advanced AI analysis techniques.

## 📚 Sales LMS Integration

### Project Context
This Llama Knowledge Graph Generator is a key component of a comprehensive **Learning Management System (LMS) for sales training** with AI features. The broader Sales LMS system includes:

- **Backend**: Node.js with Express, MongoDB via Mongoose, JWT authentication, and OpenAI integration
- **Frontend**: React.js with React Bootstrap, React Router, React Quill editor  
- **User Roles**: 
  - **Admin** (content creators) - Create AI-generated learning modules
  - **Trainee** (sales hires) - Access modules and interact with AI chatbot
- **AI Features**: Content generation and conversational AI chatbot

### Architecture Integration
The knowledge graph generator follows the Sales LMS **controller-service pattern**:

```typescript
// Example integration with Sales LMS
export class KnowledgeGraphController {
  constructor(private knowledgeGraphService: LlamaKnowledgeGraphService) {}
  
  async generateInsights(req: Request, res: Response) {
    try {
      const { transcripts, product } = req.body;
      const knowledgeGraph = await this.knowledgeGraphService
        .generateKnowledgeGraphMultiStage(product, transcripts);
      
      res.json({ success: true, data: knowledgeGraph });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

### Sales LMS Code Patterns
This component maintains consistency with Sales LMS standards:

- **RESTful API endpoints** with controller-service pattern
- **Consistent error handling** with try-catch blocks throughout
- **Input validation** on both conversation data and generated insights
- **Modular component structure** for maintainability
- **Context API integration** for state management (when used in frontend)
- **Protected routes** based on user roles (admin access for analytics)

## Features

- 🔄 **MongoDB Integration**: Fetches sales transcript data from MongoDB collections
- 🧠 **Llama AI Analysis**: Uses Meta's Llama API to analyze conversation patterns
- 📊 **Knowledge Graph Generation**: Creates structured knowledge graphs in JSON format
- 🔒 **Privacy-Aware**: Removes sensitive information (customer names, dates) before analysis
- 📈 **Streaming Support**: Optional streaming API for real-time progress tracking
- 📋 **Comprehensive Reports**: Generates both JSON graphs and markdown summaries
- 🎯 **Product-Specific Analysis**: Analyzes data per product for targeted insights

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
copy .env.example .env
```

3. Configure your `.env` file:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sales_database
MONGODB_DATABASE=sales_database
MONGODB_COLLECTION=sales_transcripts

# Llama API Configuration
LLAMA_API_KEY=your_llama_api_key_here

# Optional: Model Configuration
LLAMA_MODEL=Llama-3.3-70B-Instruct

# Optional: Output Configuration
OUTPUT_FILE=output/knowledge_graph.json
```

## MongoDB Schema

The application expects sales transcript documents with the following structure:

```typescript
{
  Date: string;           // Transaction date
  Customer: string;       // Customer identifier (removed before analysis)
  SalesRep: string;       // Sales representative (removed before analysis)
  Product: string;        // Product being sold
  Result: 'successful' | 'unsuccessful';  // Outcome
  Context: string;        // Sales context/situation
  TranscriptText: string; // Full conversation transcript
}
```

## Usage

### Development Mode

```bash
# Run demonstration with sample data
npm run dev demo

# Generate knowledge graph for specific product
npm run dev product "Product Name"

# Generate knowledge graphs for all products
npm run dev all

# Use streaming API (shows progress)
npm run dev product "Product Name" --stream
```

### Production Build

```bash
# Build the application
npm run build

# Run built application
npm start demo
```

## Knowledge Graph Structure

The generated knowledge graphs contain:

### Metadata
- Product information
- Transcript counts
- Success/failure statistics
- Generation timestamp

### Nodes
Represent concepts like:
- Conversation techniques
- Objection types
- Customer concerns
- Persuasion methods
- Emotional triggers
- Product benefits

### Edges
Show relationships between concepts:
- Causal relationships
- Correlational patterns
- Success probability weights

### Insights
Extracted analysis including:
- Success factors
- Failure factors
- Key patterns
- Actionable recommendations

## Output Files

The application generates:

1. **JSON Knowledge Graph**: `knowledge_graph_[product]_[timestamp].json`
2. **Summary Report**: `knowledge_graph_[product]_[timestamp]_summary.md`

## Example Knowledge Graph Output

```json
{
  "metadata": {
    "product": "Llama AI Platform",
    "totalTranscripts": 50,
    "successfulCount": 32,
    "unsuccessfulCount": 18,
    "generatedAt": "2025-06-21T10:30:00.000Z"
  },
  "nodes": [
    {
      "id": "price_objection",
      "type": "objection",
      "label": "Price Objection",
      "properties": {
        "frequency": 0.6,
        "successRate": 0.3,
        "description": "Customer raises concerns about pricing"
      }
    }
  ],
  "edges": [
    {
      "id": "price_to_value",
      "source": "price_objection",
      "target": "value_demonstration",
      "type": "response_strategy",
      "label": "Address with Value Demo",
      "properties": {
        "strength": 0.8,
        "confidence": 0.9,
        "description": "Responding to price objections by demonstrating value"
      }
    }
  ],
  "insights": {
    "successFactors": [
      "Early identification of customer pain points",
      "Demonstration of ROI within first 10 minutes"
    ],
    "failureFactors": [
      "Delayed response to technical questions",
      "Failure to address budget concerns upfront"
    ],
    "keyPatterns": [
      "Successful calls average 23 minutes",
      "Price objections handled best with ROI calculations"
    ],
    "recommendations": [
      "Implement value-first presentation strategy",
      "Prepare ROI calculators for common objections"
    ]
  }
}
```

## API Configuration

### Llama Model Options
- `Llama-3.3-70B-Instruct` (default) - Best for complex analysis
- `Llama-4-Maverick-17B-128E-Instruct-FP8` - Faster processing

### Streaming vs Non-Streaming
- **Non-streaming**: Faster, returns complete response
- **Streaming**: Shows progress, better for large datasets

## Error Handling

The application includes comprehensive error handling for:
- MongoDB connection issues
- Llama API rate limits
- Invalid transcript data
- File system errors
- JSON parsing errors

## Privacy & Security

- Customer names and sales rep identifiers are removed before analysis
- Only conversation patterns and outcomes are analyzed
- Sensitive data never leaves your infrastructure
- API keys should be kept secure

## Contributing

1. Ensure TypeScript compilation: `npm run build`
2. Follow existing code patterns
3. Add error handling for new features
4. Update documentation

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure database/collection exists

2. **Llama API Errors**
   - Verify API key is correct
   - Check rate limits
   - Ensure sufficient token quota

3. **No Transcripts Found**
   - Verify product name matches database
   - Check collection name in configuration
   - Ensure data exists in MongoDB

4. **JSON Parsing Errors**
   - Check Llama API response format
   - Verify model supports structured output
   - Try different temperature settings

## 🧪 Testing

### **Single, Comprehensive Test**
```bash
npm run test
```

**What This Test Does:**

1. **🧠 Tests LlamaKnowledgeGraphService**
   - Validates both `generateKnowledgeGraph()` and `generateKnowledgeGraphMultiStage()` methods
   - Processes multiple conversations in cost-optimized single API calls
   - Returns JSON strings ready for Sales LMS integration

2. **💰 Demonstrates Cost Optimization**
   - Shows processing time metrics
   - Validates that N transcripts = 1 API call (not N separate calls)
   - ~85-90% cost reduction compared to individual processing

3. **🏗️ Sales LMS Integration Ready**
   - No filesystem dependencies in the service
   - Returns structured JSON strings perfect for REST APIs
   - Follows controller-service pattern
   - Demonstrates proper error handling

4. **📊 Validates Output Quality**
   - Parses and validates JSON responses
   - Shows metadata, nodes, edges, and insights counts
   - Saves sample outputs for inspection
   - Displays success factors and recommendations

### **Test Coverage:**
- ✅ **API Connection**: Validates Llama API key and connectivity
- ✅ **Data Processing**: Tests transcript processing and analysis
- ✅ **Cost Optimization**: Confirms single-call efficiency
- ✅ **JSON Output**: Validates structured response format
- ✅ **Error Handling**: Tests robust error management
- ✅ **Sales LMS Patterns**: Follows established coding conventions

### **Expected Output:**
```
🎯 Testing LlamaKnowledgeGraphService...
✅ Knowledge graph generated successfully!
⚡ Processing time: 45.32 seconds
📊 Analysis Results:
   • Total transcripts analyzed: 3
   • Knowledge graph nodes: 12
   • Relationship edges: 8
💾 Results saved to output/
🎉 Test completed successfully!
```

## License

MIT License - see LICENSE file for details.
