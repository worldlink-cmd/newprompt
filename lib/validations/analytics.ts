import { z } from 'zod';

// KPI Dashboard Validation
export const createKPIDashboardSchema = z.object({
  name: z.string().min(1, 'Dashboard name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  widgets: z.array(z.object({
    id: z.string().min(1, 'Widget ID is required'),
    type: z.enum(['CHART', 'METRIC', 'TABLE', 'TEXT'], {
      required_error: 'Widget type is required',
    }),
    title: z.string().min(1, 'Widget title is required'),
    dataSource: z.string().min(1, 'Data source is required'),
    configuration: z.any().optional(),
    position: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1).max(12),
      height: z.number().int().min(1).max(8),
    }),
    isVisible: z.boolean().default(true),
  })).min(1, 'At least one widget is required'),
  isActive: z.boolean().default(true),
  refreshInterval: z.number().int().min(30, 'Refresh interval must be at least 30 seconds').max(3600, 'Refresh interval must be at most 3600 seconds').default(300),
});

export const updateKPIDashboardSchema = createKPIDashboardSchema.partial().extend({
  id: z.string().optional(),
});

// Custom Report Validation
export const createCustomReportSchema = z.object({
  name: z.string().min(1, 'Report name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  reportType: z.enum(['SALES', 'CUSTOMER', 'EMPLOYEE', 'FINANCIAL', 'INVENTORY', 'APPOINTMENT', 'CUSTOM'], {
    required_error: 'Report type is required',
  }),
  dataSource: z.string().min(1, 'Data source is required'),
  filters: z.any().optional(),
  groupBy: z.array(z.string()).optional(),
  aggregations: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    function: z.enum(['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'], {
      required_error: 'Aggregation function is required',
    }),
    alias: z.string().optional(),
  })).optional(),
  sortBy: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    direction: z.enum(['ASC', 'DESC']).default('DESC'),
  })).optional(),
  columns: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    header: z.string().min(1, 'Header is required'),
    type: z.enum(['STRING', 'NUMBER', 'DATE', 'CURRENCY', 'PERCENTAGE']).default('STRING'),
    format: z.string().optional(),
    width: z.number().int().min(50).max(500).optional(),
  })).optional(),
  chartType: z.enum(['BAR', 'LINE', 'PIE', 'AREA', 'SCATTER', 'TABLE']).optional(),
  isScheduled: z.boolean().default(false),
  scheduleFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
  recipients: z.array(z.string().email('Invalid email format')).optional(),
  isActive: z.boolean().default(true),
});

export const updateCustomReportSchema = createCustomReportSchema.partial().extend({
  id: z.string().optional(),
});

// Report Execution Validation
export const executeReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  filters: z.any().optional(),
  format: z.enum(['JSON', 'CSV', 'PDF', 'EXCEL']).default('JSON'),
  includeCharts: z.boolean().default(false),
});

// Analytics Query Validation
export const analyticsQuerySchema = z.object({
  dataSource: z.string().min(1, 'Data source is required'),
  metrics: z.array(z.string()).min(1, 'At least one metric is required'),
  dimensions: z.array(z.string()).optional(),
  filters: z.any().optional(),
  dateRange: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  }).optional(),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    direction: z.enum(['ASC', 'DESC']).default('DESC'),
  })).optional(),
  limit: z.number().int().min(1).max(10000).default(1000),
});

// Dashboard Widget Validation
export const createDashboardWidgetSchema = z.object({
  dashboardId: z.string().min(1, 'Dashboard is required'),
  type: z.enum(['CHART', 'METRIC', 'TABLE', 'TEXT'], {
    required_error: 'Widget type is required',
  }),
  title: z.string().min(1, 'Widget title is required').max(100, 'Title must be less than 100 characters'),
  dataSource: z.string().min(1, 'Data source is required'),
  configuration: z.any().optional(),
  position: z.object({
    x: z.number().int().min(0).default(0),
    y: z.number().int().min(0).default(0),
    width: z.number().int().min(1).max(12).default(4),
    height: z.number().int().min(1).max(8).default(3),
  }),
  refreshInterval: z.number().int().min(30).max(3600).default(300),
  isVisible: z.boolean().default(true),
});

export const updateDashboardWidgetSchema = createDashboardWidgetSchema.partial().extend({
  id: z.string().optional(),
});

// Alert Configuration Validation
export const createAlertConfigSchema = z.object({
  name: z.string().min(1, 'Alert name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  metric: z.string().min(1, 'Metric is required'),
  condition: z.enum(['GREATER_THAN', 'LESS_THAN', 'EQUALS', 'NOT_EQUALS', 'INCREASE_BY', 'DECREASE_BY'], {
    required_error: 'Condition is required',
  }),
  threshold: z.number(),
  thresholdType: z.enum(['ABSOLUTE', 'PERCENTAGE']).default('ABSOLUTE'),
  timeWindow: z.number().int().min(1, 'Time window must be at least 1 minute').max(1440, 'Time window must be at most 1440 minutes').default(60),
  notificationChannels: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'DASHBOARD'])).min(1, 'At least one notification channel is required'),
  recipients: z.array(z.string().email('Invalid email format')).optional(),
  isActive: z.boolean().default(true),
  cooldownMinutes: z.number().int().min(0).max(1440).default(60),
});

export const updateAlertConfigSchema = createAlertConfigSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateKPIDashboardInput = z.infer<typeof createKPIDashboardSchema>;
export type UpdateKPIDashboardInput = z.infer<typeof updateKPIDashboardSchema>;
export type CreateCustomReportInput = z.infer<typeof createCustomReportSchema>;
export type UpdateCustomReportInput = z.infer<typeof updateCustomReportSchema>;
export type ExecuteReportInput = z.infer<typeof executeReportSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type CreateDashboardWidgetInput = z.infer<typeof createDashboardWidgetSchema>;
export type UpdateDashboardWidgetInput = z.infer<typeof updateDashboardWidgetSchema>;
export type CreateAlertConfigInput = z.infer<typeof createAlertConfigSchema>;
export type UpdateAlertConfigInput = z.infer<typeof updateAlertConfigSchema>;
