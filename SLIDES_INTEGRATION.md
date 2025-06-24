# Slides API Integration

This integration connects the Domain Module to the SlidesGPT API for automatic training presentation generation.

## Setup

1. **Get API Key**: Get your API key from [SlidesGPT](https://slidesgpt.com/)

2. **Environment Configuration**:

   - Copy `.env.example` to `.env`
   - Add your SlidesGPT API key:

   ```
   VITE_SLIDES_API_KEY=your_actual_api_key_here
   ```

3. **Usage**:
   - Navigate to the Domain Module page
   - Click "Generate Presentation"
   - The system will create a comprehensive training presentation about Meta offerings
   - Once generated, you can download the presentation as a PPTX file
   - If embed is available, you can preview the presentation inline

## Features

- ✅ Automatic presentation generation using AI
- ✅ Download presentations as PPTX files
- ✅ Inline presentation preview (when available)
- ✅ Status tracking with user feedback
- ✅ Error handling and user notifications

## API Endpoints Used

- `POST /v1/presentations/generate` - Generate a new presentation
- `GET /v1/presentations/{id}/download` - Download presentation as PPTX
- `GET /v1/presentations/{id}/embed` - Get embed URL for preview

## Generated Content

The presentation includes:

- Meta Ads performance marketing essentials
- AR/VR solutions overview
- AI and API tools information
- Best practices and implementation strategies
- Key metrics (ROAS, CTR, CPA)
- Campaign objectives and budgeting tips
