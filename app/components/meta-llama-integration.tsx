"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, RefreshCw, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface MetaLlamaIntegrationProps {
  onDataLoaded: (customers: any[], relationships: any[]) => void
}

export default function MetaLlamaIntegration({ onDataLoaded }: MetaLlamaIntegrationProps) {
  const [loading, setLoading] = useState(false)
  const [dataset, setDataset] = useState("default")
  const [filters, setFilters] = useState({
    industry: "",
    region: "",
    status: "",
    page: "1",
    limit: "50",
  })
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [metadata, setMetadata] = useState<any>(null)

  const availableDatasets = [
    { value: "default", label: "Default Customer Base", description: "Standard customer dataset" },
    { value: "enterprise", label: "Enterprise Customers", description: "High-value enterprise accounts" },
    { value: "smb", label: "Small & Medium Business", description: "SMB customer segment" },
    { value: "tech-startups", label: "Tech Startups", description: "Technology startup customers" },
    { value: "healthcare", label: "Healthcare Sector", description: "Healthcare industry focus" },
    { value: "finance", label: "Financial Services", description: "Financial sector customers" },
    { value: "retail", label: "Retail & E-commerce", description: "Retail and e-commerce clients" },
    { value: "manufacturing", label: "Manufacturing", description: "Manufacturing industry" },
  ]

  const handleFetchData = async () => {
    setLoading(true)
    setSyncStatus("syncing")
    setErrorMessage("")

    try {
      const params = new URLSearchParams({
        dataset,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      })

      console.log(`🔄 Fetching data from Meta LLama API with params:`, params.toString())

      const response = await fetch(`/api/meta-llama?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data")
      }

      console.log(`✅ Received data:`, {
        customers: data.customers.length,
        relationships: data.relationships.length,
      })

      // Update the main application with new data
      onDataLoaded(data.customers, data.relationships)

      setMetadata(data.metadata)
      setLastSync(new Date())
      setSyncStatus("success")
    } catch (error) {
      console.error("❌ Error fetching Meta LLama data:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setSyncStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSyncData = async () => {
    setLoading(true)
    setSyncStatus("syncing")

    try {
      const response = await fetch("/api/meta-llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync",
          dataset,
          filters,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync data")
      }

      setSyncStatus("success")
      setLastSync(new Date())

      // Automatically fetch the synced data
      setTimeout(() => {
        handleFetchData()
      }, 2000)
    } catch (error) {
      console.error("❌ Error syncing Meta LLama data:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
      setSyncStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Meta LLama API Integration
          </CardTitle>
          <CardDescription>
            Connect to Meta LLama's customer database to load different customer base datasets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  syncStatus === "success"
                    ? "bg-green-500"
                    : syncStatus === "error"
                      ? "bg-red-500"
                      : syncStatus === "syncing"
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                }`}
              />
              <span className="text-sm">
                {syncStatus === "success"
                  ? "Connected"
                  : syncStatus === "error"
                    ? "Error"
                    : syncStatus === "syncing"
                      ? "Syncing..."
                      : "Not Connected"}
              </span>
            </div>
            {lastSync && <span className="text-xs text-muted-foreground">Last sync: {lastSync.toLocaleString()}</span>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="datasets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="sync">Sync & Status</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Datasets</CardTitle>
              <CardDescription>Choose a customer dataset from Meta LLama's database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {availableDatasets.map((ds) => (
                  <Card
                    key={ds.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      dataset === ds.value ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setDataset(ds.value)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{ds.label}</CardTitle>
                        {dataset === ds.value && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <CardDescription className="text-xs">{ds.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Filters</CardTitle>
              <CardDescription>Apply filters to customize the customer data you want to load</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) => setFilters({ ...filters, industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="energy">Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="north-america">North America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                      <SelectItem value="latin-america">Latin America</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Customer Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Records Limit</Label>
                  <Select value={filters.limit} onValueChange={(value) => setFilters({ ...filters, limit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 records</SelectItem>
                      <SelectItem value="50">50 records</SelectItem>
                      <SelectItem value="100">100 records</SelectItem>
                      <SelectItem value="200">200 records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Operations</CardTitle>
              <CardDescription>Load customer data from Meta LLama API into your knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button onClick={handleFetchData} disabled={loading} className="flex items-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Load Data
                  </Button>

                  <Button
                    onClick={handleSyncData}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Full Sync
                  </Button>
                </div>

                {syncStatus === "error" && errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {syncStatus === "success" && metadata && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully loaded {metadata.total_count} customers with $
                      {metadata.total_revenue?.toLocaleString()} total revenue
                    </AlertDescription>
                  </Alert>
                )}

                {metadata && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Dataset Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Records:</span>
                            <Badge variant="secondary">{metadata.total_count}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Customers:</span>
                            <Badge variant="default">{metadata.active_customers}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span className="font-medium">${metadata.total_revenue?.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Current Filters</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Dataset:</span>
                            <Badge variant="outline">{dataset}</Badge>
                          </div>
                          {filters.industry && (
                            <div className="flex justify-between">
                              <span>Industry:</span>
                              <Badge variant="outline">{filters.industry}</Badge>
                            </div>
                          )}
                          {filters.region && (
                            <div className="flex justify-between">
                              <span>Region:</span>
                              <Badge variant="outline">{filters.region}</Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
