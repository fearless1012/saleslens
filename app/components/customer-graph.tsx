"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Customer, CustomerRelationship } from "../types/customer"
import { Network, Maximize2, Minimize2 } from "lucide-react"

interface CustomerGraphProps {
  customers: Customer[]
  relationships: CustomerRelationship[]
  onCustomerSelect: (customer: Customer) => void
}

export default function CustomerGraph({ customers, relationships, onCustomerSelect }: CustomerGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<Customer | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nodes, setNodes] = useState<Array<Customer & { x: number; y: number; vx: number; vy: number }>>([])

  useEffect(() => {
    if (!canvasRef.current || customers.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize nodes with positions
    const initialNodes = customers.map((customer, index) => ({
      ...customer,
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      vx: 0,
      vy: 0,
    }))

    setNodes(initialNodes)

    // Simple force-directed layout simulation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw relationships (edges)
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2
      relationships.forEach((rel) => {
        const source = initialNodes.find((n) => n.id === rel.sourceId)
        const target = initialNodes.find((n) => n.id === rel.targetId)
        if (source && target) {
          ctx.beginPath()
          ctx.moveTo(source.x, source.y)
          ctx.lineTo(target.x, target.y)
          ctx.stroke()
        }
      })

      // Draw nodes
      initialNodes.forEach((node) => {
        const radius = Math.max(20, Math.min(40, node.revenue / 10000))

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = node.status === "active" ? "#3b82f6" : "#94a3b8"
        ctx.fill()
        ctx.strokeStyle = "#1e293b"
        ctx.lineWidth = 2
        ctx.stroke()

        // Node label
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(node.name.split(" ")[0], node.x, node.y + 4)
      })

      // Apply simple forces
      initialNodes.forEach((node) => {
        // Center force
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        node.vx += (centerX - node.x) * 0.001
        node.vy += (centerY - node.y) * 0.001

        // Repulsion between nodes
        initialNodes.forEach((other) => {
          if (node !== other) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < 100) {
              const force = (100 - distance) * 0.01
              node.vx += (dx / distance) * force
              node.vy += (dy / distance) * force
            }
          }
        })

        // Apply velocity with damping
        node.vx *= 0.9
        node.vy *= 0.9
        node.x += node.vx
        node.y += node.vy

        // Keep nodes within bounds
        node.x = Math.max(30, Math.min(canvas.width - 30, node.x))
        node.y = Math.max(30, Math.min(canvas.height - 30, node.y))
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [customers, relationships])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = nodes.find((node) => {
      const dx = x - node.x
      const dy = y - node.y
      const radius = Math.max(20, Math.min(40, node.revenue / 10000))
      return Math.sqrt(dx * dx + dy * dy) <= radius
    })

    if (clickedNode) {
      setSelectedNode(clickedNode)
      onCustomerSelect(clickedNode)
    }
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Customer Relationship Graph
              </CardTitle>
              <CardDescription>Interactive visualization of customer relationships and connections</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Active Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                <span>Inactive Customers</span>
              </div>
              <div className="text-muted-foreground">Node size represents revenue</div>
            </div>

            <canvas
              ref={canvasRef}
              width={isFullscreen ? window.innerWidth - 100 : 800}
              height={isFullscreen ? window.innerHeight - 200 : 500}
              className="border rounded-lg cursor-pointer bg-white"
              onClick={handleCanvasClick}
            />

            {selectedNode && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
                  <CardDescription>{selectedNode.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Industry:</span>
                      <div className="font-medium">{selectedNode.industry}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Revenue:</span>
                      <div className="font-medium">${selectedNode.revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={selectedNode.status === "active" ? "default" : "secondary"}>
                        {selectedNode.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
