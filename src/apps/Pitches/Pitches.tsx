import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { pitchAPI } from "@/api";

interface Pitch {
  id: string;
  title: string;
  date: string;
  customer: string;
  salesRep: string;
  product: string;
  callResult: string;
  context: string;
  transcript: string;
  description?: string;
  industry?: string;
  feedbackNotes?: string;
  filename?: string;
}

const Pitches: React.FC = () => {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchPitches = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      const response = await pitchAPI.getAll();

      if (response.data && response.data.data) {
        const pitchesData = response.data.data;
        setPitches(pitchesData);
        if (pitchesData.length > 0) {
          setSelectedPitch(pitchesData[0]);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.error("Error fetching pitches:", err);
      setError("Failed to fetch pitches. Please try again.");

      // Fallback to mock data if API fails
      const mockPitch: Pitch = {
        id: "mock-1",
        title: "RetailMax Analytics Sale",
        date: "2024-03-15",
        customer: "Jennifer Martinez, CTO at RetailMax Solutions",
        salesRep: "Alex Thompson",
        product: "Llama 4 AI Model - Customer Analytics Suite",
        callResult: "Successful Sale",
        context:
          "RetailMax is struggling with customer churn analysis and needs predictive insights.",
        transcript: `Alex: Good morning Jennifer, thanks for taking my call. I understand RetailMax is looking to better understand customer behavior patterns?

Jennifer: Yes, we're losing customers and can't pinpoint why. Our current analytics are too basic.

Alex: That's exactly what Llama 4's customer analytics suite addresses. It can process your transaction data, support tickets, and engagement metrics to predict churn risk weeks in advance. For a retailer your size, we typically see 25-30% reduction in churn within the first quarter.

Jennifer: That sounds promising. What about implementation complexity?

Alex: Great question. We handle the heavy lifting - data integration, model training, and dashboard setup. Your team would see results in 2-3 weeks. We also provide ongoing optimization.

Jennifer: I'm impressed. What's the investment looking like?

Alex: For your customer base, we're looking at $15K monthly, but the churn reduction typically saves clients $50-80K monthly. Plus, we offer a 60-day money-back guarantee.

Jennifer: Let's schedule a demo with my analytics team. This could be exactly what we need.`,
      };
      setPitches([mockPitch]);
      setSelectedPitch(mockPitch);
    } finally {
      setLoading(false);
    }
  };

  const loadRealData = () => {
    fetchPitches();
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchPitches();
      return;
    }

    try {
      setLoading(true);
      const response = await pitchAPI.search(query);
      if (response.data && response.data.data) {
        const pitchesData = response.data.data;
        setPitches(pitchesData);
        if (pitchesData.length > 0) {
          setSelectedPitch(pitchesData[0]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    const timer = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    // Initialize by trying to fetch real data first
    fetchPitches();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="ml-64 w-full">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Pitches</h1>
              <div className="flex items-center space-x-4">
                {error && <div className="text-sm text-red-600">{error}</div>}
                <button
                  onClick={loadRealData}
                  disabled={loading}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Loading..." : "Load Latest Data"}
                </button>
                <div className="relative">
                  <input
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    placeholder="Search pitches..."
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
              {/* Data Source Indicator */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Currently showing demo data. Click "Load Latest Data" to
                    fetch real pitches.
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Pitch Selection Pills */}
                  {pitches.length > 1 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {pitches.map((pitch) => (
                          <button
                            key={pitch.id}
                            onClick={() => setSelectedPitch(pitch)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedPitch?.id === pitch.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {pitch.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-6 h-[calc(100vh-200px)]">
                    {/* Left Panel - Pitch Details */}
                    <div className="w-1/3 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                      {selectedPitch && (
                        <>
                          {/* Profile Image */}
                          <div className="mb-6 flex justify-center">
                            <img
                              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                              alt="Customer"
                              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                          </div>

                          {/* Pitch Details */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Date:
                              </h3>
                              <p className="text-lg">{selectedPitch.date}</p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Customer:
                              </h3>
                              <p className="text-lg">
                                {selectedPitch.customer}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Sales Rep:
                              </h3>
                              <p className="text-lg">
                                {selectedPitch.salesRep}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Product:
                              </h3>
                              <p className="text-lg">{selectedPitch.product}</p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Call Result:
                              </h3>
                              <p className="text-lg font-semibold">
                                {selectedPitch.callResult}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-blue-100">
                                Context:
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {selectedPitch.context}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Panel - Transcript */}
                    <div className="w-2/3 bg-white rounded-lg shadow p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Transcript
                      </h2>

                      {selectedPitch && (
                        <div className="bg-gray-50 rounded-lg p-4 h-full overflow-y-auto">
                          <div className="prose prose-sm max-w-none">
                            {selectedPitch.transcript
                              .split("\n")
                              .map((line, index) => {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return <br key={index} />;

                                // Style speaker names differently
                                if (
                                  trimmedLine.includes(":") &&
                                  !trimmedLine.startsWith(" ")
                                ) {
                                  const [speaker, ...rest] =
                                    trimmedLine.split(":");
                                  return (
                                    <p key={index} className="mb-3">
                                      <span className="font-semibold text-blue-600">
                                        {speaker}:
                                      </span>
                                      <span className="ml-1">
                                        {rest.join(":")}
                                      </span>
                                    </p>
                                  );
                                }

                                return (
                                  <p key={index} className="mb-3 text-gray-700">
                                    {trimmedLine}
                                  </p>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="text-center text-red-600 mt-8">{error}</div>
              )}

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

export default Pitches;
