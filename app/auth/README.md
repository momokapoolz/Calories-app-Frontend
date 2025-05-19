# Authentication System

This directory contains the authentication system for the NutriTrack application. The system supports both token-based and cookie-based authentication as specified in the API requirements.

## Authentication Flow

### Registration
- Users can register at `/register`
- Registration requires name, email, password, and profile information
- Upon successful registration, users are automatically logged in and redirected to the dashboard

### Login
- Users can log in at `/login`
- Two authentication methods are supported:
  - **Token-based authentication**: Tokens are stored in localStorage
  - **Cookie-based authentication**: Tokens are stored in HTTP-only cookies

### Logout
- Users can log out by clicking the logout button in the navigation bar
- This clears tokens from both localStorage and cookies

## API Endpoints

### Registration
- **URL**: `/register`
- **Method**: POST
- **Request Body**: User registration data

### Token-based Login
- **URL**: `/login`
- **Method**: POST
- **Request Body**: Email and password

### Cookie-based Login
- **URL**: `/auth/login`
- **Method**: POST
- **Request Body**: Email and password

### Refresh Token
- **URL**: `/auth/refresh`
- **Method**: POST
- **Required Cookies**: refresh-id

### Logout
- **URL**: `/auth/logout`
- **Method**: POST
- **Headers**: Authorization: Bearer {access_token}

## Implementation Details

### Authentication Service
- Located at `/lib/auth-service.ts`
- Provides functions for all authentication operations
- Handles token storage and retrieval

### Protected Routes
- Use the `<ProtectedRoute>` component to protect routes that require authentication
- Example: Wrap dashboard or settings pages with this component

### Navigation
- The `<MainNav>` component handles displaying login/logout buttons based on authentication status
- It also provides navigation links to other parts of the application