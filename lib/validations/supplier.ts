import { z } from 'zod';
import { SupplierStatus, PaymentTerms } from 'types';

const baseSupplierSchema = z.object({
  supplierNumber: z.string().min(1, 'Supplier number is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters'),
  alternatePhone: z.string().max(20, 'Alternate phone must be less than 20 characters').optional().nullable(),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().nullable(),
  city: z.string().max(50, 'City must be less than 50 characters').optional().nullable(),
  state: z.string().max(50, 'State must be less than 50 characters').optional().nullable(),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional().nullable(),
  country: z.string().max(50, 'Country must be less than 50 characters').optional().nullable(),
  taxId: z.string().max(50, 'Tax ID must be less than 50 characters').optional().nullable(),
  paymentTerms: z.nativeEnum(PaymentTerms, {
    required_error: 'Payment terms are required',
  }),
  leadTimeDays: z.number().min(0, 'Lead time must be non-negative').max(365, 'Lead time must be less than 365 days'),
  minimumOrder: z.number().min(0, 'Minimum order must be non-negative').optional().nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().nullable(),
  status: z.nativeEnum(SupplierStatus).default(SupplierStatus.ACTIVE),
  isActive: z.boolean().default(true),
});

export const createSupplierSchema = baseSupplierSchema;

export const updateSupplierSchema = baseSupplierSchema.partial().extend({
  id: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
