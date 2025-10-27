import { z } from 'zod';

// Security Audit Validation
export const createSecurityAuditSchema = z.object({
  name: z.string().min(1, 'Audit name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  auditType: z.enum(['COMPREHENSIVE', 'VULNERABILITY_SCAN', 'PERMISSION_REVIEW', 'DATA_ACCESS', 'COMPLIANCE_CHECK'], {
    required_error: 'Audit type is required',
  }),
  scope: z.enum(['ALL', 'CUSTOMERS', 'EMPLOYEES', 'FINANCIAL', 'DOCUMENTS', 'COMMUNICATION'], {
    required_error: 'Scope is required',
  }),
  includeInactive: z.boolean().default(false),
  checkPermissions: z.boolean().default(true),
  checkDataAccess: z.boolean().default(true),
  checkEncryption: z.boolean().default(true),
  checkCompliance: z.boolean().default(true),
  scheduledFor: z.coerce.date().optional(),
  isAutomated: z.boolean().default(false),
});

export const updateSecurityAuditSchema = createSecurityAuditSchema.partial().extend({
  id: z.string().optional(),
});

// Security Policy Validation
export const createSecurityPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  policyType: z.enum(['PASSWORD', 'ACCESS_CONTROL', 'DATA_RETENTION', 'ENCRYPTION', 'NETWORK', 'COMPLIANCE'], {
    required_error: 'Policy type is required',
  }),
  rules: z.array(z.object({
    id: z.string().min(1, 'Rule ID is required'),
    name: z.string().min(1, 'Rule name is required'),
    description: z.string().max(200, 'Description must be less than 200 characters'),
    condition: z.string().min(1, 'Condition is required'),
    action: z.enum(['ALLOW', 'DENY', 'WARN', 'LOG']),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    isActive: z.boolean().default(true),
  })).min(1, 'At least one rule is required'),
  isActive: z.boolean().default(true),
  enforcementLevel: z.enum(['STRICT', 'WARNING', 'MONITORING']).default('STRICT'),
});

export const updateSecurityPolicySchema = createSecurityPolicySchema.partial().extend({
  id: z.string().optional(),
});

// Data Retention Validation
export const createDataRetentionSchema = z.object({
  name: z.string().min(1, 'Retention policy name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  dataType: z.enum(['CUSTOMER', 'ORDER', 'FINANCIAL', 'EMPLOYEE', 'DOCUMENT', 'COMMUNICATION', 'ALL'], {
    required_error: 'Data type is required',
  }),
  retentionPeriod: z.number().int().min(1, 'Retention period must be at least 1 day').max(3650, 'Retention period must be at most 3650 days').default(365),
  retentionUnit: z.enum(['DAYS', 'MONTHS', 'YEARS']).default('DAYS'),
  autoDelete: z.boolean().default(true),
  archiveBeforeDelete: z.boolean().default(true),
  notifyBeforeDeletion: z.boolean().default(true),
  notificationDays: z.number().int().min(1).max(90).default(30),
  isActive: z.boolean().default(true),
  exceptions: z.array(z.string()).optional(),
});

export const updateDataRetentionSchema = createDataRetentionSchema.partial().extend({
  id: z.string().optional(),
});

// GDPR Compliance Validation
export const createGDPRRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  requestType: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'PORTABILITY', 'OBJECT'], {
    required_error: 'Request type is required',
  }),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dataTypes: z.array(z.enum(['PROFILE', 'ORDERS', 'PAYMENTS', 'COMMUNICATIONS', 'DOCUMENTS', 'ALL'])).min(1, 'At least one data type is required'),
  urgency: z.enum(['NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  deadline: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']).default('PENDING'),
});

export const updateGDPRRequestSchema = createGDPRRequestSchema.partial().extend({
  id: z.string().optional(),
});

// Security Incident Validation
export const createSecurityIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    required_error: 'Severity is required',
  }),
  category: z.enum(['UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'MALWARE', 'PHISHING', 'SUSPICIOUS_ACTIVITY', 'POLICY_VIOLATION', 'OTHER'], {
    required_error: 'Category is required',
  }),
  status: z.enum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED']).default('OPEN'),
  reportedBy: z.string().min(1, 'Reported by is required'),
  assignedTo: z.string().optional(),
  affectedSystems: z.array(z.string()).optional(),
  affectedUsers: z.array(z.string()).optional(),
  evidence: z.array(z.string()).optional(),
  actionsTaken: z.string().max(1000, 'Actions taken must be less than 1000 characters').optional(),
  resolution: z.string().max(1000, 'Resolution must be less than 1000 characters').optional(),
  lessonsLearned: z.string().max(1000, 'Lessons learned must be less than 1000 characters').optional(),
});

export const updateSecurityIncidentSchema = createSecurityIncidentSchema.partial().extend({
  id: z.string().optional(),
});

// Backup Configuration Validation
export const createBackupConfigSchema = z.object({
  name: z.string().min(1, 'Backup name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  backupType: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL'], {
    required_error: 'Backup type is required',
  }),
  schedule: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL']).default('DAILY'),
  retentionDays: z.number().int().min(1, 'Retention must be at least 1 day').max(3650, 'Retention must be at most 3650 days').default(30),
  includeData: z.array(z.enum(['CUSTOMERS', 'ORDERS', 'FINANCIAL', 'EMPLOYEES', 'DOCUMENTS', 'ALL'])).min(1, 'At least one data type is required'),
  excludeData: z.array(z.string()).optional(),
  compression: z.boolean().default(true),
  encryption: z.boolean().default(true),
  storageLocation: z.enum(['LOCAL', 'CLOUD', 'HYBRID']).default('CLOUD'),
  cloudProvider: z.string().optional(),
  isActive: z.boolean().default(true),
  verifyIntegrity: z.boolean().default(true),
});

export const updateBackupConfigSchema = createBackupConfigSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateSecurityAuditInput = z.infer<typeof createSecurityAuditSchema>;
export type UpdateSecurityAuditInput = z.infer<typeof updateSecurityAuditSchema>;
export type CreateSecurityPolicyInput = z.infer<typeof createSecurityPolicySchema>;
export type UpdateSecurityPolicyInput = z.infer<typeof updateSecurityPolicySchema>;
export type CreateDataRetentionInput = z.infer<typeof createDataRetentionSchema>;
export type UpdateDataRetentionInput = z.infer<typeof updateDataRetentionSchema>;
export type CreateGDPRRequestInput = z.infer<typeof createGDPRRequestSchema>;
export type UpdateGDPRRequestInput = z.infer<typeof updateGDPRRequestSchema>;
export type CreateSecurityIncidentInput = z.infer<typeof createSecurityIncidentSchema>;
export type UpdateSecurityIncidentInput = z.infer<typeof updateSecurityIncidentSchema>;
export type CreateBackupConfigInput = z.infer<typeof createBackupConfigSchema>;
export type UpdateBackupConfigInput = z.infer<typeof updateBackupConfigSchema>;
