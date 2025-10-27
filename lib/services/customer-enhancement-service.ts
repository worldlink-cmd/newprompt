import { prisma } from '../prisma';
import {
  CreateCustomerFeedbackInput,
  CreateLoyaltyProgramInput,
  CreateLoyaltyTransactionInput,
  CreateCustomerSegmentInput,
  CreateSpecialOccasionInput,
  UpdateCustomerPreferencesInput
} from '../validations/customer-enhancement';
// Using string literals for transaction types
const LoyaltyTransactionType = {
  EARN: 'EARN',
  REDEEM: 'REDEEM',
  EXPIRE: 'EXPIRE',
  ADJUST: 'ADJUST'
} as const;

export class CustomerEnhancementService {
  // Customer Feedback Methods
  static async createFeedback(data: CreateCustomerFeedbackInput, userId: string) {
    return await prisma.customerFeedback.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            serviceDescription: true,
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

  static async getFeedback(filters: {
    customerId?: string;
    orderId?: string;
    rating?: number;
    feedbackType?: string;
    isPublic?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      customerId,
      orderId,
      rating,
      feedbackType,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (orderId) where.orderId = orderId;
    if (rating) where.rating = rating;
    if (feedbackType) where.feedbackType = feedbackType;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [feedback, total] = await Promise.all([
      prisma.customerFeedback.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
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
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.customerFeedback.count({ where }),
    ]);

    return {
      feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getFeedbackById(id: string) {
    return await prisma.customerFeedback.findUnique({
      where: { id },
      include: {
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

  // Loyalty Program Methods
  static async createLoyaltyProgram(data: CreateLoyaltyProgramInput, userId: string) {
    return await prisma.loyaltyProgram.create({
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
        benefits: true,
      },
    });
  }

  static async getLoyaltyPrograms(filters: {
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [programs, total] = await Promise.all([
      prisma.loyaltyProgram.findMany({
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
          benefits: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      prisma.loyaltyProgram.count({ where }),
    ]);

    return {
      programs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getLoyaltyProgramById(id: string) {
    return await prisma.loyaltyProgram.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        benefits: true,
        transactions: {
          include: {
            customer: {
              select: {
                id: true,
                customerNumber: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  // Loyalty Transaction Methods
  static async createLoyaltyTransaction(data: CreateLoyaltyTransactionInput, userId: string) {
    // Get current customer points
    const currentBalance = await this.getCustomerLoyaltyBalance(data.customerId, data.programId);

    // Calculate new balance
    const newBalance = currentBalance + data.points;

    // Create transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
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

    // Update customer loyalty points
    await this.updateCustomerLoyaltyPoints(data.customerId, data.programId, newBalance);

    return transaction;
  }

  static async getCustomerLoyaltyBalance(customerId: string, programId: string): Promise<number> {
    const result = await prisma.loyaltyTransaction.aggregate({
      where: {
        customerId,
        programId,
      },
      _sum: {
        points: true,
      },
    });

    return Number(result._sum.points) || 0;
  }

  static async updateCustomerLoyaltyPoints(customerId: string, programId: string, newBalance: number) {
    // This would typically update a customer loyalty balance table
    // For now, we'll calculate on the fly
    return newBalance;
  }

  // Customer Segmentation Methods
  static async createSegment(data: CreateCustomerSegmentInput, userId: string) {
    return await prisma.customerSegment.create({
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

  static async getSegments(filters: {
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [segments, total] = await Promise.all([
      prisma.customerSegment.findMany({
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
          _count: {
            select: {
              customers: true,
            },
          },
        },
      }),
      prisma.customerSegment.count({ where }),
    ]);

    return {
      segments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomersInSegment(segmentId: string) {
    return await prisma.customerSegmentMembership.findMany({
      where: { segmentId },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            totalSpent: true,
            lastOrderDate: true,
          },
        },
      },
    });
  }

  static async updateSegmentMemberships(segmentId: string) {
    // Get segment criteria
    const segment = await prisma.customerSegment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) return;

    // Get customers matching criteria
    const matchingCustomers = await this.getCustomersMatchingCriteria(segment.criteria as any);

    // Update memberships
    await prisma.customerSegmentMembership.deleteMany({
      where: { segmentId },
    });

    if (matchingCustomers.length > 0) {
      await prisma.customerSegmentMembership.createMany({
        data: matchingCustomers.map(customerId => ({
          segmentId,
          customerId,
        })),
      });
    }

    return matchingCustomers.length;
  }

  private static async getCustomersMatchingCriteria(criteria: any) {
    const where: any = {};

    if (criteria.minOrderValue) where.totalSpent = { gte: criteria.minOrderValue };
    if (criteria.maxOrderValue) where.totalSpent = { ...where.totalSpent, lte: criteria.maxOrderValue };
    if (criteria.minOrdersCount) where.ordersCount = { gte: criteria.minOrdersCount };
    if (criteria.maxOrdersCount) where.ordersCount = { ...where.ordersCount, lte: criteria.maxOrdersCount };
    if (criteria.lastOrderDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - criteria.lastOrderDays);
      where.lastOrderDate = { gte: cutoffDate };
    }
    if (criteria.preferredContactMethod) where.preferredContactMethod = criteria.preferredContactMethod;

    const customers = await prisma.customer.findMany({
      where,
      select: { id: true },
    });

    return customers.map(c => c.id);
  }

  // Special Occasions Methods
  static async createSpecialOccasion(data: CreateSpecialOccasionInput, userId: string) {
    return await prisma.specialOccasion.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
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

  static async getSpecialOccasions(filters: {
    customerId?: string;
    occasionType?: string;
    upcoming?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      customerId,
      occasionType,
      upcoming,
      sortBy = 'occasionDate',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (occasionType) where.occasionType = occasionType;
    if (upcoming) {
      const today = new Date();
      where.occasionDate = { gte: today };
    }

    const [occasions, total] = await Promise.all([
      prisma.specialOccasion.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
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
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.specialOccasion.count({ where }),
    ]);

    return {
      occasions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getUpcomingOccasions(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await prisma.specialOccasion.findMany({
      where: {
        occasionDate: {
          gte: today,
          lte: futureDate,
        },
        isActive: true,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            preferredContactMethod: true,
          },
        },
      },
      orderBy: {
        occasionDate: 'asc',
      },
    });
  }

  // Customer Preferences Methods
  static async updateCustomerPreferences(data: UpdateCustomerPreferencesInput) {
    const { customerId, ...updateData } = data;

    return await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      include: {
        preferences: true,
      },
    });
  }

  static async getCustomerPreferences(customerId: string) {
    return await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        preferredContactMethod: true,
        marketingOptIn: true,
        smsOptIn: true,
        emailOptIn: true,
        whatsappOptIn: true,
        preferredLanguage: true,
        currency: true,
        timezone: true,
        notificationPreferences: true,
      },
    });
  }

  // Analytics Methods
  static async getFeedbackAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    feedbackType?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.feedbackType) where.feedbackType = filters.feedbackType;

    const result = await prisma.customerFeedback.aggregate({
      where,
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const ratingDistribution = await prisma.customerFeedback.groupBy({
      by: ['rating'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      averageRating: Number(result._avg.rating) || 0,
      totalFeedback: result._count.id,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.id,
      })),
    };
  }

  static async getLoyaltyProgramAnalytics(programId: string) {
    const program = await prisma.loyaltyProgram.findUnique({
      where: { id: programId },
      include: {
        _count: {
          select: {
            transactions: true,
            benefits: true,
          },
        },
      },
    });

    const transactionStats = await prisma.loyaltyTransaction.aggregate({
      where: { programId },
      _sum: {
        points: true,
      },
      _count: {
        id: true,
      },
    });

    const customerCount = await prisma.loyaltyTransaction.groupBy({
      by: ['customerId'],
      where: { programId },
      _count: {
        id: true,
      },
    });

    return {
      program,
      totalTransactions: transactionStats._count.id,
      totalPointsIssued: Number(transactionStats._sum.points) || 0,
      activeCustomers: customerCount.length,
    };
  }

  static async getCustomerLifetimeValue(customerId: string) {
    const result = await prisma.financialTransaction.aggregate({
      where: {
        customerId,
        type: 'REVENUE',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const firstOrder = await prisma.financialTransaction.findFirst({
      where: {
        customerId,
        type: 'REVENUE',
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    const lastOrder = await prisma.financialTransaction.findFirst({
      where: {
        customerId,
        type: 'REVENUE',
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    return {
      totalSpent: Number(result._sum.amount) || 0,
      totalOrders: result._count.id,
      firstOrderDate: firstOrder?.transactionDate,
      lastOrderDate: lastOrder?.transactionDate,
      averageOrderValue: result._count.id > 0 ? (Number(result._sum.amount) || 0) / result._count.id : 0,
    };
  }

  static async getCustomerSegmentationAnalytics() {
    const segments = await prisma.customerSegment.findMany({
      include: {
        _count: {
          select: {
            customers: true,
          },
        },
      },
    });

    const totalCustomers = await prisma.customer.count();

    return segments.map(segment => ({
      segmentId: segment.id,
      segmentName: segment.name,
      customerCount: segment._count.customers,
      percentage: totalCustomers > 0 ? (segment._count.customers / totalCustomers) * 100 : 0,
      color: segment.color,
    }));
  }
}
