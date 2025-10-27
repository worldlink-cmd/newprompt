import { GarmentType, OrderType } from 'types';

/**
 * Order configuration constants
 * These can be moved to database in future phases for dynamic configuration
 */

// Default lead time in calendar days
export const DEFAULT_LEAD_TIME_DAYS = 7;

// Lead time by garment type (in calendar days)
export const LEAD_TIME_BY_GARMENT: Record<GarmentType, number> = {
  [GarmentType.SHIRT]: 5,
  [GarmentType.TROUSER]: 5,
  [GarmentType.DRESS]: 7,
  [GarmentType.SUIT]: 10,
};

// Lead time by order type (in calendar days)
export const LEAD_TIME_BY_ORDER_TYPE: Record<OrderType, number> = {
  [OrderType.BESPOKE_SUIT]: 14, // Longer for bespoke
  [OrderType.DRESS_ALTERATION]: 3, // Shorter for alterations
  [OrderType.ONE_PIECE]: 7,
  [OrderType.SUIT_ALTERATION]: 5, // Shorter for alterations
  [OrderType.CUSTOM_DESIGN]: 10, // Variable, but standard
  [OrderType.REPAIR]: 2, // Quick repairs
};

// Lead time for urgent/rush orders (in calendar days)
export const URGENT_ORDER_LEAD_TIME_DAYS = 2;

// Minimum allowed lead time (in calendar days)
export const MIN_LEAD_TIME_DAYS = 1;

// Maximum allowed lead time (in calendar days)
export const MAX_LEAD_TIME_DAYS = 90;

// Pricing multipliers by order type (for future use)
export const PRICING_MULTIPLIER_BY_ORDER_TYPE: Record<OrderType, number> = {
  [OrderType.BESPOKE_SUIT]: 1.5, // Premium pricing
  [OrderType.DRESS_ALTERATION]: 0.8, // Discounted for alterations
  [OrderType.ONE_PIECE]: 1.0,
  [OrderType.SUIT_ALTERATION]: 0.9,
  [OrderType.CUSTOM_DESIGN]: 1.2, // Slightly premium
  [OrderType.REPAIR]: 0.6, // Lower for repairs
};
