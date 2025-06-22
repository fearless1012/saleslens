"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Customer } from "../types/customer"
import { Plus, Link } from "lucide-react"

interface CustomerFormProps {
  onCustomerAdded: () => void
  onRelationshipAdded: () => void
  customers: Customer[]
}

export default function CustomerForm({ onCustomerAdded, onRelationshipAdded, customers }: CustomerFormProps) {
  const [customerForm, setCustomerForm] = useState({
    name: "",
    company: "",
    industry: "",
    region: "",
    revenue: "",
    dealSize: "",
    contractLength: "",
    status: "active",
    notes: "",
  })

  const [relationshipForm, setRelationshipForm] = useState({
    sourceId: "",
    targetId: "",
    type: "",
    strength: "1",
    description: "",
  })

  const [loading, setLoading] = useState(false)

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerForm,
          revenue: Number.parseInt(customerForm.revenue),
          dealSize: Number.parseInt(customerForm.dealSize),
          contractLength: Number.parseInt(customerForm.contractLength),
        }),
      })

      if (response.ok) {
        setCustomerForm({
          name: "",
          company: "",
          industry: "",
          region: "",
          revenue: "",
          dealSize: "",
          contractLength: "",
          status: "active",
          notes: "",
        })
        onCustomerAdded()
      }
    } catch (error) {
      console.error("Failed to add customer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRelationshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...relationshipForm,
          strength: Number.parseInt(relationshipForm.strength),
        }),
      })

      if (response.ok) {
        setRelationshipForm({
          sourceId: "",
          targetId: "",
          type: "",
          strength: "1",
          description: "",
        })
        onRelationshipAdded()
      }
    } catch (error) {
      console.error("Failed to add relationship:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer">Add Customer</TabsTrigger>
          <TabsTrigger value="relationship">Add Relationship</TabsTrigger>
        </TabsList>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Customer
              </CardTitle>
              <CardDescription>Add customer information to build your knowledge graph</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={customerForm.company}
                      onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={customerForm.industry}
                      onValueChange={(value) => setCustomerForm({ ...customerForm, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={customerForm.region}
                      onValueChange={(value) => setCustomerForm({ ...customerForm, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north-america">North America</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                        <SelectItem value="latin-america">Latin America</SelectItem>
                        <SelectItem value="middle-east-africa">Middle East & Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="revenue">Annual Revenue ($)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={customerForm.revenue}
                      onChange={(e) => setCustomerForm({ ...customerForm, revenue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealSize">Deal Size ($)</Label>
                    <Input
                      id="dealSize"
                      type="number"
                      value={customerForm.dealSize}
                      onChange={(e) => setCustomerForm({ ...customerForm, dealSize: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractLength">Contract Length (months)</Label>
                    <Input
                      id="contractLength"
                      type="number"
                      value={customerForm.contractLength}
                      onChange={(e) => setCustomerForm({ ...customerForm, contractLength: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={customerForm.status}
                    onValueChange={(value) => setCustomerForm({ ...customerForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    placeholder="Additional notes about this customer..."
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding Customer..." : "Add Customer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationship">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Add Customer Relationship
              </CardTitle>
              <CardDescription>Define relationships between customers to build connections</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRelationshipSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sourceId">Source Customer</Label>
                    <Select
                      value={relationshipForm.sourceId}
                      onValueChange={(value) => setRelationshipForm({ ...relationshipForm, sourceId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetId">Target Customer</Label>
                    <Select
                      value={relationshipForm.targetId}
                      onValueChange={(value) => setRelationshipForm({ ...relationshipForm, targetId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers
                          .filter((c) => c.id !== relationshipForm.sourceId)
                          .map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.company}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Relationship Type</Label>
                    <Select
                      value={relationshipForm.type}
                      onValueChange={(value) => setRelationshipForm({ ...relationshipForm, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="competitor">Competitor</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="industry-peer">Industry Peer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strength">Relationship Strength (1-5)</Label>
                    <Select
                      value={relationshipForm.strength}
                      onValueChange={(value) => setRelationshipForm({ ...relationshipForm, strength: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Weak</SelectItem>
                        <SelectItem value="2">2 - Limited</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Strong</SelectItem>
                        <SelectItem value="5">5 - Very Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={relationshipForm.description}
                    onChange={(e) => setRelationshipForm({ ...relationshipForm, description: e.target.value })}
                    placeholder="Describe the relationship between these customers..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !relationshipForm.sourceId || !relationshipForm.targetId}
                  className="w-full"
                >
                  {loading ? "Adding Relationship..." : "Add Relationship"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
