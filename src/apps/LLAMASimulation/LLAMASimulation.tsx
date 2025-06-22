import React, { useState } from "react";
import { Link } from "react-router-dom";

const LLAMASimulation: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "ai" | "system"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const scenarios = [
    {
      id: 1,
      title: "Enterprise CTO Meeting",
      description:
        "Practice pitching LLaMA to a skeptical CTO of a Fortune 500 company who is concerned about data privacy.",
      difficulty: "Hard",
      image: "https://placehold.co/600x400?text=Enterprise+Meeting",
    },
    {
      id: 2,
      title: "Technical Team Demo",
      description:
        "Present the technical capabilities of LLaMA to a team of ML engineers who are evaluating different LLMs.",
      difficulty: "Medium",
      image: "https://placehold.co/600x400?text=Technical+Demo",
    },
    {
      id: 3,
      title: "ROI Discussion",
      description:
        "Discuss the return on investment of implementing LLaMA with a CFO who is focused on cost efficiency.",
      difficulty: "Medium",
      image: "https://placehold.co/600x400?text=ROI+Discussion",
    },
    {
      id: 4,
      title: "Competitor Comparison",
      description:
        "Address questions about how LLaMA compares to other popular language models in the market.",
      difficulty: "Easy",
      image: "https://placehold.co/600x400?text=Competitor+Comparison",
    },
  ];

  const startScenario = (scenarioId: number) => {
    setCurrentScenario(scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);

    if (scenario) {
      setMessages([
        {
          role: "system",
          content: `Simulation started: ${scenario.title}`,
        },
        {
          role: "ai",
          content:
            scenario.id === 1
              ? "I'm the CTO of a Fortune 500 financial services company. We're exploring LLM solutions, but I have serious concerns about data privacy and security with Meta's products. Why should we consider LLaMA over other options?"
              : scenario.id === 2
              ? "Our ML engineering team has been evaluating several LLMs including GPT-4 and Claude. What specific technical advantages does LLaMA offer that would make us want to switch?"
              : scenario.id === 3
              ? "As the CFO, I need to understand the concrete ROI we can expect from implementing LLaMA. Can you provide specific metrics on cost savings or efficiency gains?"
              : "I've been looking at both open-source and proprietary LLMs. How exactly does LLaMA compare to models like GPT-4, Claude, or other open-source alternatives?",
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { role: "user", content: input }];

    setMessages(updatedMessages);
    setInput("");

    // Simulate AI response after a short delay
    setTimeout(() => {
      let aiResponse = "";

      // Different responses based on the scenario and conversation state
      if (currentScenario === 1) {
        if (updatedMessages.length === 3) {
          aiResponse =
            "That's interesting, but I'm still concerned about how our sensitive financial data would be handled. Does Meta have access to any data processed by LLaMA models we would deploy?";
        } else {
          aiResponse =
            "I appreciate your explanation. Let me think about this more and discuss it with our security team. I may have more questions later.";
          setFeedbackVisible(true);
        }
      } else if (currentScenario === 2) {
        if (updatedMessages.length === 3) {
          aiResponse =
            "What about inference speed and resource requirements? Our current infrastructure has certain limitations.";
        } else {
          aiResponse =
            "That's helpful information. We'd like to run some benchmarks ourselves. Can you provide documentation on how to set up proper evaluation environments?";
          setFeedbackVisible(true);
        }
      } else if (currentScenario === 3) {
        if (updatedMessages.length === 3) {
          aiResponse =
            "Those numbers sound promising, but I need more concrete examples. Do you have case studies from similar companies in our industry?";
        } else {
          aiResponse =
            "I'll need to review these figures with my team, but this gives us a starting point for our analysis. Thanks for the information.";
          setFeedbackVisible(true);
        }
      } else {
        if (updatedMessages.length === 3) {
          aiResponse =
            "What about customization capabilities and fine-tuning requirements? We have specific domain knowledge we'd need to incorporate.";
        } else {
          aiResponse =
            "Thanks for clarifying. This comparison helps us understand where LLaMA might fit in our evaluation framework.";
          setFeedbackVisible(true);
        }
      }

      setMessages([...updatedMessages, { role: "ai", content: aiResponse }]);
    }, 1000);
  };

  const resetSimulation = () => {
    setCurrentScenario(null);
    setMessages([]);
    setFeedbackVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentScenario ? "Sales Simulation" : "Practice Scenarios"}
            </h1>
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!currentScenario ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <img
                    src={scenario.image}
                    alt={scenario.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {scenario.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          scenario.difficulty === "Hard"
                            ? "bg-red-100 text-red-800"
                            : scenario.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {scenario.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {scenario.description}
                    </p>
                    <div className="mt-5">
                      <button
                        onClick={() => startScenario(scenario.id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                      >
                        Start Scenario
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {scenarios.find((s) => s.id === currentScenario)?.title}
                  </h2>
                  <button
                    onClick={resetSimulation}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Exit Simulation
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-6">
                {messages.map((message, index) =>
                  message.role !== "system" ? (
                    <div
                      key={index}
                      className={`mb-4 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block max-w-3/4 rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-primary-100 text-primary-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="my-4 text-center">
                      <span className="inline-block px-2 py-1 rounded bg-gray-200 text-xs text-gray-600">
                        {message.content}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <form onSubmit={handleSubmit}>
                  <div className="flex">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      placeholder="Type your response..."
                    />
                    <button
                      type="submit"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>

              {feedbackVisible && (
                <div className="px-6 py-4 border-t border-gray-200 bg-green-50">
                  <h3 className="text-sm font-medium text-green-800">
                    Feedback
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Great job! You've successfully navigated this sales
                      scenario.
                    </p>
                    <p className="mt-1">Key strengths:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Clear articulation of LLaMA's value proposition</li>
                      <li>Good handling of technical objections</li>
                      <li>Effective use of comparative advantages</li>
                    </ul>
                    <p className="mt-2">Areas for improvement:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Consider adding more specific industry use cases</li>
                      <li>Provide more concrete ROI figures when possible</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={resetSimulation}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none"
                    >
                      Try Another Scenario
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LLAMASimulation;
