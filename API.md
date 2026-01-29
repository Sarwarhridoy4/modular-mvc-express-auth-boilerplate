# API Documentation

## Base URL

`http://localhost:5000/api/v1`

## Authentication Endpoints

### Sign Up

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login (Two-Step OTP Verification)

**Step 1: Verify Credentials and Send OTP**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent to your email. Valid for 5 minutes",
  "data": {
    "email": "john@example.com",
    "requiresOTP": true
  }
}
```

**Step 2: Verify OTP and Complete Login**

```http
POST /api/v1/auth/login/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CASHIER",
    "isActive": true,
    "createdAt": "2026-01-28T00:00:00.000Z",
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

**Security Features:**
- OTP expires after 5 minutes
- Rate limiting: 3 OTP requests per 30 minutes
- Account blocked for 10 minutes after exceeding rate limit
- Invalid OTP returns HTTP 401 (Unauthorized)

### Logout

```http
POST /api/v1/auth/logout
```

### Forgot Password

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully",
  "data": null
}
```

### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": null
}
```

### Request OTP (One-Time Password)

```http
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully to your email",
  "data": null
}
```

**Rate Limiting:**

- Maximum 3 OTP requests per 30-minute window
- 10-minute blocking period after exceeding limit
- Returns HTTP 429 (Too Many Requests) when rate limit exceeded

**Response on Rate Limit:**

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many OTP requests. Please try again after 10 minutes.",
  "data": null
}
```

### Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CASHIER"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

**OTP Features:**

- 6-digit random OTP code
- 5-minute expiration window
- Automatic email delivery to registered email
- Time-based blocking after 3 requests in 30 minutes
- Automatic reset after 30-minute window expires

## User Endpoints

### Get All Users (Admin Only)

```http
GET /api/v1/users
Authorization: Bearer <access_token>
```

## User Roles

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative access
- **CASHIER**: Basic access (default role)
