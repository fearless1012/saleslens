// Slides API Service for generating training presentations
export interface GeneratePresentationRequest {
  prompt: string;
}

export interface PresentationResponse {
  id: string;
  download: boolean;
  embed: boolean;
}

export interface EmbedResponse {
  url?: string;
  embedUrl?: string;
}

export class SlidesService {
  private static readonly API_BASE_URL =
    "https://api.slidesgpt.com/v1/presentations";
  private static readonly API_KEY = (import.meta as any).env
    .VITE_SLIDES_API_KEY;

  static async generatePresentation(
    prompt: string
  ): Promise<PresentationResponse> {
    try {
      // Debug logging
      console.log("🔑 API Key available:", !!this.API_KEY);
      console.log("🌐 API URL:", `${this.API_BASE_URL}/generate`);

      if (!this.API_KEY) {
        throw new Error("VITE_SLIDES_API_KEY environment variable is not set");
      }

      const response = await fetch(`${this.API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(
          `API request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating presentation:", error);
      throw error;
    }
  }

  static async downloadPresentation(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download presentation: ${response.statusText}`
        );
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading presentation:", error);
      throw error;
    }
  }

  static async getEmbedUrl(id: string): Promise<EmbedResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${id}/embed`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          "Content-Type": "application/json",
        },
        redirect: "manual", // Prevent automatic redirection
      });

      if (response.status === 302 || response.status === 301) {
        const redirectUrl = response.headers.get("location");
        return { url: redirectUrl || undefined };
      }

      if (!response.ok) {
        throw new Error(`Failed to get embed URL: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting embed URL:", error);
      throw error;
    }
  }

  static downloadFile(blob: Blob, filename: string = "presentation.pptx") {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default SlidesService;
