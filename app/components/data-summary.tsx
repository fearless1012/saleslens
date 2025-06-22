"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Building2, Globe, Target } from "lucide-react"

interface DataSummaryProps {
  customers: any[]
  relationships: any[]
}

export default function DataSummary({ customers, relationships }: DataSummaryProps) {
  // Calculate metrics
  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0)
  const avgRevenue = customers.length > 0 ? totalRevenue / customers.length : 0
  const activeCustomers = customers.filter((c) => c.status === "active").length
  const retentionRate = customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0

  // Industry breakdown
  const industries = customers.reduce(
    (acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topIndustries = Object.entries(industries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Region breakdown
  const regions = customers.reduce(
    (acc, c) => {
      acc[c.region] = (acc[c.region] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Acquisition source analysis
  const acquisitionSources = customers.reduce(
    (acc, c) => {
      const source = c.notes?.match(/Acquired via ([^.]+)/)?.[1] || "Unknown"
      acc[source] = (acc[source] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topSources = Object.entries(acquisitionSources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Relationship analysis
  const relationshipTypes = relationships.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Meta LLama Customer Data Integration Summary
          </CardTitle>
          <CardDescription>Successfully integrated real customer data from Meta LLama database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Customers</span>
              </div>
              <div className="text-2xl font-bold">{customers.length}</div>
              <div className="text-xs text-muted-foreground">
                {activeCustomers} active, {customers.length - activeCustomers} inactive
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Avg: ${Math.round(avgRevenue).toLocaleString()}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Retention Rate</span>
              </div>
              <div className="text-2xl font-bold">{retentionRate.toFixed(1)}%</div>
              <Progress value={retentionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Relationships</span>
              </div>
              <div className="text-2xl font-bold">{relationships.length}</div>
              <div className="text-xs text-muted-foreground">Mapped connections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Industries</CardTitle>
            <CardDescription>Customer distribution by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIndustries.map(([industry, count]) => (
                <div key={industry} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {industry.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / customers.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acquisition Sources</CardTitle>
            <CardDescription>Most effective customer acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(count / customers.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regional Distribution</CardTitle>
            <CardDescription>Customer presence across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(regions).map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{region.replace("-", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(count / customers.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Relationship Types</CardTitle>
            <CardDescription>Customer connection patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(relationshipTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${(count / relationships.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Integration Status</CardTitle>
          <CardDescription>Real-time status of Meta LLama customer data integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div>
                <div className="font-medium text-green-800">Data Loaded</div>
                <div className="text-sm text-green-600">20 customers processed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div>
                <div className="font-medium text-blue-800">Relationships Mapped</div>
                <div className="text-sm text-blue-600">15 connections created</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div>
                <div className="font-medium text-purple-800">Ready for Training</div>
                <div className="text-sm text-purple-600">Knowledge base active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
