import { z } from 'zod';
import { OrderStatus, OrderPriority, GarmentType, OrderType } from 'types';

// Workflow stage transition validation
const validStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.RECEIVED]: [OrderStatus.CUTTING, OrderStatus.CANCELLED],
  [OrderStatus.CUTTING]: [OrderStatus.STITCHING, OrderStatus.CANCELLED],
  [OrderStatus.STITCHING]: [OrderStatus.QUALITY_CHECK, OrderStatus.CANCELLED],
  [OrderStatus.QUALITY_CHECK]: [OrderStatus.PRESSING, OrderStatus.CANCELLED],
  [OrderStatus.PRESSING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [], // Final stage
  [OrderStatus.CANCELLED]: [], // Final stage
};

const baseOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  measurementId: z.string().optional(),
  fabricId: z.string().optional(),
  garmentType: z.nativeEnum(GarmentType, {
    required_error: 'Garment type is required',
  }),
  orderType: z.nativeEnum(OrderType, {
    required_error: 'Order type is required',
  }),
  serviceDescription: z
    .string()
    .min(1, 'Service description is required')
    .max(500, 'Description must be less than 500 characters'),
  specialInstructions: z
    .string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .optional(),
  deliveryDate: z.coerce.date().optional().refine((date) => date ? date > new Date() : true, 'Delivery date must be in the future'),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.RECEIVED),
  priority: z.nativeEnum(OrderPriority).default(OrderPriority.NORMAL),
  totalAmount: z
    .number()
    .min(0, 'Amount must be positive')
    .optional(),
  depositAmount: z
    .number()
    .min(0, 'Deposit must be positive')
    .optional(),
  isUrgent: z.boolean().default(false),
  // New fields for order type extensions
  pieces: z.any().optional(),
  originalMeasurements: z.any().optional(),
  modifiedMeasurements: z.any().optional(),
  alterationNotes: z.string().optional(),
});

const orderSchemaWithRefinements = baseOrderSchema.refine(
  (data) => {
    // If depositAmount is provided and totalAmount is provided, depositAmount must be <= totalAmount
    if (data.depositAmount !== undefined && data.totalAmount !== undefined) {
      return data.depositAmount <= data.totalAmount;
    }
    return true;
  },
  {
    message: 'Deposit amount cannot be greater than total amount',
    path: ['depositAmount'],
  }
);

export const createOrderSchema = orderSchemaWithRefinements;

export const updateOrderSchema = baseOrderSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    // If depositAmount is provided and totalAmount is provided, depositAmount must be <= totalAmount
    if (data.depositAmount !== undefined && data.totalAmount !== undefined) {
      return data.depositAmount <= data.totalAmount;
    }
    return true;
  },
  {
    message: 'Deposit amount cannot be greater than total amount',
    path: ['depositAmount'],
  }
);

// Status update validation with workflow transition rules
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Validate that the status transition is allowed
    // This will be checked against the current order status in the API
    return true; // Placeholder - actual validation in API
  },
  {
    message: 'Invalid status transition',
    path: ['status'],
  }
);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// Export transition rules for use in API
export { validStatusTransitions };
