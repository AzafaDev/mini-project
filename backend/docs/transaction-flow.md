# Transaction Flow Documentation

This document explains the transaction and payment system in the Event Management Platform.

## Transaction Statuses

```
WAITING_PAYMENT → WAITING_CONFIRMATION → DONE
       ↓                    ↓              ↑
    EXPIRED             REJECTED       CANCELED
```

| Status | Description | Next Actions |
|--------|-------------|--------------|
| `WAITING_PAYMENT` | Transaction created, waiting for payment proof | Upload payment proof or cancel |
| `WAITING_CONFIRMATION` | Payment proof uploaded, waiting for organizer | Accept, reject, or auto-cancel after 3 days |
| `DONE` | Transaction completed successfully | None (final state) |
| `EXPIRED` | No payment proof within 2 hours | None (final state) |
| `REJECTED` | Organizer rejected the transaction | None (final state) |
| `CANCELED` | Customer or system canceled | None (final state) |

## Creating a Transaction

```
User selects event and ticket
         ↓
User clicks "Buy Now" or "Checkout"
         ↓
POST /api/transactions with:
  - eventId
  - ticketId (optional)
  - quantity
  - voucherCode (optional)
  - couponCode (optional)
  - pointsUsed (optional)
         ↓
Backend validates:
  - Event exists and not deleted
  - Enough available seats
  - Voucher valid (if provided)
  - Coupon valid (if provided)
  - User has enough points (if used)
         ↓
Calculate pricing:
  basePrice = event.price * quantity
  - voucherDiscount = (percentage or fixed)
  - couponDiscount = (percentage or fixed)
  - pointsDiscount = pointsUsed (1 point = 1 IDR)
  finalPrice = basePrice - discounts
         ↓
Create transaction with status: WAITING_PAYMENT
Set expiresAt: now() + 2 hours
         ↓
Reduce availableSeats in event
         ↓
Return: { success: true, data: transaction }
```

## Payment Flow

```
Transaction created (WAITING_PAYMENT)
         ↓
User has 2 hours to upload payment proof
         ↓
User uploads payment proof image
         ↓
POST /api/transactions/:id/payment-proof
  - Content-Type: multipart/form-data
  - File: paymentProof (image)
         ↓
Backend:
  - Upload to Cloudinary
  - Update transaction:
    - paymentProof: image URL
    - paymentProofUploadedAt: now()
    - status: WAITING_CONFIRMATION
    - autoCancelAt: now() + 3 days
         ↓
Return: { success: true, data: transaction }
```

## Organizer Action Flow

```
Transaction in WAITING_CONFIRMATION status
         ↓
Organizer has 3 days to accept or reject
         ↓
Option 1: Accept Transaction
POST /api/transactions/:id/accept
         ↓
Backend updates:
  - status: DONE
  - paidAt: now()
         ↓
Award points to customer:
  - points = totalPrice (1 point per 1 IDR)
  - expires in 3 months
         ↓
Send "Transaction Accepted" email
         ↓
Return: { success: true, data: transaction }

Option 2: Reject Transaction
POST /api/transactions/:id/reject
         ↓
Backend:
  - status: REJECTED
  - Restore used points to user
  - Deactivate used voucher (if any)
  - Deactivate used coupon (if any)
  - Restore availableSeats to event
         ↓
Send "Transaction Rejected" email with reason
         ↓
Return: { success: true, data: transaction }
```

## Cancellation Flow

```
User wants to cancel transaction
         ↓
POST /api/transactions/:id/cancel
         ↓
Backend checks:
  - Transaction exists
  - Status is not DONE, REJECTED, CANCELED, or EXPIRED
         ↓
Update transaction:
  - status: CANCELED
         ↓
Rollback resources:
  - Restore points used (if any)
  - Reactivate voucher (if used)
  - Reactivate coupon (if used)
  - Restore availableSeats
         ↓
Return: { success: true, data: transaction }
```

## Expiration Flow (Automatic)

```
Cron job runs every hour
         ↓
Check transactions where:
  - status = WAITING_PAYMENT
  - expiresAt < now()
         ↓
For each expired transaction:
  - status: EXPIRED
  - Rollback: points, voucher, coupon, seats
         ↓
Continue to check:
  - status = WAITING_CONFIRMATION  
  - autoCancelAt < now()
         ↓
For each expired:
  - status: CANCELED
  - Rollback: points, voucher, coupon, seats
```

## Discount Types

### Voucher (Event-specific)
- Created by event organizer
- Can only be used for that specific event
- Can be PERCENTAGE or FIXED discount

### Coupon (System-wide)
- Created when user registers with referral code
- Can be used for ANY event
- Always PERCENTAGE discount (10%)

### Points
- Earned from completed transactions (1 IDR = 1 point)
- Can be used to reduce payment amount
- Expires after 3 months

## Pricing Calculation Example

```
Event price: 100,000 IDR
Quantity: 2 tickets
Voucher: 10% off (ORGANIZER)
Coupon: 10% off (REFERRAL)
Points used: 5,000

Calculation:
  basePrice = 100,000 * 2 = 200,000
  voucherDiscount = 200,000 * 10% = 20,000
  afterVoucher = 200,000 - 20,000 = 180,000
  couponDiscount = 180,000 * 10% = 18,000
  afterCoupon = 180,000 - 18,000 = 162,000
  pointsDiscount = 5,000
  finalPrice = 162,000 - 5,000 = 157,000

Transaction created:
  - totalPrice: 200,000
  - discount: 43,000 (voucher + coupon + points)
  - pointsUsed: 5,000
  - finalPrice: 157,000
```

## Rollback Details

When transaction is rejected, canceled, or expired:

| Resource | Action |
|----------|--------|
| Points Used | Restore to user's balance |
| Voucher | Reactivate (increment usedCount) |
| Coupon | Reactivate (isActive = true) |
| Available Seats | Restore quantity to event |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get transaction by ID |
| GET | `/api/transactions/me` | Get my transactions (customer) |
| GET | `/api/transactions/event/:eventId` | Get transactions for event (organizer) |
| GET | `/api/transactions/organizer` | Get all my transactions (organizer) |
| POST | `/api/transactions/:id/payment-proof` | Upload payment proof |
| POST | `/api/transactions/:id/accept` | Accept transaction (organizer) |
| POST | `/api/transactions/:id/reject` | Reject transaction (organizer) |
| POST | `/api/transactions/:id/cancel` | Cancel transaction (customer) |

## Important Timers

| Timer | Duration | Action When Expired |
|-------|----------|---------------------|
| Payment Timeout | 2 hours | Transaction becomes EXPIRED |
| Confirmation Timeout | 3 days | Transaction becomes CANCELED |
| Points Expiry | 3 months | Points removed from balance |
| Coupon Expiry | 3 months | Coupon becomes inactive |
| Verification Token | 24 hours | Token becomes invalid |