# Kinetix Events - Event Management & Ticketing Platform

Full-stack event ticketing system with real-time seat availability, voucher/coupon system, loyalty points, referral program, and organizer analytics.

## About this project

This was a scoped bootcamp mini-project built with one teammate, not solo. I carried backend and most of the frontend; my teammate contributed a smaller share. Built with Claude Code assisting on implementation across the scope I owned — my contribution was the module design (auth, events/reviews, transactions, discounts/points), API structure, and the testing/debugging.

## Features

- **User Authentication** – JWT-based auth with email verification, password reset, and role-based access (Customer / Organizer)
- **Event Management** – Create, edit (soft delete), browse with advanced filters (category, location, price, date) and pagination
- **Ticket Types** – Support for multiple ticket tiers (General, VIP) with independent pricing and availability
- **Transaction Flow** – Create transaction → upload payment proof → organizer approval → ticket confirmation
- **Discount System** – Event‑specific vouchers and system‑wide coupons (percentage/fixed), single‑use
- **Loyalty Points** – Earn points on purchases (configurable multiplier), redeem points for future orders (max per transaction)
- **Referral Program** – Unique referral codes; referrer gets points, new user gets a discount coupon
- **Event Reviews** – Users can rate/comment on events they attended, with average rating display
- **Organizer Dashboard** – Revenue charts, ticket sales stats, attendee lists, voucher management
- **Email Notifications** – Verification, password reset, transaction acceptance/rejection (via Resend)
- **File Uploads** – Cloudinary integration for event images, profile pictures, payment proofs
- **Modern Frontend** – React 19, Tailwind CSS, Zustand state management, Recharts, Formik + Yup validation

## Tech Stack

**Backend**

- Node.js + Express (TypeScript)
- Prisma ORM (PostgreSQL)
- JWT authentication (httpOnly cookies)
- Cloudinary (image hosting)
- Resend (email delivery)
- Zod (validation)

**Frontend**

- React 19 with Vite
- Tailwind CSS 4
- Zustand (state)
- React Router v7
- Recharts (dashboard graphs)
- Formik + Yup (forms)
- Framer Motion (animations)

**Database** – PostgreSQL (Prisma adapter)
**Deployment** – Vercel (serverless functions + static frontend)

## Prerequisites

- Node.js v20+
- PostgreSQL database (local or cloud – e.g. Neon, Supabase)
- Cloudinary account (for image uploads)
- Resend API key (for email)

## Environment Variables

Create `.env` files in both `backend/` and `frontend/` folders.

### Backend (.env)

```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
RESEND_API_KEY="re_..."
PORT=8000
NODE_ENV=development
```

### Frontend (.env)

```
VITE_API_URL="http://localhost:8000/api"
```

## Installation & Setup

### 1. Clone repository

```
git clone https://github.com/AzafaDev/kinetix-events.git
cd kinetix-events
```

### 2. Install dependencies (workspaces)

```
npm install
```

### 3. Configure database & Prisma

```
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed database (optional – creates sample data)

```
npm run seed
```

### 5. Start development servers

**Backend** (port 8000)

```
cd backend
npm run dev
```

**Frontend** (port 5173)

```
cd frontend
npm run dev
```

## Project Structure

```
📁 backend/
├── prisma/               – Schema & migrations
├── src/
│   ├── modules/          – Auth, events, transactions, points, discount
│   ├── middleware/       – Auth, role, validation, rate limiting
│   ├── utils/            – Email, file upload, cron jobs, helpers
│   ├── templates/emails/ – Handlebars email templates
│   ├── config/           – Prisma, Cloudinary, Resend, constants
│   └── app.ts            – Express app entry
├── api/index.ts          – Vercel serverless entry
📁 frontend/
├── src/
│   ├── components/       – Reusable UI (checkout, dashboard, event, tickets)
│   ├── pages/            – All route pages (Home, EventDetail, Dashboard, etc.)
│   ├── stores/           – Zustand stores (auth, event, transaction, toast)
│   ├── services/         – API service layer (axios)
│   ├── hooks/            – Custom hooks (useCheckout, useCountdown)
│   ├── lib/              – Formatters, constants, price calculator
│   ├── types/            – TypeScript interfaces
│   └── validation/       – Yup schemas
├── public/               – Static assets
├── index.html
├── vite.config.ts
└── package.json
```

## API Documentation (Overview)

| Endpoint Group                 | Description                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `/api/auth`                    | Register, login, logout, verify email, forgot/reset password, profile update |
| `/api/events`                  | List events, get by ID, create/delete (organizer), stats, attendees          |
| `/api/transactions`            | Create, view, upload proof, accept/reject, cancel                            |
| `/api/reviews`                 | CRUD reviews for events                                                      |
| `/api/points`                  | Get points history & active balance                                          |
| `/api/events/check-voucher`    | Validate event‑specific vouchers                                             |
| `/api/events/coupons/validate` | Validate system‑wide coupons                                                 |
| `/api/events/my-vouchers`      | Organizer voucher management                                                 |

Full API documentation can be generated with tools like Postman or Swagger – see `backend/src/modules/*/**.route.ts` for all routes.

## Key Business Logic

- **Transaction expiry** – WAITING_PAYMENT expires after 2 hours (cron job restores seats/points).
- **Auto cancellation** – WAITING_CONFIRMATION auto‑cancels after 3 days if organizer doesn't act.
- **Points earning** – 10% cashback (configurable) on final price, max 50,000 points per transaction.
- **Referral reward** – Referrer gets 10,000 points; new user receives a 10% discount coupon (valid 3 months).
- **Voucher usage** – Single‑use per transaction; `usedCount` incremented when transaction is DONE.
- **Coupon** – System‑wide, single‑use, deactivated after successful purchase.

## Deployment on Vercel

1. Connect your GitHub repository to Vercel.
2. Set the following environment variables in Vercel project settings (backend):
  - `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `RESEND_API_KEY`, `FRONTEND_URL` (your Vercel frontend URL)
3. Configure Vercel to use the `vercel.json` output.
4. The `api/index.ts` file will handle all `/api/*` requests using the Express app.
5. Frontend will be served from `frontend/dist`.

You may need to adjust the `vercel.json` build command to generate the needed output.

## One gap

There's a `vitest` test script wired up in package.json but zero test files in the repo.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
