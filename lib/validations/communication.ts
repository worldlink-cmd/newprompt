import { z } from 'zod';

// Communication Template Validation
export const createCommunicationTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.enum(['ORDER_STATUS', 'APPOINTMENT_REMINDER', 'PROMOTIONAL', 'LOYALTY', 'BIRTHDAY', 'ANNIVERSARY', 'CUSTOM'], {
    required_error: 'Category is required',
  }),
  communicationType: z.enum(['SMS', 'WHATSAPP', 'EMAIL'], {
    required_error: 'Communication type is required',
  }),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').max(5000, 'Content must be less than 5000 characters'),
  variables: z.array(z.object({
    name: z.string().min(1, 'Variable name is required'),
    description: z.string().max(100, 'Description must be less than 100 characters'),
    defaultValue: z.string().optional(),
  })).optional(),
  isActive: z.boolean().default(true),
  provider: z.enum(['TWILIO', 'WHATSAPP_BUSINESS', 'SENDGRID', 'RESEND', 'CUSTOM']).optional(),
});

export const updateCommunicationTemplateSchema = createCommunicationTemplateSchema.partial().extend({
  id: z.string().optional(),
});

// Message Log Validation
export const createMessageLogSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  templateId: z.string().min(1, 'Template is required'),
  communicationType: z.enum(['SMS', 'WHATSAPP', 'EMAIL'], {
    required_error: 'Communication type is required',
  }),
  recipient: z.string().min(1, 'Recipient is required'),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED']).default('PENDING'),
  provider: z.string().optional(),
  providerMessageId: z.string().optional(),
  errorMessage: z.string().optional(),
  scheduledFor: z.coerce.date().optional(),
  sentAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  failedAt: z.coerce.date().optional(),
  metadata: z.any().optional(),
});

export const updateMessageLogSchema = createMessageLogSchema.partial().extend({
  id: z.string().optional(),
});

// Bulk Message Validation
export const createBulkMessageSchema = z.object({
  templateId: z.string().min(1, 'Template is required'),
  communicationType: z.enum(['SMS', 'WHATSAPP', 'EMAIL'], {
    required_error: 'Communication type is required',
  }),
  customerSegmentId: z.string().optional(),
  customerIds: z.array(z.string()).optional(),
  scheduledFor: z.coerce.date().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  metadata: z.any().optional(),
});

export const updateBulkMessageSchema = createBulkMessageSchema.partial().extend({
  id: z.string().optional(),
});

// Communication Provider Configuration
export const createProviderConfigSchema = z.object({
  provider: z.enum(['TWILIO', 'WHATSAPP_BUSINESS', 'SENDGRID', 'RESEND', 'CUSTOM'], {
    required_error: 'Provider is required',
  }),
  name: z.string().min(1, 'Provider name is required').max(100, 'Name must be less than 100 characters'),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  accountSid: z.string().optional(),
  fromNumber: z.string().optional(),
  fromEmail: z.string().email('Invalid email format').optional(),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  isActive: z.boolean().default(true),
  settings: z.any().optional(),
});

export const updateProviderConfigSchema = createProviderConfigSchema.partial().extend({
  id: z.string().optional(),
});

// SMS Campaign Validation
export const createSMSCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  templateId: z.string().min(1, 'Template is required'),
  customerSegmentId: z.string().optional(),
  customerIds: z.array(z.string()).optional(),
  scheduledFor: z.coerce.date().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateSMSCampaignSchema = createSMSCampaignSchema.partial().extend({
  id: z.string().optional(),
});

// Email Campaign Validation
export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  templateId: z.string().min(1, 'Template is required'),
  customerSegmentId: z.string().optional(),
  customerIds: z.array(z.string()).optional(),
  scheduledFor: z.coerce.date().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateEmailCampaignSchema = createEmailCampaignSchema.partial().extend({
  id: z.string().optional(),
});

// WhatsApp Campaign Validation
export const createWhatsAppCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  templateId: z.string().min(1, 'Template is required'),
  customerSegmentId: z.string().optional(),
  customerIds: z.array(z.string()).optional(),
  scheduledFor: z.coerce.date().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateWhatsAppCampaignSchema = createWhatsAppCampaignSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateCommunicationTemplateInput = z.infer<typeof createCommunicationTemplateSchema>;
export type UpdateCommunicationTemplateInput = z.infer<typeof updateCommunicationTemplateSchema>;
export type CreateMessageLogInput = z.infer<typeof createMessageLogSchema>;
export type UpdateMessageLogInput = z.infer<typeof updateMessageLogSchema>;
export type CreateBulkMessageInput = z.infer<typeof createBulkMessageSchema>;
export type UpdateBulkMessageInput = z.infer<typeof updateBulkMessageSchema>;
export type CreateProviderConfigInput = z.infer<typeof createProviderConfigSchema>;
export type UpdateProviderConfigInput = z.infer<typeof updateProviderConfigSchema>;
export type CreateSMSCampaignInput = z.infer<typeof createSMSCampaignSchema>;
export type UpdateSMSCampaignInput = z.infer<typeof updateSMSCampaignSchema>;
export type CreateEmailCampaignInput = z.infer<typeof createEmailCampaignSchema>;
export type UpdateEmailCampaignInput = z.infer<typeof updateEmailCampaignSchema>;
export type CreateWhatsAppCampaignInput = z.infer<typeof createWhatsAppCampaignSchema>;
export type UpdateWhatsAppCampaignInput = z.infer<typeof updateWhatsAppCampaignSchema>;
