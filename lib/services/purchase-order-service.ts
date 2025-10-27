import { prisma } from '../prisma';
import { PurchaseOrderStatus, PaymentTerms } from '../../types';

export class PurchaseOrderService {
  /**
   * Get all purchase orders with filtering and pagination
   */
  static async getPurchaseOrders({
    search,
    supplierId,
    status,
    dateFrom,
    dateTo,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    search?: string;
    supplierId?: string;
    status?: PurchaseOrderStatus;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = dateFrom;
      }
      if (dateTo) {
        where.orderDate.lte = dateTo;
      }
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          supplier: {
            select: {
              id: true,
              supplierNumber: true,
              name: true,
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
          approvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          _count: {
            select: {
              items: true,
              receipts: true,
              payments: true,
            },
          },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return {
      purchaseOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get purchase order by ID
   */
  static async getPurchaseOrderById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            paymentTerms: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
                unit: true,
                currentStock: true,
              },
            },
          },
        },
        receipts: {
          orderBy: { createdAt: 'desc' },
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
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            items: true,
            receipts: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Create new purchase order
   */
  static async createPurchaseOrder(data: {
    supplierId: string;
    orderDate: Date;
    expectedDate?: Date;
    status: PurchaseOrderStatus;
    totalAmount: number;
    currency: string;
    notes?: string;
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    items: {
      inventoryItemId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
    }[];
  }) {
    return prisma.purchaseOrder.create({
      data: {
        ...data,
        items: {
          create: data.items,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
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
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            receipts: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Update purchase order status
   */
  static async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrderStatus,
    approvedBy?: string,
    approvedAt?: Date,
    notes?: string
  ) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        approvedBy,
        approvedAt,
        notes,
      },
      include: {
        supplier: {
          select: {
            id: true,
            supplierNumber: true,
            name: true,
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
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            inventoryItem: {
              select: {
                id: true,
                sku: true,
                name: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
            receipts: true,
            payments: true,
          },
        },
      },
    });
  }

  /**
   * Process purchase order receipt
   */
  static async processReceipt(
    purchaseOrderId: string,
    receipts: {
      inventoryItemId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }[],
    processedBy: string
  ) {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    // Create inventory transactions for received items
    const transactions = receipts.map(receipt => ({
      inventoryItemId: receipt.inventoryItemId,
      type: 'STOCK_IN' as const,
      quantity: receipt.quantity,
      unitPrice: receipt.unitPrice,
      totalValue: receipt.quantity * receipt.unitPrice,
      referenceType: 'PURCHASE',
      referenceId: purchaseOrderId,
      purchaseOrderId,
      notes: receipt.notes,
      createdBy: processedBy,
    }));

    // Update purchase order item received quantities
    for (const receipt of receipts) {
      await prisma.purchaseOrderItem.updateMany({
        where: {
          purchaseOrderId,
          inventoryItemId: receipt.inventoryItemId,
        },
        data: {
          receivedQuantity: {
            increment: receipt.quantity,
          },
        },
      });
    }

    // Create inventory transactions
    await prisma.inventoryTransaction.createMany({
      data: transactions,
    });

    // Update inventory item stock levels
    for (const receipt of receipts) {
      await prisma.inventoryItem.update({
        where: { id: receipt.inventoryItemId },
        data: {
          currentStock: {
            increment: receipt.quantity,
          },
        },
      });
    }

    // Check if purchase order is fully received
    const updatedPurchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: true,
      },
    });

    if (updatedPurchaseOrder) {
      const allReceived = updatedPurchaseOrder.items.every(
        item => Number(item.receivedQuantity) >= Number(item.quantity)
      );

      if (allReceived && updatedPurchaseOrder.status !== 'RECEIVED') {
        await prisma.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: {
            status: 'RECEIVED',
          },
        });
      } else if (updatedPurchaseOrder.status === 'ORDERED') {
        await prisma.purchaseOrder.update({
          where: { id: purchaseOrderId },
          data: {
            status: 'PARTIALLY_RECEIVED',
          },
        });
      }
    }

    return updatedPurchaseOrder;
  }

  /**
   * Get purchase order statistics
   */
  static async getPurchaseOrderStats() {
    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      receivedOrders,
      totalValue,
      pendingValue,
    ] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({
        where: { status: 'PENDING_APPROVAL' },
      }),
      prisma.purchaseOrder.count({
        where: { status: 'APPROVED' },
      }),
      prisma.purchaseOrder.count({
        where: { status: 'RECEIVED' },
      }),
      prisma.purchaseOrder.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.purchaseOrder.aggregate({
        where: { status: 'PENDING_APPROVAL' },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      receivedOrders,
      totalValue: Number(totalValue._sum.totalAmount || 0),
      pendingValue: Number(pendingValue._sum.totalAmount || 0),
    };
  }
}
