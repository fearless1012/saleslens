"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Customer, CustomerRelationship } from "../types/customer"
import { BookOpen, CheckCircle, ArrowRight, Trophy, Target } from "lucide-react"

interface LearningModuleProps {
  customers: Customer[]
  relationships: CustomerRelationship[]
}

interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function LearningModule({ customers, relationships }: LearningModuleProps) {
  const [currentModule, setCurrentModule] = useState(0)
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  const getMostCommonIndustry = () => {
    if (customers.length === 0) return "N/A"
    const industries = customers.map((c) => c.industry)
    const counts = industries.reduce(
      (acc, industry) => {
        acc[industry] = (acc[industry] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"
  }

  const getTopRegions = () => {
    if (customers.length === 0) return []
    const regions = customers.map((c) => c.region)
    const counts = regions.reduce(
      (acc, region) => {
        acc[region] = (acc[region] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([region]) => region)
  }

  const getIndustryBreakdown = () => {
    if (customers.length === 0) return "No customers available"
    const industries = customers.reduce(
      (acc, customer) => {
        acc[customer.industry] = (acc[customer.industry] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(industries)
      .map(([industry, count]) => `• ${industry}: ${count} customers`)
      .join("\n      ")
  }

  const getRelationshipBreakdown = () => {
    if (relationships.length === 0) return "No relationships documented"
    const types = relationships.reduce(
      (acc, rel) => {
        acc[rel.type] = (acc[rel.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(types)
      .map(([type, count]) => `• ${type}: ${count} relationships`)
      .join("\n      ")
  }

  const modules = [
    {
      title: "Customer Overview",
      description: "Learn about our customer base and key metrics",
      content: `Our customer portfolio consists of ${customers.length} active relationships across various industries. 
    The total revenue managed is $${customers.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}.
    
    Key insights:
    • Average deal size: $${customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.dealSize, 0) / customers.length).toLocaleString() : "0"}
    • Most common industry: ${getMostCommonIndustry()}
    • Primary regions: ${getTopRegions().join(", ")}
    
    Understanding these metrics helps you identify patterns and opportunities in our customer base.`,
    },
    {
      title: "Industry Analysis",
      description: "Deep dive into industry-specific customer patterns",
      content: `Industry distribution shows interesting patterns:
    
    ${getIndustryBreakdown()}
    
    Each industry has unique characteristics:
    • Technology customers typically have shorter sales cycles but higher deal values
    • Healthcare customers require longer relationship building but offer stable long-term contracts
    • Finance customers are highly regulated and require compliance-focused approaches
    
    Use this knowledge to tailor your approach based on the customer's industry.`,
    },
    {
      title: "Relationship Mapping",
      description: "Understanding customer connections and referral opportunities",
      content: `Customer relationships are crucial for growth. We have ${relationships.length} documented relationships.
    
    Relationship types:
    ${getRelationshipBreakdown()}
    
    Key strategies:
    • Leverage referral relationships for warm introductions
    • Identify partnership opportunities for mutual growth
    • Monitor competitor relationships for market intelligence
    • Use supplier relationships for value-added services
    
    Always ask customers about their network and look for connection opportunities.`,
    },
  ]

  const generateQuizzes = () => {
    if (customers.length === 0 || relationships.length === 0) {
      setQuizzes([
        {
          id: "1",
          question: "What should you do when you have no customer data?",
          options: [
            "Wait for data to appear",
            "Start adding customer information",
            "Skip the training",
            "Use fake data",
          ],
          correctAnswer: 1,
          explanation:
            "The first step is to start collecting and adding customer information to build your knowledge base.",
        },
      ])
      return
    }

    const generatedQuizzes: Quiz[] = [
      {
        id: "1",
        question: `What is the total number of customers in our database?`,
        options: [
          `${Math.max(0, customers.length - 2)}`,
          `${customers.length}`,
          `${customers.length + 2}`,
          `${customers.length + 5}`,
        ],
        correctAnswer: 1,
        explanation: `We currently have ${customers.length} customers in our knowledge base.`,
      },
      {
        id: "2",
        question: "Which industry represents the largest segment of our customer base?",
        options: ["Technology", "Healthcare", "Finance", getMostCommonIndustry()],
        correctAnswer: 3,
        explanation: `${getMostCommonIndustry()} is our most common industry segment.`,
      },
      {
        id: "3",
        question: `How many customer relationships have we documented?`,
        options: [
          `${Math.max(0, relationships.length - 1)}`,
          `${relationships.length}`,
          `${relationships.length + 1}`,
          `${relationships.length + 3}`,
        ],
        correctAnswer: 1,
        explanation: `We have documented ${relationships.length} relationships between customers.`,
      },
    ]
    setQuizzes(generatedQuizzes)
  }

  useEffect(() => {
    generateQuizzes()
  }, [customers, relationships])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowResult(true)
    if (selectedAnswer === quizzes[currentQuiz].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Module completed
      setCompletedModules([...completedModules, currentModule])
      setCurrentQuiz(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
    }
  }

  const progress = ((currentQuiz + 1) / quizzes.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sales Training Modules
          </CardTitle>
          <CardDescription>Interactive learning modules to master customer knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {modules.map((module, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentModule === index ? "ring-2 ring-primary" : ""
                } ${completedModules.includes(index) ? "bg-green-50" : ""}`}
                onClick={() => setCurrentModule(index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    {completedModules.includes(index) && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{modules[currentModule].title}</CardTitle>
            <CardDescription>
              Module {currentModule + 1} of {modules.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {modules[currentModule].content}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Knowledge Check
              </CardTitle>
              <Badge variant="outline">
                Question {currentQuiz + 1} of {quizzes.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            {quizzes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">{quizzes[currentQuiz].question}</h3>

                <div className="space-y-2">
                  {quizzes[currentQuiz].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {showResult && (
                  <div
                    className={`p-4 rounded-lg ${
                      selectedAnswer === quizzes[currentQuiz].correctAnswer
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedAnswer === quizzes[currentQuiz].correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Target className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {selectedAnswer === quizzes[currentQuiz].correctAnswer ? "Correct!" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm">{quizzes[currentQuiz].explanation}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  {!showResult ? (
                    <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="ml-auto">
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion} className="ml-auto">
                      {currentQuiz < quizzes.length - 1 ? (
                        <>
                          Next Question <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Complete Module <Trophy className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {showResult && currentQuiz === quizzes.length - 1 && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold">Module Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Score: {score} out of {quizzes.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
