# API Configuration Guide

## Overview

This document explains the API configuration for the NutriTrack application and the changes made to fix API fetch issues.

## Changes Made

### 1. Improved Error Handling

The auth-service.ts file has been updated with better error handling:
- Added a centralized `handleApiResponse` function to consistently process API responses
- Proper content-type checking for JSON responses
- Detailed error messages extracted from API responses
- Try/catch blocks around all API calls with proper error logging

### 2. CORS Configuration

- Added `mode: 'cors'` to all fetch requests to properly handle Cross-Origin Resource Sharing
- Added `credentials: 'include'` where needed to ensure cookies are sent with requests
- Added `Accept: 'application/json'` header to all requests

### 3. Environment Variable Support

- Created `.env.local` file to configure the API URL
- Updated auth-service.ts to use the environment variable with a fallback

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
```

### 4. Improved Logout Handling

- Logout function now clears local storage even if the API call fails
- Added proper header handling with TypeScript types
- Only adds Authorization header if token exists

## API Implementation

The application now uses Axios for API calls instead of the Fetch API. This provides several benefits:

1. **Consistent Interface**: Axios provides a more consistent API across different browsers.
2. **Interceptors**: Request and response interceptors for global error handling and authentication.
3. **Automatic JSON Transformation**: Axios automatically transforms JSON responses.
4. **Request/Response Cancellation**: Better request cancellation capabilities.

### API Client

The app uses a centralized API client (`lib/api-client.ts`) which:

- Sets the base URL from environment variables
- Configures default headers
- Sets up interceptors for authentication and error handling
- Automatically attaches authentication tokens to requests

### Authentication

Authentication is handled through the `lib/auth-service.ts` file, which:

- Manages login (both token and cookie-based)
- Handles user registration
- Provides token refresh functionality
- Manages logout and local storage cleanup

## Configuration

### Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_URL`: The base URL for API requests

These can be configured in the `.env.local` file at the root of the project.

### API Endpoints

The application interacts with the following API endpoints:

- `/register` - User registration
- `/login` - Token-based authentication
- `/auth/login` - Cookie-based authentication
- `/auth/refresh` - Token refresh
- `/auth/logout` - User logout

## Troubleshooting

If you encounter API fetch issues:

1. Check that your backend server is running at the URL specified in `.env.local`
2. Ensure CORS is properly configured on your backend server
3. Check browser console for detailed error messages
4. Verify network requests in browser developer tools

## Server-Side Rendering (SSR) Considerations

Next.js applications perform server-side rendering, which can cause issues with libraries like Axios that expect to run in a browser environment. The following changes were made to prevent hydration errors:

1. **Conditional API Client Configuration**: The API client checks if it's running in a browser environment before configuring certain options and interceptors.

2. **Safe Local Storage Access**: All localStorage access is wrapped in helper functions that check for browser environment first.

3. **Improved Error Handling**: More detailed error handling and environment-specific error messages.

4. **Debug Utilities**: Added network debugging tools to help diagnose connection issues.

### Common Issues and Solutions

#### Hydration Errors

If you see errors like:

```
Hydration failed because the server rendered HTML didn't match the client.
```

This is usually because code that should only run on the client is trying to run during server-side rendering. Make sure:

1. All browser-specific code is wrapped in conditional checks: `if (typeof window !== 'undefined') { ... }`
2. Components that use browser APIs are marked with `"use client"` directive
3. Data fetching during initial render is handled properly

#### Network Errors

For network errors like:

```
AxiosError: Network Error
Error: No response received from server
```

Check the following:

1. API server is running and accessible
2. CORS is properly configured on the backend
3. Network requests aren't being blocked by firewalls or browser settings
4. Proper error handling is implemented (see the updated code)