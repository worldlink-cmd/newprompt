import { prisma } from '../prisma';
import { OrderType, CalculationType } from '../../types';

export interface CommissionCalculationInput {
  orderId: string;
  employeeId: string;
  orderType: OrderType;
  orderAmount: number;
  complexityFactor?: number;
  completionDays?: number;
  deliveryDays?: number;
  qualityScore?: number;
}

export interface CommissionCalculationResult {
  baseCommission: number;
  complexityBonus: number;
  timeBonus: number;
  qualityBonus: number;
  totalCommission: number;
  ruleId: string;
  calculationDetails: any;
}

export class CommissionCalculator {
  static async calculateCommission(input: CommissionCalculationInput): Promise<CommissionCalculationResult> {
    // Find applicable commission rule
    const rule = await prisma.commissionRule.findFirst({
      where: {
        orderType: input.orderType,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc', // Get the latest rule
      },
    });

    if (!rule) {
      throw new Error(`No commission rule found for order type: ${input.orderType}`);
    }

    let baseCommission = 0;
    let complexityBonus = 0;
    let timeBonus = 0;
    let qualityBonus = 0;

    const calculationDetails: any = {
      ruleId: rule.id,
      ruleName: rule.name,
      orderType: input.orderType,
      orderAmount: input.orderAmount,
    };

    // Calculate base commission
    switch (rule.calculationType) {
      case CalculationType.PERCENTAGE:
        baseCommission = (input.orderAmount * (rule.basePercentage || 0)) / 100;
        calculationDetails.basePercentage = rule.basePercentage;
        break;

      case CalculationType.FIXED:
        baseCommission = rule.fixedAmount || 0;
        calculationDetails.fixedAmount = rule.fixedAmount;
        break;

      case CalculationType.TIERED:
        baseCommission = this.calculateTieredCommission(input.orderAmount, rule.conditions);
        calculationDetails.tieredCalculation = true;
        break;

      case CalculationType.HYBRID:
        const percentagePart = (input.orderAmount * (rule.basePercentage || 0)) / 100;
        const fixedPart = rule.fixedAmount || 0;
        baseCommission = percentagePart + fixedPart;
        calculationDetails.hybridCalculation = true;
        calculationDetails.percentagePart = percentagePart;
        calculationDetails.fixedPart = fixedPart;
        break;
    }

    // Apply complexity multiplier
    const complexityFactor = input.complexityFactor || 1.0;
    complexityBonus = baseCommission * (complexityFactor - 1);
    calculationDetails.complexityFactor = complexityFactor;
    calculationDetails.complexityBonus = complexityBonus;

    // Apply time bonus/penalty
    if (input.completionDays !== undefined && input.deliveryDays !== undefined) {
      const timeFactor = this.calculateTimeFactor(input.completionDays, input.deliveryDays, rule);
      timeBonus = baseCommission * timeFactor;
      calculationDetails.completionDays = input.completionDays;
      calculationDetails.deliveryDays = input.deliveryDays;
      calculationDetails.timeFactor = timeFactor;
      calculationDetails.timeBonus = timeBonus;
    }

    // Apply quality bonus
    if (input.qualityScore !== undefined) {
      const qualityFactor = this.calculateQualityFactor(input.qualityScore, rule);
      qualityBonus = baseCommission * qualityFactor;
      calculationDetails.qualityScore = input.qualityScore;
      calculationDetails.qualityFactor = qualityFactor;
      calculationDetails.qualityBonus = qualityBonus;
    }

    const totalCommission = baseCommission + complexityBonus + timeBonus + qualityBonus;

    return {
      baseCommission,
      complexityBonus,
      timeBonus,
      qualityBonus,
      totalCommission,
      ruleId: rule.id,
      calculationDetails,
    };
  }

  private static calculateTieredCommission(amount: number, conditions: any): number {
    // Implement tiered calculation logic based on conditions
    // For now, return a simple percentage
    return (amount * 0.1); // 10% as default
  }

  private static calculateTimeFactor(completionDays: number, deliveryDays: number, rule: any): number {
    if (completionDays < deliveryDays) {
      // Early completion bonus
      const earlyFactor = (deliveryDays - completionDays) / deliveryDays;
      return Math.min(earlyFactor * rule.timeBonusEarly, 0.5); // Max 50% bonus
    } else if (completionDays > deliveryDays) {
      // Delay penalty
      const delayFactor = (completionDays - deliveryDays) / deliveryDays;
      return -Math.min(delayFactor * rule.timePenaltyDelay, 0.3); // Max 30% penalty
    }
    return 0; // On time
  }

  private static calculateQualityFactor(qualityScore: number, rule: any): number {
    if (qualityScore >= 90) {
      return rule.qualityBonus;
    } else if (qualityScore >= 70) {
      return rule.qualityBonus * 0.5;
    }
    return 0; // No bonus for low quality
  }

  static async calculateBulkCommissions(orders: CommissionCalculationInput[]): Promise<CommissionCalculationResult[]> {
    const results: CommissionCalculationResult[] = [];

    for (const order of orders) {
      try {
        const result = await this.calculateCommission(order);
        results.push(result);
      } catch (error) {
        console.error(`Error calculating commission for order ${order.orderId}:`, error);
        // Continue with other orders
      }
    }

    return results;
  }

  static async generateCommissionBonus(
    employeeId: string,
    calculationResult: CommissionCalculationResult,
    period: string,
    periodType: string
  ) {
    return await prisma.bonus.create({
      data: {
        employeeId,
        commissionRuleId: calculationResult.ruleId,
        bonusType: 'COMMISSION',
        amount: calculationResult.totalCommission,
        currency: 'AED',
        calculationBasis: calculationResult.calculationDetails,
        period,
        periodType: periodType as any,
        status: 'PENDING',
      },
    });
  }
}
