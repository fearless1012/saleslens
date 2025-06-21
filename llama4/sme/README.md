# SME RAG System

A comprehensive Subject Matter Expert (SME) Retrieval-Augmented Generation system with knowledge graphs and finetuning capabilities.

## Features

- **Knowledge Graph Creation**: Automatically extracts entities, relationships, and concepts from text data
- **RAG Chat Interface**: Chat with domain experts using knowledge graph context
- **Automated Finetuning**: Improve model performance based on user interactions
- **Neo4j Integration**: Efficient graph database for knowledge storage
- **Llama API Integration**: Uses Meta's Llama models for generation
- **MongoDB Storage**: Stores interactions, documents, and user data
- **RESTful API**: Complete backend API for all functionality

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Text Data     │    │  Knowledge      │    │   RAG Chat      │
│   Input         │───▶│  Graph          │───▶│   Interface     │
│                 │    │  Creation       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     Neo4j       │    │  Interaction    │
         │              │   Database      │    │   Logging       │
         │              └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│   Document      │                          │   Finetuning    │
│   Storage       │                          │   Pipeline      │
│   (MongoDB)     │                          │                 │
└─────────────────┘                          └─────────────────┘
```

## Prerequisites

### Software Requirements
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Neo4j (v5 or higher)

### API Keys
- Llama API key from Meta
- OpenAI API key (optional, for comparison)

### Neo4j Setup
1. Install Neo4j Desktop or Community Edition
2. Create a new database
3. Set up authentication (username/password)
4. Note the connection URI (default: `bolt://localhost:7687`)

## Installation

1. **Install dependencies:**
```bash
cd llama4/sme
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sme_rag_db
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
JWT_SECRET=your_strong_jwt_secret
LLAMA_API_KEY=your_llama_api_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

3. **Create required directories:**
```bash
mkdir logs
mkdir training_data
mkdir models\finetuned
```

4. **Start the services:**
```bash
# Start MongoDB (if not running as service)
mongod

# Start Neo4j (if not running as service)
neo4j start

# Start the SME RAG server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Knowledge Graph
- `POST /api/knowledge-graph/create` - Create knowledge graph from text
- `POST /api/knowledge-graph/query` - Query knowledge graph
- `POST /api/knowledge-graph/feedback` - Provide feedback
- `GET /api/knowledge-graph/stats` - Get statistics
- `GET /api/knowledge-graph/documents` - List documents

### RAG Chat
- `POST /api/rag/chat` - Chat with domain expert
- `POST /api/rag/feedback` - Provide response feedback
- `GET /api/rag/history` - Get conversation history
- `GET /api/rag/analytics` - Get chat analytics

### Finetuning
- `POST /api/finetune/collect-data` - Collect training data
- `POST /api/finetune/start` - Start finetuning job
- `GET /api/finetune/jobs` - List finetuning jobs
- `GET /api/finetune/jobs/:jobId` - Check job status
- `POST /api/finetune/evaluate/:modelId` - Evaluate model

## Usage Examples

### 1. Create Knowledge Graph

```bash
curl -X POST http://localhost:3001/api/knowledge-graph/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "data": "Artificial intelligence is transforming healthcare through machine learning algorithms that can analyze medical images, predict patient outcomes, and assist in drug discovery. Deep learning models trained on large datasets of medical records have shown promising results in early disease detection.",
    "sourceId": "ai_healthcare_article_1",
    "title": "AI in Healthcare"
  }'
```

### 2. Chat with Domain Expert

```bash
curl -X POST http://localhost:3001/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "How is machine learning being used in medical image analysis?",
    "conversationType": "expert",
    "includeFollowUp": true
  }'
```

### 3. Start Finetuning

```bash
curl -X POST http://localhost:3001/api/finetune/collect-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "minQualityScore": 0.8,
    "maxSamples": 500,
    "includeNegativeExamples": true
  }'
```

## Command Line Scripts

### Knowledge Graph Management

```bash
# Migrate pending documents to knowledge graph
node scripts/knowledgeGraph.js migrate USER_ID

# Rebuild knowledge graph for user
node scripts/knowledgeGraph.js rebuild USER_ID

# Export knowledge graph
node scripts/knowledgeGraph.js export USER_ID output.json

# Validate knowledge graph
node scripts/knowledgeGraph.js validate USER_ID
```

### Finetuning Management

```bash
# Collect training data
node scripts/finetune.js USER_ID collect

# Start training with collected data
node scripts/finetune.js USER_ID train /path/to/training_data.json

# Check job status
node scripts/finetune.js USER_ID status JOB_ID

# Run automated finetuning pipeline
node scripts/finetune.js USER_ID auto

# Evaluate model
node scripts/finetune.js USER_ID evaluate MODEL_ID

# Cleanup old files
node scripts/finetune.js USER_ID cleanup 30
```

## Configuration

### Knowledge Graph Settings

The system automatically extracts:
- **Entities**: People, places, organizations, topics
- **Terms**: Important keywords with TF-IDF scoring
- **Relationships**: Subject-predicate-object triples
- **Concepts**: Semantic relationships between entities

### RAG Configuration

Conversation types:
- `expert`: Professional, comprehensive responses
- `technical`: Detailed technical explanations
- `conversational`: Accessible, friendly tone

### Finetuning Parameters

Default settings:
- **Epochs**: 3
- **Learning Rate**: 5e-5
- **Batch Size**: 4
- **Validation Split**: 10%
- **Quality Threshold**: 0.7

## Monitoring and Analytics

### Knowledge Graph Metrics
- Document processing status
- Entity extraction counts
- Query performance
- Usage statistics

### RAG Performance
- Response confidence scores
- User feedback ratings
- Response times
- Context relevance

### Finetuning Progress
- Training job status
- Model performance metrics
- Accuracy improvements
- Usage analytics

## Troubleshooting

### Common Issues

1. **Neo4j Connection Failed**
   - Verify Neo4j is running
   - Check connection URI and credentials
   - Ensure firewall allows connection

2. **Knowledge Graph Creation Fails**
   - Check text data quality and length
   - Verify NLP libraries are installed
   - Review error logs for specifics

3. **RAG Responses Low Quality**
   - Increase knowledge graph size
   - Improve training data quality
   - Adjust conversation type

4. **Finetuning Jobs Fail**
   - Verify Llama API key is valid
   - Check training data format
   - Ensure sufficient training samples

### Logs

Check application logs:
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Finetuning logs
tail -f logs/finetuning.log
```

## Development

### Project Structure
```
llama4/sme/
├── server.js              # Main server file
├── package.json           # Dependencies
├── models/                # MongoDB schemas
├── services/              # Business logic
├── routes/                # API endpoints
├── middleware/            # Authentication & validation
├── scripts/               # CLI utilities
├── logs/                  # Application logs
├── training_data/         # Finetuning datasets
└── models/finetuned/      # Trained models
```

### Adding New Features

1. **New Knowledge Graph Extractors**: Extend `KnowledgeGraphService.js`
2. **Custom RAG Strategies**: Modify `RAGService.js`
3. **Additional Finetuning Options**: Update `FinetuningService.js`
4. **New API Endpoints**: Add routes in respective route files

### Testing

```bash
# Install development dependencies
npm install --dev

# Run tests (when implemented)
npm test

# Check code style
npm run lint
```

## Security Considerations

- JWT tokens for authentication
- Input validation on all endpoints
- Rate limiting (recommended)
- Secure storage of API keys
- MongoDB connection security
- Neo4j authentication

## Performance Optimization

- Index MongoDB collections appropriately
- Use Neo4j query optimization
- Implement caching for frequent queries
- Monitor memory usage during processing
- Batch process large datasets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Check the troubleshooting section
- Review application logs
- Create an issue in the repository
