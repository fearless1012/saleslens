export interface Customer {
  id: string
  name: string
  company: string
  industry: string
  region: string
  revenue: number
  dealSize: number
  contractLength: number
  status: "active" | "inactive" | "prospect"
  notes?: string
  createdAt: Date
}

export interface CustomerRelationship {
  id: string
  sourceId: string
  targetId: string
  type: "referral" | "partnership" | "competitor" | "supplier" | "customer" | "industry-peer"
  strength: number // 1-5 scale
  description?: string
  createdAt: Date
}

export interface KnowledgeGraph {
  nodes: Customer[]
  edges: CustomerRelationship[]
}
