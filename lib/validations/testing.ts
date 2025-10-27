import { z } from 'zod';

// Test Suite Validation
export const createTestSuiteSchema = z.object({
  name: z.string().min(1, 'Test suite name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.enum(['UNIT', 'INTEGRATION', 'E2E', 'PERFORMANCE', 'SECURITY', 'API', 'UI'], {
    required_error: 'Category is required',
  }),
  isActive: z.boolean().default(true),
  autoRun: z.boolean().default(false),
  schedule: z.enum(['ON_DEMAND', 'DAILY', 'WEEKLY', 'BEFORE_DEPLOY']).default('ON_DEMAND'),
  timeout: z.number().int().min(1000, 'Timeout must be at least 1000ms').max(300000, 'Timeout must be at most 300000ms').default(30000),
  environment: z.enum(['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION']).default('TESTING'),
});

export const updateTestSuiteSchema = createTestSuiteSchema.partial().extend({
  id: z.string().optional(),
});

// Test Case Validation
export const createTestCaseSchema = z.object({
  name: z.string().min(1, 'Test case name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  suiteId: z.string().min(1, 'Test suite is required'),
  type: z.enum(['UNIT', 'INTEGRATION', 'E2E', 'API', 'UI', 'PERFORMANCE', 'SECURITY'], {
    required_error: 'Test type is required',
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']).default('ACTIVE'),
  steps: z.array(z.object({
    id: z.string().min(1, 'Step ID is required'),
    action: z.string().min(1, 'Action is required'),
    expectedResult: z.string().min(1, 'Expected result is required'),
    data: z.any().optional(),
    timeout: z.number().int().min(1000).max(60000).default(5000),
  })).min(1, 'At least one step is required'),
  preconditions: z.array(z.string()).optional(),
  postconditions: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isAutomated: z.boolean().default(false),
  automationScript: z.string().optional(),
});

export const updateTestCaseSchema = createTestCaseSchema.partial().extend({
  id: z.string().optional(),
});

// Test Execution Validation
export const createTestExecutionSchema = z.object({
  suiteId: z.string().min(1, 'Test suite is required'),
  caseIds: z.array(z.string()).min(1, 'At least one test case is required').optional(),
  environment: z.enum(['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION']).default('TESTING'),
  triggeredBy: z.string().min(1, 'Triggered by is required'),
  status: z.enum(['PENDING', 'RUNNING', 'PASSED', 'FAILED', 'CANCELLED', 'TIMEOUT']).default('PENDING'),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  duration: z.number().int().min(0).optional(),
  results: z.array(z.object({
    caseId: z.string().min(1, 'Case ID is required'),
    status: z.enum(['PASSED', 'FAILED', 'SKIPPED', 'ERROR']),
    duration: z.number().int().min(0),
    errorMessage: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    logs: z.string().optional(),
    data: z.any().optional(),
  })).optional(),
  summary: z.object({
    total: z.number().int().min(0),
    passed: z.number().int().min(0),
    failed: z.number().int().min(0),
    skipped: z.number().int().min(0),
    errors: z.number().int().min(0),
  }).optional(),
});

export const updateTestExecutionSchema = createTestExecutionSchema.partial().extend({
  id: z.string().optional(),
});

// Performance Test Validation
export const createPerformanceTestSchema = z.object({
  name: z.string().min(1, 'Performance test name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  targetUrl: z.string().url('Invalid target URL'),
  testType: z.enum(['LOAD', 'STRESS', 'SPIKE', 'VOLUME', 'ENDURANCE'], {
    required_error: 'Test type is required',
  }),
  configuration: z.object({
    virtualUsers: z.number().int().min(1, 'At least 1 virtual user required').max(10000, 'Maximum 10000 virtual users').default(100),
    duration: z.number().int().min(60, 'Duration must be at least 60 seconds').max(3600, 'Duration must be at most 3600 seconds').default(300),
    rampUpTime: z.number().int().min(0, 'Ramp up time must be non-negative').max(600, 'Ramp up time must be at most 600 seconds').default(30),
    maxResponseTime: z.number().int().min(100, 'Max response time must be at least 100ms').max(30000, 'Max response time must be at most 30000ms').default(5000),
    throughput: z.number().int().min(1).max(100000).optional(),
  }),
  scenarios: z.array(z.object({
    name: z.string().min(1, 'Scenario name is required'),
    weight: z.number().int().min(1).max(100).default(100),
    steps: z.array(z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      url: z.string().min(1, 'URL is required'),
      headers: z.record(z.string()).optional(),
      body: z.any().optional(),
      thinkTime: z.number().int().min(0).max(10000).default(1000),
    })).min(1, 'At least one step is required'),
  })).min(1, 'At least one scenario is required'),
  thresholds: z.object({
    responseTime: z.number().int().min(100).max(30000),
    errorRate: z.number().min(0).max(100).default(5),
    throughput: z.number().int().min(1).optional(),
  }),
  isActive: z.boolean().default(true),
});

export const updatePerformanceTestSchema = createPerformanceTestSchema.partial().extend({
  id: z.string().optional(),
});

// Load Test Validation
export const createLoadTestSchema = z.object({
  name: z.string().min(1, 'Load test name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  targetSystem: z.string().min(1, 'Target system is required'),
  testDuration: z.number().int().min(60, 'Test duration must be at least 60 seconds').max(7200, 'Test duration must be at most 7200 seconds').default(300),
  maxUsers: z.number().int().min(1, 'At least 1 user required').max(50000, 'Maximum 50000 users').default(1000),
  rampUpTime: z.number().int().min(0, 'Ramp up time must be non-negative').max(3600, 'Ramp up time must be at most 3600 seconds').default(60),
  metrics: z.array(z.enum(['RESPONSE_TIME', 'THROUGHPUT', 'ERROR_RATE', 'CPU_USAGE', 'MEMORY_USAGE', 'NETWORK_IO'])).min(1, 'At least one metric is required'),
  thresholds: z.object({
    maxResponseTime: z.number().int().min(100).max(60000).default(5000),
    maxErrorRate: z.number().min(0).max(100).default(5),
    minThroughput: z.number().int().min(1).optional(),
  }),
  isActive: z.boolean().default(true),
});

export const updateLoadTestSchema = createLoadTestSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateTestSuiteInput = z.infer<typeof createTestSuiteSchema>;
export type UpdateTestSuiteInput = z.infer<typeof updateTestSuiteSchema>;
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseSchema>;
export type CreateTestExecutionInput = z.infer<typeof createTestExecutionSchema>;
export type UpdateTestExecutionInput = z.infer<typeof updateTestExecutionSchema>;
export type CreatePerformanceTestInput = z.infer<typeof createPerformanceTestSchema>;
export type UpdatePerformanceTestInput = z.infer<typeof updatePerformanceTestSchema>;
export type CreateLoadTestInput = z.infer<typeof createLoadTestSchema>;
export type UpdateLoadTestInput = z.infer<typeof updateLoadTestSchema>;
