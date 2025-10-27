import { z } from 'zod';
import { WasteReason } from 'types';

const baseWasteSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  totalCost: z.number().min(0, 'Total cost must be non-negative'),
  reason: z.nativeEnum(WasteReason, {
    required_error: 'Waste reason is required',
  }),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  wasteDate: z.coerce.date().default(() => new Date()),
  orderId: z.string().optional().nullable(),
});

const wasteSchemaWithRefinements = baseWasteSchema.refine(
  (data) => {
    const calculatedTotal = data.quantity * data.unitCost;
    return Math.abs(data.totalCost - calculatedTotal) < 0.01; // Allow for small floating point differences
  },
  {
    message: 'Total cost must match quantity times unit cost',
    path: ['totalCost'],
  }
);

export const createWasteSchema = wasteSchemaWithRefinements;

export const updateWasteSchema = baseWasteSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    if (data.quantity !== undefined && data.unitCost !== undefined && data.totalCost !== undefined) {
      const calculatedTotal = data.quantity * data.unitCost;
      return Math.abs(data.totalCost - calculatedTotal) < 0.01;
    }
    return true;
  },
  {
    message: 'Total cost must match quantity times unit cost',
    path: ['totalCost'],
  }
);

export type CreateWasteInput = z.infer<typeof createWasteSchema>;
export type UpdateWasteInput = z.infer<typeof updateWasteSchema>;
