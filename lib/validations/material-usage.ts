import { z } from 'zod';

const baseMaterialUsageSchema = z.object({
  orderId: z.string().min(1, 'Order is required'),
  inventoryItemId: z.string().min(1, 'Inventory item is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  totalCost: z.number().min(0, 'Total cost must be non-negative'),
  usageDate: z.coerce.date().default(() => new Date()),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional().nullable(),
});

const materialUsageSchemaWithRefinements = baseMaterialUsageSchema.refine(
  (data) => {
    const calculatedTotal = data.quantity * data.unitPrice;
    return Math.abs(data.totalCost - calculatedTotal) < 0.01; // Allow for small floating point differences
  },
  {
    message: 'Total cost must match quantity times unit price',
    path: ['totalCost'],
  }
);

export const createMaterialUsageSchema = materialUsageSchemaWithRefinements;

export const updateMaterialUsageSchema = baseMaterialUsageSchema.partial().extend({
  id: z.string().optional(),
}).refine(
  (data) => {
    if (data.quantity !== undefined && data.unitPrice !== undefined && data.totalCost !== undefined) {
      const calculatedTotal = data.quantity * data.unitPrice;
      return Math.abs(data.totalCost - calculatedTotal) < 0.01;
    }
    return true;
  },
  {
    message: 'Total cost must match quantity times unit price',
    path: ['totalCost'],
  }
);

export type CreateMaterialUsageInput = z.infer<typeof createMaterialUsageSchema>;
export type UpdateMaterialUsageInput = z.infer<typeof updateMaterialUsageSchema>;
