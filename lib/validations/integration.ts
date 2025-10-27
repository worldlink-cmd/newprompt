import { z } from 'zod';

// Integration Configuration Validation
export const createIntegrationConfigSchema = z.object({
  name: z.string().min(1, 'Integration name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  provider: z.enum(['STRIPE', 'PAYPAL', 'SQUARE', 'QUICKBOOKS', 'XERO', 'SHOPIFY', 'WOOCOMMERCE', 'CUSTOM'], {
    required_error: 'Provider is required',
  }),
  integrationType: z.enum(['PAYMENT', 'ACCOUNTING', 'POS', 'ECOMMERCE', 'CRM', 'MARKETING', 'CUSTOM'], {
    required_error: 'Integration type is required',
  }),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  webhookSecret: z.string().optional(),
  endpoint: z.string().url('Invalid endpoint URL').optional(),
  settings: z.any().optional(),
  isActive: z.boolean().default(true),
  syncFrequency: z.enum(['REAL_TIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MANUAL']).default('DAILY'),
  retryAttempts: z.number().int().min(0).max(10).default(3),
  timeoutSeconds: z.number().int().min(10).max(300).default(30),
});

export const updateIntegrationConfigSchema = createIntegrationConfigSchema.partial().extend({
  id: z.string().optional(),
});

// Webhook Validation
export const createWebhookSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  event: z.string().min(1, 'Event is required').max(100, 'Event must be less than 100 characters'),
  endpoint: z.string().url('Invalid endpoint URL'),
  method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
  retryOnFailure: z.boolean().default(true),
  maxRetries: z.number().int().min(0).max(5).default(3),
  timeoutSeconds: z.number().int().min(5).max(60).default(30),
});

export const updateWebhookSchema = createWebhookSchema.partial().extend({
  id: z.string().optional(),
});

// Webhook Log Validation
export const createWebhookLogSchema = z.object({
  webhookId: z.string().min(1, 'Webhook is required'),
  event: z.string().min(1, 'Event is required'),
  payload: z.any(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'RETRY']).default('PENDING'),
  responseStatus: z.number().int().optional(),
  responseBody: z.string().optional(),
  errorMessage: z.string().optional(),
  processingTime: z.number().int().optional(),
  retryCount: z.number().int().min(0).default(0),
  nextRetryAt: z.coerce.date().optional(),
});

export const updateWebhookLogSchema = createWebhookLogSchema.partial().extend({
  id: z.string().optional(),
});

// Data Mapping Validation
export const createDataMappingSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  fieldMapping: z.record(z.string(), z.object({
    sourceField: z.string().min(1, 'Source field is required'),
    targetField: z.string().min(1, 'Target field is required'),
    transformation: z.enum(['DIRECT', 'CONVERT', 'FORMAT', 'CONDITIONAL']).default('DIRECT'),
    defaultValue: z.string().optional(),
    validation: z.string().optional(),
  })),
  isActive: z.boolean().default(true),
  syncDirection: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']).default('OUTBOUND'),
});

export const updateDataMappingSchema = createDataMappingSchema.partial().extend({
  id: z.string().optional(),
});

// Sync Job Validation
export const createSyncJobSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  jobType: z.enum(['FULL_SYNC', 'INCREMENTAL_SYNC', 'WEBHOOK_PROCESSING', 'DATA_EXPORT', 'DATA_IMPORT'], {
    required_error: 'Job type is required',
  }),
  entityType: z.string().min(1, 'Entity type is required'),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).default('PENDING'),
  filters: z.any().optional(),
  options: z.any().optional(),
  scheduledFor: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  errorMessage: z.string().optional(),
  recordsProcessed: z.number().int().min(0).default(0),
  recordsSuccessful: z.number().int().min(0).default(0),
  recordsFailed: z.number().int().min(0).default(0),
});

export const updateSyncJobSchema = createSyncJobSchema.partial().extend({
  id: z.string().optional(),
});

// API Endpoint Validation
export const createAPIEndpointSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  name: z.string().min(1, 'Endpoint name is required').max(100, 'Name must be less than 100 characters'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    required_error: 'HTTP method is required',
  }),
  path: z.string().min(1, 'Path is required').max(500, 'Path must be less than 500 characters'),
  headers: z.record(z.string()).optional(),
  authentication: z.enum(['NONE', 'API_KEY', 'OAUTH', 'BASIC_AUTH', 'BEARER_TOKEN']).default('NONE'),
  rateLimit: z.number().int().min(1).max(10000).optional(),
  timeoutSeconds: z.number().int().min(5).max(300).default(30),
  isActive: z.boolean().default(true),
});

export const updateAPIEndpointSchema = createAPIEndpointSchema.partial().extend({
  id: z.string().optional(),
});

// Integration Test Validation
export const createIntegrationTestSchema = z.object({
  integrationId: z.string().min(1, 'Integration is required'),
  testType: z.enum(['CONNECTION', 'AUTHENTICATION', 'DATA_SYNC', 'WEBHOOK', 'API_CALL'], {
    required_error: 'Test type is required',
  }),
  endpoint: z.string().optional(),
  payload: z.any().optional(),
  expectedResponse: z.any().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'PASSED', 'FAILED']).default('PENDING'),
  result: z.any().optional(),
  errorMessage: z.string().optional(),
  responseTime: z.number().int().optional(),
});

export const updateIntegrationTestSchema = createIntegrationTestSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateIntegrationConfigInput = z.infer<typeof createIntegrationConfigSchema>;
export type UpdateIntegrationConfigInput = z.infer<typeof updateIntegrationConfigSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type CreateWebhookLogInput = z.infer<typeof createWebhookLogSchema>;
export type UpdateWebhookLogInput = z.infer<typeof updateWebhookLogSchema>;
export type CreateDataMappingInput = z.infer<typeof createDataMappingSchema>;
export type UpdateDataMappingInput = z.infer<typeof updateDataMappingSchema>;
export type CreateSyncJobInput = z.infer<typeof createSyncJobSchema>;
export type UpdateSyncJobInput = z.infer<typeof updateSyncJobSchema>;
export type CreateAPIEndpointInput = z.infer<typeof createAPIEndpointSchema>;
export type UpdateAPIEndpointInput = z.infer<typeof updateAPIEndpointSchema>;
export type CreateIntegrationTestInput = z.infer<typeof createIntegrationTestSchema>;
export type UpdateIntegrationTestInput = z.infer<typeof updateIntegrationTestSchema>;
