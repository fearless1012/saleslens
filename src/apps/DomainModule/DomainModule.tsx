import React, { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import SlidesService from "@/services/slidesService";

const DomainModule: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [presentationId, setPresentationId] = useState<string>("");
  const [embedUrl, setEmbedUrl] = useState<string>("");

  const handleTestLogin = async () => {
    try {
      const API_URL =
        (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setGenerationStatus(
          "✅ Test user logged in successfully! You can now generate presentations."
        );
      } else {
        setGenerationStatus("❌ Test login failed");
      }
    } catch (error) {
      setGenerationStatus("❌ Test login error");
    }
  };

  const handleGenerateTrainingModules = async () => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setGenerationStatus("❌ Please log in to generate presentations");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("🚀 Starting presentation generation...");
    setPresentationId("");
    setEmbedUrl("");

    try {
      const token = localStorage.getItem("token") || "";
      const API_URL =
        (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api";

      // Generate the presentation using backend API
      const prompt =
        "Create a comprehensive training module about Meta offerings including Meta Ads, AR/VR solutions, and AI API tools. Include best practices, key metrics like ROAS, CTR, CPA, campaign objectives, and practical implementation strategies for performance marketing.";

      console.log("🔄 Generating presentation via backend API...");
      console.log("API URL:", `${API_URL}/training-modules/generate-slides`);
      console.log("Request payload:", { prompt });

      const response = await fetch(
        `${API_URL}/training-modules/generate-slides`,
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(
          "Server returned invalid response format. Please check if the API endpoint is correct."
        );
      }

      if (result.status === "success" && result.data?.id) {
        setPresentationId(result.data.id);
        setGenerationStatus(
          `✅ Successfully generated presentation! ID: ${result.data.id}`
        );

        // If embed is available, try to get the embed URL
        if (result.data.embed) {
          try {
            const embedResponse = await SlidesService.getEmbedUrl(
              result.data.id
            );
            if (embedResponse.url) {
              setEmbedUrl(embedResponse.url);
              setGenerationStatus(
                `✅ Presentation ready! You can view or download it below.`
              );
            }
          } catch (embedError) {
            console.error("Error getting embed URL:", embedError);
          }
        }

        console.log("🎉 Presentation generated:", result.data);
      } else {
        setGenerationStatus("❌ Failed to generate presentation");
      }
    } catch (error: any) {
      console.error("❌ Error generating presentation:", error);

      let errorMessage = "Failed to generate presentation";
      if (
        error.message.includes("Token is not valid") ||
        error.message.includes("authorization denied")
      ) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (
        error.message.includes("Server returned invalid response format")
      ) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setGenerationStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPresentation = async () => {
    if (!presentationId) return;

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setGenerationStatus("❌ Please log in to download presentations");
      return;
    }

    try {
      setGenerationStatus("📥 Downloading presentation...");
      const token = localStorage.getItem("token") || "";
      const API_URL =
        (import.meta as any).env.VITE_API_URL || "http://localhost:3001/api";

      const response = await fetch(
        `${API_URL}/training-modules/download-slides/${presentationId}`,
        {
          method: "GET",
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = `${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training-module-${presentationId}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setGenerationStatus("✅ Presentation downloaded successfully!");
    } catch (error: any) {
      console.error("❌ Error downloading presentation:", error);
      setGenerationStatus(`❌ Download failed: ${error.message}`);
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
                <span className="text-blue-600">🌐</span> Domain Module
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
              {/* AI Training Module Generation Section */}
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                      🤖 AI Training Module Generator
                    </h2>
                    <p className="text-gray-600">
                      Use SlidesGPT AI to automatically generate comprehensive
                      training presentations from your domain knowledge data.
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleTestLogin}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all text-sm"
                      >
                        Test Login
                      </button>
                      <button
                        onClick={handleGenerateTrainingModules}
                        disabled={isGenerating}
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                          isGenerating
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            <span>Generate Presentation</span>
                          </>
                        )}
                      </button>

                      {presentationId && (
                        <button
                          onClick={handleDownloadPresentation}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
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
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download PPTX</span>
                        </button>
                      )}
                    </div>

                    {generationStatus && (
                      <div
                        className={`text-sm px-3 py-1 rounded-full ${
                          generationStatus.includes("✅")
                            ? "bg-green-100 text-green-800"
                            : generationStatus.includes("❌")
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {generationStatus}
                      </div>
                    )}
                  </div>
                </div>

                {/* Presentation Viewer */}
                {embedUrl && (
                  <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700">
                        Generated Training Presentation
                      </h3>
                    </div>
                    <iframe
                      src={embedUrl}
                      className="w-full h-96"
                      frameBorder="0"
                      allowFullScreen
                      title="Generated Training Presentation"
                    />
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  💡 The AI will analyze Meta's offerings and generate a
                  structured training presentation with comprehensive content
                  about advertising, AR/VR solutions, and API tools.
                </div>
              </div>

              {/* Meta Offerings Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Meta Offerings
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {/* Meta Ads */}
                  <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="mb-3">
                      <div className="bg-blue-100 inline-block p-3 rounded-lg">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-3">Meta Ads</h3>
                  </div>

                  {/* AR/VR Solutions */}
                  <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="mb-3">
                      <div className="bg-purple-100 inline-block p-3 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-3">
                      AR/VR solutions
                    </h3>
                  </div>

                  {/* AI and API tools */}
                  <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="mb-3">
                      <div className="bg-blue-100 inline-block p-3 rounded-lg">
                        <img
                          src="/src/assets/meta-logo.svg"
                          alt="Meta Logo"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-3">
                      AI and API tools
                    </h3>
                  </div>

                  {/* Create New */}
                  <div className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition-all">
                    <div className="mb-3">
                      <div className="bg-blue-100 inline-block p-3 rounded-lg">
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
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-3">Create New</h3>
                  </div>
                </div>
              </div>

              {/* Meta Ads Performance Marketing Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-white p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center">
                    {/* Left side - Image */}
                    <div className="lg:w-1/3 mb-6 lg:mb-0">
                      <div className="relative">
                        <div className="bg-white rounded-lg shadow-md p-4 transform rotate-3">
                          <div className="bg-blue-100 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <div className="text-sm font-medium">
                                Meta Ads Manager
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                              <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                              <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-lg shadow-md p-3 transform -rotate-6">
                          <div className="text-xs text-gray-600">
                            Performance Report
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            +24%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="lg:w-2/3 lg:pl-8">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Meta Ads – Performance Marketing
                        </h2>
                        <h3 className="text-xl text-gray-700 mb-4">
                          Essentials
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Get familiar with how Meta Ads help businesses at all
                          sizes drive measurable outcomes using Facebook,
                          Instagram and Audience Network.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-600 mb-1">
                              Digital Advertising
                            </h4>
                            <p className="text-sm text-gray-600">
                              Lorem ipsum dolor sit amet consectetur. Facilisis
                              at mauris mi feugiat et facilibus.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom section with subheading and content */}
                <div className="p-8 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Subheading
                  </h3>
                  <div className="mb-6">
                    <p className="text-gray-700 italic mb-4">
                      "Whether you're a startup or a global brand, Meta Ads lets
                      you test fast, scale faster, and attribute every dollar."
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold">1.</span>
                      <span className="text-gray-700">
                        Campaign objectives (Awareness, Traffic, Conversions)
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold">2.</span>
                      <span className="text-gray-700">
                        Pixel & Conversions API basics
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold">3.</span>
                      <span className="text-gray-700">
                        Budgeting tips for small vs enterprise clients
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold">4.</span>
                      <span className="text-gray-700">
                        Key metrics: ROAS, CTR, CPA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrow */}
                <div className="flex justify-end p-6 bg-white">
                  <button
                    className="bg-green-400 hover:bg-green-500 text-white rounded-full p-3 transition-colors"
                    title="Next"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
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

export default DomainModule;
