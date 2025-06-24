import Axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { getCookie } from "@/Utils/cookies";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const token = getCookie("saleslensUserData");

const api: AxiosInstance = Axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "x-auth-token": token,
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

api.interceptors.request.use((request) => {
  if (typeof request.headers["x-auth-token"] === "undefined") {
    request.headers["x-auth-token"] = getCookie("saleslensUserData");
  }
  return request;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Domain Knowledge APIs
export const domainKnowledgeAPI = {
  getAll: (params?: any) => api.get("/domain-knowledge", { params }),

  getById: (id: string) => api.get(`/domain-knowledge/${id}`),

  search: (query: string) =>
    api.get(`/domain-knowledge/search?q=${encodeURIComponent(query)}`),

  upload: (formData: FormData) => {
    const headers = {
      ...api.defaults.headers,
      "Content-Type": "multipart/form-data",
    };
    return api.post("/upload/knowledge", formData, { headers });
  },

  delete: (id: string) => api.delete(`/upload/knowledge/${id}`),
};

// Customer Database APIs
export const customerAPI = {
  getAll: (params?: any) => api.get("/customers", { params }),

  getById: (id: string) => api.get(`/customers/${id}`),

  search: (query: string) =>
    api.get(`/customers/search?q=${encodeURIComponent(query)}`),

  upload: (formData: FormData) => {
    const headers = {
      ...api.defaults.headers,
      "Content-Type": "multipart/form-data",
    };
    return api.post("/upload/customer", formData, { headers });
  },

  delete: (id: string) => api.delete(`/upload/customer/${id}`),

  // Generate customer profiles using AI
  generateProfiles: (data: {
    count?: number;
    industries?: string[];
    focusAreas?: string[];
    analysisDepth?: "basic" | "detailed" | "comprehensive";
  }) => api.post("/customers/generate-profiles", data),
};

// Sales Pitch Transcripts APIs
export const pitchAPI = {
  getAll: (params?: any) => api.get("/pitches", { params }),

  getById: (id: string) => api.get(`/pitches/${id}`),

  getTranscript: (id: string) => api.get(`/pitches/transcript/${id}`),

  getAnalytics: () => api.get("/pitches/analytics/summary"),

  search: (query: string) =>
    api.get(`/pitches/search/${encodeURIComponent(query)}`),

  upload: (formData: FormData) => {
    const headers = {
      "Content-Type": "multipart/form-data",
      "x-auth-token": getCookie("saleslensUserData"),
    };
    return api.post("/pitches", formData, { headers });
  },

  update: (id: string, data: any) => api.put(`/pitches/${id}`, data),

  addFeedback: (
    id: string,
    data: { feedbackNotes?: string; successRate?: number }
  ) => api.put(`/pitches/${id}/feedback`, data),

  delete: (id: string) => api.delete(`/pitches/${id}`),

  download: (id: string) =>
    api.get(`/pitches/download/${id}`, { responseType: "blob" }),
};

// Transcripts APIs
export const transcriptAPI = {
  generate: (data: {
    customerProfile: string;
    includeHistoricalData?: boolean;
    industryFocus?: string;
    specificProducts?: string[];
    pitchType?: "discovery" | "demo" | "proposal" | "closing";
  }) => api.post("/transcripts/generate", data),

  getHistory: (params?: any) => api.get("/transcripts/history", { params }),
};

// Practice Chat APIs
export const practiceChatAPI = {
  respond: (data: {
    message: string;
    customerProfile: string;
    conversationHistory?: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
    industryFocus?: string;
    specificProducts?: string[];
    pitchType?: "discovery" | "demo" | "proposal" | "closing";
  }) => api.post("/practice-chat/respond", data),

  analyzeSentiment: (data: {
    message: string;
    context?: {
      customerProfile?: string;
      industryFocus?: string;
      pitchType?: "discovery" | "demo" | "proposal" | "closing";
    };
  }) => api.post("/practice-chat/sentiment-analysis", data),
};

export default api;
