# 🧠 Advanced Sales Analytics with Chain-of-Thought Reasoning

A sophisticated TypeScript application that analyzes sales conversation transcripts using Meta's Llama API with **multi-stage processing** and **chain-of-thought reasoning** to generate comprehensive knowledge graphs and actionable sales insights.

## 🌟 Key Features

### 🧠 **Chain-of-Thought Reasoning**
- **Step-by-step analysis** of each conversation phase
- **Systematic thinking** through opening, problem discovery, objection handling, emotional dynamics, trust building, and closing
- **Evidence-based insights** with specific examples from conversations
- **Counterfactual reasoning** for learning opportunities ("What if this had been done differently?")

### 🚀 **Multi-Stage Processing Pipeline**
1. **Stage 1**: Individual conversation analysis with chain-of-thought
2. **Stage 2**: Cross-conversation pattern identification  
3. **Stage 3**: Success/failure factor synthesis with causal explanations
4. **Stage 4**: Actionable coaching recommendations generation
5. **Stage 5**: Comprehensive knowledge graph assembly

### 📊 **Advanced Sales Intelligence**
- **Psychological trigger analysis** - What emotional factors drive decisions?
- **Conversation flow optimization** - Which sequences lead to success?
- **Trust building/breaking identification** - Critical relationship moments
- **Objection handling mastery** - Effective techniques for common concerns
- **Competitive positioning insights** - How to handle competitor mentions
- **Timing and momentum analysis** - When to advance vs. slow down

### 🎯 **Actionable Coaching Outputs**
- **Personalized skill development priorities** ranked by impact
- **Behavioral interventions** (start doing, stop doing, do differently)
- **Real-time coaching cues** for live conversations
- **Role-play scenarios** for practice and training
- **Measurement frameworks** for tracking improvement

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- TypeScript
- Llama API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd llama-customer-transcripts

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your LLAMA_API_KEY
```

### Environment Variables
```bash
LLAMA_API_KEY=your_llama_api_key_here
MONGO_URI=mongodb://localhost:27017/sales_transcripts (optional)
```

## 🚀 Usage

### Available Test Scripts

```bash
# Chain-of-thought individual analysis
npm run test:cot

# Full multi-stage processing pipeline
npm run test:multistage

# Simple knowledge graph generation
npm run test

# Enhanced comprehensive analysis (legacy)
npm run test:enhanced
```

### Example: Chain-of-Thought Analysis

```typescript
import { LlamaKnowledgeGraphService } from './llamaService';

const service = new LlamaKnowledgeGraphService(apiKey);

// Multi-stage processing with chain-of-thought reasoning
const knowledgeGraph = await service.generateKnowledgeGraphMultiStage(
  'SaaS Customer Support Platform', 
  transcripts
);
```

## 📈 Enhanced Analysis Framework

### Chain-of-Thought Process
For each conversation, the system analyzes:

1. **Opening Analysis** - How did the rep start? Customer's initial state?
2. **Problem Discovery** - Effectiveness of pain point identification
3. **Solution Presentation** - Tailored vs. generic approach
4. **Objection Handling** - Techniques used and their effectiveness
5. **Emotional Dynamics** - Triggers, responses, emotional evolution
6. **Trust Building** - Critical moments of connection or disconnection
7. **Closing Analysis** - Techniques attempted and timing
8. **Critical Moments** - 2-3 turning points that determined outcome
9. **Counterfactual Reasoning** - Alternative approaches and their likely outcomes

### Pattern Analysis Across Conversations
- **Success patterns** with frequency and evidence counts
- **Failure patterns** with causal explanations
- **Context dependency** analysis (industry, complexity, timing)
- **Emotional pattern correlation** with outcomes
- **Sequential patterns** that predict success

### Factor Synthesis
- **Primary success factors** ranked by impact strength
- **Primary failure factors** with evidence patterns
- **Interaction effects** between multiple factors
- **Contextual modifiers** that change factor importance
- **Counter-intuitive insights** discovered through analysis

## 📊 Output Structure

### Knowledge Graph Schema
```typescript
{
  metadata: {
    product: string,
    totalTranscripts: number,
    successfulCount: number,
    unsuccessfulCount: number,
    analysisDate: string,
    confidenceScore: number
  },
  nodes: [
    {
      id: string,
      type: "technique" | "objection" | "pattern" | "outcome",
      label: string,
      properties: {
        frequency: number,
        successRate: number,
        description: string
      }
    }
  ],
  edges: [
    {
      id: string,
      source: string,
      target: string,
      type: "leads_to" | "causes" | "correlates_with",
      label: string,
      properties: {
        strength: number,
        confidence: number,
        description: string
      }
    }
  ],
  insights: {
    successFactors: string[],
    failureFactors: string[],
    keyPatterns: string[],
    recommendations: string[]
  }
}
```

## 🎯 Sales LMS Integration

This system is designed to integrate with the Sales LMS project to provide:

### For Sales Managers
- **Performance analytics** with root cause analysis
- **Team coaching priorities** based on conversation analysis
- **Success pattern templates** for replication
- **Competitive intelligence** from lost deals

### For Sales Reps
- **Personalized coaching modules** based on individual weaknesses
- **Real-time conversation guidance** 
- **Objection handling playbooks** with proven techniques
- **Success story examples** for modeling

### For Training Teams
- **Curriculum optimization** based on failure pattern analysis
- **Role-play scenario generation** from real conversations
- **Progress tracking metrics** that matter
- **Adaptive learning paths** for different experience levels

## 🔬 Advanced Features

### Few-Shot Learning
The system uses high-quality examples to demonstrate desired analysis depth and style.

### Structured JSON Schema Validation
All outputs follow strict schemas for reliable parsing and integration.

### Error Handling & Debugging
- Raw output saving for debugging
- Comprehensive error reporting
- Markdown format handling
- Parsing error details

### Performance Optimization
- Configurable timeouts for large responses
- Token optimization strategies
- Parallel processing where possible
- Streaming support for real-time analysis

## 🧪 Testing

### Chain-of-Thought Test
```bash
npm run test:cot
```
Tests individual conversation analysis with step-by-step reasoning.

### Multi-Stage Test
```bash
npm run test:multistage
```
Tests the complete 5-stage processing pipeline with sample conversations.

### Simple Test
```bash
npm run test
```
Basic knowledge graph generation for quick validation.

## 📝 Example Output

```
🧠 CHAIN-OF-THOUGHT ANALYSIS:
================================

1️⃣ OPENING ANALYSIS:
   The rep used a consultative approach by asking about the customer's current evaluation process rather than immediately pitching. This created psychological safety and positioned the rep as an advisor rather than a vendor.

2️⃣ PROBLEM DISCOVERY:
   Excellent use of follow-up questions to uncover both technical issues (slow system, poor integration) and business impact (declining CSAT scores). The rep identified emotional pain (team frustration) and business risk (client concerns).

3️⃣ OBJECTION HANDLING:
   When the customer raised complexity concerns, the rep used social proof (similar company example) and specific implementation timeline to address fears. The training objection was handled with specific details rather than generic assurances.

4️⃣ CRITICAL MOMENTS:
   1. Customer revealing CSAT decline - created urgency
   2. Mentioning biggest client concerns - elevated stakes
   3. ROI calculation moment - justified investment

5️⃣ COUNTERFACTUAL REASONING:
   If the rep had led with features instead of problems, the customer likely would have compared purely on technical specs rather than business value. The outcome probably would have been a longer evaluation cycle or loss to a lower-cost competitor.
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Sales LMS project - Transforming sales conversations into actionable intelligence through AI-powered analysis.**
