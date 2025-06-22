import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch customers and relationships
    const customersResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/customers`,
    )
    const relationshipsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/relationships`,
    )

    const customers = await customersResponse.json()
    const relationships = await relationshipsResponse.json()

    // Build adjacency list representation of the graph
    const adjacencyList: Record<string, string[]> = {}

    // Initialize adjacency list
    customers.forEach((customer: any) => {
      adjacencyList[customer.id] = []
    })

    // Populate adjacency list with relationships
    relationships.forEach((rel: any) => {
      if (adjacencyList[rel.sourceId]) {
        adjacencyList[rel.sourceId].push(rel.targetId)
      }
      if (adjacencyList[rel.targetId]) {
        adjacencyList[rel.targetId].push(rel.sourceId)
      }
    })

    // Calculate graph metrics
    const metrics = {
      totalNodes: customers.length,
      totalEdges: relationships.length,
      averageConnections:
        Object.values(adjacencyList).reduce((sum, connections) => sum + connections.length, 0) / customers.length,
      mostConnectedCustomer: Object.entries(adjacencyList).reduce(
        (max, [id, connections]) =>
          connections.length > max.connections ? { id, connections: connections.length } : max,
        { id: "", connections: 0 },
      ),
    }

    return NextResponse.json({
      nodes: customers,
      edges: relationships,
      adjacencyList,
      metrics,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to build knowledge graph" }, { status: 500 })
  }
}
