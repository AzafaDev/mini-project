# Authentication Flow Documentation

This document explains the authentication system in the Event Management Platform.

## Overview

The system uses JWT-based authentication with two types of tokens:
- **Temporary Token (`temp_token`)**: Used during email verification
- **Authentication Token (`auth_token`)**: Used for authenticated requests

## User Roles

- **CUSTOMER**: Regular users who can browse and buy tickets
- **ORGANIZER**: Users who can create and manage events

## Registration Flow

```
User submits registration data
         ↓
Backend validates & sanitizes input
         ↓
Check if email already exists
         ↓
┌─────────────────────────────────────┐
│ Email exists but NOT verified?      │
│ → Rehash password, resend token    │
└─────────────────────────────────────┘
         ↓
Create user with:
  - isVerified: false
  - verifyToken: <6-digit code>
  - verifyTokenExpiresAt: 24 hours
         ↓
Generate unique referral code
         ↓
If referral code provided:
  - Award referrer with 10,000 points
  - Create 10% discount coupon for new user
         ↓
Send verification email with token
         ↓
Set temp_token cookie (30 min expiry)
         ↓
Return: { success: true, requiresVerification: true }
```

## Email Verification Flow

```
User clicks verification link in email
         ↓
POST /api/auth/verify-email with token
         ↓
Backend finds user with:
  - verifyToken = provided token
  - verifyTokenExpiresAt > now()
         ↓
If token invalid/expired:
  → Return error: "Invalid or expired token"
         ↓
Update user:
  - isVerified: true
  - verifyToken: null
  - verifyTokenExpiresAt: null
         ↓
Generate auth_token (JWT)
         ↓
Set auth_token cookie (httpOnly, secure)
         ↓
Clear temp_token cookie
         ↓
Return: { success: true, user: {...} }
```

## Login Flow

```
User submits email & password
         ↓
Backend finds user by email
         ↓
If user not found:
  → Return error: "Invalid email or password"
         ↓
Compare password with hashed password
         ↓
If password incorrect:
  → Return error: "Invalid email or password"
         ↓
Check if user is verified
         ↓
┌─────────────────────────────────────┐
│ User NOT verified?                  │
│ → Generate new verifyToken          │
│ → Send verification email           │
│ → Return: requiresVerification: true│
│ → Set temp_token cookie             │
└─────────────────────────────────────┘
         ↓
User IS verified
         ↓
Generate auth_token with userId & role
         ↓
Set auth_token cookie
         ↓
Clear temp_token (if exists)
         ↓
Return: { success: true, user: {...} }
```

## Token Types Comparison

| Aspect | temp_token | auth_token |
|--------|------------|------------|
| Purpose | Email verification flow | Authenticated requests |
| Expiry | 30 minutes | No expiry (session-based) |
| Cookie Name | `temp_token` | `auth_token` |
| Contains | userId, userEmail | userId, userRole |
| HttpOnly | Yes | Yes |
| SameSite | strict | strict |
| Secure | production only | production only |

## Password Reset Flow

### Step 1: Request Reset

```
User enters email in "Forgot Password" form
         ↓
POST /api/auth/forgot-password
         ↓
Backend finds user by email
         ↓
If user not found:
  → Return generic message (security: don't reveal if email exists)
         ↓
Generate reset token (32 char hex)
         ↓
Update user:
  - resetPasswordToken: token
  - resetPasswordTokenExpiresAt: 15 minutes
         ↓
Send password reset email
         ↓
Return: { success: true, message: "If email exists, reset link sent" }
```

### Step 2: Reset Password

```
User clicks reset link in email
         ↓
POST /api/auth/reset-password/:token
         ↓
Backend finds user with:
  - resetPasswordToken = provided token
  - resetPasswordTokenExpiresAt > now()
         ↓
If token invalid/expired:
  → Return error: "Invalid or expired token"
         ↓
Validate new password (min 8 chars)
         ↓
Hash new password with bcrypt (10 rounds)
         ↓
Update user:
  - password: hashed password
  - resetPasswordToken: null
  - resetPasswordTokenExpiresAt: null
         ↓
Return: { success: true, user: {...} }
```

## Middleware Usage

### verifyTempToken
Used for routes that need unverified user context:
- Resend verification email

### verifyAuthToken
Used for protected routes:
- Get current user profile
- Update profile
- Change password
- Create/view transactions
- Create/update events (organizer only)

### isOrganizer
Used after verifyAuthToken for organizer-only routes:
- Create event
- Update event
- Delete event
- Accept/reject transactions

## Security Considerations

1. **Passwords**: Hash with bcrypt (10 rounds) before storing
2. **Tokens**: Signed with JWT_SECRET
3. **Cookies**: httpOnly, secure (production), sameSite: strict
4. **Email Existence**: Generic messages to prevent enumeration
5. **Token Expiry**: Verification tokens expire in 24 hours
6. **Reset Tokens**: Expire in 15 minutes

## Common Errors

| Error Message | Cause |
|---------------|-------|
| "Invalid email or password" | Wrong email or password |
| "Invalid or expired token" | Verification/reset token expired or invalid |
| "Account already verified" | User tries to verify already-verified account |
| "Unauthorized: No token provided" | Missing auth_token cookie |
| "Access denied" | User is not an ORGANIZER |