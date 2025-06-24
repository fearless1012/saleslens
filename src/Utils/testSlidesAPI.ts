import SlidesService from "../services/slidesService";

/**
 * Test utility for the Slides API integration
 * Run this to test the API connection and functionality
 */
export const testSlidesAPI = async () => {
  console.log("🧪 Testing Slides API Integration...");

  try {
    // Test 1: Generate a simple presentation
    console.log("📝 Test 1: Generating test presentation...");
    const result = await SlidesService.generatePresentation(
      "Create a simple 3-slide presentation about AI in business"
    );

    console.log("✅ Generation successful:", result);

    if (result.id) {
      // Test 2: Try to get embed URL if available
      if (result.embed) {
        console.log("🔗 Test 2: Getting embed URL...");
        try {
          const embedResponse = await SlidesService.getEmbedUrl(result.id);
          console.log("✅ Embed URL retrieved:", embedResponse);
        } catch (embedError) {
          console.log(
            "⚠️ Embed URL failed (this might be normal):",
            embedError
          );
        }
      }

      // Test 3: Try to download (but don't actually save)
      if (result.download) {
        console.log("📥 Test 3: Testing download capability...");
        try {
          const blob = await SlidesService.downloadPresentation(result.id);
          console.log("✅ Download successful, blob size:", blob.size);
        } catch (downloadError) {
          console.log("❌ Download failed:", downloadError);
        }
      }
    }

    console.log("🎉 Slides API integration test completed!");
    return result;
  } catch (error) {
    console.error("❌ Slides API test failed:", error);
    throw error;
  }
};

// Export for use in development
export default testSlidesAPI;
