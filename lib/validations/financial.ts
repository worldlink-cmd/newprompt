import { z } from 'zod';
import { TransactionType, PaymentMethod, ExpenseCategoryType, FinancialPeriod } from 'types';

// Expense Category Validation
export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.nativeEnum(ExpenseCategoryType, {
    required_error: 'Category type is required',
  }),
  budgetLimit: z.number().min(0, 'Budget limit must be positive').optional(),
  isActive: z.boolean().default(true),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema.partial().extend({
  id: z.string().optional(),
});

// Financial Transaction Validation
export const createFinancialTransactionSchema = z.object({
  transactionNumber: z.string().min(1, 'Transaction number is required'),
  type: z.nativeEnum(TransactionType, {
    required_error: 'Transaction type is required',
  }),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().default('AED'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: 'Payment method is required',
  }),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  transactionDate: z.coerce.date().default(new Date()),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  categoryId: z.string().optional(),
  customerId: z.string().optional(),
  orderId: z.string().optional(),
  supplierId: z.string().optional(),
  employeeId: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.string().default('COMPLETED'),
});

export const updateFinancialTransactionSchema = createFinancialTransactionSchema.partial().extend({
  id: z.string().optional(),
});

// Sales Record Validation
export const createSalesRecordSchema = z.object({
  date: z.coerce.date().default(new Date()),
  totalRevenue: z.number().min(0, 'Total revenue must be positive'),
  totalTransactions: z.number().int().min(0, 'Total transactions must be non-negative').default(0),
  cashAmount: z.number().min(0, 'Cash amount must be positive').default(0),
  cardAmount: z.number().min(0, 'Card amount must be positive').default(0),
  onlineAmount: z.number().min(0, 'Online amount must be positive').default(0),
  otherAmount: z.number().min(0, 'Other amount must be positive').default(0),
  transactionCount: z.number().int().min(0, 'Transaction count must be non-negative').default(0),
  averageTransactionValue: z.number().min(0, 'Average transaction value must be positive').default(0),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateSalesRecordSchema = createSalesRecordSchema.partial().extend({
  id: z.string().optional(),
});

// Profit Loss Calculation Validation
export const createProfitLossCalculationSchema = z.object({
  period: z.string().min(1, 'Period is required'),
  periodType: z.nativeEnum(FinancialPeriod, {
    required_error: 'Period type is required',
  }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalRevenue: z.number().min(0, 'Total revenue must be positive').default(0),
  totalExpenses: z.number().min(0, 'Total expenses must be positive').default(0),
  grossProfit: z.number().default(0),
  netProfit: z.number().default(0),
  profitMargin: z.number().min(-100, 'Profit margin must be between -100 and 100').max(100).default(0),
  expenseBreakdown: z.any().optional(),
  revenueBreakdown: z.any().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateProfitLossCalculationSchema = createProfitLossCalculationSchema.partial().extend({
  id: z.string().optional(),
});

// Cash Flow Validation
export const createCashFlowSchema = z.object({
  period: z.string().min(1, 'Period is required'),
  periodType: z.nativeEnum(FinancialPeriod, {
    required_error: 'Period type is required',
  }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  openingBalance: z.number().default(0),
  cashInflows: z.number().min(0, 'Cash inflows must be positive').default(0),
  cashOutflows: z.number().min(0, 'Cash outflows must be positive').default(0),
  netCashFlow: z.number().default(0),
  closingBalance: z.number().default(0),
  inflowBreakdown: z.any().optional(),
  outflowBreakdown: z.any().optional(),
  forecast: z.boolean().default(false),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateCashFlowSchema = createCashFlowSchema.partial().extend({
  id: z.string().optional(),
});

// Type exports
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;
export type CreateFinancialTransactionInput = z.infer<typeof createFinancialTransactionSchema>;
export type UpdateFinancialTransactionInput = z.infer<typeof updateFinancialTransactionSchema>;
export type CreateSalesRecordInput = z.infer<typeof createSalesRecordSchema>;
export type UpdateSalesRecordInput = z.infer<typeof updateSalesRecordSchema>;
export type CreateProfitLossCalculationInput = z.infer<typeof createProfitLossCalculationSchema>;
export type UpdateProfitLossCalculationInput = z.infer<typeof updateProfitLossCalculationSchema>;
export type CreateCashFlowInput = z.infer<typeof createCashFlowSchema>;
export type UpdateCashFlowInput = z.infer<typeof updateCashFlowSchema>;
