import { prisma } from '../prisma';
import {
  CreateKPIDashboardInput,
  CreateCustomReportInput,
  AnalyticsQueryInput,
  CreateAlertConfigInput
} from '../validations/analytics';
import { FinancialService } from './financial-service';
import { CustomerEnhancementService } from './customer-enhancement-service';
import { AppointmentService } from './appointment-service';

export class AnalyticsService {
  // KPI Dashboard Management
  static async createKPIDashboard(data: CreateKPIDashboardInput, userId: string) {
    return await prisma.kpiDashboard.create({
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
        widgets: true,
      },
    });
  }

  static async getKPIDashboards(filters: {
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

    const [dashboards, total] = await Promise.all([
      prisma.kpiDashboard.findMany({
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
          widgets: true,
          _count: {
            select: {
              widgets: true,
            },
          },
        },
      }),
      prisma.kpiDashboard.count({ where }),
    ]);

    return {
      dashboards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDashboardData(dashboardId: string) {
    const dashboard = await prisma.kpiDashboard.findUnique({
      where: { id: dashboardId },
      include: {
        widgets: {
          where: { isVisible: true },
          orderBy: [
            { positionY: 'asc' },
            { positionX: 'asc' },
          ],
        },
      },
    });

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // Fetch data for each widget
    const widgetData = await Promise.all(
      dashboard.widgets.map(async (widget) => {
        const data = await this.getWidgetData(widget);
        return {
          widget,
          data,
        };
      })
    );

    return {
      dashboard,
      widgets: widgetData,
    };
  }

  // Widget Data Retrieval
  private static async getWidgetData(widget: any) {
    switch (widget.dataSource) {
      case 'FINANCIAL_SUMMARY':
        return await FinancialService.getFinancialSummary();
      case 'SALES_TREND':
        return await this.getSalesTrend();
      case 'CUSTOMER_METRICS':
        return await this.getCustomerMetrics();
      case 'APPOINTMENT_STATUS':
        return await this.getAppointmentMetrics();
      case 'EMPLOYEE_PERFORMANCE':
        return await this.getEmployeePerformanceMetrics();
      case 'INVENTORY_STATUS':
        return await this.getInventoryMetrics();
      case 'LOYALTY_PROGRAM':
        return await this.getLoyaltyProgramMetrics();
      case 'COMMUNICATION_EFFECTIVENESS':
        return await this.getCommunicationMetrics();
      default:
        return null;
    }
  }

  // Sales Analytics
  static async getSalesTrend(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy?: 'DAY' | 'WEEK' | 'MONTH';
  } = {}) {
    const { dateFrom, dateTo, groupBy = 'DAY' } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = dateFrom;
      if (dateTo) where.transactionDate.lte = dateTo;
    }

    const salesData = await prisma.financialTransaction.findMany({
      where: {
        ...where,
        type: 'REVENUE',
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    // Group data based on groupBy parameter
    const groupedData = this.groupTimeSeriesData(salesData, groupBy);

    return {
      trend: groupedData,
      totalSales: salesData.reduce((sum, sale) => sum + Number(sale.amount), 0),
      averageOrderValue: salesData.length > 0
        ? salesData.reduce((sum, sale) => sum + Number(sale.amount), 0) / salesData.length
        : 0,
      totalOrders: salesData.length,
    };
  }

  // Customer Analytics
  static async getCustomerMetrics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const { dateFrom, dateTo } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const totalCustomers = await prisma.customer.count({ where });

    const newCustomers = await prisma.customer.count({
      where: {
        ...where,
      },
    });

    const activeCustomers = await prisma.customer.count({
      where: {
        ...where,
        isActive: true,
      },
    });

    const customerRetention = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    // Customer acquisition over time
    const acquisitionTrend = await this.getCustomerAcquisitionTrend(filters);

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      retentionRate: customerRetention,
      acquisitionTrend,
    };
  }

  // Appointment Analytics
  static async getAppointmentMetrics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const { dateFrom, dateTo } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.startDateTime = {};
      if (dateFrom) where.startDateTime.gte = dateFrom;
      if (dateTo) where.startDateTime.lte = dateTo;
    }

    const totalAppointments = await prisma.appointment.count({ where });

    const completedAppointments = await prisma.appointment.count({
      where: {
        ...where,
        status: 'COMPLETED',
      },
    });

    const cancelledAppointments = await prisma.appointment.count({
      where: {
        ...where,
        status: 'CANCELLED',
      },
    });

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      completionRate,
      noShowRate: 0, // Would need to calculate based on no-show status
    };
  }

  // Employee Performance Analytics
  static async getEmployeePerformanceMetrics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    employeeId?: string;
  } = {}) {
    const { dateFrom, dateTo, employeeId } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (employeeId) where.employeeId = employeeId;

    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
      },
      include: {
        performanceMetrics: {
          where,
          orderBy: {
            calculatedAt: 'desc',
          },
        },
        assignedTasks: {
          where: {
            ...where,
            status: 'COMPLETED',
          },
        },
      },
    });

    return employees.map(employee => ({
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.role,
      },
      metrics: employee.performanceMetrics,
      completedTasks: employee.assignedTasks.length,
      averagePerformance: employee.performanceMetrics.length > 0
        ? employee.performanceMetrics.reduce((sum, metric) => sum + Number(metric.value), 0) / employee.performanceMetrics.length
        : 0,
    }));
  }

  // Inventory Analytics
  static async getInventoryMetrics() {
    const totalItems = await prisma.inventoryItem.count();
    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        currentStock: {
          lte: prisma.inventoryItem.fields.minStockLevel,
        },
      },
    });

    const outOfStockItems = await prisma.inventoryItem.count({
      where: {
        currentStock: 0,
      },
    });

    const totalValue = await prisma.inventoryItem.aggregate({
      _sum: {
        currentStock: true,
      },
    });

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      stockHealth: totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 0,
      totalValue: Number(totalValue._sum.currentStock) || 0,
    };
  }

  // Loyalty Program Analytics
  static async getLoyaltyProgramMetrics() {
    const programs = await prisma.loyaltyProgram.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            transactions: true,
            benefits: true,
          },
        },
      },
    });

    const totalPointsIssued = await prisma.loyaltyTransaction.aggregate({
      _sum: {
        points: true,
      },
    });

    const activeMembers = await prisma.loyaltyTransaction.groupBy({
      by: ['customerId'],
      _count: {
        id: true,
      },
    });

    return {
      programs: programs.map(program => ({
        id: program.id,
        name: program.name,
        totalTransactions: program._count.transactions,
        totalBenefits: program._count.benefits,
      })),
      totalPointsIssued: Number(totalPointsIssued._sum.points) || 0,
      activeMembers: activeMembers.length,
    };
  }

  // Communication Analytics
  static async getCommunicationMetrics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  } = {}) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const totalMessages = await prisma.messageLog.count({ where });

    const deliveredMessages = await prisma.messageLog.count({
      where: {
        ...where,
        status: 'DELIVERED',
      },
    });

    const failedMessages = await prisma.messageLog.count({
      where: {
        ...where,
        status: 'FAILED',
      },
    });

    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;

    return {
      totalMessages,
      deliveredMessages,
      failedMessages,
      deliveryRate,
    };
  }

  // Custom Report Generation
  static async createCustomReport(data: CreateCustomReportInput, userId: string) {
    return await prisma.customReport.create({
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

  static async executeReport(reportId: string, filters?: any) {
    const report = await prisma.customReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Execute report based on type
    switch (report.reportType) {
      case 'SALES':
        return await this.executeSalesReport(report, filters);
      case 'CUSTOMER':
        return await this.executeCustomerReport(report, filters);
      case 'EMPLOYEE':
        return await this.executeEmployeeReport(report, filters);
      case 'FINANCIAL':
        return await this.executeFinancialReport(report, filters);
      case 'INVENTORY':
        return await this.executeInventoryReport(report, filters);
      case 'APPOINTMENT':
        return await this.executeAppointmentReport(report, filters);
      default:
        return await this.executeCustomReport(report, filters);
    }
  }

  // Report Execution Methods
  private static async executeSalesReport(report: any, filters: any) {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.transactionDate = {};
      if (filters.dateFrom) where.transactionDate.gte = filters.dateFrom;
      if (filters.dateTo) where.transactionDate.lte = filters.dateTo;
    }

    const sales = await prisma.financialTransaction.findMany({
      where: {
        ...where,
        type: 'REVENUE',
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
        order: {
          select: {
            id: true,
            orderNumber: true,
            serviceDescription: true,
          },
        },
      },
    });

    return {
      report,
      data: sales,
      summary: {
        totalSales: sales.reduce((sum, sale) => sum + Number(sale.amount), 0),
        totalTransactions: sales.length,
        averageOrderValue: sales.length > 0
          ? sales.reduce((sum, sale) => sum + Number(sale.amount), 0) / sales.length
          : 0,
      },
    };
  }

  private static async executeCustomerReport(report: any, filters: any) {
    const where: any = {};

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            orderDate: true,
          },
        },
      },
    });

    return {
      report,
      data: customers,
      summary: {
        totalCustomers: customers.length,
        newCustomers: customers.filter(c => {
          const daysSinceCreation = (new Date().getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 30; // New customers in last 30 days
        }).length,
        averageOrdersPerCustomer: customers.length > 0
          ? customers.reduce((sum, c) => sum + c.orders.length, 0) / customers.length
          : 0,
      },
    };
  }

  private static async executeEmployeeReport(report: any, filters: any) {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        assignedTasks: {
          where: {
            status: 'COMPLETED',
          },
        },
        performanceMetrics: true,
      },
    });

    return {
      report,
      data: employees,
      summary: {
        totalEmployees: employees.length,
        averageTasksCompleted: employees.length > 0
          ? employees.reduce((sum, emp) => sum + emp.assignedTasks.length, 0) / employees.length
          : 0,
        averagePerformance: employees.length > 0
          ? employees.reduce((sum, emp) =>
              sum + (emp.performanceMetrics.length > 0
                ? emp.performanceMetrics.reduce((pSum, metric) => pSum + Number(metric.value), 0) / emp.performanceMetrics.length
                : 0
              ), 0) / employees.length
          : 0,
      },
    };
  }

  private static async executeFinancialReport(report: any, filters: any) {
    const summary = await FinancialService.getFinancialSummary(filters?.dateFrom, filters?.dateTo);
    const paymentBreakdown = await FinancialService.getPaymentMethodBreakdown(filters?.dateFrom, filters?.dateTo);
    const expenseBreakdown = await FinancialService.getExpenseCategoryBreakdown(filters?.dateFrom, filters?.dateTo);

    return {
      report,
      data: {
        summary,
        paymentBreakdown,
        expenseBreakdown,
      },
    };
  }

  private static async executeInventoryReport(report: any, filters: any) {
    const inventoryMetrics = await this.getInventoryMetrics();

    const items = await prisma.inventoryItem.findMany({
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    return {
      report,
      data: {
        metrics: inventoryMetrics,
        items,
      },
    };
  }

  private static async executeAppointmentReport(report: any, filters: any) {
    const appointmentMetrics = await this.getAppointmentMetrics(filters);
    const employeeUtilization = await AppointmentService.getEmployeeUtilization(filters);

    return {
      report,
      data: {
        metrics: appointmentMetrics,
        employeeUtilization,
      },
    };
  }

  private static async executeCustomReport(report: any, filters: any) {
    // Custom query execution based on report configuration
    // This would be more complex in a real implementation
    return {
      report,
      data: [],
      message: 'Custom report execution not implemented',
    };
  }

  // Alert Management
  static async createAlertConfig(data: CreateAlertConfigInput, userId: string) {
    return await prisma.alertConfig.create({
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

  static async checkAlerts() {
    const activeAlerts = await prisma.alertConfig.findMany({
      where: { isActive: true },
    });

    const triggeredAlerts = [];

    for (const alert of activeAlerts) {
      const shouldTrigger = await this.evaluateAlert(alert);
      if (shouldTrigger) {
        triggeredAlerts.push(alert);
        await this.triggerAlert(alert);
      }
    }

    return triggeredAlerts;
  }

  private static async evaluateAlert(alert: any): Promise<boolean> {
    // This would implement the actual alert evaluation logic
    // For now, return false as placeholder
    return false;
  }

  private static async triggerAlert(alert: any) {
    // Send notifications based on configured channels
    console.log('Alert triggered:', alert.name);

    // Update last triggered timestamp to implement cooldown
    await prisma.alertConfig.update({
      where: { id: alert.id },
      data: {
        lastTriggered: new Date(),
      },
    });
  }

  // Real-time Metrics
  static async getRealTimeMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      todaySales,
      todayAppointments,
      todayNewCustomers,
      pendingTasks,
      lowStockItems,
    ] = await Promise.all([
      FinancialService.calculateRevenue({ dateFrom: todayStart }),
      prisma.appointment.count({
        where: {
          startDateTime: {
            gte: todayStart,
          },
        },
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.task.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.inventoryItem.count({
        where: {
          currentStock: {
            lte: prisma.inventoryItem.fields.minStockLevel,
          },
        },
      }),
    ]);

    return {
      todaySales: todaySales.totalRevenue,
      todayAppointments,
      todayNewCustomers,
      pendingTasks,
      lowStockItems,
      timestamp: now,
    };
  }

  // Data Aggregation Utilities
  private static groupTimeSeriesData(data: any[], groupBy: 'DAY' | 'WEEK' | 'MONTH') {
    const grouped = new Map();

    data.forEach(item => {
      const date = new Date(item.transactionDate);
      let key: string;

      switch (groupBy) {
        case 'DAY':
          key = date.toISOString().split('T')[0];
          break;
        case 'WEEK':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'MONTH':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          date: key,
          total: 0,
          count: 0,
        });
      }

      const group = grouped.get(key);
      group.total += Number(item.amount);
      group.count += 1;
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  private static async getCustomerAcquisitionTrend(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { dateFrom, dateTo } = filters;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const monthly = new Map();
    customers.forEach(customer => {
      const monthKey = customer.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthly.set(monthKey, (monthly.get(monthKey) || 0) + 1);
    });

    return Array.from(monthly.entries()).map(([month, count]) => ({
      month,
      newCustomers: count,
    }));
  }

  // Export and Data Processing
  static async exportReport(reportId: string, format: 'CSV' | 'PDF' | 'EXCEL', filters?: any) {
    const reportData = await this.executeReport(reportId, filters);

    switch (format) {
      case 'CSV':
        return this.generateCSV(reportData);
      case 'PDF':
        return this.generatePDF(reportData);
      case 'EXCEL':
        return this.generateExcel(reportData);
      default:
        return reportData;
    }
  }

  private static generateCSV(data: any): string {
    // Simple CSV generation
    if (Array.isArray(data.data)) {
      const headers = Object.keys(data.data[0] || {});
      const csvRows = [
        headers.join(','),
        ...data.data.map(row =>
          headers.map(header => JSON.stringify(row[header] || '')).join(',')
        ),
      ];
      return csvRows.join('\n');
    }
    return 'No data to export';
  }

  private static generatePDF(data: any): Buffer {
    // PDF generation would require a PDF library
    // For now, return placeholder
    return Buffer.from('PDF generation not implemented');
  }

  private static generateExcel(data: any): Buffer {
    // Excel generation would require an Excel library
    // For now, return placeholder
    return Buffer.from('Excel generation not implemented');
  }

  // Predictive Analytics
  static async getPredictiveInsights() {
    // Sales forecasting
    const salesTrend = await this.getSalesTrend({ groupBy: 'MONTH' });
    const salesForecast = this.forecastSales(salesTrend.trend);

    // Customer growth prediction
    const customerTrend = await this.getCustomerAcquisitionTrend({});
    const customerForecast = this.forecastCustomerGrowth(customerTrend);

    return {
      salesForecast,
      customerForecast,
      recommendations: this.generateRecommendations(salesForecast, customerForecast),
    };
  }

  private static forecastSales(historicalData: any[]): any {
    if (historicalData.length < 3) {
      return { nextMonth: 0, confidence: 0 };
    }

    // Simple linear trend analysis
    const recent = historicalData.slice(-3);
    const avgGrowth = recent.reduce((sum, curr, index) => {
      if (index === 0) return 0;
      return sum + (curr.total - recent[index - 1].total) / recent[index - 1].total;
    }, 0) / (recent.length - 1);

    const lastMonth = recent[recent.length - 1];
    const forecast = lastMonth.total * (1 + avgGrowth);

    return {
      nextMonth: forecast,
      confidence: Math.min(Math.abs(avgGrowth) * 100, 90), // Simple confidence metric
    };
  }

  private static forecastCustomerGrowth(historicalData: any[]): any {
    if (historicalData.length < 3) {
      return { nextMonth: 0, confidence: 0 };
    }

    const recent = historicalData.slice(-3);
    const avgGrowth = recent.reduce((sum, curr, index) => {
      if (index === 0) return 0;
      return sum + (curr.newCustomers - recent[index - 1].newCustomers);
    }, 0) / (recent.length - 1);

    const lastMonth = recent[recent.length - 1];
    const forecast = Math.max(0, lastMonth.newCustomers + avgGrowth);

    return {
      nextMonth: Math.round(forecast),
      confidence: 70, // Conservative confidence for customer prediction
    };
  }

  private static generateRecommendations(salesForecast: any, customerForecast: any): string[] {
    const recommendations = [];

    if (salesForecast.nextMonth > 0) {
      recommendations.push('Sales are trending positively. Consider increasing inventory levels.');
    }

    if (customerForecast.nextMonth > 10) {
      recommendations.push('Strong customer growth expected. Plan for capacity expansion.');
    }

    if (salesForecast.confidence < 50) {
      recommendations.push('Sales data shows high variability. Review pricing strategy.');
    }

    return recommendations;
  }

  // Performance Monitoring
  static async getSystemPerformance() {
    const startTime = Date.now();

    // Database query performance
    const dbStart = Date.now();
    await prisma.customer.count();
    const dbTime = Date.now() - dbStart;

    // API response time
    const apiTime = Date.now() - startTime;

    return {
      databaseResponseTime: dbTime,
      apiResponseTime: apiTime,
      timestamp: new Date(),
    };
  }

  // Data Quality Checks
  static async validateDataQuality() {
    const issues = [];

    // Check for customers without orders (might be test data)
    const customersWithoutOrders = await prisma.customer.count({
      where: {
        orders: {
          none: {},
        },
      },
    });

    if (customersWithoutOrders > 0) {
      issues.push({
        type: 'DATA_QUALITY',
        message: `${customersWithoutOrders} customers have no orders`,
        severity: 'LOW',
      });
    }

    // Check for orders without financial transactions
    const ordersWithoutTransactions = await prisma.order.count({
      where: {
        financialTransactions: {
          none: {},
        },
      },
    });

    if (ordersWithoutTransactions > 0) {
      issues.push({
        type: 'DATA_QUALITY',
        message: `${ordersWithoutTransactions} orders have no financial transactions`,
        severity: 'MEDIUM',
      });
    }

    return {
      totalIssues: issues.length,
      issues,
      qualityScore: Math.max(0, 100 - (issues.length * 10)),
    };
  }
}
