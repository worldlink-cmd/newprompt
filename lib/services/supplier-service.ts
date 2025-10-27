import { prisma } from '../prisma';
import { SupplierStatus, PaymentTerms } from '../../types';

export class SupplierService {
  /**
   * Get all suppliers with filtering and pagination
   */
  static async getSuppliers({
    search,
    status,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    search?: string;
    status?: SupplierStatus;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { supplierNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
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
              inventoryItems: true,
              purchaseOrders: true,
              payments: true,
            },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string) {
    return prisma.supplier.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        inventoryItems: {
          select: {
            id: true,
            sku: true,
            name: true,
            currentStock: true,
            unitPrice: true,
          },
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: {
              include: {
                inventoryItem: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            inventoryItems: true,
            purchaseOrders: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Create new supplier
   */
  static async createSupplier(data: {
    supplierNumber: string;
    name: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
    paymentTerms: PaymentTerms;
    leadTimeDays: number;
    minimumOrder?: number;
    notes?: string;
    status: SupplierStatus;
    isActive: boolean;
    createdBy: string;
  }) {
    return prisma.supplier.create({
      data,
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
            inventoryItems: true,
            purchaseOrders: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: Partial<{
    name: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
    paymentTerms: PaymentTerms;
    leadTimeDays: number;
    minimumOrder?: number;
    notes?: string;
    status: SupplierStatus;
    isActive: boolean;
  }>) {
    return prisma.supplier.update({
      where: { id },
      data,
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
            inventoryItems: true,
            purchaseOrders: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Get supplier performance metrics
   */
  static async getSupplierPerformance(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        purchaseOrders: {
          include: {
            items: true,
          },
        },
        payments: true,
        _count: {
          select: {
            purchaseOrders: true,
            payments: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Calculate performance metrics
    const totalOrders = supplier.purchaseOrders.length;
    const completedOrders = supplier.purchaseOrders.filter(
      order => order.status === 'RECEIVED'
    ).length;
    const totalOrderValue = supplier.purchaseOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalPayments = supplier.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const onTimeDelivery = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

    return {
      supplierId,
      supplierName: supplier.name,
      totalOrders,
      completedOrders,
      totalOrderValue,
      totalPayments,
      onTimeDelivery,
      averageOrderValue,
      outstandingPayments: totalOrderValue - totalPayments,
    };
  }

  /**
   * Get suppliers with low stock alerts
   */
  static async getSuppliersWithLowStock() {
    return prisma.supplier.findMany({
      include: {
        inventoryItems: {
          where: {
            currentStock: {
              lte: prisma.inventoryItem.fields.minStockLevel,
            },
            isActive: true,
          },
          select: {
            id: true,
            sku: true,
            name: true,
            currentStock: true,
            minStockLevel: true,
            unitPrice: true,
          },
        },
        _count: {
          select: {
            inventoryItems: true,
          },
        },
      },
    });
  }
}
