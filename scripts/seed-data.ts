// Script to seed the application with sample customer data
import type { Customer, CustomerRelationship } from "../app/types/customer"

const sampleCustomers: Omit<Customer, "id" | "createdAt">[] = [
  {
    name: "Alice Rodriguez",
    company: "DataFlow Analytics",
    industry: "technology",
    region: "north-america",
    revenue: 850000,
    dealSize: 85000,
    contractLength: 24,
    status: "active",
    notes: "Data-driven decision maker, loves metrics and KPIs",
  },
  {
    name: "Robert Kim",
    company: "SecureBank Corp",
    industry: "finance",
    region: "asia-pacific",
    revenue: 2100000,
    dealSize: 210000,
    contractLength: 36,
    status: "active",
    notes: "Security-focused, requires extensive compliance documentation",
  },
  {
    name: "Maria Santos",
    company: "EduTech Solutions",
    industry: "education",
    region: "latin-america",
    revenue: 450000,
    dealSize: 45000,
    contractLength: 12,
    status: "prospect",
    notes: "Budget constraints, looking for cost-effective solutions",
  },
  {
    name: "David Thompson",
    company: "RetailMax Group",
    industry: "retail",
    region: "europe",
    revenue: 1800000,
    dealSize: 180000,
    contractLength: 18,
    status: "active",
    notes: "Seasonal business, needs flexible scaling options",
  },
  {
    name: "Jennifer Wu",
    company: "MedDevice Innovations",
    industry: "healthcare",
    region: "north-america",
    revenue: 950000,
    dealSize: 95000,
    contractLength: 30,
    status: "active",
    notes: "FDA compliance critical, long approval cycles",
  },
]

const sampleRelationships: Omit<CustomerRelationship, "id" | "createdAt">[] = [
  {
    sourceId: "1", // Will be updated with actual IDs
    targetId: "2",
    type: "referral",
    strength: 5,
    description: "Strong referral relationship, Alice recommended our services to Robert",
  },
  {
    sourceId: "2",
    targetId: "4",
    type: "industry-peer",
    strength: 3,
    description: "Both companies share similar compliance requirements",
  },
  {
    sourceId: "3",
    targetId: "5",
    type: "partnership",
    strength: 4,
    description: "Collaborative partnership for educational healthcare solutions",
  },
]

async function seedData() {
  console.log("Seeding customer data...")

  try {
    // Add customers
    for (const customer of sampleCustomers) {
      const response = await fetch("http://localhost:3000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      })

      if (response.ok) {
        const created = await response.json()
        console.log(`Created customer: ${created.name}`)
      }
    }

    // Note: In a real implementation, you would fetch the created customer IDs
    // and use them to create relationships
    console.log("Sample data seeded successfully!")
  } catch (error) {
    console.error("Error seeding data:", error)
  }
}

// Run the seed function
seedData()
