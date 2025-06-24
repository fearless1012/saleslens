import React, { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { customerAPI } from "@/api";

interface CustomerProfileData {
  company: string;
  industry: string;
  stage: string;
  description: string;
  position: string;
  keyTraits: string[];
  valueProposition: string[];
  painPoints: string[];
  objections: string[];
  status: string;
  tags: string[];
}

const CustomerProfile: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProfiles, setGeneratedProfiles] = useState<
    CustomerProfileData[]
  >([]);
  const [showGeneratedProfiles, setShowGeneratedProfiles] = useState(false);

  const customerData = {
    company: "Startups",
    description:
      "Lorem ipsum dolor sit amet consectetur. Faucibus et morbi mi ut feugiat elit facilisis. Mollit dolor nullam Ornare etiam.",
    stage: "Early-Stage Startups",
    stageDescription:
      "Lorem ipsum dolor sit amet consectetur. Faucibus et morbi mi ut feugiat elit facilisis.",
    keyTraits: [
      "High-stakes, deadline fast ROI",
      "Prefers metrics-driven messaging",
      "Gets energized by data",
      "Loves product demos and 'how it works' explanations",
    ],
    valueProposition: [
      "Reduce significant manual work, then business outcome",
      "Mention integrations: APIs, and platforms",
      "Focus on operational efficiency",
      "Offer short demo calls or try-it-now links",
    ],
    painPoints: [
      '"We already built something in-house"',
      '"Too early to spend on this"',
      '"How fast can we onboard?"',
    ],
    objections: [
      '"We already built something in-house"',
      '"Too early to spend on this"',
      '"How fast can we onboard?"',
    ],
  };

  const handleGenerateProfiles = async () => {
    setIsGenerating(true);
    try {
      const response = await customerAPI.generateProfiles({
        count: 3,
        industries: [
          "Technology",
          "Healthcare",
          "Finance",
          "E-commerce",
          "Manufacturing",
        ],
        focusAreas: ["Startups", "Enterprise", "SMB", "Growth Companies"],
        analysisDepth: "detailed",
      });

      if (response.data.status === "success") {
        setGeneratedProfiles(response.data.data.profiles);
        setShowGeneratedProfiles(true);
      } else {
        console.error("Failed to generate profiles:", response.data.message);
        alert("Failed to generate customer profiles. Please try again.");
      }
    } catch (error) {
      console.error("Error generating profiles:", error);
      alert(
        "An error occurred while generating customer profiles. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-64 w-full">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Profile
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    placeholder="Search for anything..."
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center text-white">
                      3
                    </span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-2">
                      <span className="text-sm font-medium block">
                        Alex mirian
                      </span>
                      <span className="text-xs text-gray-500">
                        Product manager
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Customer Profiles Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer Profiles
                </h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    Last 30 days
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Customer Profile Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Customer"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      E-commerce / Fashion
                    </div>
                    <h3 className="font-medium text-lg mb-1">
                      Chief Marketing Officer
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Customer"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Retail Banking
                    </div>
                    <h3 className="font-medium text-lg mb-1">
                      Head of Digital Ops
                    </h3>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Customer"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Healthcare / Pharma
                    </div>
                    <h3 className="font-medium text-lg mb-1">
                      Head of Learning & Development
                    </h3>
                  </div>
                </div>

                <div
                  className="bg-white rounded-lg shadow p-5 cursor-pointer flex flex-col justify-center items-center hover:shadow-md transition-all"
                  onClick={handleGenerateProfiles}
                >
                  <div className="bg-blue-100 p-3 rounded-full mb-3">
                    {isGenerating ? (
                      <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-medium text-lg">
                    {isGenerating ? "Generating..." : "Create New"}
                  </h3>
                  {isGenerating && (
                    <p className="text-sm text-gray-500 mt-1">
                      Using AI to analyze customer data
                    </p>
                  )}
                </div>
              </div>

              {/* Main Customer Profile Details */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                    alt="Startup Customer"
                    className="w-64 h-48 object-cover rounded-lg mr-6"
                  />
                  <div className="flex-1 text-white">
                    <h2 className="text-3xl font-bold mb-2">
                      {customerData.company}
                    </h2>
                    <p className="text-blue-100 mb-4 leading-relaxed">
                      {customerData.description}
                    </p>

                    <div className="bg-white bg-opacity-20 rounded-lg p-4">
                      <h3 className="text-blue-200 font-semibold mb-2">
                        {customerData.stage}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {customerData.stageDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Profiles Section */}
              {showGeneratedProfiles && generatedProfiles.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI-Generated Customer Profiles
                    </h2>
                    <button
                      onClick={() => setShowGeneratedProfiles(false)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close generated profiles"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {generatedProfiles.map((profile, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500"
                      >
                        <div className="bg-gradient-to-r from-green-400 to-green-600 p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                              {profile.company}
                            </h3>
                            <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                              AI Generated
                            </span>
                          </div>
                          <p className="text-green-100 text-sm mt-1">
                            {profile.industry} • {profile.position}
                          </p>
                        </div>

                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {profile.stage}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {profile.description}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                Key Traits
                              </h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {profile.keyTraits
                                  .slice(0, 2)
                                  .map((trait, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-1">
                                        •
                                      </span>
                                      {trait}
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                Value Props
                              </h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {profile.valueProposition
                                  .slice(0, 2)
                                  .map((value, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-1">
                                        •
                                      </span>
                                      {value}
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                Common Objections
                              </h5>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {profile.objections
                                  .slice(0, 2)
                                  .map((objection, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-red-500 mr-1">
                                        •
                                      </span>
                                      {objection}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1">
                              {profile.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Traits */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Key Traits
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.keyTraits.map((trait, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Value Proposition */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Value Proposition
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.valueProposition.map((value, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Objections */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Objections
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.objections.map((objection, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {objection}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pain Points */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pain points
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.painPoints.map((pain, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Objections (duplicate section as shown in image) */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Objections
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.objections.map((objection, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {objection}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Objections */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Objections
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {customerData.objections.map((objection, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        {objection}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t">
                SalesLens ©2025
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
