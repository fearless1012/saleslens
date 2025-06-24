// Simple test to check environment variables
console.log("🧪 Environment Variable Test");
console.log("VITE_API_URL:", (import.meta as any).env.VITE_API_URL);
console.log(
  "VITE_SLIDES_API_KEY available:",
  !!(import.meta as any).env.VITE_SLIDES_API_KEY
);
console.log(
  "VITE_SLIDES_API_KEY length:",
  ((import.meta as any).env.VITE_SLIDES_API_KEY || "").length
);

// Test the slides API directly
import SlidesService from "./services/slidesService";

(window as any).testSlides = async () => {
  try {
    console.log("🧪 Testing Slides API...");
    const result = await SlidesService.generatePresentation(
      "Test presentation about AI"
    );
    console.log("✅ Success:", result);
    return result;
  } catch (error) {
    console.error("❌ Error:", error);
    return error;
  }
};

console.log(
  "💡 You can test the slides API by running: testSlides() in the browser console"
);

export {};
