import React, { useState, useEffect } from "react";
import { domainKnowledgeAPI, customerAPI, pitchAPI } from "@/api";
import Sidebar from "@/components/ui/Sidebar";

interface DomainKnowledge {
  _id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileName: string;
  tags: string[];
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  company: string;
  industry: string;
  position: string;
  status: string;
  createdAt: string;
}

interface Pitch {
  _id: string;
  title: string;
  description: string;
  industry: string;
  successRate: number;
  status: string;
  salesRep: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadSection, setUploadSection] = useState<string>("offerings");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState<string>("");

  // State for dashboard data
  const [domainKnowledge, setDomainKnowledge] = useState<DomainKnowledge[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string>("");

  // State for total counts (for stats display)
  const [totalCounts, setTotalCounts] = useState({
    domainKnowledge: 0,
    customers: 0,
    pitches: 0,
  });

  // State for storing all pitches data to calculate average success rate
  const [allPitches, setAllPitches] = useState<Pitch[]>([]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setDataError("");

        // Fetch data from all three APIs concurrently
        const [domainResponse, customerResponse, pitchResponse] =
          await Promise.all([
            domainKnowledgeAPI.getAll({ limit: 3 }),
            customerAPI.getAll({ limit: 3 }),
            pitchAPI.getAll({ limit: 3 }),
          ]);

        // Fetch total counts for stats
        const [totalDomainResponse, totalCustomerResponse, totalPitchResponse] =
          await Promise.all([
            domainKnowledgeAPI.getAll({}), // No limit for total count
            customerAPI.getAll({}), // No limit for total count
            pitchAPI.getAll({}), // No limit for total count
          ]);

        console.log("Customer response:", customerResponse.data); // Debug log

        setDomainKnowledge(domainResponse.data.data || []);
        setCustomers(customerResponse.data.data || []);
        setPitches(pitchResponse.data.data || []);

        // Set total counts for stats
        setTotalCounts({
          domainKnowledge: totalDomainResponse.data.data?.length || 0,
          customers: totalCustomerResponse.data.data?.length || 0,
          pitches: totalPitchResponse.data.data?.length || 0,
        });

        // Store all pitches for average calculation
        setAllPitches(totalPitchResponse.data.data || []);

        console.log(
          "Domain Knowledge count:",
          domainResponse.data.data?.length
        );
        console.log("Customers count:", customerResponse.data.data?.length);
        console.log("Pitches count:", pitchResponse.data.data?.length);
        console.log("Total counts:", {
          domainKnowledge: totalDomainResponse.data.data?.length || 0,
          customers: totalCustomerResponse.data.data?.length || 0,
          pitches: totalPitchResponse.data.data?.length || 0,
        });
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setDataError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to refresh data after successful upload
  const refreshDashboardData = async () => {
    try {
      if (uploadSection === "offerings") {
        const response = await domainKnowledgeAPI.getAll({ limit: 3 });
        setDomainKnowledge(response.data.data || []);
      } else if (uploadSection === "customers") {
        const response = await customerAPI.getAll({ limit: 3 });
        setCustomers(response.data.data || []);
      } else if (uploadSection === "pitches") {
        const response = await pitchAPI.getAll({ limit: 3 });
        setPitches(response.data.data || []);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Convert FileList to array to add to state
    const newFiles = Array.from(files);
    setUploadedFiles(newFiles);
  };

  const openUploadModal = (section: string) => {
    setUploadSection(section);
    setShowUploadModal(true);
    setUploadError(""); // Clear any previous errors
    setUploadSuccess(""); // Clear any previous success messages
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      // Process each file separately
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        // Add metadata based on upload section
        if (uploadSection === "offerings") {
          formData.append("title", file.name.split(".")[0]);
          formData.append(
            "description",
            `Meta offering document: ${file.name}`
          );
          formData.append("category", "product"); // Changed from "offering" to "product"
          await domainKnowledgeAPI.upload(formData);
        } else if (uploadSection === "customers") {
          formData.append("name", file.name.split(".")[0]);
          formData.append("company", "Imported from file");
          formData.append("industry", "General");
          formData.append("notes", `Customer data from: ${file.name}`);
          await customerAPI.upload(formData);
        } else if (uploadSection === "pitches") {
          formData.append("title", file.name.split(".")[0]);
          formData.append("description", `Sales pitch content: ${file.name}`);
          formData.append("industry", "General");
          formData.append("category", "solution"); // Changed from "sales-pitch" to "solution"
          formData.append("feedbackNotes", "Uploaded via dashboard");
          await pitchAPI.upload(formData);
        }
      }

      // Success - show success message
      const fileCount = uploadedFiles.length;
      const sectionName =
        uploadSection === "offerings"
          ? "Meta Offerings"
          : uploadSection === "customers"
          ? "Customers"
          : "Pitches";
      setUploadSuccess(
        `Successfully uploaded ${fileCount} file(s) to ${sectionName}!`
      );

      // Clear files but keep modal open to show success message
      setUploadedFiles([]);

      // Refresh dashboard data to show newly uploaded content
      await refreshDashboardData();

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess("");
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.message ||
          `Failed to upload files to ${uploadSection}. Please try again.`
      );
    } finally {
      setIsUploading(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
              {/* Dashboard Summary Stats */}
              {!loading && !dataError && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Domain Knowledge Datasets
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {totalCounts.domainKnowledge}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Customer data
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {totalCounts.customers}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <svg
                            className="h-5 w-5 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Pitch transcripts
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {totalCounts.pitches}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                          <svg
                            className="h-5 w-5 text-yellow-600"
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
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Avg Success Rate
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {allPitches.length > 0
                              ? Math.round(
                                  allPitches.reduce(
                                    (sum, pitch) => sum + pitch.successRate,
                                    0
                                  ) / allPitches.length
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  {loading ? (
                    // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow p-5 animate-pulse"
                      >
                        <div className="mb-3">
                          <div className="bg-gray-200 inline-block p-3 rounded-lg w-12 h-12"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : dataError ? (
                    // Error state
                    <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{dataError}</p>
                    </div>
                  ) : (
                    <>
                      {domainKnowledge.length === 0 && (
                        <div className="col-span-3 bg-gray-50 rounded-lg shadow p-8 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No Meta Offerings yet
                          </p>
                          <p className="text-gray-400 text-sm">
                            Upload your first offering to get started!
                          </p>
                        </div>
                      )}

                      {domainKnowledge.slice(0, 3).map((offering) => (
                        <div
                          key={offering._id}
                          className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow"
                        >
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
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-1 capitalize">
                            {offering.category} /{" "}
                            {offering.fileType.toUpperCase()}
                          </div>
                          <h3
                            className="font-medium text-lg mb-3 line-clamp-2"
                            title={offering.title}
                          >
                            {offering.title}
                          </h3>
                          <p
                            className="text-sm text-gray-600 line-clamp-3 mb-3"
                            title={offering.description}
                          >
                            {offering.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {offering.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-1"
                              >
                                {tag}
                              </span>
                            ))}
                            {offering.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{offering.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  <div
                    onClick={() => openUploadModal("offerings")}
                    className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition-all border-2 border-dashed border-gray-200 hover:border-blue-300"
                  >
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
                    <div className="text-xs text-gray-500 mb-1">
                      Module Topic
                    </div>
                    <h3 className="font-medium text-lg mb-3">Create New</h3>
                  </div>
                </div>
              </div>

              {/* Customers Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customers
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
                  {loading ? (
                    // Loading state
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow overflow-hidden animate-pulse"
                      >
                        <div className="bg-gray-200 w-full h-32"></div>
                        <div className="p-4">
                          <div className="h-3 bg-gray-200 rounded mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))
                  ) : dataError ? (
                    // Error state
                    <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{dataError}</p>
                    </div>
                  ) : (
                    <>
                      {customers.length === 0 && (
                        <div className="col-span-3 bg-gray-50 rounded-lg shadow p-8 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No Customers yet
                          </p>
                          <p className="text-gray-400 text-sm">
                            Upload your customer database to get started!
                          </p>
                        </div>
                      )}

                      {customers.slice(0, 3).map((customer, index) => {
                        // Cycle through different placeholder images
                        const imageUrls = [
                          "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                        ];

                        return (
                          <div
                            key={customer._id}
                            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <img
                              src={imageUrls[index % imageUrls.length]}
                              alt={`${customer.name} - ${customer.company}`}
                              className="w-full h-32 object-cover"
                            />
                            <div className="p-4">
                              <div className="text-xs text-gray-500 mb-1 capitalize">
                                {customer.industry} /{" "}
                                {customer.position || "Contact"}
                              </div>
                              <h3
                                className="font-medium text-lg mb-1 truncate"
                                title={customer.name}
                              >
                                {customer.name}
                              </h3>
                              <p
                                className="text-sm text-gray-600 mb-1 truncate"
                                title={customer.company}
                              >
                                {customer.company}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    customer.status === "Active"
                                      ? "bg-green-100 text-green-700"
                                      : customer.status === "Prospect"
                                      ? "bg-blue-100 text-blue-700"
                                      : customer.status === "Lead"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {customer.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    customer.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div
                    onClick={() => openUploadModal("customers")}
                    className="bg-white rounded-lg shadow p-5 cursor-pointer flex flex-col justify-center items-center hover:shadow-md transition-all border-2 border-dashed border-gray-200 hover:border-blue-300"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
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
                    <div className="text-xs text-gray-500 mb-1">
                      Customer Data
                    </div>
                    <h3 className="font-medium text-lg">Create New</h3>
                  </div>
                </div>
              </div>

              {/* Pitches Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pitches
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {loading ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow p-5 animate-pulse"
                      >
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : dataError ? (
                    // Error state
                    <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{dataError}</p>
                    </div>
                  ) : (
                    <>
                      {pitches.length === 0 && (
                        <div className="col-span-3 bg-gray-50 rounded-lg shadow p-8 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium mb-2">
                            No Pitches yet
                          </p>
                          <p className="text-gray-400 text-sm">
                            Upload your sales pitch transcripts to get started!
                          </p>
                        </div>
                      )}

                      {pitches.slice(0, 3).map((pitch, index) => {
                        // Cycle through different avatar images
                        const avatarUrls = [
                          "https://randomuser.me/api/portraits/men/32.jpg",
                          "https://randomuser.me/api/portraits/women/32.jpg",
                          "https://randomuser.me/api/portraits/men/45.jpg",
                          "https://randomuser.me/api/portraits/women/45.jpg",
                          "https://randomuser.me/api/portraits/men/60.jpg",
                          "https://randomuser.me/api/portraits/women/60.jpg",
                          "https://randomuser.me/api/portraits/men/75.jpg",
                          "https://randomuser.me/api/portraits/women/75.jpg",
                        ];

                        return (
                          <div
                            key={pitch._id}
                            className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-start space-x-3 mb-3">
                              <img
                                src={avatarUrls[index % avatarUrls.length]}
                                alt={pitch.salesRep || "Sales Rep"}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-medium truncate"
                                  title={pitch.title}
                                >
                                  {pitch.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                  {pitch.industry} • {pitch.successRate}%
                                  Success Rate
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      pitch.status === "Successful"
                                        ? "bg-green-100 text-green-700"
                                        : pitch.status === "Failed"
                                        ? "bg-red-100 text-red-700"
                                        : pitch.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : pitch.status === "Presented"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {pitch.status}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      pitch.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {pitch.salesRep && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Sales Rep: {pitch.salesRep}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div
                    onClick={() => openUploadModal("pitches")}
                    className="bg-white rounded-lg shadow p-5 cursor-pointer flex flex-col justify-center items-center hover:shadow-md transition-all border-2 border-dashed border-gray-200 hover:border-blue-300"
                  >
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
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
                    <div className="text-xs text-gray-500 mb-1">
                      Pitch Content
                    </div>
                    <h3 className="font-medium text-lg">Create New</h3>
                  </div>
                </div>
              </div>

              {/* Upload Modal */}
              {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {uploadSection === "offerings"
                          ? "Upload Meta Offering"
                          : uploadSection === "customers"
                          ? "Upload Customer"
                          : "Upload Pitch"}
                      </h3>
                      <button
                        onClick={() => setShowUploadModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close upload modal"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        dragActive
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-primary-500"
                      } transition-colors`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        id="modal-file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="modal-file-upload"
                        className="cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-primary-500 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <h3 className="text-xl font-medium mb-1">
                          Drop files here or click to upload
                        </h3>
                        <p className="text-gray-500">
                          {uploadSection === "offerings"
                            ? "Support for PDF, DOCX, TXT (Max 50MB)"
                            : uploadSection === "customers"
                            ? "Support for CSV, XLSX, JSON, TXT - Auto-detects format & fields (Max 20MB)"
                            : "Support for PDF, DOCX, TXT, MP4, MP3 - Auto-extracts call data (Max 100MB)"}
                        </p>
                      </label>
                    </div>

                    {/* Show uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 max-h-40 overflow-y-auto">
                        <h4 className="text-sm font-medium mb-2">
                          Selected Files:
                        </h4>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2"
                          >
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm truncate max-w-xs">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                setUploadedFiles(
                                  uploadedFiles.filter((_, i) => i !== index)
                                )
                              }
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove file"
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
                        ))}
                      </div>
                    )}

                    {/* Success display */}
                    {uploadSuccess && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex">
                          <svg
                            className="h-5 w-5 text-green-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="ml-2 text-sm text-green-700">
                            {uploadSuccess}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error display */}
                    {uploadError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="ml-2 text-sm text-red-700">
                            {uploadError}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setUploadedFiles([]);
                          setUploadError("");
                          setUploadSuccess("");
                        }}
                        className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isUploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                        onClick={handleUpload}
                        disabled={isUploading}
                        aria-label="Upload files"
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>
                </div>
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

export default Dashboard;
