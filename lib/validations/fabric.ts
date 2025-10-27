import { z } from 'zod';
import { FabricCategory } from '../../types';

export const createFabricSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(FabricCategory, { required_error: 'Category is required' }),
  color: z.string().optional(),
  pattern: z.string().optional(),
  material: z.string().optional(),
  pricePerMeter: z.number().positive('Price must be positive').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  minOrderQuantity: z.number().int().min(1, 'Minimum order quantity must be at least 1'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isActive: z.boolean().default(true),
});

export const updateFabricSchema = createFabricSchema.partial();

export type CreateFabricInput = z.infer<typeof createFabricSchema>;
export type UpdateFabricInput = z.infer<typeof updateFabricSchema>;
