import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui";
import { transcriptAPI } from "@/api";
import {
  exampleCustomerProfiles,
  pitchTypeDescriptions,
} from "@/data/customerProfiles";

interface ConversationItem {
  speaker: "AI" | "You";
  message: string;
  id: string;
}

interface SentimentData {
  anxiety: number;
  happy: number;
  doubt: number;
}

interface CustomerProfileForm {
  customerProfile: string;
  industryFocus: string;
  specificProducts: string[];
  pitchType: "discovery" | "demo" | "proposal" | "closing";
  includeHistoricalData: boolean;
}

const Practice: React.FC = () => {
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    anxiety: 30,
    happy: 65,
    doubt: 25,
  });

  // Customer profile form state
  const [customerForm, setCustomerForm] = useState<CustomerProfileForm>({
    customerProfile: "",
    industryFocus: "",
    specificProducts: [],
    pitchType: "discovery",
    includeHistoricalData: true,
  });
  const [showForm, setShowForm] = useState(true);
  const [generatingTranscript, setGeneratingTranscript] = useState(false);

  // Mock transcript data - will be replaced by generated content
  const [transcript, setTranscript] =
    useState(`Alex: Good morning Jennifer, thanks for taking my call. I understand RetailMax is looking to better understand customer behavior patterns?

Jennifer: Yes, we're losing customers and can't pinpoint why. Our current analytics are too basic.

Alex: That's exactly what Llama 4's customer analytics suite addresses. It can process your transaction data, support tickets, and engagement metrics to predict churn risk weeks in advance. For a retailer your size, we typically see 25-30% reduction in churn within the first quarter.

Jennifer: That sounds promising. What about implementation complexity?

Alex: Great question. We handle the heavy lifting - data integration, model training, and dashboard setup. Your team would see results in 2-3 weeks. We also provide ongoing optimization.

Jennifer: I'm impressed. What's the investment looking like?

Alex: For your customer base, we're looking at $15K monthly, but the churn reduction typically saves clients $50-80K monthly. Plus, we offer a 60-day money-back guarantee.

Jennifer: Let's schedule a demo with my analytics team. This could be exactly what we need.`);

  // Generate transcript using LLaMA AI
  const generateTranscript = async () => {
    if (!customerForm.customerProfile.trim()) {
      alert("Please enter a customer profile description");
      return;
    }

    setGeneratingTranscript(true);
    try {
      const response = await transcriptAPI.generate({
        customerProfile: customerForm.customerProfile,
        industryFocus: customerForm.industryFocus,
        specificProducts: customerForm.specificProducts,
        pitchType: customerForm.pitchType,
        includeHistoricalData: customerForm.includeHistoricalData,
      });

      if (response.data.status === "success") {
        const generatedTranscript = response.data.data.transcript;
        setTranscript(generatedTranscript);
        setShowForm(false);

        // Initialize conversation with some context
        setConversation([
          {
            speaker: "AI",
            message:
              "I've generated a new sales pitch transcript based on your customer profile. You can now practice by asking questions or discussing the pitch techniques used in this scenario.",
            id: "intro-1",
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error generating transcript:", error);
      alert("Failed to generate transcript. Please try again.");
    } finally {
      setGeneratingTranscript(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (field: keyof CustomerProfileForm, value: any) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle adding products
  const addProduct = (product: string) => {
    if (
      product.trim() &&
      !customerForm.specificProducts.includes(product.trim())
    ) {
      setCustomerForm((prev) => ({
        ...prev,
        specificProducts: [...prev.specificProducts, product.trim()],
      }));
    }
  };

  // Handle removing products
  const removeProduct = (index: number) => {
    setCustomerForm((prev) => ({
      ...prev,
      specificProducts: prev.specificProducts.filter((_, i) => i !== index),
    }));
  };

  // Handle using example profile
  const useExampleProfile = (example: (typeof exampleCustomerProfiles)[0]) => {
    setCustomerForm({
      customerProfile: example.profile,
      industryFocus: example.industryFocus,
      specificProducts: example.products,
      pitchType: example.pitchType,
      includeHistoricalData: true,
    });
  };

  // Initialize conversation with some AI responses
  useEffect(() => {
    if (!showForm) {
      const initialConversation: ConversationItem[] = [
        {
          speaker: "AI",
          message:
            "Welcome to Sales Practice! I can help you analyze this sales transcript and practice your responses. What would you like to discuss about this pitch?",
          id: "1",
        },
      ];
      setConversation(initialConversation);
    }
  }, [showForm]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMessage: ConversationItem = {
      speaker: "You",
      message: currentMessage,
      id: Date.now().toString(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const contextualResponses = [
        "That's a great observation! In successful sales conversations, it's important to focus on the customer's specific pain points. What other techniques did you notice in this transcript?",
        "Excellent question! The key here is building rapport and trust before diving into the product features. How would you approach building that initial connection?",
        "You're right to focus on that part of the conversation. Active listening and asking follow-up questions are crucial. What would you ask next in this scenario?",
        "That's a good insight about objection handling. The sales rep demonstrated patience and provided specific value propositions. How would you handle a price objection?",
        "Great point about the closing technique! Notice how the sales rep suggested a demo rather than pushing for an immediate decision. What are your thoughts on this approach?",
      ];

      const aiResponse: ConversationItem = {
        speaker: "AI",
        message:
          contextualResponses[
            Math.floor(Math.random() * contextualResponses.length)
          ],
        id: (Date.now() + 1).toString(),
      };

      setConversation((prev) => [...prev, aiResponse]);

      // Update sentiment analysis with some random variation
      setSentimentData({
        anxiety: Math.max(
          0,
          Math.min(100, sentimentData.anxiety + (Math.random() - 0.5) * 20)
        ),
        happy: Math.max(
          0,
          Math.min(100, sentimentData.happy + (Math.random() - 0.5) * 20)
        ),
        doubt: Math.max(
          0,
          Math.min(100, sentimentData.doubt + (Math.random() - 0.5) * 20)
        ),
      });

      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MainLayout title="Practice">
      {/* Customer Profile Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Generate Sales Pitch Transcript
            </h2>

            {/* Example Profiles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Quick Start with Example Profiles
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {exampleCustomerProfiles.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExampleProfile(example)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {example.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {example.industryFocus} •{" "}
                      {pitchTypeDescriptions[example.pitchType]}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-500">
                  or create your own profile below
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Customer Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Profile *
                </label>
                <textarea
                  value={customerForm.customerProfile}
                  onChange={(e) =>
                    handleFormChange("customerProfile", e.target.value)
                  }
                  placeholder="Describe the customer: their company, industry, challenges, needs, decision-making process, etc. Be as detailed as possible for better transcript generation."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Industry Focus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Focus
                </label>
                <input
                  type="text"
                  value={customerForm.industryFocus}
                  onChange={(e) =>
                    handleFormChange("industryFocus", e.target.value)
                  }
                  placeholder="e.g., Technology, Healthcare, Retail, Manufacturing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Pitch Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch Type
                </label>
                <select
                  value={customerForm.pitchType}
                  onChange={(e) =>
                    handleFormChange("pitchType", e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select pitch type"
                >
                  <option value="discovery">Discovery Call</option>
                  <option value="demo">Product Demo</option>
                  <option value="proposal">Proposal Presentation</option>
                  <option value="closing">Closing Call</option>
                </select>
              </div>

              {/* Specific Products */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Products/Services
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add product or service"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addProduct((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      addProduct(input.value);
                      input.value = "";
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {customerForm.specificProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customerForm.specificProducts.map((product, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {product}
                        <button
                          onClick={() => removeProduct(index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Include Historical Data */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customerForm.includeHistoricalData}
                    onChange={(e) =>
                      handleFormChange(
                        "includeHistoricalData",
                        e.target.checked
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Include historical sales data for context
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Use Default Transcript
                </button>
                <button
                  type="button"
                  onClick={generateTranscript}
                  disabled={
                    generatingTranscript || !customerForm.customerProfile.trim()
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {generatingTranscript && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {generatingTranscript
                      ? "Generating..."
                      : "Generate Transcript"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Transcript */}
        <div className="col-span-4">
          <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg p-6 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Transcript</h2>
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 text-sm"
              >
                New Transcript
              </button>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 h-[calc(100%-5rem)] overflow-y-auto">
              <div className="text-white text-sm leading-relaxed">
                {transcript.split("\n").map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return <br key={index} />;

                  // Style speaker names differently
                  if (
                    trimmedLine.includes(":") &&
                    !trimmedLine.startsWith(" ")
                  ) {
                    const [speaker, ...rest] = trimmedLine.split(":");
                    return (
                      <p key={index} className="mb-3">
                        <span className="font-semibold text-blue-100">
                          {speaker}:
                        </span>
                        <span className="ml-1">{rest.join(":")}</span>
                      </p>
                    );
                  }

                  return (
                    <p key={index} className="mb-3">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Panel - AI Conversation */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            {/* Customer Photo and Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                  alt="Customer"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {conversation.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.speaker === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-xs">
                      <div
                        className={`text-sm font-medium mb-1 ${
                          item.speaker === "You" ? "text-right" : "text-left"
                        }`}
                      >
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs ${
                            item.speaker === "You"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.speaker}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          item.speaker === "You"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{item.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium mb-1">
                        <span className="inline-block px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          AI
                        </span>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Sentiment Analysis */}
        <div className="col-span-4">
          <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg p-6 h-full text-white">
            <h2 className="text-2xl font-bold mb-4">Sentiment Analysis</h2>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-100 leading-relaxed">
                Practice your sales skills with AI-generated transcripts. This
                sentiment analysis shows your practice session performance and
                provides personalized recommendations for improvement.
              </p>
            </div>{" "}
            {/* Sentiment Bars */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 font-medium">Anxiety</span>
                  <span className="text-white font-semibold">
                    {Math.round(sentimentData.anxiety)}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className={`bg-red-400 h-3 rounded-full transition-all duration-500 ${
                      sentimentData.anxiety <= 20
                        ? "w-[20%]"
                        : sentimentData.anxiety <= 40
                        ? "w-[40%]"
                        : sentimentData.anxiety <= 60
                        ? "w-[60%]"
                        : sentimentData.anxiety <= 80
                        ? "w-[80%]"
                        : "w-full"
                    }`}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 font-medium">Confidence</span>
                  <span className="text-white font-semibold">
                    {Math.round(sentimentData.happy)}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className={`bg-green-400 h-3 rounded-full transition-all duration-500 ${
                      sentimentData.happy <= 20
                        ? "w-[20%]"
                        : sentimentData.happy <= 40
                        ? "w-[40%]"
                        : sentimentData.happy <= 60
                        ? "w-[60%]"
                        : sentimentData.happy <= 80
                        ? "w-[80%]"
                        : "w-full"
                    }`}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 font-medium">Uncertainty</span>
                  <span className="text-white font-semibold">
                    {Math.round(sentimentData.doubt)}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className={`bg-yellow-400 h-3 rounded-full transition-all duration-500 ${
                      sentimentData.doubt <= 20
                        ? "w-[20%]"
                        : sentimentData.doubt <= 40
                        ? "w-[40%]"
                        : sentimentData.doubt <= 60
                        ? "w-[60%]"
                        : sentimentData.doubt <= 80
                        ? "w-[80%]"
                        : "w-full"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            {/* Recommendations */}
            <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Practice Tips</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <p>
                  • Ask more discovery questions to understand customer needs
                </p>
                <p>
                  • Practice active listening and acknowledge customer concerns
                </p>
                <p>• Focus on value proposition rather than just features</p>
                <p>• Handle objections with empathy and specific examples</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t">
        SalesLens ©2025
      </div>
    </MainLayout>
  );
};

export default Practice;
