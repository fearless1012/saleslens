<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sales LMS Project

This is a Learning Management System (LMS) for sales training with AI features. The system allows admins to create AI-generated learning modules and trainees to access the modules and interact with an AI chatbot.

## Key Components

- Backend: Node.js with Express, MongoDB via Mongoose, JWT authentication, and OpenAI integration
- Frontend: React.js with React Bootstrap, React Router, React Quill editor
- Two user roles: admin (content creators) and trainee (sales hires)
- AI features: content generation and conversational AI chatbot

## Code Patterns

- RESTful API endpoints with controller-service pattern
- Context API for state management
- Protected routes based on user roles

When modifying code:

- Maintain consistent error handling with try-catch blocks
- Follow the existing component structure
- Ensure responsive design for all UI components
- Validate inputs on both client and server sides
