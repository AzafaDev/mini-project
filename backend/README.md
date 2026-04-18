# Event Management Platform - Backend

## Overview

Backend API for an event management platform built with Express.js, TypeScript, and PostgreSQL (via Prisma ORM).

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (cookies-based)
- **File Storage:** Cloudinary
- **Email:** Resend
- **Validation:** Zod
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)
- Resend account (for emails)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-secret-key-here"

# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (Email)
RESEND_API_KEY=your-resend-api-key
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run seed
```

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── constants.ts     # Application constants
│   │   ├── prisma.ts       # Prisma client instance
│   │   ├── resend.ts       # Email service config
│   │   └── cloudinary.ts   # Cloudinary config
│   │
│   ├── modules/            # Feature modules (MVC pattern)
│   │   ├── auth/           # Authentication (register, login, etc.)
│   │   ├── events/         # Event management
│   │   ├── transaction/    # Transaction/payment handling
│   │   ├── points/         # Points/rewards system
│   │   └── reviews/        # Event reviews & ratings
│   │
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── validate.ts     # Request validation
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   └── isEventOwner.ts # Authorization check
│   │
│   ├── utils/              # Utility functions
│   │   ├── sendEmail.ts    # Email sending
│   │   ├── generateToken.ts# Token generation
│   │   ├── cronJobs.ts     # Scheduled tasks
│   │   └── ...
│   │
│   ├── app.ts              # Express app entry point
│   └── main.ts             # Server startup
│
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
│
└── package.json
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| POST | `/verify-email` | Verify email with token |
| POST | `/resend-verification` | Resend verification email |
| GET | `/me` | Get current user |
| PUT | `/update-profile` | Update user profile |
| PUT | `/change-password` | Change password |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password/:token` | Reset password |

### Events (`/api/events`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all events (with filters) |
| GET | `/:id` | Get single event |
| POST | `/` | Create new event (Organizer) |
| PUT | `/:id` | Update event (Organizer) |
| DELETE | `/:id` | Soft delete event (Organizer) |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create transaction |
| GET | `/me` | Get my transactions |
| GET | `/organizer` | Get organizer's transactions |
| POST | `/:id/payment-proof` | Upload payment proof |
| POST | `/:id/accept` | Accept transaction (Organizer) |
| POST | `/:id/reject` | Reject transaction (Organizer) |
| POST | `/:id/cancel` | Cancel transaction |

### Points (`/api/points`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's points balance |
| GET | `/history` | Get points transaction history |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/event/:eventId` | Get reviews for event |
| POST | `/` | Create review (after event) |

## Authentication Flow

### Registration with Email Verification

1. User submits registration data (email, password, name, etc.)
2. Backend creates user with `isVerified: false`
3. Backend sends verification email with token
4. User clicks link in email → backend verifies and sets `isVerified: true`
5. User can now login

### Token Types

- **temp_token**: Used during email verification flow (30 min expiry)
- **auth_token**: Used for authenticated requests (JWT, cookie-based)

## Transaction Flow

```
WAITING_PAYMENT → WAITING_CONFIRMATION → DONE
       ↓                    ↓              ↑
    EXPIRED             REJECTED       CANCELED
```

1. **WAITING_PAYMENT**: Transaction created, customer uploads payment proof within 2 hours
2. **WAITING_CONFIRMATION**: Payment proof uploaded, organizer accepts/rejects within 3 days
3. **DONE**: Transaction completed successfully
4. **EXPIRED**: No payment proof uploaded within 2 hours
5. **REJECTED**: Organizer rejected the transaction (points/vouchers rolled back)
6. **CANCELED**: Customer canceled (points/vouchers rolled back, seats restored)

## Common Issues

### "Unauthorized: No token provided"

- Make sure you're sending the `auth_token` cookie with requests
- Check that you're logged in

### "Invalid or expired token"

- Your authentication token has expired
- Try logging in again

### "Email already exists"

- User with that email already registered
- Try login or use forgot password

### Database connection errors

- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## License

ISC