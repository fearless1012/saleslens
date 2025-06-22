"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Building2, TrendingUp, BookOpen } from "lucide-react"
import CustomerGraph from "./components/customer-graph"
import CustomerForm from "./components/customer-form"
import LearningModule from "./components/learning-module"
import DataSummary from "./components/data-summary"
import MetaLlamaIntegration from "./components/meta-llama-integration"
import LlamaAIAssistant from "./components/llama-ai-assistant"
import type { Customer, CustomerRelationship } from "./types/customer"

export default function SalesKnowledgeBase() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [relationships, setRelationships] = useState<CustomerRelationship[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
    fetchRelationships()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelationships = async () => {
    try {
      const response = await fetch("/api/relationships")
      const data = await response.json()
      setRelationships(data)
    } catch (error) {
      console.error("Failed to fetch relationships:", error)
    }
  }

  const handleMetaLlamaDataLoaded = (newCustomers: Customer[], newRelationships: CustomerRelationship[]) => {
    console.log(
      `🔄 Loading Meta LLama data: ${newCustomers.length} customers, ${newRelationships.length} relationships`,
    )
    setCustomers(newCustomers)
    setRelationships(newRelationships)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.industry.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.revenue, 0)
  const avgDealSize = customers.length > 0 ? totalRevenue / customers.length : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Sales Knowledge Base</h1>
            </div>
            <Badge variant="secondary" className="text-sm">
              {customers.length} Customers • LLama 4 AI
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">Active customer relationships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(avgDealSize).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per customer</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="meta-llama">Meta LLama API</TabsTrigger>
            <TabsTrigger value="data-summary">Data Summary</TabsTrigger>
            <TabsTrigger value="graph">Customer Graph</TabsTrigger>
            <TabsTrigger value="add-data">Add Data</TabsTrigger>
            <TabsTrigger value="learning">Learning Module</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Directory</CardTitle>
                <CardDescription>Search and explore your customer knowledge base</CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers, companies, or industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{customer.name}</CardTitle>
                          <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                        </div>
                        <CardDescription>{customer.company}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Industry:</span>
                            <span>{customer.industry}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-medium">${customer.revenue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Region:</span>
                            <span>{customer.region}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant">
            <LlamaAIAssistant customers={customers} relationships={relationships} />
          </TabsContent>

          <TabsContent value="meta-llama">
            <MetaLlamaIntegration onDataLoaded={handleMetaLlamaDataLoaded} />
          </TabsContent>

          <TabsContent value="data-summary">
            <DataSummary customers={customers} relationships={relationships} />
          </TabsContent>

          <TabsContent value="graph">
            <CustomerGraph customers={customers} relationships={relationships} onCustomerSelect={setSelectedCustomer} />
          </TabsContent>

          <TabsContent value="add-data">
            <CustomerForm
              onCustomerAdded={fetchCustomers}
              onRelationshipAdded={fetchRelationships}
              customers={customers}
            />
          </TabsContent>

          <TabsContent value="learning">
            <LearningModule customers={customers} relationships={relationships} />
          </TabsContent>
        </Tabs>

        {selectedCustomer && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Details: {selectedCustomer.name}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Company:</strong> {selectedCustomer.company}
                    </div>
                    <div>
                      <strong>Industry:</strong> {selectedCustomer.industry}
                    </div>
                    <div>
                      <strong>Region:</strong> {selectedCustomer.region}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedCustomer.status}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Business Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Revenue:</strong> ${selectedCustomer.revenue.toLocaleString()}
                    </div>
                    <div>
                      <strong>Deal Size:</strong> ${selectedCustomer.dealSize.toLocaleString()}
                    </div>
                    <div>
                      <strong>Contract Length:</strong> {selectedCustomer.contractLength} months
                    </div>
                  </div>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
