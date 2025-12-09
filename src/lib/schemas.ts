import { z } from 'zod';

// ===========================================
// SHARED TYPES
// ===========================================

export const UuidSchema = z.string().uuid({ message: 'Invalid UUID format' });
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  cursor: z.string().optional(),
});

// ===========================================
// USER & PROFILE
// ===========================================

export const UserProfileSchema = z.object({
  nickname: z.string().min(2, 'Nickname too short').max(30, 'Nickname too long').optional(),
  name: z.string().min(2).optional(),
  bio: z.string().max(300).optional(),
  phone: z.string().regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, 'Invalid phone number').optional(),
  preferences: z.record(z.string(), z.any()).optional(),
});

export const UserRoleSchema = z.enum(['user', 'host', 'admin', 'superadmin']);

// ===========================================
// CHECK-IN & VERIFICATION
// ===========================================

export const PopupCheckInSchema = z.object({
  popupId: UuidSchema,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  qrCode: z.string().length(6).optional(),
  referralCode: z.string().max(8).optional(),
});

export const CheckInSchema = z.object({
  storeId: UuidSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gpsAccuracy: z.number().positive().optional(),
  qrCode: z.string().optional(),
});

export const ReceiptVerificationSchema = z.object({
  checkInId: UuidSchema,
  receiptText: z.string().min(10, 'Receipt text too short'),
  date: z.string().datetime().optional(),
  amount: z.number().positive().optional(),
});

// ===========================================
// POPUP & CAMPAIGN
// ===========================================

export const PopupParticipationSchema = z.object({
  popupId: UuidSchema,
  referralCode: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string()
  })).optional(),
});

export const PopupQuerySchema = PaginationSchema.extend({
  category: z.string().optional(),
  status: z.enum(['funding', 'confirmed', 'completed', 'cancelled']).optional(),
  sort: z.enum(['latest', 'popular', 'ending']).default('latest'),
});

// ===========================================
// PAYMENT
// ===========================================

export const PaymentInitSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.enum(['KRW', 'USD']).default('KRW'),
  orderId: z.string().min(1),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().int().positive(),
  })),
});

export const PaymentVerifySchema = z.object({
  paymentKey: z.string(),
  orderId: z.string(),
  amount: z.number().int(),
});
