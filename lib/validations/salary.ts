import { z } from 'zod';
import {
  PayPeriod,
  CalculationType,
  OrderType,
  MetricType,
  PeriodType,
  BonusType,
  BonusStatus,
  PayrollStatus
} from '../../types';

// Salary Structure Validation
export const salaryStructureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  employeeId: z.string().min(1, 'Employee is required'),
  baseSalary: z.number().positive('Base salary must be positive'),
  payPeriod: z.nativeEnum(PayPeriod),
  standardHours: z.number().min(1, 'Standard hours must be at least 1').max(24, 'Standard hours must be less than 24'),
  overtimeRate: z.number().min(1, 'Overtime rate must be at least 1').max(5, 'Overtime rate must be less than 5'),
  weekendRate: z.number().min(1, 'Weekend rate must be at least 1').max(5, 'Weekend rate must be less than 5'),
  holidayRate: z.number().min(1, 'Holiday rate must be at least 1').max(5, 'Holiday rate must be less than 5'),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const createSalaryStructureSchema = salaryStructureSchema;
export const updateSalaryStructureSchema = salaryStructureSchema.partial().extend({
  id: z.string().optional(),
});

// Commission Rule Validation
const baseCommissionRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  orderType: z.nativeEnum(OrderType),
  calculationType: z.nativeEnum(CalculationType),
  basePercentage: z.number().min(0, 'Base percentage must be non-negative').max(100, 'Base percentage must be less than 100').optional(),
  fixedAmount: z.number().positive('Fixed amount must be positive').optional(),
  complexityMultiplierMin: z.number().min(0.1, 'Complexity multiplier min must be at least 0.1').max(10, 'Complexity multiplier min must be less than 10'),
  complexityMultiplierMax: z.number().min(0.1, 'Complexity multiplier max must be at least 0.1').max(10, 'Complexity multiplier max must be less than 10'),
  timeBonusEarly: z.number().min(0, 'Time bonus early must be non-negative').max(1, 'Time bonus early must be less than 1'),
  timePenaltyDelay: z.number().min(0, 'Time penalty delay must be non-negative').max(1, 'Time penalty delay must be less than 1'),
  qualityBonus: z.number().min(0, 'Quality bonus must be non-negative').max(1, 'Quality bonus must be less than 1'),
  conditions: z.any().optional(),
  isActive: z.boolean().default(true),
});

export const commissionRuleSchema = baseCommissionRuleSchema.refine((data) => {
  if (data.calculationType === CalculationType.PERCENTAGE && !data.basePercentage) {
    return false;
  }
  if (data.calculationType === CalculationType.FIXED && !data.fixedAmount) {
    return false;
  }
  return true;
}, {
  message: 'Base percentage or fixed amount is required based on calculation type',
  path: ['basePercentage', 'fixedAmount'],
});

export const createCommissionRuleSchema = commissionRuleSchema;
export const updateCommissionRuleSchema = baseCommissionRuleSchema.partial().extend({
  id: z.string().optional(),
});

// Performance Metric Validation
export const performanceMetricSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  metricType: z.nativeEnum(MetricType),
  value: z.number().min(0, 'Value must be non-negative').max(100, 'Value must be less than 100'),
  targetValue: z.number().min(0, 'Target value must be non-negative').max(100, 'Target value must be less than 100'),
  weight: z.number().min(0.1, 'Weight must be at least 0.1').max(10, 'Weight must be less than 10'),
  period: z.string().min(1, 'Period is required'),
  periodType: z.nativeEnum(PeriodType),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const createPerformanceMetricSchema = performanceMetricSchema;
export const updatePerformanceMetricSchema = performanceMetricSchema.partial().extend({
  id: z.string().optional(),
});

// Bonus Validation
export const bonusSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  commissionRuleId: z.string().optional(),
  performanceMetricId: z.string().optional(),
  bonusType: z.nativeEnum(BonusType),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('AED'),
  calculationBasis: z.any(),
  performanceMetrics: z.any().optional(),
  period: z.string().min(1, 'Period is required'),
  periodType: z.nativeEnum(PeriodType),
  status: z.nativeEnum(BonusStatus).default(BonusStatus.PENDING),
});

export const createBonusSchema = bonusSchema;
export const updateBonusSchema = bonusSchema.partial().extend({
  id: z.string().optional(),
});

// Payroll Validation
export const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  salaryStructureId: z.string().optional(),
  period: z.string().min(1, 'Period is required'),
  periodType: z.nativeEnum(PeriodType),
  startDate: z.date(),
  endDate: z.date(),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  overtimePay: z.number().min(0, 'Overtime pay must be non-negative'),
  commissionPay: z.number().min(0, 'Commission pay must be non-negative'),
  bonusPay: z.number().min(0, 'Bonus pay must be non-negative'),
  totalEarnings: z.number().min(0, 'Total earnings must be non-negative'),
  deductions: z.number().min(0, 'Deductions must be non-negative'),
  netPay: z.number().min(0, 'Net pay must be non-negative'),
  status: z.nativeEnum(PayrollStatus).default(PayrollStatus.DRAFT),
  calculationDetails: z.any(),
});

export const createPayrollSchema = payrollSchema;
export const updatePayrollSchema = payrollSchema.partial().extend({
  id: z.string().optional(),
});

// Export types
export type CreateSalaryStructureInput = z.infer<typeof createSalaryStructureSchema>;
export type UpdateSalaryStructureInput = z.infer<typeof updateSalaryStructureSchema>;
export type CreateCommissionRuleInput = z.infer<typeof createCommissionRuleSchema>;
export type UpdateCommissionRuleInput = z.infer<typeof updateCommissionRuleSchema>;
export type CreatePerformanceMetricInput = z.infer<typeof createPerformanceMetricSchema>;
export type UpdatePerformanceMetricInput = z.infer<typeof updatePerformanceMetricSchema>;
export type CreateBonusInput = z.infer<typeof createBonusSchema>;
export type UpdateBonusInput = z.infer<typeof updateBonusSchema>;
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;
