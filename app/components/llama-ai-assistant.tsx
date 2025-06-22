"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  MessageSquare,
  Loader2,
  Sparkles,
  BarChart3,
} from "lucide-react"
import type { Customer, CustomerRelationship } from "../types/customer"

interface LlamaAIAssistantProps {
  customers: Customer[]
  relationships: CustomerRelationship[]
}

export default function LlamaAIAssistant({ customers, relationships }: LlamaAIAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [insights, setInsights] = useState<string>("")
  const [strategy, setStrategy] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<string>("")
  const [churnAnalysis, setChurnAnalysis] = useState<string>("")

  const handleAnalyzeCustomer = async () => {
    if (!selectedCustomer) return

    setLoading(true)
    try {
      const customer = customers.find((c) => c.id === selectedCustomer)
      const customerRelationships = relationships.filter(
        (r) => r.sourceId === selectedCustomer || r.targetId === selectedCustomer,
      )

      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_customer",
          data: {
            customer,
            relationships: customerRelationships,
          },
        }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing customer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_insights",
          data: { customers, relationships },
        }),
      })

      const data = await response.json()
      setInsights(data.insights)
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendStrategy = async () => {
    if (!selectedCustomer) return

    setLoading(true)
    try {
      const customer = customers.find((c) => c.id === selectedCustomer)

      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recommend_strategy",
          data: {
            customer,
            target_outcome: "increase_revenue",
            context: "quarterly_review",
          },
        }),
      })

      const data = await response.json()
      setStrategy(data.strategy)
    } catch (error) {
      console.error("Error recommending strategy:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindOpportunities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "find_opportunities",
          data: { customers, relationships },
        }),
      })

      const data = await response.json()
      setOpportunities(data.opportunities)
    } catch (error) {
      console.error("Error finding opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePredictChurn = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "predict_churn",
          data: { customers: customers.slice(0, 10) }, // Analyze first 10 customers
        }),
      })

      const data = await response.json()
      setChurnAnalysis(data.churn_analysis)
    } catch (error) {
      console.error("Error predicting churn:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage = chatMessage
    setChatMessage("")
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/ai/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          data: {
            message: userMessage,
            context: "sales_knowledge_base",
            customers,
            relationships,
          },
        }),
      })

      if (response.body) {
        const reader = response.body.getReader()
        let assistantMessage = ""

        setChatHistory((prev) => [...prev, { role: "assistant", content: "" }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          assistantMessage += chunk

          setChatHistory((prev) => {
            const newHistory = [...prev]
            newHistory[newHistory.length - 1].content = assistantMessage
            return newHistory
          })
        }
      }
    } catch (error) {
      console.error("Error in chat:", error)
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Meta LLama 4 AI Assistant
          </CardTitle>
          <CardDescription>
            AI-powered customer analysis, insights, and sales recommendations using Meta LLama 4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">LLama 4 Connected</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {customers.length} customers • {relationships.length} relationships
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analysis">Customer Analysis</TabsTrigger>
          <TabsTrigger value="insights">Portfolio Insights</TabsTrigger>
          <TabsTrigger value="strategy">Sales Strategy</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Customer Analysis
              </CardTitle>
              <CardDescription>Deep AI analysis of individual customer profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a customer to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAnalyzeCustomer} disabled={loading || !selectedCustomer}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Analyze
                  </Button>
                </div>

                {analysis && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {analysis.customer_analysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-green-500 mt-2"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-red-600">Risks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {analysis.customer_analysis.risks.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-red-500 mt-2"></div>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-blue-600">Opportunities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {analysis.customer_analysis.opportunities.map((opportunity: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-blue-500 mt-2"></div>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-purple-600">Recommended Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          {analysis.customer_analysis.recommended_actions.map((action: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-purple-500 mt-2"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Insights
              </CardTitle>
              <CardDescription>AI-generated insights about your entire customer portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleGenerateInsights} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Generate Insights
                </Button>

                {insights && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <div className="whitespace-pre-wrap text-sm">{insights}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sales Strategy Recommendations
              </CardTitle>
              <CardDescription>AI-powered sales strategies for specific customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a customer for strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleRecommendStrategy} disabled={loading || !selectedCustomer}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                    Get Strategy
                  </Button>
                </div>

                {strategy && (
                  <div className="space-y-4">
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Recommended Approach:</strong> {strategy.recommended_approach}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Talking Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm">
                            {strategy.talking_points.map((point: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-2"></div>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Potential Objections</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm">
                            {strategy.potential_objections.map((objection: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-2"></div>
                                {objection}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex gap-4">
                      <Badge variant="outline">
                        Success Probability: {Math.round(strategy.success_probability * 100)}%
                      </Badge>
                      <Badge variant="outline">Timeline: {strategy.timeline_estimate}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Opportunity Identification
              </CardTitle>
              <CardDescription>AI-identified growth and expansion opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button onClick={handleFindOpportunities} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                    Find Opportunities
                  </Button>
                  <Button onClick={handlePredictChurn} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                    Predict Churn
                  </Button>
                </div>

                {opportunities && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <div className="whitespace-pre-wrap text-sm">{opportunities}</div>
                    </AlertDescription>
                  </Alert>
                )}

                {churnAnalysis && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="whitespace-pre-wrap text-sm">{churnAnalysis}</div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Chat Assistant
              </CardTitle>
              <CardDescription>Chat with LLama 4 about your customers and sales strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-96 border rounded-lg p-4 overflow-y-auto space-y-3">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground">
                      <Bot className="h-8 w-8 mx-auto mb-2" />
                      <p>Start a conversation with your AI sales assistant!</p>
                    </div>
                  )}
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about customers, strategies, or insights..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
