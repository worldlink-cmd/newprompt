import { z } from 'zod';
import { PurchaseOrderStatus } from 'types';

const basePurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  orderDate: z.coerce.date().default(() => new Date()),
  expectedDate: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(PurchaseOrderStatus).default(PurchaseOrderStatus.DRAFT),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
  approvedBy: z.string().optional().nullable(),
  approvedAt: z.coerce.date().optional().nullable(),
  items: z.array(z.object({
    inventoryItemId: z.string().min(1, 'Inventory item is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
  })).min(1, 'At least one item is required'),
});

const purchaseOrderSchemaWithRefinements = basePurchaseOrderSchema.refine(
  (data) => {
    const calculatedTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return Math.abs(data.totalAmount - calculatedTotal) < 0.01; // Allow for small floating point differences
  },
  {
    message: 'Total amount must match the sum of item totals',
    path: ['totalAmount'],
  }
);

export const createPurchaseOrderSchema = purchaseOrderSchemaWithRefinements;

export const updatePurchaseOrderSchema = basePurchaseOrderSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    if (data.totalAmount !== undefined && data.items) {
      const calculatedTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      return Math.abs(data.totalAmount - calculatedTotal) < 0.01;
    }
    return true;
  },
  {
    message: 'Total amount must match the sum of item totals',
    path: ['totalAmount'],
  }
);

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus, {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.coerce.date().optional(),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderInput = z.infer<typeof updatePurchaseOrderSchema>;
export type UpdatePurchaseOrderStatusInput = z.infer<typeof updatePurchaseOrderStatusSchema>;
