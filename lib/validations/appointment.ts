import { z } from 'zod';

// Base appointment schema
const baseAppointmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().optional(),
  orderId: z.string().optional(),
  employeeId: z.string().optional(),
  appointmentType: z.enum(['CONSULTATION', 'FITTING', 'MEASUREMENT', 'DELIVERY', 'FOLLOW_UP', 'CUSTOM'], {
    required_error: 'Appointment type is required',
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration must be at most 480 minutes').optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  requiresConfirmation: z.boolean().default(true),
  reminderSent: z.boolean().default(false),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().url('Invalid meeting link').optional(),
  preparationNotes: z.string().max(500, 'Preparation notes must be less than 500 characters').optional(),
});

// Appointment Validation
export const createAppointmentSchema = baseAppointmentSchema.refine(
  (data) => data.endDateTime > data.startDateTime,
  {
    message: 'End time must be after start time',
    path: ['endDateTime'],
  }
);

export const updateAppointmentSchema = baseAppointmentSchema.partial().extend({
  id: z.string().optional(),
});

// Appointment Booking Validation
export const createAppointmentBookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().optional(),
  employeeId: z.string().optional(),
  appointmentType: z.enum(['CONSULTATION', 'FITTING', 'MEASUREMENT', 'DELIVERY', 'FOLLOW_UP', 'CUSTOM'], {
    required_error: 'Appointment type is required',
  }),
  preferredDateTime: z.coerce.date(),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration must be at most 480 minutes').default(60),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  contactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP', 'SMS']).default('EMAIL'),
});

export const updateAppointmentBookingSchema = createAppointmentBookingSchema.partial().extend({
  id: z.string().optional(),
});

// Appointment Template Validation
export const createAppointmentTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  appointmentType: z.enum(['CONSULTATION', 'FITTING', 'MEASUREMENT', 'DELIVERY', 'FOLLOW_UP', 'CUSTOM'], {
    required_error: 'Appointment type is required',
  }),
  defaultDuration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration must be at most 480 minutes').default(60),
  bufferTime: z.number().int().min(0, 'Buffer time must be non-negative').max(120, 'Buffer time must be at most 120 minutes').default(15),
  maxAdvanceBooking: z.number().int().min(1, 'Advance booking must be at least 1 day').max(365, 'Advance booking must be at most 365 days').default(30),
  requiresConfirmation: z.boolean().default(true),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').optional(),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
});

export const updateAppointmentTemplateSchema = createAppointmentTemplateSchema.partial().extend({
  id: z.string().optional(),
});

// Base availability schema
const baseAvailabilitySchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  dayOfWeek: z.number().int().min(0, 'Day of week must be 0-6').max(6, 'Day of week must be 0-6'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  isActive: z.boolean().default(true),
  breakStartTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  breakEndTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
});

// Availability Validation
export const createAvailabilitySchema = baseAvailabilitySchema.refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const updateAvailabilitySchema = baseAvailabilitySchema.partial().extend({
  id: z.string().optional(),
});

// Appointment Reminder Validation
export const createAppointmentReminderSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment is required'),
  reminderType: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'], {
    required_error: 'Reminder type is required',
  }),
  scheduledFor: z.coerce.date(),
  templateId: z.string().min(1, 'Template is required'),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED']).default('PENDING'),
  variables: z.record(z.string(), z.string()).optional(),
});

export const updateAppointmentReminderSchema = createAppointmentReminderSchema.partial().extend({
  id: z.string().optional(),
});

// Appointment Series Validation
export const createAppointmentSeriesSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  baseAppointmentId: z.string().min(1, 'Base appointment is required'),
  seriesType: z.enum(['FITTING_SERIES', 'ALTERATION_SERIES', 'BESPOKE_PROCESS', 'CUSTOM'], {
    required_error: 'Series type is required',
  }),
  totalAppointments: z.number().int().min(2, 'Series must have at least 2 appointments').max(20, 'Series must have at most 20 appointments'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'], {
    required_error: 'Frequency is required',
  }),
  intervalDays: z.number().int().min(1, 'Interval must be at least 1 day').max(90, 'Interval must be at most 90 days').optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

export const updateAppointmentSeriesSchema = createAppointmentSeriesSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateAppointmentBookingInput = z.infer<typeof createAppointmentBookingSchema>;
export type UpdateAppointmentBookingInput = z.infer<typeof updateAppointmentBookingSchema>;
export type CreateAppointmentTemplateInput = z.infer<typeof createAppointmentTemplateSchema>;
export type UpdateAppointmentTemplateInput = z.infer<typeof updateAppointmentTemplateSchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type CreateAppointmentReminderInput = z.infer<typeof createAppointmentReminderSchema>;
export type UpdateAppointmentReminderInput = z.infer<typeof updateAppointmentReminderSchema>;
export type CreateAppointmentSeriesInput = z.infer<typeof createAppointmentSeriesSchema>;
export type UpdateAppointmentSeriesInput = z.infer<typeof updateAppointmentSeriesSchema>;
