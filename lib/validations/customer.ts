import { z } from 'zod';
import { Gender, PreferredContactMethod } from '../../types';

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const baseCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number must be less than 20 digits').regex(phoneRegex, 'Invalid phone number format'),
  alternatePhone: z.string().max(20, 'Alternate phone must be less than 20 digits').regex(phoneRegex, 'Invalid phone number format').optional(),
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(100, 'State must be less than 100 characters').optional(),
  postalCode: z.string().max(20, 'Postal code must be less than 20 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  dateOfBirth: z.date().optional().refine((date) => {
    if (!date) return true;
    return date < new Date();
  }, 'Date of birth must be in the past'),
  gender: z.nativeEnum(Gender).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  preferredContactMethod: z.nativeEnum(PreferredContactMethod).optional(),
});

export const customerSchema = baseCustomerSchema.refine((data) => {
  // Email is required if preferred contact method is EMAIL
  if (data.preferredContactMethod === PreferredContactMethod.EMAIL) {
    return data.email && data.email.length > 0;
  }
  return true;
}, {
  message: 'Email is required when preferred contact method is Email',
  path: ['email'],
});

export const createCustomerSchema = customerSchema;
export const updateCustomerSchema = baseCustomerSchema.partial().extend({
  id: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
