import { prisma } from '../prisma';
import { InventoryTransactionType } from '../../types';

export class InventoryService {
  static async updateStock(
    inventoryItemId: string,
    quantity: number,
    type: InventoryTransactionType,
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    userId?: string
  ) {
    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    const previousStock = Number(item.currentStock);
    let newStock: number;

    switch (type) {
      case InventoryTransactionType.STOCK_IN:
        newStock = previousStock + quantity;
        break;
      case InventoryTransactionType.STOCK_OUT:
        newStock = previousStock - quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock');
        }
        break;
      case InventoryTransactionType.ADJUSTMENT:
        newStock = quantity; // Direct set
        break;
      case InventoryTransactionType.RETURN:
        newStock = previousStock + quantity;
        break;
      case InventoryTransactionType.DAMAGE:
        newStock = previousStock - quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock for damage');
        }
        break;
      case InventoryTransactionType.TRANSFER:
        newStock = previousStock - quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock for transfer');
        }
        break;
      default:
        throw new Error('Invalid transaction type');
    }

    // Update stock
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        currentStock: newStock,
        updatedBy: userId,
      },
    });

    // Create transaction record
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId,
        type,
        quantity,
        previousStock,
        newStock,
        referenceType,
        referenceId,
        notes,
        createdBy: userId,
      },
    });

    return updatedItem;
  }

  static async checkLowStockAlerts() {
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.inventoryItem.fields.minStockLevel,
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
      },
    });

    return lowStockItems.map(item => ({
      ...item,
      currentStock: Number(item.currentStock),
      minStockLevel: Number(item.minStockLevel),
    }));
  }

  static async getInventoryValue() {
    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      select: {
        currentStock: true,
        unitPrice: true,
        currency: true,
      },
    });

    let totalValue = 0;
    items.forEach(item => {
      if (item.unitPrice) {
        totalValue += Number(item.currentStock) * Number(item.unitPrice);
      }
    });

    return totalValue;
  }

  /**
   * Process purchase order receipt and update inventory
   */
  static async processPurchaseOrderReceipt(
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

    // Validate receipt quantities against purchase order
    for (const receipt of receipts) {
      const orderItem = purchaseOrder.items.find(
        item => item.inventoryItemId === receipt.inventoryItemId
      );

      if (!orderItem) {
        throw new Error(`Item ${receipt.inventoryItemId} not found in purchase order`);
      }

      const remainingQuantity = Number(orderItem.quantity) - Number(orderItem.receivedQuantity);

      if (receipt.quantity > remainingQuantity) {
        throw new Error(
          `Receipt quantity (${receipt.quantity}) exceeds remaining quantity (${remainingQuantity}) for item ${orderItem.inventoryItem.name}`
        );
      }
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
          updatedBy: processedBy,
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
   * Get inventory items with supplier information
   */
  static async getInventoryWithSuppliers({
    search,
    category,
    lowStock,
    isActive,
    supplierId,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  }: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    isActive?: boolean;
    supplierId?: string;
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
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock) {
      where.currentStock = {
        lte: prisma.inventoryItem.fields.minStockLevel,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
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
          updatedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              purchaseOrderItems: true,
              materialUsages: true,
              wastes: true,
            },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return {
      items: items.map(item => ({
        ...item,
        currentStock: Number(item.currentStock),
        minStockLevel: Number(item.minStockLevel),
        maxStockLevel: item.maxStockLevel ? Number(item.maxStockLevel) : item.maxStockLevel,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : item.unitPrice,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get inventory analytics with supplier insights
   */
  static async getInventoryAnalytics() {
    const [
      totalItems,
      lowStockItems,
      totalValue,
      itemsByCategory,
      itemsBySupplier,
      recentTransactions,
    ] = await Promise.all([
      prisma.inventoryItem.count({ where: { isActive: true } }),
      prisma.inventoryItem.count({
        where: {
          isActive: true,
          currentStock: {
            lte: prisma.inventoryItem.fields.minStockLevel,
          },
        },
      }),
      this.getInventoryValue(),
      prisma.inventoryItem.groupBy({
        by: ['category'],
        where: { isActive: true },
        _count: {
          category: true,
        },
        _sum: {
          currentStock: true,
        },
      }),
      prisma.inventoryItem.groupBy({
        by: ['supplierId'],
        where: { isActive: true },
        _count: {
          supplierId: true,
        },
        _sum: {
          currentStock: true,
        },
      }),
      prisma.inventoryTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          inventoryItem: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Get supplier details for supplier grouping
    const supplierIds = itemsBySupplier
      .filter(item => item.supplierId)
      .map(item => item.supplierId!);

    const suppliers = await prisma.supplier.findMany({
      where: {
        id: {
          in: supplierIds,
        },
      },
      select: {
        id: true,
        supplierNumber: true,
        name: true,
      },
    });

    const supplierMap = new Map(suppliers.map(s => [s.id, s]));

    return {
      summary: {
        totalItems,
        lowStockItems,
        totalValue,
      },
      byCategory: itemsByCategory.map(item => ({
        category: item.category,
        count: item._count.category,
        totalStock: Number(item._sum.currentStock || 0),
      })),
      bySupplier: itemsBySupplier
        .filter(item => item.supplierId)
        .map(item => ({
          supplier: supplierMap.get(item.supplierId!) || { id: item.supplierId, name: 'Unknown' },
          count: item._count.supplierId,
          totalStock: Number(item._sum.currentStock || 0),
        })),
      recentTransactions: recentTransactions.map(transaction => ({
        ...transaction,
        quantity: Number(transaction.quantity),
        previousStock: Number(transaction.previousStock),
        newStock: Number(transaction.newStock),
      })),
    };
  }
}
