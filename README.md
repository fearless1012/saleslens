# Sales Learning Management System

A Learning Management System (LMS) for new sales hires with AI-generated learning modules and an AI chatbot that can answer questions based on the learning material.

## Features

### For Admins (Company)

- Create AI-generated learning modules by providing a topic, key points, and target audience
- Customize AI-generated content with a rich text editor
- Add knowledge base Q&A pairs to train the AI chatbot
- Manage and update existing modules

### For Trainees (Sales Hires)

- Access a dashboard of available training modules
- Track progress through modules
- Interact with an AI chatbot trained on the module's content
- Ask questions and get personalized assistance

## Database Schema

### User Schema

The user table stores information for both admin and trainee users with role-based access control:

| Field     | Type   | Description                                              |
| --------- | ------ | -------------------------------------------------------- |
| name      | String | Full name of the user (required)                         |
| email     | String | User's email address (required, unique, lowercase)       |
| password  | String | Hashed password using bcrypt (never stored in plaintext) |
| role      | String | User role: "admin" or "trainee" (default: "trainee")     |
| createdAt | Date   | Timestamp when the user account was created              |

Authentication features:

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication
- Role-based access control for protected routes

Example usage:

```javascript
// Creating an admin user
const adminUser = new User({
  name: "Admin Name",
  email: "admin@example.com",
  password: "securePassword", // will be automatically hashed
  role: "admin",
});

// Creating a trainee user
const traineeUser = new User({
  name: "Trainee Name",
  email: "trainee@example.com",
  password: "securePassword", // will be automatically hashed
  // role defaults to "trainee"
});
```

## Technology Stack

### Backend

- Node.js and Express
- MongoDB for database
- JWT for authentication
- OpenAI integration for AI-generated content and chatbot

### Frontend

- React.js
- React Bootstrap for UI components
- React Router for navigation
- React Quill for rich text editing
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd sales-lms
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Configure environment variables
   Create a `.env` file in the backend directory with the following:

```
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

5. Start the backend server

```bash
cd ../backend
npm run dev
```

6. Start the frontend development server

```bash
cd ../frontend
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## Usage

### Admin User

1. Register with the role set to "admin"
2. Login to access the admin dashboard
3. Use the "Create New Module" button to create training modules
4. You can generate content with AI or write it manually
5. Add knowledge base items to train the AI chatbot

### Trainee User

1. Register with the role set to "trainee" (default)
2. Login to access the trainee dashboard
3. Select a module to begin training
4. Track your progress through modules
5. Ask questions to the AI chatbot for personalized assistance

## License

This project is licensed under the MIT License.
