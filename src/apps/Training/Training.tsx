import React from "react";
import { Link } from "react-router-dom";

const Training: React.FC = () => {
  const trainingModules = [
    {
      id: 1,
      title: "LLaMA Fundamentals",
      description:
        "Learn the basics of Meta's LLaMA models, their architecture, and key capabilities.",
      duration: "2 hours",
      progress: 75,
      image: "https://placehold.co/600x400?text=LLaMA+Fundamentals",
    },
    {
      id: 2,
      title: "Enterprise Use Cases",
      description:
        "Explore how enterprise customers are implementing LLaMA for business transformation.",
      duration: "3 hours",
      progress: 45,
      image: "https://placehold.co/600x400?text=Enterprise+Use+Cases",
    },
    {
      id: 3,
      title: "Competitor Analysis",
      description:
        "Compare LLaMA with other LLMs in the market and understand key differentiators.",
      duration: "1.5 hours",
      progress: 0,
      image: "https://placehold.co/600x400?text=Competitor+Analysis",
    },
    {
      id: 4,
      title: "Technical Deep Dive",
      description:
        "Detailed technical specifications and architecture of LLaMA models.",
      duration: "4 hours",
      progress: 0,
      image: "https://placehold.co/600x400?text=Technical+Deep+Dive",
    },
    {
      id: 5,
      title: "Objection Handling",
      description:
        "Learn how to address common customer concerns about LLaMA models.",
      duration: "2.5 hours",
      progress: 20,
      image: "https://placehold.co/600x400?text=Objection+Handling",
    },
    {
      id: 6,
      title: "Case Studies",
      description:
        "Real-world examples of successful LLaMA implementations across industries.",
      duration: "3 hours",
      progress: 0,
      image: "https://placehold.co/600x400?text=Case+Studies",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Training Modules
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
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainingModules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <img
                    src={module.image}
                    alt={module.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {module.description}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Duration: {module.duration}
                    </p>

                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-primary-700">
                          Progress
                        </span>
                        <span className="text-sm font-medium text-primary-700">
                          {module.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary-600 h-2.5 rounded-full"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                        {module.progress > 0 ? "Continue" : "Start"} Module
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Training;
