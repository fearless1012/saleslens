# Llama Knowledge Graph Generator

A TypeScript application that fetches sales transcript data from MongoDB and uses the Llama API to generate knowledge graphs representing insights about successful vs unsuccessful sales interactions.

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

## License

MIT License - see LICENSE file for details.
