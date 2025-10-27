import { z } from 'zod';

// Document Validation
export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  category: z.enum(['CONTRACT', 'INVOICE', 'RECEIPT', 'ALTERATION_PHOTO', 'MEASUREMENT', 'EMPLOYEE_DOCUMENT', 'VISA', 'COMPLIANCE', 'OTHER'], {
    required_error: 'Category is required',
  }),
  type: z.enum(['PDF', 'IMAGE', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'OTHER'], {
    required_error: 'Document type is required',
  }),
  fileSize: z.number().min(1, 'File size must be greater than 0').max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  mimeType: z.string().min(1, 'MIME type is required'),
  filePath: z.string().min(1, 'File path is required'),
  fileUrl: z.string().url('Invalid file URL'),
  isPublic: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  expiryDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial().extend({
  id: z.string().optional(),
});

// Document Version Validation
export const createDocumentVersionSchema = z.object({
  documentId: z.string().min(1, 'Document is required'),
  version: z.string().min(1, 'Version is required'),
  changeLog: z.string().max(500, 'Change log must be less than 500 characters').optional(),
  filePath: z.string().min(1, 'File path is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export const updateDocumentVersionSchema = createDocumentVersionSchema.partial().extend({
  id: z.string().optional(),
});

// Document Approval Validation
export const createDocumentApprovalSchema = z.object({
  documentId: z.string().min(1, 'Document is required'),
  approvedBy: z.string().min(1, 'Approved by is required'),
  status: z.enum(['APPROVED', 'REJECTED', 'REVISION_REQUESTED'], {
    required_error: 'Status is required',
  }),
  comments: z.string().max(1000, 'Comments must be less than 1000 characters').optional(),
  approvalDate: z.coerce.date().default(new Date()),
});

export const updateDocumentApprovalSchema = createDocumentApprovalSchema.partial().extend({
  id: z.string().optional(),
});

// Document Template Validation
export const createDocumentTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.enum(['CONTRACT', 'INVOICE', 'RECEIPT', 'ALTERATION_PHOTO', 'MEASUREMENT', 'EMPLOYEE_DOCUMENT', 'VISA', 'COMPLIANCE', 'OTHER'], {
    required_error: 'Category is required',
  }),
  templateType: z.enum(['PDF_TEMPLATE', 'EMAIL_TEMPLATE', 'DOCUMENT_TEMPLATE'], {
    required_error: 'Template type is required',
  }),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.object({
    name: z.string().min(1, 'Variable name is required'),
    type: z.enum(['TEXT', 'NUMBER', 'DATE', 'CURRENCY', 'BOOLEAN']),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
  })).optional(),
  isActive: z.boolean().default(true),
});

export const updateDocumentTemplateSchema = createDocumentTemplateSchema.partial().extend({
  id: z.string().optional(),
});

// Document Sharing Validation
export const createDocumentShareSchema = z.object({
  documentId: z.string().min(1, 'Document is required'),
  sharedWith: z.string().min(1, 'Shared with is required'),
  shareType: z.enum(['USER', 'DEPARTMENT', 'PUBLIC'], {
    required_error: 'Share type is required',
  }),
  permissions: z.enum(['VIEW', 'EDIT', 'ADMIN'], {
    required_error: 'Permissions are required',
  }),
  expiryDate: z.coerce.date().optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

export const updateDocumentShareSchema = createDocumentShareSchema.partial().extend({
  id: z.string().optional(),
});

// Document Search and Filter Validation
export const documentSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  isPublic: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Document Batch Operations Validation
export const documentBatchOperationSchema = z.object({
  documentIds: z.array(z.string().min(1, 'Document ID is required')).min(1, 'At least one document is required'),
  operation: z.enum(['DELETE', 'APPROVE', 'REJECT', 'ARCHIVE', 'RESTORE', 'UPDATE_CATEGORY'], {
    required_error: 'Operation is required',
  }),
  newCategory: z.string().optional(),
  comments: z.string().max(500, 'Comments must be less than 500 characters').optional(),
});

// Type exports
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateDocumentVersionInput = z.infer<typeof createDocumentVersionSchema>;
export type UpdateDocumentVersionInput = z.infer<typeof updateDocumentVersionSchema>;
export type CreateDocumentApprovalInput = z.infer<typeof createDocumentApprovalSchema>;
export type UpdateDocumentApprovalInput = z.infer<typeof updateDocumentApprovalSchema>;
export type CreateDocumentTemplateInput = z.infer<typeof createDocumentTemplateSchema>;
export type UpdateDocumentTemplateInput = z.infer<typeof updateDocumentTemplateSchema>;
export type CreateDocumentShareInput = z.infer<typeof createDocumentShareSchema>;
export type UpdateDocumentShareInput = z.infer<typeof updateDocumentShareSchema>;
export type DocumentSearchInput = z.infer<typeof documentSearchSchema>;
export type DocumentBatchOperationInput = z.infer<typeof documentBatchOperationSchema>;
