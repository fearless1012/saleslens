import { type NextRequest, NextResponse } from "next/server"
import type { CustomerRelationship } from "../../types/customer"

// Generated relationships based on Meta LLama customer data
const relationships: CustomerRelationship[] = [
  {
    id: "1",
    sourceId: "1",
    targetId: "11",
    type: "referral",
    strength: 5,
    description: "Sarah Chen referred Amanda Johnson through employee referral program",
    createdAt: new Date("2023-07-02"),
  },
  {
    id: "2",
    sourceId: "6",
    targetId: "19",
    type: "referral",
    strength: 4,
    description: "Robert Martinez referred Melissa Lewis through partner referral network",
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "3",
    sourceId: "2",
    targetId: "15",
    type: "industry-peer",
    strength: 4,
    description: "Both companies operate in the healthcare industry",
    createdAt: new Date("2023-09-08"),
  },
  {
    id: "4",
    sourceId: "4",
    targetId: "10",
    type: "industry-peer",
    strength: 3,
    description: "Both companies operate in the retail industry",
    createdAt: new Date("2023-06-16"),
  },
  {
    id: "5",
    sourceId: "12",
    targetId: "8",
    type: "partnership",
    strength: 5,
    description: "Strategic partnership between high-value customers in energy and automotive sectors",
    createdAt: new Date("2023-07-19"),
  },
  {
    id: "6",
    sourceId: "15",
    targetId: "17",
    type: "partnership",
    strength: 4,
    description: "Strategic partnership between high-value customers in healthcare and telecommunications",
    createdAt: new Date("2023-10-12"),
  },
  {
    id: "7",
    sourceId: "3",
    targetId: "14",
    type: "industry-peer",
    strength: 3,
    description: "Both companies work in financial services sector",
    createdAt: new Date("2023-08-22"),
  },
  {
    id: "8",
    sourceId: "1",
    targetId: "18",
    type: "industry-peer",
    strength: 2,
    description: "Technology and gaming industries share similar innovation patterns",
    createdAt: new Date("2023-10-29"),
  },
  {
    id: "9",
    sourceId: "5",
    targetId: "19",
    type: "industry-peer",
    strength: 3,
    description: "Education and agriculture sectors both focus on knowledge transfer",
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "10",
    sourceId: "6",
    targetId: "20",
    type: "industry-peer",
    strength: 4,
    description: "Both companies operate in the manufacturing and construction industries",
    createdAt: new Date("2023-12-01"),
  },
  {
    id: "11",
    sourceId: "13",
    targetId: "17",
    type: "industry-peer",
    strength: 3,
    description: "Logistics and telecommunications both focus on connectivity solutions",
    createdAt: new Date("2023-10-12"),
  },
  {
    id: "12",
    sourceId: "8",
    targetId: "12",
    type: "supplier",
    strength: 4,
    description: "Automotive industry relies on energy sector for sustainable solutions",
    createdAt: new Date("2023-07-19"),
  },
  {
    id: "13",
    sourceId: "16",
    targetId: "19",
    type: "industry-peer",
    strength: 2,
    description: "Food and agriculture industries share supply chain connections",
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "14",
    sourceId: "9",
    targetId: "20",
    type: "customer",
    strength: 3,
    description: "Real estate companies often work with construction firms",
    createdAt: new Date("2023-12-01"),
  },
  {
    id: "15",
    sourceId: "7",
    targetId: "18",
    type: "industry-peer",
    strength: 4,
    description: "Media and gaming industries share content creation expertise",
    createdAt: new Date("2023-10-29"),
  },
]

export async function GET() {
  return NextResponse.json(relationships)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newRelationship: CustomerRelationship = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date(),
    }

    relationships.push(newRelationship)

    return NextResponse.json(newRelationship, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create relationship" }, { status: 500 })
  }
}
