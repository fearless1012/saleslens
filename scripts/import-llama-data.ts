import fs from "fs"
import path from "path"
import type { Customer, CustomerRelationship } from "../app/types/customer"

interface ParsedCustomer {
  name: string
  industry: string
  revenue: number
  status: "active" | "inactive" | "prospect"
  dateJoined: string
  leaveDate?: string
  reasonForLeaving?: string
  acquisitionSource: string
}

// Industry mapping to standardize categories
const industryMapping: Record<string, string> = {
  "Technology Consulting": "technology",
  "Healthcare Analytics": "healthcare",
  "Financial Services": "finance",
  "E-commerce": "retail",
  "Education Technology": "education",
  Manufacturing: "manufacturing",
  "Media & Entertainment": "media",
  Automotive: "automotive",
  "Real Estate": "real-estate",
  "Retail Analytics": "retail",
  "Legal Tech": "legal",
  "Energy & Utilities": "energy",
  Logistics: "logistics",
  Insurance: "insurance",
  Pharmaceutical: "healthcare",
  "Food & Beverage": "food",
  Telecommunications: "telecommunications",
  Gaming: "gaming",
  "Agriculture Tech": "agriculture",
  Construction: "construction",
  "Fashion & Apparel": "fashion",
  Cybersecurity: "technology",
  "Marketing Analytics": "marketing",
  Transportation: "transportation",
  Hospitality: "hospitality",
  "Sports Analytics": "sports",
  "Environmental Tech": "environmental",
  Aerospace: "aerospace",
  Biotechnology: "biotechnology",
  "Music Technology": "music",
  "Pet Care Industry": "pet-care",
  "Mining & Minerals": "mining",
  "Social Media Analytics": "social-media",
  "Renewable Energy": "energy",
  "Beauty & Cosmetics": "beauty",
  "Gaming Analytics": "gaming",
  "Healthcare AI": "healthcare",
  "Supply Chain": "logistics",
  "EdTech Startups": "education",
  "Drone Technology": "technology",
  "Mental Health Tech": "healthcare",
  "Smart City Solutions": "smart-city",
  "Virtual Reality": "technology",
  "Blockchain Analytics": "technology",
  "Food Delivery Tech": "food",
  "Weather Analytics": "weather",
  "HR Technology": "hr",
  "IoT Solutions": "technology",
  "Customer Service AI": "technology",
  "Quantum Computing": "technology",
  "Social Impact Tech": "social-impact",
  "Language Translation": "technology",
  "Mental Wellness Apps": "healthcare",
  "Agricultural Drones": "agriculture",
  "Smart Home Technology": "smart-home",
  "Sports Betting Analytics": "sports",
  "Elderly Care Tech": "healthcare",
  "Maritime Logistics": "maritime",
  "Fashion AI": "fashion",
  "Financial Fraud Detection": "finance",
  "Podcast Analytics": "media",
  "Renewable Battery Tech": "energy",
  "Digital Art Platforms": "art",
  "Precision Agriculture": "agriculture",
  Telemedicine: "healthcare",
  "Carbon Tracking": "environmental",
  "Event Management Tech": "events",
  "Smart Manufacturing": "manufacturing",
  "Vaccine Distribution": "healthcare",
  "Space Technology": "aerospace",
  "Legal Document AI": "legal",
  "Autonomous Vehicles": "automotive",
  "Social Commerce": "retail",
  "Construction AI": "construction",
  "Virtual Events": "events",
  "Wildlife Conservation Tech": "environmental",
  "Influencer Analytics": "marketing",
  "Smart Grid Technology": "energy",
  "Travel Planning AI": "travel",
  "Disaster Response Tech": "emergency",
  "Personal Finance AI": "finance",
  "Ocean Cleanup Technology": "environmental",
  "Elderly Monitoring": "healthcare",
  "Wine Industry Analytics": "food",
  "Pet Health Monitoring": "pet-care",
  "Archaeological Tech": "archaeology",
  "Urban Planning AI": "urban-planning",
  "Language Learning AI": "education",
  "Climate Modeling": "environmental",
  "Waste Management Tech": "environmental",
  "Digital Therapeutics": "healthcare",
  "Smart Parking Solutions": "smart-city",
  "Music Recommendation": "music",
  "Mental Health Analytics": "healthcare",
  "Sustainable Fashion": "fashion",
  "Maritime Safety": "maritime",
  "Wildlife Tracking": "environmental",
  "Smart Irrigation": "agriculture",
  "Virtual Reality Therapy": "healthcare",
  "Precision Medicine": "healthcare",
  "Digital Twin Technology": "technology",
  "Crop Disease Detection": "agriculture",
  "Social Media Sentiment": "social-media",
  "Geospatial Analytics": "geospatial",
  "Smart Textiles": "fashion",
  "Energy Efficiency AI": "energy",
  "Virtual Assistant Tech": "technology",
  "Smart Mirror Technology": "smart-home",
  "Elderly Fall Detection": "healthcare",
  "Ocean Current Mapping": "maritime",
  "Dream Analysis AI": "healthcare",
  "Smart Greenhouse Tech": "agriculture",
  "Digital Identity Verification": "security",
  "Autonomous Farming": "agriculture",
  "Voice Therapy Apps": "healthcare",
  "Smart City Lighting": "smart-city",
  "Food Safety Monitoring": "food",
  "Airline Route Optimization": "aviation",
  "Digital Recipe Platform": "food",
  "Smart Inventory Management": "retail",
  "Mental Health Chatbots": "healthcare",
  "Solar Panel Efficiency": "energy",
  "Virtual Museum Tours": "culture",
  "Wildlife Poaching Prevention": "environmental",
  "Smart Water Management": "utilities",
  "Digital Art Authentication": "art",
  "Pregnancy Monitoring Apps": "healthcare",
  "Bee Colony Monitoring": "agriculture",
  "Virtual Personal Trainer": "fitness",
  "Earthquake Prediction": "emergency",
  "Digital Wardrobe Assistant": "fashion",
  "Smart Fishing Technology": "maritime",
  "Virtual Reality Education": "education",
  "Crop Yield Prediction": "agriculture",
  "Smart Hospital Management": "healthcare",
  "Ocean Plastic Cleanup": "environmental",
  "Digital Art Therapy": "healthcare",
  "Smart Beehive Management": "agriculture",
  "Virtual Reality Meditation": "wellness",
  "AI Music Composition": "music",
  "Smart Traffic Management": "transportation",
  "Digital Pet Care": "pet-care",
  "Precision Aquaculture": "aquaculture",
  "Smart Building Automation": "construction",
  "Digital Fashion Design": "fashion",
  "Wildlife Habitat Monitoring": "environmental",
  "Smart Waste Sorting": "environmental",
  "Virtual Reality Fitness": "fitness",
  "AI Crop Protection": "agriculture",
  "Digital Memory Care": "healthcare",
  "Smart Vineyard Management": "agriculture",
  "Virtual Reality Pain Management": "healthcare",
  "AI Weather Forecasting": "weather",
  "Digital Art Curation": "art",
  "Smart Aquarium Management": "pet-care",
  "AI Music Therapy": "healthcare",
  "Digital Plant Care": "gardening",
  "Smart Pet Feeding": "pet-care",
  "Virtual Reality Archaeology": "archaeology",
  "AI Nutrition Planning": "healthcare",
  "Smart Forestry Management": "environmental",
  "Digital Meditation Guide": "wellness",
  "AI Wildlife Photography": "photography",
  "Smart Plant Monitoring": "agriculture",
  "Virtual Reality Museum": "culture",
  "AI Songbird Identification": "environmental",
  "Smart Greenhouse Climate": "agriculture",
  "Digital Art Gallery": "art",
  "AI Bird Migration Tracking": "environmental",
  "Smart Garden Irrigation": "gardening",
  "Virtual Reality Zoo": "entertainment",
  "AI Plant Disease Detection": "agriculture",
  "Smart Butterfly Garden": "environmental",
  "Digital Nature Journal": "environmental",
  "AI Tree Health Monitoring": "environmental",
  "Smart Bird Feeder Network": "environmental",
  "Virtual Reality Herbarium": "education",
  "AI Flower Recognition": "environmental",
  "Smart Composting System": "environmental",
  "Digital Wildlife Tracker": "environmental",
  "AI Mushroom Identification": "environmental",
  "Smart Weather Station Network": "weather",
  "Virtual Reality Ecosystem": "environmental",
  "AI Pollinator Monitoring": "environmental",
  "Smart Rain Gauge Network": "weather",
  "Digital Nature Photography": "photography",
  "AI Soil Health Analysis": "agriculture",
  "Smart Wildlife Camera Network": "environmental",
  "Virtual Reality Forest": "environmental",
  "AI Seed Identification": "agriculture",
  "Smart Pollination Monitoring": "agriculture",
  "Digital Ecosystem Mapping": "environmental",
  "AI Climate Change Modeling": "environmental",
  "Smart Carbon Sequestration": "environmental",
  "Virtual Reality Conservation": "environmental",
  "AI Species Classification": "environmental",
  "Smart Habitat Restoration": "environmental",
  "Digital Biodiversity Index": "environmental",
  "AI Environmental Impact": "environmental",
  "Smart Ecosystem Health": "environmental",
}

// Region mapping based on acquisition sources and industry patterns
const regionMapping: Record<string, string> = {
  "Technology Consulting": "north-america",
  "Healthcare Analytics": "north-america",
  "Financial Services": "north-america",
  "E-commerce": "north-america",
  "Education Technology": "north-america",
  Manufacturing: "north-america",
  "Media & Entertainment": "north-america",
  Automotive: "north-america",
  "Real Estate": "north-america",
  "Retail Analytics": "north-america",
  "Legal Tech": "north-america",
  "Energy & Utilities": "north-america",
  Logistics: "europe",
  Insurance: "north-america",
  Pharmaceutical: "europe",
  "Food & Beverage": "europe",
  Telecommunications: "asia-pacific",
  Gaming: "asia-pacific",
  "Agriculture Tech": "north-america",
  Construction: "north-america",
  "Fashion & Apparel": "europe",
  Cybersecurity: "north-america",
  "Marketing Analytics": "north-america",
  Transportation: "europe",
  Hospitality: "europe",
  "Sports Analytics": "north-america",
  "Environmental Tech": "europe",
  Aerospace: "north-america",
  Biotechnology: "north-america",
  "Music Technology": "north-america",
  "Pet Care Industry": "north-america",
  "Mining & Minerals": "asia-pacific",
  "Social Media Analytics": "north-america",
  "Renewable Energy": "europe",
  "Beauty & Cosmetics": "europe",
  "Gaming Analytics": "asia-pacific",
  "Healthcare AI": "north-america",
  "Supply Chain": "asia-pacific",
  "EdTech Startups": "north-america",
  "Drone Technology": "north-america",
  "Mental Health Tech": "north-america",
  "Smart City Solutions": "europe",
  "Virtual Reality": "north-america",
  "Blockchain Analytics": "north-america",
  "Food Delivery Tech": "asia-pacific",
  "Weather Analytics": "north-america",
  "HR Technology": "north-america",
  "IoT Solutions": "europe",
  "Customer Service AI": "north-america",
  "Quantum Computing": "north-america",
  "Social Impact Tech": "north-america",
  "Language Translation": "europe",
  "Mental Wellness Apps": "north-america",
}

function parseCustomerData(fileContent: string): ParsedCustomer[] {
  const lines = fileContent.split("\n")
  const customers: ParsedCustomer[] = []

  // Find the start of customer data (after the header)
  let startIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().match(/^\d+\./)) {
      startIndex = i
      break
    }
  }

  // Parse each customer line
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || !line.match(/^\d+\./)) continue

    // Split by | and clean up
    const parts = line.split("|").map((part) => part.trim())
    if (parts.length < 8) continue

    // Remove the number prefix from name
    const nameWithNumber = parts[0]
    const name = nameWithNumber.replace(/^\d+\.\s*/, "")

    const industry = parts[1]
    const revenue = Number.parseInt(parts[2].replace(/[,$]/g, ""))
    const status = parts[3].toLowerCase() as "active" | "inactive"
    const dateJoined = parts[4]
    const leaveDate = parts[5] !== "N/A" ? parts[5] : undefined
    const reasonForLeaving = parts[6] !== "N/A" ? parts[6] : undefined
    const acquisitionSource = parts[7]

    customers.push({
      name,
      industry,
      revenue,
      status,
      dateJoined,
      leaveDate,
      reasonForLeaving,
      acquisitionSource,
    })
  }

  return customers
}

function convertToCustomerFormat(parsedCustomers: ParsedCustomer[]): Customer[] {
  return parsedCustomers.map((parsed, index) => {
    const standardizedIndustry = industryMapping[parsed.industry] || "other"
    const region = regionMapping[parsed.industry] || "north-america"

    // Estimate deal size as 10-20% of annual revenue
    const dealSizeMultiplier = 0.1 + Math.random() * 0.1
    const dealSize = Math.round(parsed.revenue * dealSizeMultiplier)

    // Estimate contract length based on industry (6-36 months)
    const contractLength = Math.floor(12 + Math.random() * 24)

    return {
      id: (index + 1).toString(),
      name: parsed.name,
      company: `${parsed.name.split(" ")[0]} ${parsed.industry.split(" ")[0]} Corp`,
      industry: standardizedIndustry,
      region,
      revenue: parsed.revenue,
      dealSize,
      contractLength,
      status: parsed.status === "inactive" ? "inactive" : "active",
      notes: `Acquired via ${parsed.acquisitionSource}. ${parsed.reasonForLeaving ? `Left due to: ${parsed.reasonForLeaving}` : "Strong ongoing relationship."}`,
      createdAt: new Date(parsed.dateJoined),
    }
  })
}

function generateRelationships(customers: Customer[]): CustomerRelationship[] {
  const relationships: CustomerRelationship[] = []
  const relationshipTypes: CustomerRelationship["type"][] = [
    "referral",
    "partnership",
    "industry-peer",
    "supplier",
    "customer",
  ]

  // Group customers by industry for industry-peer relationships
  const industriesByCustomer = customers.reduce(
    (acc, customer) => {
      if (!acc[customer.industry]) acc[customer.industry] = []
      acc[customer.industry].push(customer)
      return acc
    },
    {} as Record<string, Customer[]>,
  )

  // Create industry-peer relationships
  Object.values(industriesByCustomer).forEach((industryCustomers) => {
    if (industryCustomers.length > 1) {
      for (let i = 0; i < industryCustomers.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 3, industryCustomers.length); j++) {
          if (Math.random() > 0.7) {
            // 30% chance of relationship
            relationships.push({
              id: `rel-${relationships.length + 1}`,
              sourceId: industryCustomers[i].id,
              targetId: industryCustomers[j].id,
              type: "industry-peer",
              strength: Math.floor(Math.random() * 3) + 2, // 2-4 strength
              description: `Both companies operate in the ${industryCustomers[i].industry} industry`,
              createdAt: new Date(),
            })
          }
        }
      }
    }
  })

  // Create referral relationships based on acquisition source
  const referralCustomers = customers.filter(
    (c) => c.notes?.includes("Employee Referral") || c.notes?.includes("Partner Referral"),
  )

  referralCustomers.forEach((customer) => {
    // Find potential referrer (earlier customer in same industry or region)
    const potentialReferrers = customers.filter(
      (c) =>
        c.id !== customer.id &&
        (c.industry === customer.industry || c.region === customer.region) &&
        c.createdAt < customer.createdAt,
    )

    if (potentialReferrers.length > 0 && Math.random() > 0.5) {
      const referrer = potentialReferrers[Math.floor(Math.random() * potentialReferrers.length)]
      relationships.push({
        id: `rel-${relationships.length + 1}`,
        sourceId: referrer.id,
        targetId: customer.id,
        type: "referral",
        strength: Math.floor(Math.random() * 2) + 4, // 4-5 strength
        description: `${referrer.name} referred ${customer.name} to our services`,
        createdAt: customer.createdAt,
      })
    }
  })

  // Create partnership relationships for high-revenue customers
  const highRevenueCustomers = customers
    .filter((c) => c.revenue > 120000)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20)

  for (let i = 0; i < highRevenueCustomers.length - 1; i += 2) {
    if (Math.random() > 0.6) {
      // 40% chance
      relationships.push({
        id: `rel-${relationships.length + 1}`,
        sourceId: highRevenueCustomers[i].id,
        targetId: highRevenueCustomers[i + 1].id,
        type: "partnership",
        strength: Math.floor(Math.random() * 2) + 4, // 4-5 strength
        description: `Strategic partnership between high-value customers`,
        createdAt: new Date(),
      })
    }
  }

  return relationships
}

async function importLlamaData() {
  try {
    console.log("🚀 Starting Meta LLama customer data import...")

    // Read the data file
    const filePath = path.join(process.cwd(), "data", "llama_customers_data.txt")
    const fileContent = fs.readFileSync(filePath, "utf-8")

    console.log("📖 Parsing customer data...")
    const parsedCustomers = parseCustomerData(fileContent)
    console.log(`✅ Parsed ${parsedCustomers.length} customers`)

    console.log("🔄 Converting to application format...")
    const customers = convertToCustomerFormat(parsedCustomers)

    console.log("🔗 Generating relationships...")
    const relationships = generateRelationships(customers)
    console.log(`✅ Generated ${relationships.length} relationships`)

    // Save to JSON files for the API to use
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(path.join(dataDir, "customers.json"), JSON.stringify(customers, null, 2))

    fs.writeFileSync(path.join(dataDir, "relationships.json"), JSON.stringify(relationships, null, 2))

    console.log("💾 Data saved to JSON files")

    // Print summary statistics
    const activeCustomers = customers.filter((c) => c.status === "active").length
    const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0)
    const avgRevenue = totalRevenue / customers.length

    console.log("\n📊 IMPORT SUMMARY:")
    console.log(`Total Customers: ${customers.length}`)
    console.log(`Active Customers: ${activeCustomers} (${((activeCustomers / customers.length) * 100).toFixed(1)}%)`)
    console.log(`Total Revenue: $${totalRevenue.toLocaleString()}`)
    console.log(`Average Revenue: $${Math.round(avgRevenue).toLocaleString()}`)
    console.log(`Total Relationships: ${relationships.length}`)

    // Industry breakdown
    const industries = customers.reduce(
      (acc, c) => {
        acc[c.industry] = (acc[c.industry] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("\n🏭 TOP INDUSTRIES:")
    Object.entries(industries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([industry, count]) => {
        console.log(`  ${industry}: ${count} customers`)
      })

    console.log("\n🎉 Import completed successfully!")
  } catch (error) {
    console.error("❌ Error importing data:", error)
    process.exit(1)
  }
}

// Run the import
importLlamaData()
