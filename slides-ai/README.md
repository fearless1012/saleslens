# Slides AI Service

A TypeScript Node.js service for AI-powered slide generation that takes prompts as input and processes them.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
copy .env.example .env
```

### 3. Run Tests
```bash
npm test
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:3000/api/health
```

### Process Prompt
```bash
POST http://localhost:3000/api/process-prompt
Content-Type: application/json

{
  "prompt": "Create a presentation about machine learning basics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalPrompt": "Create a presentation about machine learning basics",
    "processedPrompt": "Create a presentation about machine learning basics",
    "timestamp": "2025-06-22T14:00:00.000Z"
  },
  "message": "Prompt processed successfully"
}
```

## 🏗️ Architecture

### Core Function
The main `processPrompt()` function takes a string prompt as input and returns the processed prompt:

```typescript
function processPrompt(prompt: string): string {
  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt provided');
  }
  
  if (prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  // Process and return the prompt
  return prompt.trim();
}
```

### Express Server
- RESTful API with Express.js
- CORS enabled for cross-origin requests
- JSON body parsing with 10MB limit
- Comprehensive error handling
- Health check endpoint

## 🧪 Testing

Run the test suite to verify functionality:

```bash
npm test
```

The test file validates:
- ✅ Valid prompt processing
- ✅ Empty prompt error handling
- ✅ Input validation
- ✅ Response format

## 📁 Project Structure

```
slides-ai/
├── server.ts          # Main Express server
├── test.ts           # Test suite
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── .env.example      # Environment variables template
└── README.md         # This file
```

## 🔧 Configuration

Environment variables (in `.env`):

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run built application
- `npm test` - Run test suite
- `npm run clean` - Clean build directory

### Error Handling

The service includes comprehensive error handling:

- Input validation for prompts
- Empty prompt detection
- Malformed request handling
- 404 route handling
- Unhandled error catching

## 🚀 Future Enhancements

This is a foundation that can be extended with:

- AI integration (OpenAI, Llama, etc.)
- Slide template generation
- PowerPoint/PDF export
- Image generation
- Presentation styling
- Multi-language support

## 📝 Usage Examples

### Using curl
```bash
curl -X POST http://localhost:3000/api/process-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create slides about TypeScript benefits"}'
```

### Using JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/process-prompt', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Generate a presentation on sustainable energy'
  })
});

const result = await response.json();
console.log(result.data.processedPrompt);
```

This service is ready for integration with the Sales LMS or any other application requiring prompt processing capabilities!
