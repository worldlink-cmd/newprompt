import { prisma } from '../prisma';
import { OvertimeCalculator } from './overtime-calculator';
import { CommissionCalculator } from './commission-calculator';
import { TaxCalculator } from './tax-calculator';
import { PeriodType, PayrollStatus } from '../../types';

export interface PayrollGenerationInput {
  employeeId: string;
  period: string;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
}

export interface PayrollGenerationResult {
  payroll: any;
  overtimeCalculation: any;
  commissionCalculations: any[];
  totalEarnings: number;
  calculationDetails: any;
}

export class PayrollGenerator {
  static async generatePayroll(input: PayrollGenerationInput): Promise<PayrollGenerationResult> {
    // Get salary structure
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { employeeId: input.employeeId },
    });

    if (!salaryStructure) {
      throw new Error(`No salary structure found for employee: ${input.employeeId}`);
    }

    // Calculate overtime
    const overtimeCalculation = await OvertimeCalculator.calculateOvertime({
      employeeId: input.employeeId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    // Calculate base salary for the period
    const baseSalary = this.calculateBaseSalary(salaryStructure, input.periodType);

    // Calculate overtime pay
    const overtimePay = OvertimeCalculator.calculateOvertimePay(overtimeCalculation, salaryStructure);

    // Get completed orders for commission calculation
    const completedOrders = await this.getCompletedOrdersForEmployee(input.employeeId, input.startDate, input.endDate);

    // Calculate commissions
    const commissionInputs = completedOrders.map(order => ({
      orderId: order.id,
      employeeId: input.employeeId,
      orderType: order.orderType,
      orderAmount: order.totalAmount || 0,
      complexityFactor: this.calculateComplexityFactor(order),
      completionDays: this.calculateCompletionDays(order),
      deliveryDays: this.calculateDeliveryDays(order),
      qualityScore: this.getQualityScore(order),
    }));

    const commissionCalculations = await CommissionCalculator.calculateBulkCommissions(commissionInputs);
    const totalCommissionPay = commissionCalculations.reduce((sum, calc) => sum + calc.totalCommission, 0);

    // Get bonuses for the period
    const bonuses = await prisma.bonus.findMany({
      where: {
        employeeId: input.employeeId,
        period: input.period,
        periodType: input.periodType,
        status: 'APPROVED',
      },
    });

    const bonusPay = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

    // Calculate total earnings
    const totalEarnings = baseSalary + overtimePay + totalCommissionPay + bonusPay;

    // Calculate tax deductions
    let taxDeductions = 0;
    let taxCalculationDetails = null;

    try {
      const taxResult = await TaxCalculator.calculateTax({
        employeeId: input.employeeId,
        grossIncome: totalEarnings,
        period: input.periodType,
      });

      taxDeductions = taxResult.totalTax;
      taxCalculationDetails = taxResult;
    } catch (error) {
      console.warn('Tax calculation failed, proceeding without tax deductions:', error);
    }

    const netPay = totalEarnings - taxDeductions;

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        employeeId: input.employeeId,
        period: input.period,
        periodType: input.periodType,
        startDate: input.startDate,
        endDate: input.endDate,
        baseSalary,
        overtimePay,
        commissionPay: totalCommissionPay,
        bonusPay,
        totalEarnings,
        taxDeductions,
        otherDeductions: 0,
        totalDeductions: taxDeductions,
        netPay,
        status: PayrollStatus.DRAFT,
        calculationDetails: {
          overtimeCalculation,
          commissionCalculations,
          bonuses,
        },
        taxCalculationDetails,
      },
    });

    return {
      payroll,
      overtimeCalculation,
      commissionCalculations,
      totalEarnings,
      calculationDetails: {
        baseSalary,
        overtimePay,
        totalCommissionPay,
        bonusPay,
      },
    };
  }

  private static calculateBaseSalary(salaryStructure: any, periodType: PeriodType): number {
    switch (periodType) {
      case PeriodType.MONTHLY:
        return salaryStructure.baseSalary;
      case PeriodType.BI_WEEKLY:
        return salaryStructure.baseSalary / 2;
      case PeriodType.WEEKLY:
        return salaryStructure.baseSalary / 4;
      default:
        return salaryStructure.baseSalary;
    }
  }

  private static async getCompletedOrdersForEmployee(employeeId: string, startDate: Date, endDate: Date) {
    // This would need to be implemented based on how orders are linked to employees
    // For now, return empty array
    return [];
  }

  private static calculateComplexityFactor(order: any): number {
    // Implement complexity calculation based on order details
    return 1.0; // Default
  }

  private static calculateCompletionDays(order: any): number {
    // Calculate days from order date to completion
    if (order.createdAt && order.updatedAt) {
      return Math.ceil((order.updatedAt.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  private static calculateDeliveryDays(order: any): number {
    // Calculate days from order date to delivery date
    if (order.orderDate && order.deliveryDate) {
      return Math.ceil((order.deliveryDate.getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 30; // Default 30 days
  }

  private static getQualityScore(order: any): number {
    // Get quality score from order or tasks
    return 85; // Default score
  }

  static async generateBulkPayrolls(employees: string[], period: string, periodType: PeriodType, startDate: Date, endDate: Date) {
    const results: PayrollGenerationResult[] = [];

    for (const employeeId of employees) {
      try {
        const result = await this.generatePayroll({
          employeeId,
          period,
          periodType,
          startDate,
          endDate,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error generating payroll for employee ${employeeId}:`, error);
      }
    }

    return results;
  }
}
