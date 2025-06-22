import { type NextRequest, NextResponse } from "next/server"
import type { Customer, CustomerRelationship } from "../../types/customer"

// Meta LLama API configuration
const META_LLAMA_API_BASE = process.env.META_LLAMA_API_URL || "https://api.meta-llama.com/v1"
const META_LLAMA_API_KEY = process.env.META_LLAMA_API_KEY

interface MetaLlamaCustomer {
  id: string
  name: string
  company: string
  industry: string
  revenue: number
  status: "active" | "inactive" | "prospect"
  region: string
  acquisition_source: string
  join_date: string
  leave_date?: string
  churn_reason?: string
  contact_info: {
    email: string
    phone?: string
  }
  deal_info: {
    deal_size: number
    contract_length: number
    renewal_probability: number
  }
  engagement_metrics: {
    last_interaction: string
    interaction_frequency: number
    satisfaction_score: number
  }
}

interface MetaLlamaResponse {
  customers: MetaLlamaCustomer[]
  total_count: number
  page: number
  per_page: number
  metadata: {
    total_revenue: number
    active_customers: number
    industries: Record<string, number>
    regions: Record<string, number>
  }
}

// Industry standardization mapping
const industryMapping: Record<string, string> = {
  Technology: "technology",
  Healthcare: "healthcare",
  "Financial Services": "finance",
  "E-commerce": "retail",
  Education: "education",
  Manufacturing: "manufacturing",
  "Media & Entertainment": "media",
  Automotive: "automotive",
  "Real Estate": "real-estate",
  Legal: "legal",
  "Energy & Utilities": "energy",
  Logistics: "logistics",
  Insurance: "insurance",
  "Food & Beverage": "food",
  Telecommunications: "telecommunications",
  Gaming: "gaming",
  Agriculture: "agriculture",
  Construction: "construction",
  Fashion: "fashion",
  Cybersecurity: "technology",
  Marketing: "marketing",
  Transportation: "transportation",
  Hospitality: "hospitality",
  Sports: "sports",
  Environmental: "environmental",
  Aerospace: "aerospace",
  Biotechnology: "biotechnology",
  Music: "music",
  "Pet Care": "pet-care",
  Mining: "mining",
  "Social Media": "social-media",
  "Renewable Energy": "energy",
  "Beauty & Cosmetics": "beauty",
}

function convertMetaLlamaToCustomer(metaCustomer: MetaLlamaCustomer): Customer {
  return {
    id: metaCustomer.id,
    name: metaCustomer.name,
    company: metaCustomer.company,
    industry: industryMapping[metaCustomer.industry] || metaCustomer.industry.toLowerCase().replace(/\s+/g, "-"),
    region: metaCustomer.region.toLowerCase().replace(/\s+/g, "-"),
    revenue: metaCustomer.revenue,
    dealSize: metaCustomer.deal_info.deal_size,
    contractLength: metaCustomer.deal_info.contract_length,
    status: metaCustomer.status,
    notes: `Acquired via ${metaCustomer.acquisition_source}. ${
      metaCustomer.churn_reason
        ? `Left due to: ${metaCustomer.churn_reason}`
        : `Satisfaction: ${metaCustomer.engagement_metrics.satisfaction_score}/10. Last interaction: ${metaCustomer.engagement_metrics.last_interaction}`
    }`,
    createdAt: new Date(metaCustomer.join_date),
  }
}

function generateRelationshipsFromMetaData(customers: Customer[]): CustomerRelationship[] {
  const relationships: CustomerRelationship[] = []

  // Group by industry for peer relationships
  const industriesByCustomer = customers.reduce(
    (acc, customer) => {
      if (!acc[customer.industry]) acc[customer.industry] = []
      acc[customer.industry].push(customer)
      return acc
    },
    {} as Record<string, Customer[]>,
  )

  // Create industry peer relationships
  Object.values(industriesByCustomer).forEach((industryCustomers) => {
    if (industryCustomers.length > 1) {
      for (let i = 0; i < industryCustomers.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 3, industryCustomers.length); j++) {
          if (Math.random() > 0.6) {
            // 40% chance
            relationships.push({
              id: `meta-rel-${relationships.length + 1}`,
              sourceId: industryCustomers[i].id,
              targetId: industryCustomers[j].id,
              type: "industry-peer",
              strength: Math.floor(Math.random() * 3) + 2,
              description: `Both companies operate in the ${industryCustomers[i].industry} industry`,
              createdAt: new Date(),
            })
          }
        }
      }
    }
  })

  // Create referral relationships based on acquisition patterns
  const referralCustomers = customers.filter(
    (c) =>
      c.notes?.includes("Employee Referral") ||
      c.notes?.includes("Partner Referral") ||
      c.notes?.includes("Word of Mouth"),
  )

  referralCustomers.forEach((customer) => {
    const potentialReferrers = customers.filter(
      (c) =>
        c.id !== customer.id &&
        (c.industry === customer.industry || c.region === customer.region) &&
        c.createdAt < customer.createdAt &&
        c.status === "active",
    )

    if (potentialReferrers.length > 0 && Math.random() > 0.4) {
      const referrer = potentialReferrers[Math.floor(Math.random() * potentialReferrers.length)]
      relationships.push({
        id: `meta-rel-${relationships.length + 1}`,
        sourceId: referrer.id,
        targetId: customer.id,
        type: "referral",
        strength: Math.floor(Math.random() * 2) + 4,
        description: `${referrer.name} likely referred ${customer.name} based on acquisition patterns`,
        createdAt: customer.createdAt,
      })
    }
  })

  // Create partnerships for high-value customers
  const highValueCustomers = customers
    .filter((c) => c.revenue > 150000 && c.status === "active")
    .sort((a, b) => b.revenue - a.revenue)

  for (let i = 0; i < highValueCustomers.length - 1; i += 2) {
    if (Math.random() > 0.5) {
      relationships.push({
        id: `meta-rel-${relationships.length + 1}`,
        sourceId: highValueCustomers[i].id,
        targetId: highValueCustomers[i + 1].id,
        type: "partnership",
        strength: Math.floor(Math.random() * 2) + 4,
        description: `Strategic partnership opportunity between high-value customers`,
        createdAt: new Date(),
      })
    }
  }

  return relationships
}

async function fetchFromMetaLlama(endpoint: string, params: Record<string, any> = {}) {
  if (!META_LLAMA_API_KEY) {
    throw new Error("META_LLAMA_API_KEY environment variable is required")
  }

  const url = new URL(`${META_LLAMA_API_BASE}/${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.append(key, value.toString())
  })

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${META_LLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Meta LLama API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataset = searchParams.get("dataset") || "default"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const industry = searchParams.get("industry")
    const region = searchParams.get("region")
    const status = searchParams.get("status")

    console.log(`🔄 Fetching customer data from Meta LLama API...`)
    console.log(`Dataset: ${dataset}, Page: ${page}, Limit: ${limit}`)

    // Fetch customer data from Meta LLama API
    const metaResponse: MetaLlamaResponse = await fetchFromMetaLlama("customers", {
      dataset,
      page,
      per_page: limit,
      industry,
      region,
      status,
    })

    console.log(`✅ Received ${metaResponse.customers.length} customers from Meta LLama`)

    // Convert Meta LLama format to our application format
    const customers = metaResponse.customers.map(convertMetaLlamaToCustomer)

    // Generate intelligent relationships
    const relationships = generateRelationshipsFromMetaData(customers)

    console.log(`🔗 Generated ${relationships.length} relationships`)

    return NextResponse.json({
      customers,
      relationships,
      metadata: {
        total_count: metaResponse.total_count,
        page: metaResponse.page,
        per_page: metaResponse.per_page,
        total_revenue: metaResponse.metadata.total_revenue,
        active_customers: metaResponse.metadata.active_customers,
        industries: metaResponse.metadata.industries,
        regions: metaResponse.metadata.regions,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching from Meta LLama API:", error)

    // Return mock data if API fails (for development)
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 Falling back to mock data for development")
      return NextResponse.json({
        customers: [],
        relationships: [],
        metadata: {
          total_count: 0,
          page: 1,
          per_page: 50,
          total_revenue: 0,
          active_customers: 0,
          industries: {},
          regions: {},
        },
        error: "Meta LLama API not available - using mock data",
      })
    }

    return NextResponse.json({ error: "Failed to fetch customer data from Meta LLama API" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, dataset, filters } = body

    switch (action) {
      case "sync":
        // Sync all customer data from Meta LLama
        console.log(`🔄 Syncing customer data from dataset: ${dataset}`)

        const syncResponse = await fetchFromMetaLlama("customers/sync", {
          dataset,
          ...filters,
        })

        return NextResponse.json({
          message: "Customer data sync initiated",
          sync_id: syncResponse.sync_id,
          status: "in_progress",
        })

      case "refresh":
        // Refresh specific customer segments
        console.log(`🔄 Refreshing customer segments with filters:`, filters)

        const refreshResponse = await fetchFromMetaLlama("customers/refresh", {
          dataset,
          filters,
        })

        return NextResponse.json({
          message: "Customer data refresh completed",
          updated_count: refreshResponse.updated_count,
        })

      default:
        return NextResponse.json({ error: "Invalid action. Use 'sync' or 'refresh'" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error in Meta LLama API operation:", error)
    return NextResponse.json({ error: "Failed to perform Meta LLama API operation" }, { status: 500 })
  }
}
