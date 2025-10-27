import { prisma } from '../prisma';
import { TransactionType, PaymentMethod, ExpenseCategoryType, FinancialPeriod } from 'types';
import {
  CreateFinancialTransactionInput,
  CreateSalesRecordInput,
  CreateProfitLossCalculationInput,
  CreateCashFlowInput
} from '../validations/financial';
import { generateTransactionNumber } from '../utils';

export class FinancialService {
  // Financial Transaction Methods
  static async createTransaction(data: CreateFinancialTransactionInput, userId: string) {
    const transactionNumber = generateTransactionNumber();

    return await prisma.financialTransaction.create({
      data: {
        ...data,
        transactionNumber,
        createdBy: userId,
      },
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            serviceDescription: true,
          },
        },
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getTransactions(filters: {
    type?: TransactionType;
    customerId?: string;
    orderId?: string;
    supplierId?: string;
    employeeId?: string;
    categoryId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    paymentMethod?: PaymentMethod;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      type,
      customerId,
      orderId,
      supplierId,
      employeeId,
      categoryId,
      dateFrom,
      dateTo,
      paymentMethod,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) where.type = type;
    if (customerId) where.customerId = customerId;
    if (orderId) where.orderId = orderId;
    if (supplierId) where.supplierId = supplierId;
    if (employeeId) where.employeeId = employeeId;
    if (categoryId) where.categoryId = categoryId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    const [transactions, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          category: true,
          customer: {
            select: {
              id: true,
              customerNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              serviceDescription: true,
            },
          },
          supplier: {
            select: {
              id: true,
              supplierNumber: true,
              name: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.financialTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTransactionById(id: string) {
    return await prisma.financialTransaction.findUnique({
      where: { id },
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            serviceDescription: true,
            totalAmount: true,
          },
        },
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateTransaction(id: string, data: Partial<CreateFinancialTransactionInput>) {
    return await prisma.financialTransaction.update({
      where: { id },
      data,
      include: {
        category: true,
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            serviceDescription: true,
          },
        },
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async deleteTransaction(id: string) {
    return await prisma.financialTransaction.delete({
      where: { id },
    });
  }

  // Sales Record Methods
  static async createSalesRecord(data: CreateSalesRecordInput, userId: string) {
    return await prisma.salesRecord.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          select: {
            id: true,
            transactionNumber: true,
            amount: true,
            paymentMethod: true,
          },
        },
      },
    });
  }

  static async getSalesRecords(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [salesRecords, total] = await Promise.all([
      prisma.salesRecord.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          transactions: {
            select: {
              id: true,
              transactionNumber: true,
              amount: true,
              paymentMethod: true,
            },
          },
        },
      }),
      prisma.salesRecord.count({ where }),
    ]);

    return {
      salesRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSalesRecordByDate(date: Date) {
    return await prisma.salesRecord.findUnique({
      where: { date },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          select: {
            id: true,
            transactionNumber: true,
            amount: true,
            paymentMethod: true,
            description: true,
          },
        },
      },
    });
  }

  // Revenue Calculation Methods
  static async calculateRevenue(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    customerId?: string;
    orderId?: string;
  }) {
    const where: any = {
      type: TransactionType.REVENUE,
    };

    if (filters.dateFrom || filters.dateTo) {
      where.transactionDate = {};
      if (filters.dateFrom) where.transactionDate.gte = filters.dateFrom;
      if (filters.dateTo) where.transactionDate.lte = filters.dateTo;
    }

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.orderId) where.orderId = filters.orderId;

    const result = await prisma.financialTransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalRevenue: Number(result._sum.amount) || 0,
      transactionCount: result._count.id,
    };
  }

  // Expense Calculation Methods
  static async calculateExpenses(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    categoryId?: string;
    supplierId?: string;
    employeeId?: string;
  }) {
    const where: any = {
      type: TransactionType.EXPENSE,
    };

    if (filters.dateFrom || filters.dateTo) {
      where.transactionDate = {};
      if (filters.dateFrom) where.transactionDate.gte = filters.dateFrom;
      if (filters.dateTo) where.transactionDate.lte = filters.dateTo;
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.employeeId) where.employeeId = filters.employeeId;

    const result = await prisma.financialTransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalExpenses: Number(result._sum.amount) || 0,
      transactionCount: result._count.id,
    };
  }

  // Profit/Loss Calculation Methods
  static async calculateProfitLoss(filters: {
    startDate: Date;
    endDate: Date;
    periodType: FinancialPeriod;
  }) {
    const { startDate, endDate, periodType } = filters;

    // Calculate revenue
    const revenue = await this.calculateRevenue({
      dateFrom: startDate,
      dateTo: endDate,
    });

    // Calculate expenses
    const expenses = await this.calculateExpenses({
      dateFrom: startDate,
      dateTo: endDate,
    });

    const grossProfit = revenue.totalRevenue - expenses.totalExpenses;
    const profitMargin = revenue.totalRevenue > 0 ? (grossProfit / revenue.totalRevenue) * 100 : 0;

    // Generate period string
    const period = this.generatePeriodString(startDate, endDate, periodType);

    return {
      period,
      periodType,
      startDate,
      endDate,
      totalRevenue: revenue.totalRevenue,
      totalExpenses: expenses.totalExpenses,
      grossProfit,
      netProfit: grossProfit, // For now, net profit equals gross profit
      profitMargin,
    };
  }

  static async saveProfitLossCalculation(data: CreateProfitLossCalculationInput, userId: string) {
    return await prisma.profitLossCalculation.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Cash Flow Methods
  static async calculateCashFlow(filters: {
    startDate: Date;
    endDate: Date;
    periodType: FinancialPeriod;
  }) {
    const { startDate, endDate, periodType } = filters;

    // Calculate cash inflows (revenue)
    const inflows = await this.calculateRevenue({
      dateFrom: startDate,
      dateTo: endDate,
    });

    // Calculate cash outflows (expenses)
    const outflows = await this.calculateExpenses({
      dateFrom: startDate,
      dateTo: endDate,
    });

    const netCashFlow = inflows.totalRevenue - outflows.totalExpenses;

    // Get opening balance (closing balance from previous period)
    const previousPeriod = this.getPreviousPeriod(startDate, periodType);
    const previousCashFlow = await prisma.cashFlow.findFirst({
      where: {
        period: previousPeriod.period,
        periodType,
        forecast: false,
      },
      orderBy: {
        endDate: 'desc',
      },
    });

    const openingBalance = previousCashFlow?.closingBalance || 0;
    const closingBalance = openingBalance + netCashFlow;

    // Generate period string
    const period = this.generatePeriodString(startDate, endDate, periodType);

    return {
      period,
      periodType,
      startDate,
      endDate,
      openingBalance,
      cashInflows: inflows.totalRevenue,
      cashOutflows: outflows.totalExpenses,
      netCashFlow,
      closingBalance,
    };
  }

  static async saveCashFlowCalculation(data: CreateCashFlowInput, userId: string) {
    return await prisma.cashFlow.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Utility Methods
  private static generatePeriodString(startDate: Date, endDate: Date, periodType: FinancialPeriod): string {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    switch (periodType) {
      case FinancialPeriod.DAILY:
        return start;
      case FinancialPeriod.WEEKLY:
        return `${start}_to_${end}`;
      case FinancialPeriod.MONTHLY:
        return start.substring(0, 7); // YYYY-MM
      case FinancialPeriod.QUARTERLY:
        const quarter = Math.floor(startDate.getMonth() / 3) + 1;
        return `${startDate.getFullYear()}-Q${quarter}`;
      case FinancialPeriod.YEARLY:
        return startDate.getFullYear().toString();
      default:
        return `${start}_to_${end}`;
    }
  }

  private static getPreviousPeriod(currentDate: Date, periodType: FinancialPeriod): { period: string; startDate: Date; endDate: Date } {
    const date = new Date(currentDate);

    switch (periodType) {
      case FinancialPeriod.DAILY:
        date.setDate(date.getDate() - 1);
        return {
          period: date.toISOString().split('T')[0],
          startDate: date,
          endDate: date,
        };
      case FinancialPeriod.WEEKLY:
        date.setDate(date.getDate() - 7);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          period: `${weekStart.toISOString().split('T')[0]}_to_${weekEnd.toISOString().split('T')[0]}`,
          startDate: weekStart,
          endDate: weekEnd,
        };
      case FinancialPeriod.MONTHLY:
        date.setMonth(date.getMonth() - 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
          period: monthStart.toISOString().split('T')[0].substring(0, 7),
          startDate: monthStart,
          endDate: monthEnd,
        };
      case FinancialPeriod.QUARTERLY:
        date.setMonth(date.getMonth() - 3);
        return {
          period: `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`,
          startDate: date,
          endDate: date,
        };
      case FinancialPeriod.YEARLY:
        date.setFullYear(date.getFullYear() - 1);
        return {
          period: date.getFullYear().toString(),
          startDate: date,
          endDate: date,
        };
      default:
        return {
          period: date.toISOString().split('T')[0],
          startDate: date,
          endDate: date,
        };
    }
  }

  // Dashboard Summary Methods
  static async getFinancialSummary(dateFrom?: Date, dateTo?: Date) {
    const revenue = await this.calculateRevenue({ dateFrom, dateTo });
    const expenses = await this.calculateExpenses({ dateFrom, dateTo });

    const profit = revenue.totalRevenue - expenses.totalExpenses;
    const profitMargin = revenue.totalRevenue > 0 ? (profit / revenue.totalRevenue) * 100 : 0;

    return {
      totalRevenue: revenue.totalRevenue,
      totalExpenses: expenses.totalExpenses,
      netProfit: profit,
      profitMargin,
      transactionCount: revenue.transactionCount + expenses.transactionCount,
    };
  }

  static async getPaymentMethodBreakdown(dateFrom?: Date, dateTo?: Date) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    const result = await prisma.financialTransaction.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return result.map(item => ({
      paymentMethod: item.paymentMethod,
      totalAmount: Number(item._sum.amount) || 0,
      transactionCount: item._count.id,
    }));
  }

  static async getExpenseCategoryBreakdown(dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      type: TransactionType.EXPENSE,
    };

    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    const result = await prisma.financialTransaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      include: {
        category: true,
      },
    });

    return result.map(item => ({
      categoryId: item.categoryId,
      category: item.category,
      totalAmount: Number(item._sum.amount) || 0,
      transactionCount: item._count.id,
    }));
  }
}
