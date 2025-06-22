import { type NextRequest, NextResponse } from "next/server"
import { generateText, generateObject, streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

// Configure Meta LLama 4 model
const llama = createOpenAI({
  apiKey: process.env.META_LLAMA_API_KEY,
  baseURL: process.env.META_LLAMA_BASE_URL || "https://api.llama-api.com/v1",
})

// Schema for customer insights
const CustomerInsightSchema = z.object({
  customer_analysis: z.object({
    strengths: z.array(z.string()),
    risks: z.array(z.string()),
    opportunities: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  }),
  relationship_score: z.number().min(1).max(10),
  churn_probability: z.number().min(0).max(1),
  expansion_potential: z.enum(["low", "medium", "high"]),
  next_best_actions: z.array(z.string()),
})

// Schema for sales recommendations
const SalesRecommendationSchema = z.object({
  recommended_approach: z.string(),
  talking_points: z.array(z.string()),
  potential_objections: z.array(z.string()),
  success_probability: z.number().min(0).max(1),
  timeline_estimate: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "analyze_customer":
        return await analyzeCustomer(data)
      case "generate_insights":
        return await generateInsights(data)
      case "recommend_strategy":
        return await recommendStrategy(data)
      case "predict_churn":
        return await predictChurn(data)
      case "find_opportunities":
        return await findOpportunities(data)
      case "chat":
        return await chatWithLlama(data)
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error with LLama 4 API:", error)
    return NextResponse.json({ error: "Failed to process LLama 4 request" }, { status: 500 })
  }
}

async function analyzeCustomer(data: any) {
  const { customer, relationships, industry_data } = data

  const prompt = `
  Analyze this customer profile and provide detailed insights:
  
  Customer: ${customer.name} at ${customer.company}
  Industry: ${customer.industry}
  Revenue: $${customer.revenue.toLocaleString()}
  Status: ${customer.status}
  Region: ${customer.region}
  Deal Size: $${customer.dealSize.toLocaleString()}
  Contract Length: ${customer.contractLength} months
  Notes: ${customer.notes}
  
  Relationships: ${relationships.length} connections
  ${relationships.map((r: any) => `- ${r.type} relationship (strength: ${r.strength}/5)`).join("\n")}
  
  Provide a comprehensive analysis including strengths, risks, opportunities, and recommended actions.
  `

  const { object } = await generateObject({
    model: llama("llama-4-turbo"),
    schema: CustomerInsightSchema,
    prompt,
  })

  return NextResponse.json({
    analysis: object,
    timestamp: new Date().toISOString(),
  })
}

async function generateInsights(data: any) {
  const { customers, relationships } = data

  const prompt = `
  Analyze this customer portfolio and generate strategic insights:
  
  Total Customers: ${customers.length}
  Active Customers: ${customers.filter((c: any) => c.status === "active").length}
  Total Revenue: $${customers.reduce((sum: number, c: any) => sum + c.revenue, 0).toLocaleString()}
  
  Industry Breakdown:
  ${Object.entries(
    customers.reduce((acc: any, c: any) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1
      return acc
    }, {}),
  )
    .map(([industry, count]) => `- ${industry}: ${count} customers`)
    .join("\n")}
  
  Relationships: ${relationships.length} total connections
  
  Provide insights on:
  1. Portfolio health and diversification
  2. Revenue concentration risks
  3. Growth opportunities by industry/region
  4. Relationship leverage opportunities
  5. Strategic recommendations for sales team
  `

  const { text } = await generateText({
    model: llama("llama-4-turbo"),
    prompt,
    maxTokens: 1000,
  })

  return NextResponse.json({
    insights: text,
    timestamp: new Date().toISOString(),
  })
}

async function recommendStrategy(data: any) {
  const { customer, target_outcome, context } = data

  const prompt = `
  Create a sales strategy recommendation for this customer:
  
  Customer: ${customer.name} at ${customer.company}
  Industry: ${customer.industry}
  Current Status: ${customer.status}
  Revenue: $${customer.revenue.toLocaleString()}
  
  Target Outcome: ${target_outcome}
  Context: ${context}
  
  Provide a detailed sales strategy including approach, talking points, potential objections, and success probability.
  `

  const { object } = await generateObject({
    model: llama("llama-4-turbo"),
    schema: SalesRecommendationSchema,
    prompt,
  })

  return NextResponse.json({
    strategy: object,
    timestamp: new Date().toISOString(),
  })
}

async function predictChurn(data: any) {
  const { customers } = data

  const prompt = `
  Analyze these customers for churn risk:
  
  ${customers
    .map(
      (c: any) => `
  Customer: ${c.name}
  Industry: ${c.industry}
  Revenue: $${c.revenue.toLocaleString()}
  Status: ${c.status}
  Contract Length: ${c.contractLength} months
  Notes: ${c.notes}
  `,
    )
    .join("\n")}
  
  Identify customers at risk of churning and provide:
  1. Churn probability score (0-1)
  2. Risk factors
  3. Recommended retention actions
  4. Timeline for intervention
  `

  const { text } = await generateText({
    model: llama("llama-4-turbo"),
    prompt,
    maxTokens: 800,
  })

  return NextResponse.json({
    churn_analysis: text,
    timestamp: new Date().toISOString(),
  })
}

async function findOpportunities(data: any) {
  const { customers, relationships } = data

  const prompt = `
  Identify expansion and cross-sell opportunities in this customer base:
  
  Customer Portfolio:
  ${customers
    .map(
      (c: any) => `
  - ${c.name} (${c.company}): ${c.industry}, $${c.revenue.toLocaleString()} revenue, ${c.status}
  `,
    )
    .join("")}
  
  Relationships:
  ${relationships.map((r: any) => `- ${r.type} connection (strength: ${r.strength}/5): ${r.description}`).join("\n")}
  
  Identify:
  1. Upsell opportunities with existing customers
  2. Cross-sell potential based on industry patterns
  3. Referral opportunities through relationships
  4. New market expansion possibilities
  5. Partnership opportunities
  `

  const { text } = await generateText({
    model: llama("llama-4-turbo"),
    prompt,
    maxTokens: 1000,
  })

  return NextResponse.json({
    opportunities: text,
    timestamp: new Date().toISOString(),
  })
}

async function chatWithLlama(data: any) {
  const { message, context, customers, relationships } = data

  const systemPrompt = `
  You are an AI sales assistant powered by Meta LLama 4. You have access to a customer knowledge base with ${customers?.length || 0} customers and ${relationships?.length || 0} relationships.
  
  Your role is to help sales teams by:
  - Analyzing customer data and relationships
  - Providing strategic sales recommendations
  - Identifying opportunities and risks
  - Answering questions about the customer portfolio
  
  Context: ${context || "General sales consultation"}
  
  Be helpful, insightful, and provide actionable recommendations based on the available data.
  `

  const { textStream } = streamText({
    model: llama("llama-4-turbo"),
    system: systemPrompt,
    prompt: message,
    maxTokens: 500,
  })

  return new Response(textStream.toReadableStream(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

export async function GET() {
  return NextResponse.json({
    status: "Meta LLama 4 API is running",
    model: "llama-4-turbo",
    capabilities: [
      "Customer Analysis",
      "Sales Strategy Recommendations",
      "Churn Prediction",
      "Opportunity Identification",
      "Interactive Chat",
    ],
  })
}
