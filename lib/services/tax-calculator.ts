import { prisma } from '../prisma';
import { TaxType, PeriodType, PayrollStatus } from '../../types';

export interface TaxCalculationInput {
  employeeId: string;
  grossIncome: number;
  period: PeriodType;
  taxYear?: number;
}

export interface TaxCalculationResult {
  totalTax: number;
  taxBreakdown: {
    taxType: TaxType;
    amount: number;
    rate: number;
    calculation: string;
  }[];
  netIncome: number;
  effectiveTaxRate: number;
}

export class TaxCalculator {
  // UAE Tax Brackets (simplified for 2023-2024)
  private static readonly UAE_TAX_BRACKETS = [
    { min: 0, max: 375000, rate: 0 }, // 0% up to AED 375,000
    { min: 375000, max: 750000, rate: 0.09 }, // 9% from AED 375,000 to 750,000
    { min: 750000, max: 1500000, rate: 0.15 }, // 15% from AED 750,000 to 1,500,000
    { min: 1500000, max: Infinity, rate: 0.18 }, // 18% above AED 1,500,000
  ];

  private static readonly SOCIAL_SECURITY_RATE = 0.05; // 5% employee contribution
  private static readonly SOCIAL_SECURITY_MAX = 50000; // Max annual contribution

  static async calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    const { employeeId, grossIncome, period, taxYear = new Date().getFullYear() } = input;

    // Get active tax deductions
    const taxDeductions = await prisma.taxDeduction.findMany({
      where: {
        isActive: true,
        effectiveFrom: {
          lte: new Date(`${taxYear}-12-31`),
        },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date(`${taxYear}-01-01`) } },
        ],
      },
    });

    let totalTax = 0;
    const taxBreakdown: TaxCalculationResult['taxBreakdown'] = [];

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(grossIncome);
    if (incomeTax > 0) {
      taxBreakdown.push({
        taxType: TaxType.INCOME_TAX,
        amount: incomeTax,
        rate: this.getEffectiveTaxRate(grossIncome),
        calculation: `Income tax on AED ${grossIncome.toLocaleString()}`,
      });
      totalTax += incomeTax;
    }

    // Calculate social security
    const socialSecurity = this.calculateSocialSecurity(grossIncome);
    if (socialSecurity > 0) {
      taxBreakdown.push({
        taxType: TaxType.SOCIAL_SECURITY,
        amount: socialSecurity,
        rate: this.SOCIAL_SECURITY_RATE,
        calculation: `Social security on AED ${grossIncome.toLocaleString()}`,
      });
      totalTax += socialSecurity;
    }

    // Calculate other taxes from database
    for (const deduction of taxDeductions) {
      let amount = 0;

      if (deduction.fixedAmount) {
        amount = deduction.fixedAmount;
      } else if (deduction.rate) {
        amount = grossIncome * deduction.rate;

        // Apply min/max income thresholds
        if (deduction.minIncome && grossIncome < deduction.minIncome) {
          amount = 0;
        }
        if (deduction.maxIncome && grossIncome > deduction.maxIncome) {
          amount = deduction.maxIncome * deduction.rate;
        }
      }

      if (amount > 0) {
        taxBreakdown.push({
          taxType: deduction.taxType,
          amount,
          rate: deduction.rate || 0,
          calculation: `${deduction.name} calculation`,
        });
        totalTax += amount;
      }
    }

    const netIncome = grossIncome - totalTax;
    const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

    return {
      totalTax,
      taxBreakdown,
      netIncome,
      effectiveTaxRate,
    };
  }

  private static calculateIncomeTax(annualIncome: number): number {
    let tax = 0;

    for (const bracket of this.UAE_TAX_BRACKETS) {
      if (annualIncome <= bracket.min) {
        break;
      }

      const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }

    return tax;
  }

  private static calculateSocialSecurity(annualIncome: number): number {
    const contribution = annualIncome * this.SOCIAL_SECURITY_RATE;
    return Math.min(contribution, this.SOCIAL_SECURITY_MAX);
  }

  private static getEffectiveTaxRate(annualIncome: number): number {
    if (annualIncome <= 0) return 0;

    const tax = this.calculateIncomeTax(annualIncome);
    return (tax / annualIncome) * 100;
  }

  static async calculatePayrollTaxDeductions(
    payrollId: string,
    grossEarnings: number
  ): Promise<{ totalTax: number; entries: any[] }> {
    // Get payroll details
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { employee: true },
    });

    if (!payroll) {
      throw new Error('Payroll not found');
    }

    // Calculate annual income (simplified - in real scenario, aggregate from multiple payrolls)
    const annualIncome = this.estimateAnnualIncome(grossEarnings, payroll.periodType);

    // Calculate tax
    const taxResult = await this.calculateTax({
      employeeId: payroll.employeeId,
      grossIncome: annualIncome,
      period: payroll.periodType,
    });

    // Create tax deduction entries
    const entries = [];
    for (const breakdown of taxResult.taxBreakdown) {
      // Find or create tax deduction record
      let taxDeduction = await prisma.taxDeduction.findFirst({
        where: {
          taxType: breakdown.taxType,
          isActive: true,
        },
      });

      if (!taxDeduction) {
        // Create default tax deduction if not exists
        taxDeduction = await prisma.taxDeduction.create({
          data: {
            name: breakdown.taxType.replace('_', ' '),
            taxType: breakdown.taxType,
            rate: breakdown.rate,
            isActive: true,
          },
        });
      }

      // Create tax deduction entry
      const entry = await prisma.taxDeductionEntry.create({
        data: {
          payrollId,
          taxDeductionId: taxDeduction.id,
          amount: breakdown.amount,
          calculationBasis: {
            grossEarnings,
            annualIncome,
            rate: breakdown.rate,
            calculation: breakdown.calculation,
          },
        },
      });

      entries.push(entry);
    }

    // Update payroll with tax deductions
    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        taxDeductions: taxResult.totalTax,
        totalDeductions: taxResult.totalTax, // Assuming no other deductions for now
        netPay: grossEarnings - taxResult.totalTax,
        taxCalculationDetails: taxResult,
      },
    });

    return {
      totalTax: taxResult.totalTax,
      entries,
    };
  }

  private static estimateAnnualIncome(grossEarnings: number, periodType: PeriodType): number {
    switch (periodType) {
      case PeriodType.MONTHLY:
        return grossEarnings * 12;
      case PeriodType.BI_WEEKLY:
        return grossEarnings * 26;
      case PeriodType.WEEKLY:
        return grossEarnings * 52;
      default:
        return grossEarnings;
    }
  }

  static async generateTaxReport(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Get all payrolls for the period
    const payrolls = await prisma.payroll.findMany({
      where: {
        employeeId,
        startDate: { gte: startDate },
        endDate: { lte: endDate },
        status: 'PAID',
      },
      include: {
        taxDeductionEntries: {
          include: {
            taxDeduction: true,
          },
        },
      },
    });

    const totalGross = payrolls.reduce((sum, p) => sum + p.totalEarnings, 0);
    const totalTax = payrolls.reduce((sum, p) => sum + p.taxDeductions, 0);
    const totalNet = payrolls.reduce((sum, p) => sum + p.netPay, 0);

    // Group by tax type
    const taxByType: Record<string, number> = {};
    payrolls.forEach(payroll => {
      payroll.taxDeductionEntries.forEach(entry => {
        const type = entry.taxDeduction.taxType;
        taxByType[type] = (taxByType[type] || 0) + entry.amount;
      });
    });

    return {
      employeeId,
      period: { startDate, endDate },
      totalGross,
      totalTax,
      totalNet,
      effectiveTaxRate: totalGross > 0 ? (totalTax / totalGross) * 100 : 0,
      taxBreakdown: taxByType,
      payrollCount: payrolls.length,
    };
  }
}
