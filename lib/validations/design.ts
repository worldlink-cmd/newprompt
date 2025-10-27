import { z } from 'zod';
import { DesignCategory } from '../../types';

export const createDesignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(DesignCategory, { required_error: 'Category is required' }),
  style: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  fabricId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateDesignSchema = createDesignSchema.partial();

export type CreateDesignInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>;
