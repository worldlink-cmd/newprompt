import { z } from 'zod';

// Customer Feedback Validation
export const createCustomerFeedbackSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  orderId: z.string().optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  feedbackType: z.enum(['SERVICE', 'PRODUCT', 'DELIVERY', 'OVERALL'], {
    required_error: 'Feedback type is required',
  }),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  isPublic: z.boolean().default(false),
  wouldRecommend: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateCustomerFeedbackSchema = createCustomerFeedbackSchema.partial().extend({
  id: z.string().optional(),
});

// Customer Loyalty Program Validation
export const createLoyaltyProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  pointsPerCurrency: z.number().min(0.1, 'Points per currency must be positive').default(1),
  minimumPoints: z.number().int().min(0, 'Minimum points must be non-negative').default(0),
  expiryMonths: z.number().int().min(1, 'Expiry must be at least 1 month').max(60, 'Expiry must be at most 60 months').default(12),
  isActive: z.boolean().default(true),
  benefits: z.array(z.object({
    name: z.string().min(1, 'Benefit name is required'),
    description: z.string().max(200, 'Benefit description must be less than 200 characters'),
    requiredPoints: z.number().int().min(1, 'Required points must be positive'),
    benefitType: z.enum(['DISCOUNT', 'FREE_SERVICE', 'UPGRADE', 'CASHBACK'], {
      required_error: 'Benefit type is required',
    }),
    discountPercentage: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
  })).min(1, 'At least one benefit is required'),
});

export const updateLoyaltyProgramSchema = createLoyaltyProgramSchema.partial().extend({
  id: z.string().optional(),
});

// Customer Loyalty Transaction Validation
export const createLoyaltyTransactionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  programId: z.string().min(1, 'Program is required'),
  points: z.number().int().min(-10000, 'Points must be between -10000 and 10000').max(10000),
  transactionType: z.enum(['EARN', 'REDEEM', 'EXPIRE', 'ADJUST'], {
    required_error: 'Transaction type is required',
  }),
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  expiryDate: z.coerce.date().optional(),
});

export const updateLoyaltyTransactionSchema = createLoyaltyTransactionSchema.partial().extend({
  id: z.string().optional(),
});

// Customer Segmentation Validation
export const createCustomerSegmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  criteria: z.object({
    minOrderValue: z.number().min(0).optional(),
    maxOrderValue: z.number().min(0).optional(),
    minOrdersCount: z.number().int().min(0).optional(),
    maxOrdersCount: z.number().int().min(0).optional(),
    lastOrderDays: z.number().int().min(0).optional(),
    totalSpent: z.number().min(0).optional(),
    preferredContactMethod: z.string().optional(),
    garmentTypes: z.array(z.string()).optional(),
    orderTypes: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
});

export const updateCustomerSegmentSchema = createCustomerSegmentSchema.partial().extend({
  id: z.string().optional(),
});

// Customer Special Occasions Validation
export const createSpecialOccasionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  occasionType: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'WEDDING', 'GRADUATION', 'OTHER'], {
    required_error: 'Occasion type is required',
  }),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  occasionDate: z.coerce.date(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  reminderDays: z.number().int().min(0, 'Reminder days must be non-negative').max(365, 'Reminder days must be at most 365').default(7),
  isActive: z.boolean().default(true),
  giftPreference: z.string().max(200, 'Gift preference must be less than 200 characters').optional(),
});

export const updateSpecialOccasionSchema = createSpecialOccasionSchema.partial().extend({
  id: z.string().optional(),
});

// Customer Preferences Validation
export const updateCustomerPreferencesSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP', 'SMS']).optional(),
  marketingOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  emailOptIn: z.boolean().optional(),
  whatsappOptIn: z.boolean().optional(),
  preferredLanguage: z.string().max(10, 'Language code must be less than 10 characters').optional(),
  currency: z.string().max(3, 'Currency code must be 3 characters').default('AED'),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  notificationPreferences: z.object({
    orderUpdates: z.boolean().default(true),
    promotionalOffers: z.boolean().default(false),
    appointmentReminders: z.boolean().default(true),
    newArrivals: z.boolean().default(false),
  }).optional(),
});

// Type exports
export type CreateCustomerFeedbackInput = z.infer<typeof createCustomerFeedbackSchema>;
export type UpdateCustomerFeedbackInput = z.infer<typeof updateCustomerFeedbackSchema>;
export type CreateLoyaltyProgramInput = z.infer<typeof createLoyaltyProgramSchema>;
export type UpdateLoyaltyProgramInput = z.infer<typeof updateLoyaltyProgramSchema>;
export type CreateLoyaltyTransactionInput = z.infer<typeof createLoyaltyTransactionSchema>;
export type UpdateLoyaltyTransactionInput = z.infer<typeof updateLoyaltyTransactionSchema>;
export type CreateCustomerSegmentInput = z.infer<typeof createCustomerSegmentSchema>;
export type UpdateCustomerSegmentInput = z.infer<typeof updateCustomerSegmentSchema>;
export type CreateSpecialOccasionInput = z.infer<typeof createSpecialOccasionSchema>;
export type UpdateSpecialOccasionInput = z.infer<typeof updateSpecialOccasionSchema>;
export type UpdateCustomerPreferencesInput = z.infer<typeof updateCustomerPreferencesSchema>;
