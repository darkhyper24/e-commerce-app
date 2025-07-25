# Payment Gateway Authentication System Documentation

## Overview

This document details the authentication system implemented for the Payment Gateway application. The system uses a JWT (JSON Web Token) based authentication flow with both access and refresh tokens stored as HTTP-only cookies, providing a secure and modern authentication solution.

## Architecture

The authentication system follows these core principles:

1. **Stateless Authentication**: Using JWT tokens rather than server-side sessions
2. **Token Segregation**: Separate short-lived access tokens and long-lived refresh tokens
3. **Secure Storage**: HTTP-only cookies to prevent XSS (Cross-Site Scripting) attacks
4. **CSRF Protection**: SameSite cookie attribute to mitigate CSRF (Cross-Site Request Forgery)
5. **Path Restriction**: Limiting refresh token exposure to specific endpoints

## User Data Model

The `users` table stores user information with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Stored as hashed values
  phone TEXT
);
```

## Authentication Flow

### Registration Flow
1. User submits registration data (username, email, password, phone)
2. Server validates the data and checks for existing users
3. Password is hashed using bcrypt or PBKDF2
4. User record is created in database
5. Access and refresh tokens are generated
6. Tokens are set as HTTP-only cookies
7. User data (excluding password) is returned to client

### Login Flow
1. User submits credentials (email, password)
2. Server validates credentials against database
3. If valid, access and refresh tokens are generated
4. Tokens are set as HTTP-only cookies
5. User data is returned to client

### Authentication Check Flow
1. Client makes request to protected route
2. Server middleware extracts access token from cookie
3. Token is verified using secret key
4. If valid, request proceeds with user data attached
5. If expired, client is directed to refresh token

### Token Refresh Flow
1. Client calls refresh token endpoint
2. Server extracts refresh token from cookie
3. Token is verified using refresh token secret
4. If valid, new access token is generated
5. New access token is set as HTTP-only cookie
6. Success response is sent to client

### Logout Flow
1. Client calls logout endpoint
2. Server clears access and refresh token cookies
3. Success response is sent to client

## API Endpoints

### `POST /api/auth/register`

Registers a new user in the system.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890" // Optional
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Error Responses:**
- `400 Bad Request`: User already exists or invalid data
- `500 Internal Server Error`: Registration failed

**Cookies Set:**
- `accessToken`: HTTP-only, secure in production, SameSite=strict, 15m expiry
- `refreshToken`: HTTP-only, secure in production, SameSite=strict, path=/api/auth/refresh-token, 7d expiry

### `POST /api/auth/login`

Authenticates a user and issues tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-string",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Login failed

**Cookies Set:**
- `accessToken`: HTTP-only, secure in production, SameSite=strict, 15m expiry
- `refreshToken`: HTTP-only, secure in production, SameSite=strict, path=/api/auth/refresh-token, 7d expiry

### `POST /api/auth/refresh-token`

Refreshes the access token using the refresh token.

**Request Body:** None (uses refresh token cookie)

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Refresh token not found or invalid
- `403 Forbidden`: Invalid refresh token

**Cookies Set:**
- `accessToken`: Updated HTTP-only cookie with new token and 15m expiry

### `POST /api/auth/logout`

Logs out a user by clearing authentication cookies.

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `accessToken`
- `refreshToken`

### `GET /api/auth/profile`

Returns the authenticated user's profile (protected route).

**Request Body:** None (uses access token cookie)

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated or token expired
- `403 Forbidden`: Invalid token

## Middleware Functions

### `hashPasswordMiddleware`

Located in `middleware/passwordMiddleware.js`, this middleware intercepts requests to hash passwords before they reach controllers.

**Functionality:**
- Checks if request body contains a `password` field
- If yes, hashes the password using cryptographic functions
- Replaces plain text password with hashed value
- Passes control to the next middleware or controller

**Implementation:**
```javascript
const hashPasswordMiddleware = async (req, res, next) => {
  try {
    if (req.body && req.body.password) {
      req.body.password = await hashPassword(req.body.password);
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Password processing failed' });
  }
};
```

### `authenticateToken`

Located in `middleware/authMiddleware.js`, this middleware protects routes by verifying the JWT access token.

**Functionality:**
- Extracts the access token from cookies
- Verifies the token signature using the secret key
- Decodes the token payload
- Attaches the user data to the request object
- Handles token expiration by sending appropriate error

**Implementation:**
```javascript
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', tokenExpired: true });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

## Security Considerations

### Token Storage
- Access and refresh tokens are stored in HTTP-only cookies
- HTTP-only prevents JavaScript access (protects against XSS)
- SameSite=strict prevents CSRF attacks
- In production, Secure flag ensures cookies only sent over HTTPS

### Password Security
- Passwords are never stored in plain text
- Password hashing uses either bcrypt or PBKDF2 with salt
- Hash functions are slow by design to prevent brute force attacks

### Token Refresh Mechanism
- Access tokens have short lifespan (15 minutes)
- Refresh tokens have longer lifespan (7 days)
- Refresh token has path restriction to limit exposure
- Token refresh creates a new access token only

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true // Allows cookies to be sent cross-origin
}));
```

## Frontend Integration

The frontend uses these key methods to interact with the authentication system:

1. **Register**: Send user data to `/api/auth/register` endpoint
2. **Login**: Send credentials to `/api/auth/login` endpoint
3. **API Requests**: Include `credentials: 'include'` to send cookies
4. **Token Refresh**: Detect 401 responses with `tokenExpired: true` and call refresh endpoint
5. **Logout**: Call logout endpoint and clear local state

Example frontend API call:
```javascript
fetch('http://localhost:3000/api/auth/profile', {
  method: 'GET',
  credentials: 'include' // Important for cookies
})
```

## Error Handling

The authentication system provides specific error messages to help troubleshoot issues:

- **Registration Errors**: Username/email already exists, validation errors
- **Login Errors**: Invalid credentials
- **Token Errors**: Missing token, expired token, invalid token
- **Server Errors**: Database connection issues, hashing failures

Each error returns an appropriate HTTP status code and a JSON response with error details.