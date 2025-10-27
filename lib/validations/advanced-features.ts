import { z } from 'zod';

// AI Demand Forecasting Validation
export const createDemandForecastSchema = z.object({
  name: z.string().min(1, 'Forecast name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  forecastType: z.enum(['SALES', 'CUSTOMER_DEMAND', 'INVENTORY_NEEDS', 'SEASONAL_TREND'], {
    required_error: 'Forecast type is required',
  }),
  algorithm: z.enum(['LINEAR_REGRESSION', 'ARIMA', 'EXPONENTIAL_SMOOTHING', 'NEURAL_NETWORK', 'ENSEMBLE'], {
    required_error: 'Algorithm is required',
  }),
  dataSource: z.string().min(1, 'Data source is required'),
  predictionHorizon: z.number().int().min(1, 'Prediction horizon must be at least 1 day').max(365, 'Prediction horizon must be at most 365 days'),
  historicalDataDays: z.number().int().min(30, 'Historical data must be at least 30 days').max(1095, 'Historical data must be at most 1095 days').default(365),
  confidenceLevel: z.number().min(0.5, 'Confidence level must be at least 50%').max(0.99, 'Confidence level must be at most 99%').default(0.95),
  seasonality: z.boolean().default(true),
  includeExternalFactors: z.boolean().default(false),
  externalFactors: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  autoUpdate: z.boolean().default(true),
  updateFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
});

export const updateDemandForecastSchema = createDemandForecastSchema.partial().extend({
  id: z.string().optional(),
});

// Quality Assurance Automation Validation
export const createQAAutomationSchema = z.object({
  name: z.string().min(1, 'QA automation name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  processType: z.enum(['ORDER_QUALITY_CHECK', 'MATERIAL_INSPECTION', 'FINISHED_GARMENT', 'ALTERATION_VERIFICATION'], {
    required_error: 'Process type is required',
  }),
  checkpoints: z.array(z.object({
    id: z.string().min(1, 'Checkpoint ID is required'),
    name: z.string().min(1, 'Checkpoint name is required'),
    description: z.string().max(200, 'Description must be less than 200 characters'),
    order: z.number().int().min(1),
    isRequired: z.boolean().default(true),
    autoCheck: z.boolean().default(false),
    criteria: z.any().optional(),
    tolerance: z.number().min(0).optional(),
    measurement: z.string().optional(),
  })).min(1, 'At least one checkpoint is required'),
  automationRules: z.array(z.object({
    trigger: z.enum(['TIME_BASED', 'CONDITION_BASED', 'EVENT_BASED']),
    condition: z.string().min(1, 'Condition is required'),
    action: z.enum(['NOTIFY', 'ESCALATE', 'AUTO_APPROVE', 'AUTO_REJECT', 'CREATE_TASK']),
    parameters: z.any().optional(),
  })).optional(),
  isActive: z.boolean().default(true),
  requiresHumanReview: z.boolean().default(true),
});

export const updateQAAutomationSchema = createQAAutomationSchema.partial().extend({
  id: z.string().optional(),
});

// Cost Optimization Validation
export const createCostOptimizationSchema = z.object({
  name: z.string().min(1, 'Optimization name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  optimizationType: z.enum(['MATERIAL_COST', 'LABOR_COST', 'OVERHEAD', 'PROCESS_EFFICIENCY', 'SUPPLIER_NEGOTIATION'], {
    required_error: 'Optimization type is required',
  }),
  targetMetric: z.string().min(1, 'Target metric is required'),
  currentValue: z.number(),
  targetValue: z.number(),
  improvementPercentage: z.number().min(0, 'Improvement must be non-negative').max(100, 'Improvement must be at most 100%'),
  strategies: z.array(z.object({
    id: z.string().min(1, 'Strategy ID is required'),
    name: z.string().min(1, 'Strategy name is required'),
    description: z.string().max(200, 'Description must be less than 200 characters'),
    implementationCost: z.number().min(0).default(0),
    expectedSavings: z.number().min(0),
    timeframe: z.number().int().min(1, 'Timeframe must be at least 1 day').max(365, 'Timeframe must be at most 365 days'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    status: z.enum(['PROPOSED', 'APPROVED', 'IMPLEMENTED', 'MONITORING']).default('PROPOSED'),
  })).min(1, 'At least one strategy is required'),
  isActive: z.boolean().default(true),
  monitoringFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('WEEKLY'),
});

export const updateCostOptimizationSchema = createCostOptimizationSchema.partial().extend({
  id: z.string().optional(),
});

// Material Waste Reduction Validation
export const createWasteReductionSchema = z.object({
  name: z.string().min(1, 'Waste reduction name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  materialType: z.string().min(1, 'Material type is required'),
  currentWastePercentage: z.number().min(0, 'Waste percentage must be non-negative').max(100, 'Waste percentage must be at most 100%'),
  targetWastePercentage: z.number().min(0, 'Target waste must be non-negative').max(100, 'Target waste must be at most 100%'),
  reductionStrategies: z.array(z.object({
    id: z.string().min(1, 'Strategy ID is required'),
    name: z.string().min(1, 'Strategy name is required'),
    description: z.string().max(200, 'Description must be less than 200 characters'),
    implementationDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
    expectedReduction: z.number().min(0, 'Expected reduction must be non-negative').max(100, 'Expected reduction must be at most 100%'),
    cost: z.number().min(0).default(0),
    timeframe: z.number().int().min(1, 'Timeframe must be at least 1 day').max(180, 'Timeframe must be at most 180 days'),
  })).min(1, 'At least one strategy is required'),
  monitoringMetrics: z.array(z.string()).min(1, 'At least one monitoring metric is required'),
  isActive: z.boolean().default(true),
});

export const updateWasteReductionSchema = createWasteReductionSchema.partial().extend({
  id: z.string().optional(),
});

// Smart Notification Validation
export const createSmartNotificationSchema = z.object({
  name: z.string().min(1, 'Notification name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  triggerEvent: z.string().min(1, 'Trigger event is required'),
  conditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'IN']),
    value: z.any(),
    logicalOperator: z.enum(['AND', 'OR']).default('AND'),
  })).min(1, 'At least one condition is required'),
  notificationChannels: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'DASHBOARD', 'PUSH'])).min(1, 'At least one channel is required'),
  recipients: z.array(z.string().email('Invalid email format')).optional(),
  templateId: z.string().min(1, 'Template is required'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  cooldownMinutes: z.number().int().min(0).max(1440).default(60),
  isActive: z.boolean().default(true),
});

export const updateSmartNotificationSchema = createSmartNotificationSchema.partial().extend({
  id: z.string().optional(),
});

// Predictive Analytics Validation
export const createPredictiveModelSchema = z.object({
  name: z.string().min(1, 'Model name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  modelType: z.enum(['SALES_FORECAST', 'CUSTOMER_CHURN', 'DEMAND_PREDICTION', 'PRICE_OPTIMIZATION', 'INVENTORY_FORECAST'], {
    required_error: 'Model type is required',
  }),
  algorithm: z.enum(['LINEAR_REGRESSION', 'DECISION_TREE', 'RANDOM_FOREST', 'NEURAL_NETWORK', 'SVM', 'ENSEMBLE'], {
    required_error: 'Algorithm is required',
  }),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  targetVariable: z.string().min(1, 'Target variable is required'),
  trainingDataSource: z.string().min(1, 'Training data source is required'),
  trainingDataDays: z.number().int().min(30, 'Training data must be at least 30 days').max(1095, 'Training data must be at most 1095 days').default(365),
  validationSplit: z.number().min(0.1, 'Validation split must be at least 10%').max(0.5, 'Validation split must be at most 50%').default(0.2),
  hyperparameters: z.any().optional(),
  isActive: z.boolean().default(true),
  autoRetrain: z.boolean().default(true),
  retrainFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY']).default('MONTHLY'),
});

export const updatePredictiveModelSchema = createPredictiveModelSchema.partial().extend({
  id: z.string().optional(),
});

// Workflow Automation Validation
export const createWorkflowAutomationSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  triggerEvent: z.string().min(1, 'Trigger event is required'),
  triggerConditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS']),
    value: z.any(),
  })).optional(),
  actions: z.array(z.object({
    id: z.string().min(1, 'Action ID is required'),
    type: z.enum(['SEND_NOTIFICATION', 'CREATE_TASK', 'UPDATE_STATUS', 'GENERATE_DOCUMENT', 'TRIGGER_INTEGRATION']),
    parameters: z.any(),
    delay: z.number().int().min(0).max(1440).default(0), // Delay in minutes
    conditions: z.array(z.object({
      field: z.string().min(1, 'Field is required'),
      operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN']),
      value: z.any(),
    })).optional(),
  })).min(1, 'At least one action is required'),
  isActive: z.boolean().default(true),
  maxExecutions: z.number().int().min(1).max(1000).optional(),
  executionCount: z.number().int().min(0).default(0),
});

export const updateWorkflowAutomationSchema = createWorkflowAutomationSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateDemandForecastInput = z.infer<typeof createDemandForecastSchema>;
export type UpdateDemandForecastInput = z.infer<typeof updateDemandForecastSchema>;
export type CreateQAAutomationInput = z.infer<typeof createQAAutomationSchema>;
export type UpdateQAAutomationInput = z.infer<typeof updateQAAutomationSchema>;
export type CreateCostOptimizationInput = z.infer<typeof createCostOptimizationSchema>;
export type UpdateCostOptimizationInput = z.infer<typeof updateCostOptimizationSchema>;
export type CreateWasteReductionInput = z.infer<typeof createWasteReductionSchema>;
export type UpdateWasteReductionInput = z.infer<typeof updateWasteReductionSchema>;
export type CreateSmartNotificationInput = z.infer<typeof createSmartNotificationSchema>;
export type UpdateSmartNotificationInput = z.infer<typeof updateSmartNotificationSchema>;
export type CreatePredictiveModelInput = z.infer<typeof createPredictiveModelSchema>;
export type UpdatePredictiveModelInput = z.infer<typeof updatePredictiveModelSchema>;
export type CreateWorkflowAutomationInput = z.infer<typeof createWorkflowAutomationSchema>;
export type UpdateWorkflowAutomationInput = z.infer<typeof updateWorkflowAutomationSchema>;
