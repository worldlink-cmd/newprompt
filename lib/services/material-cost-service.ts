import { prisma } from '../prisma';

export class MaterialCostService {
  /**
   * Calculate material cost for a specific order
   */
  static async calculateOrderMaterialCost(orderId: string) {
    const materialUsages = await prisma.materialUsage.findMany({
      where: { orderId },
      include: {
        inventoryItem: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
    });

    const totalCost = materialUsages.reduce(
      (sum, usage) => sum + Number(usage.totalCost),
      0
    );

    const costBreakdown = materialUsages.map(usage => ({
      inventoryItemId: usage.inventoryItemId,
      itemName: usage.inventoryItem.name,
      itemSku: usage.inventoryItem.sku,
      category: usage.inventoryItem.category,
      quantity: Number(usage.quantity),
      unitPrice: Number(usage.unitPrice),
      totalCost: Number(usage.totalCost),
      unit: usage.inventoryItem.unit,
    }));

    return {
      orderId,
      totalCost,
      itemCount: materialUsages.length,
      costBreakdown,
    };
  }

  /**
   * Get material cost analysis for all orders
   */
  static async getMaterialCostAnalysis({
    dateFrom,
    dateTo,
    sortBy = 'totalCost',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dateFrom || dateTo) {
      where.usageDate = {};
      if (dateFrom) {
        where.usageDate.gte = dateFrom;
      }
      if (dateTo) {
        where.usageDate.lte = dateTo;
      }
    }

    const [materialUsages, total] = await Promise.all([
      prisma.materialUsage.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              totalAmount: true,
            },
          },
          inventoryItem: {
            select: {
              id: true,
              sku: true,
              name: true,
              category: true,
              unit: true,
            },
          },
        },
      }),
      prisma.materialUsage.count({ where }),
    ]);

    // Group by order and calculate totals
    const orderCosts = new Map();
    let grandTotal = 0;

    for (const usage of materialUsages) {
      const orderId = usage.orderId;
      const cost = Number(usage.totalCost);

      if (!orderCosts.has(orderId)) {
        orderCosts.set(orderId, {
          orderId,
          orderNumber: usage.order.orderNumber,
          customerName: `${usage.order.customer.firstName} ${usage.order.customer.lastName}`,
          totalAmount: Number(usage.order.totalAmount || 0),
          materialCost: 0,
          materialCostPercentage: 0,
          items: [],
        });
      }

      const orderCost = orderCosts.get(orderId);
      orderCost.materialCost += cost;
      orderCost.items.push({
        inventoryItemId: usage.inventoryItemId,
        itemName: usage.inventoryItem.name,
        itemSku: usage.inventoryItem.sku,
        category: usage.inventoryItem.category,
        quantity: Number(usage.quantity),
        unitPrice: Number(usage.unitPrice),
        totalCost: cost,
        unit: usage.inventoryItem.unit,
      });

      grandTotal += cost;
    }

    const orders = Array.from(orderCosts.values()).map(order => ({
      ...order,
      materialCostPercentage: order.totalAmount > 0
        ? (order.materialCost / order.totalAmount) * 100
        : 0,
    }));

    return {
      orders,
      summary: {
        totalOrders: orders.length,
        grandTotal,
        averageMaterialCost: orders.length > 0 ? grandTotal / orders.length : 0,
        averageMaterialCostPercentage: orders.length > 0
          ? orders.reduce((sum, order) => sum + order.materialCostPercentage, 0) / orders.length
          : 0,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get material cost by category
   */
  static async getMaterialCostByCategory({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.usageDate = {};
      if (dateFrom) {
        where.usageDate.gte = dateFrom;
      }
      if (dateTo) {
        where.usageDate.lte = dateTo;
      }
    }

    const materialUsages = await prisma.materialUsage.findMany({
      where,
      include: {
        inventoryItem: {
          select: {
            category: true,
          },
        },
      },
    });

    const categoryCosts = new Map();

    for (const usage of materialUsages) {
      const category = usage.inventoryItem.category;
      const cost = Number(usage.totalCost);

      if (!categoryCosts.has(category)) {
        categoryCosts.set(category, {
          category,
          totalCost: 0,
          usageCount: 0,
        });
      }

      const categoryCost = categoryCosts.get(category);
      categoryCost.totalCost += cost;
      categoryCost.usageCount += 1;
    }

    return Array.from(categoryCosts.values()).map(category => ({
      ...category,
      averageCost: category.usageCount > 0 ? category.totalCost / category.usageCount : 0,
    }));
  }

  /**
   * Get material cost trends over time
   */
  static async getMaterialCostTrends({
    period = 'monthly',
    months = 12,
  }: {
    period?: 'daily' | 'weekly' | 'monthly';
    months?: number;
  }) {
    const endDate = new Date();
    const startDate = new Date();

    if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - months);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - (months * 7));
    } else {
      startDate.setDate(startDate.getDate() - months);
    }

    const materialUsages = await prisma.materialUsage.findMany({
      where: {
        usageDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        inventoryItem: {
          select: {
            category: true,
          },
        },
      },
      orderBy: {
        usageDate: 'asc',
      },
    });

    const trends = new Map();

    for (const usage of materialUsages) {
      let periodKey: string;

      if (period === 'monthly') {
        periodKey = `${usage.usageDate.getFullYear()}-${String(usage.usageDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const weekStart = new Date(usage.usageDate);
        weekStart.setDate(usage.usageDate.getDate() - usage.usageDate.getDay());
        periodKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate() - weekStart.getDate() + 1) / 7)}`;
      } else {
        periodKey = usage.usageDate.toISOString().split('T')[0];
      }

      const cost = Number(usage.totalCost);

      if (!trends.has(periodKey)) {
        trends.set(periodKey, {
          period: periodKey,
          totalCost: 0,
          usageCount: 0,
          categories: new Map(),
        });
      }

      const trend = trends.get(periodKey);
      trend.totalCost += cost;
      trend.usageCount += 1;

      const category = usage.inventoryItem.category;
      if (!trend.categories.has(category)) {
        trend.categories.set(category, 0);
      }
      trend.categories.set(category, trend.categories.get(category) + cost);
    }

    return Array.from(trends.values()).map(trend => ({
      period: trend.period,
      totalCost: trend.totalCost,
      usageCount: trend.usageCount,
      averageCost: trend.usageCount > 0 ? trend.totalCost / trend.usageCount : 0,
      categoryBreakdown: Object.fromEntries(trend.categories),
    }));
  }

  /**
   * Get top materials by cost
   */
  static async getTopMaterialsByCost({
    dateFrom,
    dateTo,
    limit = 10,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.usageDate = {};
      if (dateFrom) {
        where.usageDate.gte = dateFrom;
      }
      if (dateTo) {
        where.usageDate.lte = dateTo;
      }
    }

    const materialUsages = await prisma.materialUsage.findMany({
      where,
      include: {
        inventoryItem: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
    });

    const materialCosts = new Map();

    for (const usage of materialUsages) {
      const itemId = usage.inventoryItemId;
      const cost = Number(usage.totalCost);
      const quantity = Number(usage.quantity);

      if (!materialCosts.has(itemId)) {
        materialCosts.set(itemId, {
          inventoryItemId: itemId,
          itemName: usage.inventoryItem.name,
          itemSku: usage.inventoryItem.sku,
          category: usage.inventoryItem.category,
          unit: usage.inventoryItem.unit,
          totalCost: 0,
          totalQuantity: 0,
          usageCount: 0,
        });
      }

      const materialCost = materialCosts.get(itemId);
      materialCost.totalCost += cost;
      materialCost.totalQuantity += quantity;
      materialCost.usageCount += 1;
    }

    return Array.from(materialCosts.values())
      .map(material => ({
        ...material,
        averageCost: material.usageCount > 0 ? material.totalCost / material.usageCount : 0,
        averagePrice: material.totalQuantity > 0 ? material.totalCost / material.totalQuantity : 0,
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  /**
   * Calculate waste cost impact
   */
  static async getWasteCostImpact({
    dateFrom,
    dateTo,
  }: {
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.wasteDate = {};
      if (dateFrom) {
        where.wasteDate.gte = dateFrom;
      }
      if (dateTo) {
        where.wasteDate.lte = dateTo;
      }
    }

    const wastes = await prisma.waste.findMany({
      where,
      include: {
        inventoryItem: {
          select: {
            category: true,
            unitPrice: true,
          },
        },
      },
    });

    const totalWasteCost = wastes.reduce(
      (sum, waste) => sum + Number(waste.totalCost),
      0
    );

    const wasteByReason = new Map();
    const wasteByCategory = new Map();

    for (const waste of wastes) {
      const reason = waste.reason;
      const category = waste.inventoryItem.category;
      const cost = Number(waste.totalCost);

      // By reason
      if (!wasteByReason.has(reason)) {
        wasteByReason.set(reason, {
          reason,
          totalCost: 0,
          count: 0,
        });
      }
      const reasonData = wasteByReason.get(reason);
      reasonData.totalCost += cost;
      reasonData.count += 1;

      // By category
      if (!wasteByCategory.has(category)) {
        wasteByCategory.set(category, {
          category,
          totalCost: 0,
          count: 0,
        });
      }
      const categoryData = wasteByCategory.get(category);
      categoryData.totalCost += cost;
      categoryData.count += 1;
    }

    return {
      totalWasteCost,
      totalWasteItems: wastes.length,
      averageWasteCost: wastes.length > 0 ? totalWasteCost / wastes.length : 0,
      wasteByReason: Array.from(wasteByReason.values()),
      wasteByCategory: Array.from(wasteByCategory.values()),
    };
  }
}
