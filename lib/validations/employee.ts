import { z } from 'zod';
import { Gender, UserRole, PayPeriod } from '../../types';

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const baseEmployeeSchema = z.object({
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
  hireDate: z.date().optional(),
  role: z.nativeEnum(UserRole),
  salary: z.number().positive('Salary must be positive').optional().nullable(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
  skillIds: z.array(z.string()).optional(),
  specializationIds: z.array(z.string()).optional(),
});

export const employeeSchema = baseEmployeeSchema;

export const createEmployeeSchema = employeeSchema;
export const updateEmployeeSchema = baseEmployeeSchema.partial().extend({
  id: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
