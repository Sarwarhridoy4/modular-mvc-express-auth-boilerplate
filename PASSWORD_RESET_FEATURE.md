# Password Reset Feature Documentation

## Overview

The password reset feature allows users to securely reset their forgotten passwords through a two-step process:

1. **Forgot Password** - User requests a password reset link
2. **Reset Password** - User verifies the token and sets a new password

## API Endpoints

### 1. Forgot Password

**POST** `/api/auth/forgot-password`

Request the password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully",
  "data": null
}
```

**Error Responses:**

- `404` - User not found with this email
- `500` - Email service unavailable

---

### 2. Reset Password

**POST** `/api/auth/reset-password`

Reset the password using the token from email.

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": null
}
```

**Error Responses:**

- `400` - Passwords do not match
- `401` - Invalid or expired reset token
- `422` - Validation error

---

## Database Schema Changes

New fields added to the `User` model:

```prisma
model User {
  // ... existing fields ...
  passwordResetToken    String?       // Unique reset token
  passwordResetExpires  DateTime?     // Token expiration time
}
```

**Migration:** `20260128075628_add_password_reset_fields`

---

## Implementation Details

### Key Files

1. **Service** - [src/app/modules/auth/auth.service.ts](src/app/modules/auth/auth.service.ts)
   - `forgotPassword()` - Generate token and send email
   - `resetPassword()` - Validate token and update password

2. **Controller** - [src/app/modules/auth/auth.controller.ts](src/app/modules/auth/auth.controller.ts)
   - Handles HTTP requests and responses

3. **Validation** - [src/app/modules/auth/auth.validation.ts](src/app/modules/auth/auth.validation.ts)
   - `forgotPasswordSchema` - Email validation
   - `resetPasswordSchema` - Password validation with confirmation

4. **Routes** - [src/app/modules/auth/auth.route.ts](src/app/modules/auth/auth.route.ts)
   - POST `/api/auth/forgot-password`
   - POST `/api/auth/reset-password`

5. **Utilities** - [src/utils/tokenGenerator.ts](src/utils/tokenGenerator.ts)
   - `generateResetToken()` - Creates 32-byte random token
   - `getTokenExpirationTime()` - Sets 10-minute expiration

6. **Email Template** - [src/utils/templates/forgetPassword.ejs](src/utils/templates/forgetPassword.ejs)
   - HTML template for password reset email

---

## Security Features

✅ **Token Generation**

- Uses cryptographically secure random tokens
- 32-byte hex tokens (64 characters)

✅ **Token Expiration**

- Default 10-minute expiration window
- Automatic cleanup on reset or failure

✅ **Password Security**

- Passwords hashed with bcryptjs
- Configurable salt rounds (default: 12)

✅ **Email Verification**

- Token sent only via email
- Cannot reset without valid email access

✅ **Error Handling**

- Generic error messages to prevent user enumeration
- Automatic token cleanup on email failure

---

## Frontend Integration

### Step 1: Request Password Reset

```javascript
// User submits email
const response = await fetch("/api/auth/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com" }),
});
```

### Step 2: User Clicks Email Link

Email contains link: `http://localhost:3000/auth/reset-password?token=abc123...`

### Step 3: Submit New Password

```javascript
const response = await fetch("/api/auth/reset-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: "abc123...",
    password: "newPassword123",
    confirmPassword: "newPassword123",
  }),
});
```

---

## Environment Variables

The feature uses existing environment variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Frontend URL for reset link
FRONTEND_URL=http://localhost:3000

# Password hashing
BYCRYPT_SALT_ROUNDS=12
```

---

## Testing the Feature

### Using cURL

**1. Forgot Password:**

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**2. Reset Password:**

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"<token_from_email>",
    "password":"newPassword123",
    "confirmPassword":"newPassword123"
  }'
```

### Using Postman

1. Create POST request to `/api/auth/forgot-password`
2. Send test email
3. Check database for `passwordResetToken`
4. Copy token and use in `/api/auth/reset-password` request

---

## Error Handling

| Scenario              | Status | Message                                |
| --------------------- | ------ | -------------------------------------- |
| Valid email           | 200    | Password reset email sent successfully |
| User not found        | 404    | User not found with this email         |
| Email service fails   | 500    | Email service unavailable              |
| Invalid token         | 401    | Invalid or expired reset token         |
| Expired token         | 401    | Invalid or expired reset token         |
| Passwords don't match | 400    | Passwords do not match                 |
| Invalid email format  | 422    | Validation error                       |
| Password too short    | 422    | Password must be at least 8 characters |

---

## Token Lifecycle

```
1. User requests reset
   ↓
2. Token generated & saved to DB
   ├─ passwordResetToken: "abc123..."
   └─ passwordResetExpires: "2024-01-28T10:10:00Z"
   ↓
3. Email sent with reset link
   ↓
4. User clicks link & submits new password
   ↓
5. Token validated (must not be expired)
   ↓
6. Password updated & token cleared
   ├─ passwordResetToken: null
   └─ passwordResetExpires: null
```

---

## Future Enhancements

- [ ] Rate limiting on forgot-password endpoint
- [ ] Multi-language email templates
- [ ] Custom token expiration per user type
- [ ] Password history (prevent reuse)
- [ ] Email confirmation before reset
- [ ] Reset attempt logging/audit trail
