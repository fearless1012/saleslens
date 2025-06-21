# Frontend Environment Variables Guide

This document explains how environment variables work in the React frontend of the Sales LMS application.

## How Environment Variables Work in React

In React applications created with Create React App, environment variables need to follow specific rules:

1. **Naming Convention**: All environment variables must be prefixed with `REACT_APP_` to be accessible in the React application.

2. **No Secrets**: Since the React app runs in the browser, any environment variables will be included in the built JavaScript bundle. Never include secrets like API keys here.

3. **Access Method**: Environment variables are accessed with `process.env.REACT_APP_VARIABLE_NAME`.

4. **Build Time Only**: Environment variables are embedded during build time, not at runtime. If you change an environment variable, you need to restart the development server.

## Current Environment Variables

The following environment variables are defined in the .env file:

- `REACT_APP_NAME`: The name of the application displayed in the UI
- `REACT_APP_VERSION`: The current version of the application
- `REACT_APP_ENVIRONMENT`: The current environment (development, production, etc.)
- `REACT_APP_BACKEND_URL`: The URL of the backend server (primarily for documentation, as the proxy in package.json handles this in development)

## Different Environment Files

You can create different environment files for different environments:

- `.env`: Default environment variables
- `.env.development`: Development-specific variables (when running `npm start`)
- `.env.production`: Production-specific variables (when running `npm run build`)
- `.env.local`: Local overrides that are not committed to version control

## Example Usage

Here's how to use these environment variables in your React components:

```jsx
function MyComponent() {
  return (
    <div>
      <h1>{process.env.REACT_APP_NAME}</h1>
      <p>Version: {process.env.REACT_APP_VERSION}</p>
      <p>Environment: {process.env.REACT_APP_ENVIRONMENT}</p>
    </div>
  );
}
```

## Adding New Environment Variables

To add a new environment variable:

1. Add it to the appropriate .env file with the `REACT_APP_` prefix
2. Restart the development server
3. Access it in your code using `process.env.REACT_APP_YOUR_VARIABLE`
