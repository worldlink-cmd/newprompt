import { z } from 'zod';
import { InventoryCategory } from '../../types';

export const createInventoryItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(InventoryCategory, { required_error: 'Category is required' }),
  unit: z.string().optional(),
  currentStock: z.number().min(0, 'Current stock must be non-negative'),
  minStockLevel: z.number().min(0, 'Minimum stock level must be non-negative'),
  maxStockLevel: z.number().min(0, 'Maximum stock level must be non-negative').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  currency: z.string().default('AED'),
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  specifications: z.any().optional(),
  imageUrls: z.array(z.string().url('Invalid image URL')).default([]),
  isActive: z.boolean().default(true),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const createInventoryTransactionSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER']),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>;
