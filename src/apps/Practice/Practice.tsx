import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/ui";

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

const Practice: React.FC = () => {
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    anxiety: 30,
    happy: 65,
    doubt: 25,
  });

  // Mock transcript data
  const transcript = `Alex: Good morning Jennifer, thanks for taking my call. I understand RetailMax is looking to better understand customer behavior patterns?

Jennifer: Yes, we're losing customers and can't pinpoint why. Our current analytics are too basic.

Alex: That's exactly what Llama 4's customer analytics suite addresses. It can process your transaction data, support tickets, and engagement metrics to predict churn risk weeks in advance. For a retailer your size, we typically see 25-30% reduction in churn within the first quarter.

Jennifer: That sounds promising. What about implementation complexity?

Alex: Great question. We handle the heavy lifting - data integration, model training, and dashboard setup. Your team would see results in 2-3 weeks. We also provide ongoing optimization.

Jennifer: I'm impressed. What's the investment looking like?

Alex: For your customer base, we're looking at $15K monthly, but the churn reduction typically saves clients $50-80K monthly. Plus, we offer a 60-day money-back guarantee.

Jennifer: Let's schedule a demo with my analytics team. This could be exactly what we need.`;

  // Initialize conversation with some AI responses
  useEffect(() => {
    const initialConversation: ConversationItem[] = [
      {
        speaker: "AI",
        message:
          "Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi feugiat dui facilisis.",
        id: "1",
      },
      {
        speaker: "You",
        message:
          "Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi feugiat dui facilisis.",
        id: "2",
      },
      {
        speaker: "AI",
        message:
          "Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi feugiat dui facilisis.",
        id: "3",
      },
      {
        speaker: "You",
        message:
          "Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi feugiat dui facilisis.",
        id: "4",
      },
    ];
    setConversation(initialConversation);
  }, []);

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
      const aiResponse: ConversationItem = {
        speaker: "AI",
        message:
          "Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi feugiat dui facilisis.",
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
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Transcript */}
        <div className="col-span-4">
          <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg p-6 h-full">
            <h2 className="text-2xl font-bold text-white mb-4">Transcript</h2>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 h-[calc(100%-4rem)] overflow-y-auto">
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
                Lorem ipsum dolor sit amet consectetur. Faucibus at morbi mi
                feugiat dui facilisis. Module Description/ Overview
              </p>
            </div>

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
                    className={`bg-red-400 h-3 rounded-full transition-all duration-500 w-[30%]`}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 font-medium">Happy</span>
                  <span className="text-white font-semibold">
                    {Math.round(sentimentData.happy)}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className={`bg-green-400 h-3 rounded-full transition-all duration-500 w-[65%]`}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-100 font-medium">Doubt</span>
                  <span className="text-white font-semibold">
                    {Math.round(sentimentData.doubt)}%
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className={`bg-yellow-400 h-3 rounded-full transition-all duration-500 w-[25%]`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Recommendations</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <p>• You should do this more</p>
                <p>• You should do this more</p>
                <p>• You should do this more</p>
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
