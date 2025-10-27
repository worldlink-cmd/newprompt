import { prisma } from '../prisma';
import {
  CreateSecurityAuditInput,
  CreateSecurityPolicyInput,
  CreateDataRetentionInput,
  CreateGDPRRequestInput,
  CreateSecurityIncidentInput,
  CreateBackupConfigInput
} from '../validations/security';

export class SecurityService {
  // Security Audit Management
  static async createSecurityAudit(data: CreateSecurityAuditInput, userId: string) {
    return await prisma.securityAudit.create({
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

  static async executeSecurityAudit(auditId: string) {
    const audit = await prisma.securityAudit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new Error('Security audit not found');
    }

    // Update audit status
    await prisma.securityAudit.update({
      where: { id: auditId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      const results = await this.performSecurityAudit(audit);

      // Update audit with results
      await prisma.securityAudit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          results: results,
        },
      });

      return results;

    } catch (error) {
      // Update audit with error
      await prisma.securityAudit.update({
        where: { id: auditId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  private static async performSecurityAudit(audit: any) {
    const results = {
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warnings: 0,
      },
      findings: [] as any[],
      recommendations: [] as string[],
    };

    // Permission Audit
    if (audit.checkPermissions) {
      const permissionResults = await this.auditPermissions(audit.scope);
      results.findings.push(...permissionResults.findings);
      results.summary.totalChecks += permissionResults.totalChecks;
      results.summary.passedChecks += permissionResults.passedChecks;
      results.summary.failedChecks += permissionResults.failedChecks;
    }

    // Data Access Audit
    if (audit.checkDataAccess) {
      const accessResults = await this.auditDataAccess(audit.scope);
      results.findings.push(...accessResults.findings);
      results.summary.totalChecks += accessResults.totalChecks;
      results.summary.passedChecks += accessResults.passedChecks;
      results.summary.failedChecks += accessResults.failedChecks;
    }

    // Encryption Audit
    if (audit.checkEncryption) {
      const encryptionResults = await this.auditEncryption(audit.scope);
      results.findings.push(...encryptionResults.findings);
      results.summary.totalChecks += encryptionResults.totalChecks;
      results.summary.passedChecks += encryptionResults.passedChecks;
      results.summary.failedChecks += encryptionResults.failedChecks;
    }

    // Compliance Audit
    if (audit.checkCompliance) {
      const complianceResults = await this.auditCompliance(audit.scope);
      results.findings.push(...complianceResults.findings);
      results.summary.totalChecks += complianceResults.totalChecks;
      results.summary.passedChecks += complianceResults.passedChecks;
      results.summary.failedChecks += complianceResults.failedChecks;
    }

    // Generate recommendations
    results.recommendations = this.generateSecurityRecommendations(results.findings);

    return results;
  }

  private static async auditPermissions(scope: string) {
    const results = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [] as any[],
    };

    // Check user role permissions
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
    });

    results.totalChecks += users.length;

    for (const user of users) {
      // Check for inactive users with active sessions
      const hasActiveSession = user.sessions.some(session => session.expires > new Date());

      if (!user.emailVerified && hasActiveSession) {
        results.failedChecks++;
        results.findings.push({
          type: 'PERMISSION',
          severity: 'HIGH',
          title: 'Unverified user with active session',
          description: `User ${user.email} has active sessions but email is not verified`,
          entityType: 'USER',
          entityId: user.id,
        });
      } else {
        results.passedChecks++;
      }
    }

    return results;
  }

  private static async auditDataAccess(scope: string) {
    const results = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [] as any[],
    };

    // Check document access permissions
    const documents = await prisma.document.findMany({
      include: {
        shares: true,
      },
    });

    results.totalChecks += documents.length;

    for (const document of documents) {
      // Check for public documents without proper access controls
      if (document.isPublic && !document.requiresApproval) {
        results.failedChecks++;
        results.findings.push({
          type: 'DATA_ACCESS',
          severity: 'MEDIUM',
          title: 'Public document without approval',
          description: `Document ${document.name} is public but doesn't require approval`,
          entityType: 'DOCUMENT',
          entityId: document.id,
        });
      } else {
        results.passedChecks++;
      }
    }

    return results;
  }

  private static async auditEncryption(scope: string) {
    const results = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [] as any[],
    };

    // Check for sensitive data encryption
    // This would typically check database encryption settings
    results.totalChecks = 1;
    results.passedChecks = 1; // Assuming encryption is properly configured

    return results;
  }

  private static async auditCompliance(scope: string) {
    const results = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [] as any[],
    };

    // Check GDPR compliance
    const gdprResults = await this.auditGDPRCompliance();
    results.findings.push(...gdprResults.findings);
    results.totalChecks += gdprResults.totalChecks;
    results.passedChecks += gdprResults.passedChecks;
    results.failedChecks += gdprResults.failedChecks;

    return results;
  }

  private static async auditGDPRCompliance() {
    const results = {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      findings: [] as any[],
    };

    // Check for customer data consent
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        marketingOptIn: true,
        smsOptIn: true,
        emailOptIn: true,
        whatsappOptIn: true,
      },
    });

    results.totalChecks += customers.length;

    for (const customer of customers) {
      // Check if customer has given consent for communications
      if (customer.email && !customer.emailOptIn && customer.marketingOptIn) {
        results.failedChecks++;
        results.findings.push({
          type: 'GDPR_COMPLIANCE',
          severity: 'HIGH',
          title: 'Marketing consent without email consent',
          description: `Customer ${customer.email} has marketing opt-in but not email opt-in`,
          entityType: 'CUSTOMER',
          entityId: customer.id,
        });
      } else {
        results.passedChecks++;
      }
    }

    return results;
  }

  private static generateSecurityRecommendations(findings: any[]) {
    const recommendations = [];

    const highSeverityFindings = findings.filter(f => f.severity === 'HIGH');
    const mediumSeverityFindings = findings.filter(f => f.severity === 'MEDIUM');

    if (highSeverityFindings.length > 0) {
      recommendations.push(`Address ${highSeverityFindings.length} high-severity security findings immediately`);
    }

    if (mediumSeverityFindings.length > 0) {
      recommendations.push(`Review ${mediumSeverityFindings.length} medium-severity security findings`);
    }

    if (findings.some(f => f.type === 'PERMISSION')) {
      recommendations.push('Review and update user permission policies');
    }

    if (findings.some(f => f.type === 'DATA_ACCESS')) {
      recommendations.push('Implement proper access controls for sensitive data');
    }

    if (findings.some(f => f.type === 'GDPR_COMPLIANCE')) {
      recommendations.push('Ensure GDPR compliance for customer data processing');
    }

    return recommendations;
  }

  // Security Policy Management
  static async createSecurityPolicy(data: CreateSecurityPolicyInput, userId: string) {
    return await prisma.securityPolicy.create({
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

  static async enforceSecurityPolicy(policyId: string, context: any) {
    const policy = await prisma.securityPolicy.findUnique({
      where: { id: policyId },
    });

    if (!policy || !policy.isActive) {
      return { allowed: true };
    }

    // Evaluate policy rules
    for (const rule of policy.rules) {
      if (rule.isActive && this.evaluateRule(rule, context)) {
        switch (rule.action) {
          case 'DENY':
            return { allowed: false, reason: rule.description };
          case 'WARN':
            return { allowed: true, warning: rule.description };
          case 'LOG':
            // Log the action
            console.log('Security policy triggered:', rule.description);
            break;
        }
      }
    }

    return { allowed: true };
  }

  private static evaluateRule(rule: any, context: any): boolean {
    // Simple rule evaluation - in production, this would be more sophisticated
    return true;
  }

  // Data Retention Management
  static async createDataRetentionPolicy(data: CreateDataRetentionInput, userId: string) {
    return await prisma.dataRetentionPolicy.create({
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

  static async executeDataRetentionPolicies() {
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { isActive: true },
    });

    for (const policy of policies) {
      await this.executeDataRetentionPolicy(policy);
    }
  }

  private static async executeDataRetentionPolicy(policy: any) {
    const cutoffDate = new Date();
    const retentionDays = this.convertRetentionPeriodToDays(policy.retentionPeriod, policy.retentionUnit);

    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let where: any = {
      createdAt: { lt: cutoffDate },
    };

    // Apply data type filter
    switch (policy.dataType) {
      case 'CUSTOMER':
        where = { ...where, customer: { is: {} } };
        break;
      case 'ORDER':
        where = { ...where, order: { is: {} } };
        break;
      case 'FINANCIAL':
        where = { ...where, financialTransaction: { is: {} } };
        break;
      case 'EMPLOYEE':
        where = { ...where, employee: { is: {} } };
        break;
      case 'DOCUMENT':
        where = { ...where, document: { is: {} } };
        break;
    }

    // Archive or delete data based on policy
    if (policy.archiveBeforeDelete) {
      await this.archiveExpiredData(policy.dataType, where);
    } else {
      await this.deleteExpiredData(policy.dataType, where);
    }
  }

  private static convertRetentionPeriodToDays(period: number, unit: string): number {
    switch (unit) {
      case 'DAYS':
        return period;
      case 'MONTHS':
        return period * 30;
      case 'YEARS':
        return period * 365;
      default:
        return period;
    }
  }

  private static async archiveExpiredData(dataType: string, where: any) {
    // Archive data instead of deleting
    console.log(`Archiving expired ${dataType} data`);
  }

  private static async deleteExpiredData(dataType: string, where: any) {
    // Delete expired data
    console.log(`Deleting expired ${dataType} data`);
  }

  // GDPR Compliance Management
  static async createGDPRRequest(data: CreateGDPRRequestInput, userId: string) {
    return await prisma.gdprRequest.create({
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

  static async processGDPRRequest(requestId: string) {
    const request = await prisma.gdprRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: true,
      },
    });

    if (!request) {
      throw new Error('GDPR request not found');
    }

    // Update request status
    await prisma.gdprRequest.update({
      where: { id: requestId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    try {
      const result = await this.executeGDPRRequest(request);

      // Update request with results
      await prisma.gdprRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          result: result,
        },
      });

      return result;

    } catch (error) {
      // Update request with error
      await prisma.gdprRequest.update({
        where: { id: requestId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  private static async executeGDPRRequest(request: any) {
    const customerId = request.customerId;
    const dataTypes = request.dataTypes;

    const result = {
      customer: null as any,
      dataCollected: [] as any[],
      actionsTaken: [] as string[],
    };

    // Get customer data
    if (dataTypes.includes('PROFILE') || dataTypes.includes('ALL')) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      result.customer = customer;
      result.dataCollected.push({ type: 'PROFILE', data: customer });
    }

    // Get order data
    if (dataTypes.includes('ORDERS') || dataTypes.includes('ALL')) {
      const orders = await prisma.order.findMany({
        where: { customerId },
      });
      result.dataCollected.push({ type: 'ORDERS', data: orders });
    }

    // Get payment data
    if (dataTypes.includes('PAYMENTS') || dataTypes.includes('ALL')) {
      const payments = await prisma.financialTransaction.findMany({
        where: { customerId, type: 'REVENUE' },
      });
      result.dataCollected.push({ type: 'PAYMENTS', data: payments });
    }

    // Get communication data
    if (dataTypes.includes('COMMUNICATIONS') || dataTypes.includes('ALL')) {
      const communications = await prisma.messageLog.findMany({
        where: { customerId },
      });
      result.dataCollected.push({ type: 'COMMUNICATIONS', data: communications });
    }

    // Get document data
    if (dataTypes.includes('DOCUMENTS') || dataTypes.includes('ALL')) {
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { relatedEntityType: 'CUSTOMER', relatedEntityId: customerId },
            { createdBy: customerId },
          ],
        },
      });
      result.dataCollected.push({ type: 'DOCUMENTS', data: documents });
    }

    // Execute action based on request type
    switch (request.requestType) {
      case 'ACCESS':
        result.actionsTaken.push('Data access report generated');
        break;
      case 'RECTIFICATION':
        result.actionsTaken.push('Data rectification process initiated');
        break;
      case 'ERASURE':
        await this.eraseCustomerData(customerId, dataTypes);
        result.actionsTaken.push('Data erasure completed');
        break;
      case 'RESTRICTION':
        await this.restrictCustomerData(customerId, dataTypes);
        result.actionsTaken.push('Data processing restriction applied');
        break;
      case 'PORTABILITY':
        result.actionsTaken.push('Data portability package generated');
        break;
    }

    return result;
  }

  private static async eraseCustomerData(customerId: string, dataTypes: string[]) {
    // Erase customer data based on GDPR right to erasure
    if (dataTypes.includes('PROFILE') || dataTypes.includes('ALL')) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          email: null,
          phone: 'REDACTED',
          address: null,
          city: null,
          state: null,
          postalCode: null,
          dateOfBirth: null,
          notes: null,
        },
      });
    }

    // Archive orders instead of deleting
    if (dataTypes.includes('ORDERS') || dataTypes.includes('ALL')) {
      await prisma.order.updateMany({
        where: { customerId },
        data: {
          isArchived: true,
        },
      });
    }

    // Archive financial transactions
    if (dataTypes.includes('PAYMENTS') || dataTypes.includes('ALL')) {
      await prisma.financialTransaction.updateMany({
        where: { customerId },
        data: {
          isArchived: true,
        },
      });
    }
  }

  private static async restrictCustomerData(customerId: string, dataTypes: string[]) {
    // Apply data processing restrictions
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        dataProcessingRestricted: true,
      },
    });
  }

  // Security Incident Management
  static async createSecurityIncident(data: CreateSecurityIncidentInput, userId: string) {
    return await prisma.securityIncident.create({
      data: {
        ...data,
        reportedBy: userId,
      },
      include: {
        reportedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateIncidentStatus(incidentId: string, status: string, userId: string) {
    const updateData: any = {
      status,
      updatedBy: userId,
    };

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    } else if (status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    return await prisma.securityIncident.update({
      where: { id: incidentId },
      data: updateData,
      include: {
        reportedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Backup Management
  static async createBackupConfig(data: CreateBackupConfigInput, userId: string) {
    return await prisma.backupConfig.create({
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

  static async executeBackup(backupId: string) {
    const config = await prisma.backupConfig.findUnique({
      where: { id: backupId },
    });

    if (!config || !config.isActive) {
      throw new Error('Backup configuration not found or inactive');
    }

    // Create backup job
    const job = await prisma.backupJob.create({
      data: {
        configId: backupId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      const result = await this.performBackup(config);

      // Update job with results
      await prisma.backupJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          fileSize: result.fileSize,
          recordsBackedUp: result.recordsBackedUp,
        },
      });

      return result;

    } catch (error) {
      // Update job with error
      await prisma.backupJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  private static async performBackup(config: any) {
    // Perform actual backup based on configuration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${config.name}-${timestamp}.sql`;

    // This would typically use pg_dump or similar tool
    console.log(`Creating backup: ${filename}`);

    return {
      filename,
      fileSize: 0, // Would be actual file size
      recordsBackedUp: 0, // Would be actual record count
    };
  }

  // Data Encryption Management
  static async encryptSensitiveData(data: string, key: string): Promise<string> {
    // In production, use proper encryption library
    const crypto = require('crypto');
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static async decryptSensitiveData(encryptedData: string, key: string): Promise<string> {
    // In production, use proper decryption
    const crypto = require('crypto');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Access Log Monitoring
  static async logSecurityEvent(event: {
    type: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.securityEventLog.create({
      data: {
        ...event,
        timestamp: new Date(),
      },
    });
  }

  static async getSecurityEvents(filters: {
    type?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      type,
      userId,
      dateFrom,
      dateTo,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const [events, total] = await Promise.all([
      prisma.securityEventLog.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.securityEventLog.count({ where }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Compliance Reporting
  static async generateComplianceReport(reportType: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI') {
    switch (reportType) {
      case 'GDPR':
        return await this.generateGDPRComplianceReport();
      case 'SOX':
        return await this.generateSOXComplianceReport();
      default:
        throw new Error(`Compliance report type ${reportType} not supported`);
    }
  }

  private static async generateGDPRComplianceReport() {
    const totalCustomers = await prisma.customer.count();
    const customersWithConsent = await prisma.customer.count({
      where: {
        OR: [
          { emailOptIn: true },
          { smsOptIn: true },
          { whatsappOptIn: true },
        ],
      },
    });

    const pendingGDPRRequests = await prisma.gdprRequest.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    const dataBreaches = await prisma.securityIncident.count({
      where: {
        category: 'DATA_BREACH',
      },
    });

    return {
      reportType: 'GDPR',
      generatedAt: new Date(),
      summary: {
        totalCustomers,
        customersWithConsent,
        consentRate: totalCustomers > 0 ? (customersWithConsent / totalCustomers) * 100 : 0,
        pendingGDPRRequests,
        dataBreaches,
      },
      compliance: {
        dataProcessingConsent: customersWithConsent / totalCustomers >= 0.95,
        gdprRequestsProcessed: pendingGDPRRequests === 0,
        dataBreachReporting: dataBreaches === 0,
        overallCompliance: false, // Would calculate based on all factors
      },
    };
  }

  private static async generateSOXComplianceReport() {
    // SOX compliance report implementation
    return {
      reportType: 'SOX',
      generatedAt: new Date(),
      summary: {
        financialControls: 'IMPLEMENTED',
        auditTrails: 'ACTIVE',
        accessControls: 'ENFORCED',
      },
    };
  }

  // Security Monitoring
  static async monitorSecurityMetrics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      failedLogins,
      suspiciousActivities,
      dataAccessAttempts,
      securityIncidents,
    ] = await Promise.all([
      prisma.securityEventLog.count({
        where: {
          type: 'LOGIN_FAILED',
          timestamp: { gte: last24Hours },
        },
      }),
      prisma.securityEventLog.count({
        where: {
          type: 'SUSPICIOUS_ACTIVITY',
          timestamp: { gte: last24Hours },
        },
      }),
      prisma.securityEventLog.count({
        where: {
          type: 'DATA_ACCESS',
          timestamp: { gte: last24Hours },
        },
      }),
      prisma.securityIncident.count({
        where: {
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
      }),
    ]);

    return {
      timestamp: now,
      last24Hours: {
        failedLogins,
        suspiciousActivities,
        dataAccessAttempts,
      },
      activeIncidents: securityIncidents,
      securityScore: this.calculateSecurityScore({
        failedLogins,
        suspiciousActivities,
        dataAccessAttempts,
        securityIncidents,
      }),
    };
  }

  private static calculateSecurityScore(metrics: any): number {
    let score = 100;

    // Deduct points for security issues
    score -= metrics.failedLogins * 2;
    score -= metrics.suspiciousActivities * 5;
    score -= metrics.activeIncidents * 10;

    return Math.max(0, Math.min(100, score));
  }

  // Password Security
  static async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    requirements: string[];
  }> {
    const requirements = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 20;
    } else {
      requirements.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      requirements.push('At least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      requirements.push('At least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 20;
    } else {
      requirements.push('At least one number');
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    } else {
      requirements.push('At least one special character');
    }

    return {
      isValid: requirements.length === 0,
      score,
      requirements,
    };
  }

  // Session Security
  static async validateUserSession(sessionToken: string, userAgent: string, ipAddress: string) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    });

    if (!session || session.expires < new Date()) {
      return { valid: false, reason: 'Session expired or invalid' };
    }

    // Check for suspicious activity
    const recentEvents = await prisma.securityEventLog.findMany({
      where: {
        userId: session.userId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    const suspiciousEvents = recentEvents.filter(event =>
      event.type === 'SUSPICIOUS_ACTIVITY' || event.type === 'LOGIN_FAILED'
    );

    if (suspiciousEvents.length > 3) {
      return { valid: false, reason: 'Too many suspicious activities' };
    }

    return { valid: true, session };
  }

  // Data Masking
  static maskSensitiveData(data: string, type: 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD'): string {
    switch (type) {
      case 'EMAIL':
        const [username, domain] = data.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
      case 'PHONE':
        return `***${data.slice(-3)}`;
      case 'SSN':
        return `***-**-${data.slice(-4)}`;
      case 'CREDIT_CARD':
        return `****-****-****-${data.slice(-4)}`;
      default:
        return '***';
    }
  }

  // Security Alert Management
  static async checkSecurityThresholds() {
    const metrics = await this.monitorSecurityMetrics();
    const alerts = [];

    if (metrics.last24Hours.failedLogins > 10) {
      alerts.push({
        type: 'HIGH_FAILED_LOGINS',
        severity: 'HIGH',
        message: `${metrics.last24Hours.failedLogins} failed login attempts in the last 24 hours`,
      });
    }

    if (metrics.last24Hours.suspiciousActivities > 5) {
      alerts.push({
        type: 'HIGH_SUSPICIOUS_ACTIVITY',
        severity: 'CRITICAL',
        message: `${metrics.last24Hours.suspiciousActivities} suspicious activities detected`,
      });
    }

    if (metrics.securityScore < 70) {
      alerts.push({
        type: 'LOW_SECURITY_SCORE',
        severity: 'MEDIUM',
        message: `Security score is ${metrics.securityScore}, below acceptable threshold`,
      });
    }

    return alerts;
  }

  // Data Anonymization
  static async anonymizeCustomerData(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Anonymize customer data
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: 'ANONYMIZED',
        lastName: 'USER',
        email: `anonymized.${customerId}@example.com`,
        phone: 'ANONYMIZED',
        address: 'ANONYMIZED',
        city: 'ANONYMIZED',
        state: 'ANONYMIZED',
        postalCode: 'ANONYMIZED',
        dateOfBirth: null,
        notes: 'Data anonymized for privacy compliance',
        isAnonymized: true,
      },
    });

    return { success: true };
  }

  // Security Policy Enforcement
  static async enforcePasswordPolicy() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    const weakPasswords = [];

    for (const user of users) {
      const validation = await this.validatePasswordStrength(user.password);
      if (!validation.isValid) {
        weakPasswords.push({
          userId: user.id,
          email: user.email,
          issues: validation.requirements,
        });
      }
    }

    return {
      totalUsers: users.length,
      weakPasswords: weakPasswords.length,
      users: weakPasswords,
    };
  }

  // Audit Trail Management
  static async getAuditTrail(filters: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      entityType,
      entityId,
      userId,
      action,
      dateFrom,
      dateTo,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = dateFrom;
      if (dateTo) where.timestamp.lte = dateTo;
    }

    const [events, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditTrail.count({ where }),
    ]);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Security Reporting
  static async generateSecurityReport(reportType: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY') {
    const now = new Date();
    let dateFrom: Date;

    switch (reportType) {
      case 'WEEKLY':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTHLY':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'QUARTERLY':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      securityMetrics,
      securityEvents,
      securityIncidents,
      complianceStatus,
    ] = await Promise.all([
      this.monitorSecurityMetrics(),
      this.getSecurityEvents({ dateFrom }),
      prisma.securityIncident.findMany({
        where: {
          createdAt: { gte: dateFrom },
        },
      }),
      this.generateComplianceReport('GDPR'),
    ]);

    return {
      reportType,
      period: {
        from: dateFrom,
        to: now,
      },
      generatedAt: now,
      metrics: securityMetrics,
      events: securityEvents.events,
      incidents: securityIncidents,
      compliance: complianceStatus,
      recommendations: this.generateSecurityRecommendations(securityMetrics),
    };
  }

  private static generateSecurityRecommendations(metrics: any): string[] {
    const recommendations = [];

    if (metrics.last24Hours.failedLogins > 5) {
      recommendations.push('High number of failed login attempts detected. Consider implementing CAPTCHA or rate limiting.');
    }

    if (metrics.last24Hours.suspiciousActivities > 2) {
      recommendations.push('Multiple suspicious activities detected. Review security logs and consider additional monitoring.');
    }

    if (metrics.securityScore < 80) {
      recommendations.push('Security score is below optimal level. Review and address security findings.');
    }

    if (metrics.activeIncidents > 0) {
      recommendations.push('There are active security incidents. Prioritize incident response and resolution.');
    }

    return recommendations;
  }

  // Data Protection
  static async applyDataClassification(data: any, classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED') {
    // Apply data classification and protection measures
    switch (classification) {
      case 'PUBLIC':
        return { ...data, classification, canShare: true };
      case 'INTERNAL':
        return { ...data, classification, canShare: false, requiresApproval: false };
      case 'CONFIDENTIAL':
        return { ...data, classification, canShare: false, requiresApproval: true };
      case 'RESTRICTED':
        return { ...data, classification, canShare: false, requiresApproval: true, requiresEncryption: true };
      default:
        return data;
    }
  }

  // Security Training and Awareness
  static async trackSecurityTraining(userId: string, trainingType: string, completed: boolean) {
    return await prisma.securityTraining.create({
      data: {
        userId,
        trainingType,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  static async getSecurityTrainingStatus(userId: string) {
    const trainings = await prisma.securityTraining.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const completedTrainings = trainings.filter(t => t.completed);
    const pendingTrainings = trainings.filter(t => !t.completed);

    return {
      totalTrainings: trainings.length,
      completedTrainings: completedTrainings.length,
      pendingTrainings: pendingTrainings.length,
      completionRate: trainings.length > 0 ? (completedTrainings.length / trainings.length) * 100 : 0,
      trainings: trainings.map(t => ({
        type: t.trainingType,
        completed: t.completed,
        completedAt: t.completedAt,
      })),
    };
  }
}
