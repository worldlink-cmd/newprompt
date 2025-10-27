import { prisma } from '../prisma';
import {
  CreateDocumentInput,
  CreateDocumentVersionInput,
  CreateDocumentApprovalInput,
  DocumentSearchInput,
  DocumentBatchOperationInput
} from '../validations/document';

export class DocumentService {
  // Document Management
  static async createDocument(data: CreateDocumentInput, userId: string) {
    return await prisma.document.create({
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
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        approvals: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  static async getDocuments(filters: DocumentSearchInput) {
    const {
      search,
      category,
      type,
      relatedEntityType,
      relatedEntityId,
      isPublic,
      requiresApproval,
      isExpired,
      dateFrom,
      dateTo,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (type) where.type = type;
    if (relatedEntityType) where.relatedEntityType = relatedEntityType;
    if (relatedEntityId) where.relatedEntityId = relatedEntityId;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (requiresApproval !== undefined) where.requiresApproval = requiresApproval;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (isExpired) {
      where.expiryDate = { lt: new Date() };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
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
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          approvals: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          _count: {
            select: {
              versions: true,
              approvals: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDocumentById(id: string) {
    return await prisma.document.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          include: {
            createdByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        approvals: {
          include: {
            approvedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
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

  static async updateDocument(id: string, data: Partial<CreateDocumentInput>) {
    return await prisma.document.update({
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
      },
    });
  }

  static async deleteDocument(id: string) {
    // Delete all versions and approvals first
    await prisma.documentVersion.deleteMany({
      where: { documentId: id },
    });

    await prisma.documentApproval.deleteMany({
      where: { documentId: id },
    });

    return await prisma.document.delete({
      where: { id },
    });
  }

  // Document Version Management
  static async createDocumentVersion(data: CreateDocumentVersionInput, userId: string) {
    // Get current version count
    const versionCount = await prisma.documentVersion.count({
      where: { documentId: data.documentId },
    });

    const newVersion = (versionCount + 1).toString();

    return await prisma.documentVersion.create({
      data: {
        ...data,
        version: newVersion,
        createdBy: userId,
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            category: true,
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

  static async getDocumentVersions(documentId: string) {
    return await prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getLatestVersion(documentId: string) {
    return await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: {
        createdAt: 'desc',
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

  // Document Approval Workflow
  static async createDocumentApproval(data: CreateDocumentApprovalInput, userId: string) {
    return await prisma.documentApproval.create({
      data: {
        ...data,
        approvedBy: userId,
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getDocumentApprovals(documentId: string) {
    return await prisma.documentApproval.findMany({
      where: { documentId },
      include: {
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async processApproval(documentId: string, status: string, comments?: string, userId?: string) {
    // Update document approval status
    const approval = await prisma.documentApproval.create({
      data: {
        documentId,
        approvedBy: userId || '',
        status,
        comments,
      },
      include: {
        document: true,
      },
    });

    // If approved, update document status
    if (status === 'APPROVED') {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          requiresApproval: false,
        },
      });
    }

    return approval;
  }

  // Document Sharing and Access Control
  static async shareDocument(documentId: string, sharedWith: string, permissions: string, userId: string) {
    return await prisma.documentShare.create({
      data: {
        documentId,
        sharedWith,
        permissions,
        sharedBy: userId,
      },
      include: {
        document: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getDocumentShares(documentId: string) {
    return await prisma.documentShare.findMany({
      where: { documentId },
      include: {
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async checkDocumentAccess(documentId: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        isPublic: true,
        createdBy: true,
        shares: {
          where: {
            sharedWith: userId,
          },
        },
      },
    });

    if (!document) return false;

    // Public documents are accessible to all
    if (document.isPublic) return true;

    // Owner has access
    if (document.createdBy === userId) return true;

    // Shared documents
    if (document.shares.length > 0) return true;

    return false;
  }

  // Document Expiry Management
  static async getExpiredDocuments() {
    return await prisma.document.findMany({
      where: {
        expiryDate: {
          lt: new Date(),
        },
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

  static async getDocumentsExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await prisma.document.findMany({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: futureDate,
        },
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
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  // Batch Operations
  static async batchOperation(data: DocumentBatchOperationInput, userId: string) {
    const { documentIds, operation, newCategory, comments } = data;

    switch (operation) {
      case 'DELETE':
        await prisma.documentVersion.deleteMany({
          where: {
            documentId: { in: documentIds },
          },
        });
        await prisma.documentApproval.deleteMany({
          where: {
            documentId: { in: documentIds },
          },
        });
        await prisma.documentShare.deleteMany({
          where: {
            documentId: { in: documentIds },
          },
        });
        return await prisma.document.deleteMany({
          where: {
            id: { in: documentIds },
          },
        });

      case 'APPROVE':
        return await prisma.documentApproval.createMany({
          data: documentIds.map(documentId => ({
            documentId,
            approvedBy: userId,
            status: 'APPROVED',
            comments,
          })),
        });

      case 'REJECT':
        return await prisma.documentApproval.createMany({
          data: documentIds.map(documentId => ({
            documentId,
            approvedBy: userId,
            status: 'REJECTED',
            comments,
          })),
        });

      case 'ARCHIVE':
        return await prisma.document.updateMany({
          where: {
            id: { in: documentIds },
          },
          data: {
            isArchived: true,
          },
        });

      case 'RESTORE':
        return await prisma.document.updateMany({
          where: {
            id: { in: documentIds },
          },
          data: {
            isArchived: false,
          },
        });

      case 'UPDATE_CATEGORY':
        if (!newCategory) throw new Error('New category is required for UPDATE_CATEGORY operation');
        return await prisma.document.updateMany({
          where: {
            id: { in: documentIds },
          },
          data: {
            category: newCategory,
          },
        });

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  // Document Templates
  static async createDocumentTemplate(data: any, userId: string) {
    return await prisma.documentTemplate.create({
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

  static async getDocumentTemplates(filters: {
    category?: string;
    templateType?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      templateType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (templateType) where.templateType = templateType;
    if (isActive !== undefined) where.isActive = isActive;

    const [templates, total] = await Promise.all([
      prisma.documentTemplate.findMany({
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
        },
      }),
      prisma.documentTemplate.count({ where }),
    ]);

    return {
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Document Generation from Templates
  static async generateDocumentFromTemplate(templateId: string, variables: Record<string, string>, userId: string) {
    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Process template content with variables
    let processedContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    // Create document from template
    return await this.createDocument({
      name: `Generated from ${template.name}`,
      description: `Auto-generated document from template: ${template.name}`,
      category: template.category,
      type: template.templateType.replace('_TEMPLATE', '') as any,
      fileSize: processedContent.length,
      mimeType: this.getMimeType(template.templateType),
      filePath: `/generated/${Date.now()}.${this.getFileExtension(template.templateType)}`,
      fileUrl: `/generated/${Date.now()}.${this.getFileExtension(template.templateType)}`,
      isPublic: false,
      requiresApproval: true,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        variables,
      },
    }, userId);
  }

  // Analytics and Reporting
  static async getDocumentAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    category?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.category) where.category = filters.category;

    const result = await prisma.document.aggregate({
      where,
      _count: {
        id: true,
      },
      _avg: {
        fileSize: true,
      },
    });

    const categoryBreakdown = await prisma.document.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true,
      },
    });

    const typeBreakdown = await prisma.document.groupBy({
      by: ['type'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      totalDocuments: result._count.id,
      averageFileSize: Number(result._avg.fileSize) || 0,
      categoryBreakdown: categoryBreakdown.map(item => ({
        category: item.category,
        count: item._count.id,
      })),
      typeBreakdown: typeBreakdown.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }

  static async getStorageAnalytics() {
    const result = await prisma.document.aggregate({
      _sum: {
        fileSize: true,
      },
      _count: {
        id: true,
      },
    });

    const sizeByCategory = await prisma.document.groupBy({
      by: ['category'],
      _sum: {
        fileSize: true,
      },
    });

    return {
      totalFiles: result._count.id,
      totalSize: Number(result._sum.fileSize) || 0,
      sizeByCategory: sizeByCategory.map(item => ({
        category: item.category,
        totalSize: Number(item._sum.fileSize) || 0,
      })),
    };
  }

  // Document Search and Filtering
  static async searchDocuments(query: string, filters: {
    category?: string;
    type?: string;
    limit?: number;
  }) {
    const { category, type, limit = 20 } = filters;

    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    };

    if (category) where.category = category;
    if (type) where.type = type;

    return await prisma.document.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  // Document Relationship Management
  static async linkDocumentToEntity(documentId: string, entityType: string, entityId: string) {
    return await prisma.document.update({
      where: { id: documentId },
      data: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
    });
  }

  static async getDocumentsByEntity(entityType: string, entityId: string) {
    return await prisma.document.findMany({
      where: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Utility Methods
  private static getMimeType(templateType: string): string {
    switch (templateType) {
      case 'PDF_TEMPLATE':
        return 'application/pdf';
      case 'EMAIL_TEMPLATE':
        return 'text/html';
      case 'DOCUMENT_TEMPLATE':
        return 'application/msword';
      default:
        return 'application/octet-stream';
    }
  }

  private static getFileExtension(templateType: string): string {
    switch (templateType) {
      case 'PDF_TEMPLATE':
        return 'pdf';
      case 'EMAIL_TEMPLATE':
        return 'html';
      case 'DOCUMENT_TEMPLATE':
        return 'doc';
      default:
        return 'bin';
    }
  }

  // Document Security and Access Control
  static async getUserDocuments(userId: string, filters: {
    category?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, type, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { createdBy: userId },
        { isPublic: true },
        {
          shares: {
            some: {
              sharedWith: userId,
            },
          },
        },
      ],
    };

    if (category) where.category = category;
    if (type) where.type = type;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
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
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Document Backup and Recovery
  static async createDocumentBackup(documentId: string, userId: string) {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    return await prisma.documentBackup.create({
      data: {
        documentId,
        backupData: JSON.stringify(document),
        createdBy: userId,
      },
    });
  }

  static async restoreDocumentFromBackup(backupId: string, userId: string) {
    const backup = await prisma.documentBackup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    const backupData = JSON.parse(backup.backupData);

    return await this.createDocument({
      name: `${backupData.name} (Restored)`,
      description: backupData.description,
      category: backupData.category,
      type: backupData.type,
      fileSize: backupData.fileSize,
      mimeType: backupData.mimeType,
      filePath: backupData.filePath,
      fileUrl: backupData.fileUrl,
      isPublic: false,
      requiresApproval: true,
      metadata: {
        restoredFrom: backupId,
        originalDocumentId: backup.documentId,
      },
    }, userId);
  }

  // Document Tagging and Organization
  static async addDocumentTags(documentId: string, tags: string[]) {
    return await prisma.document.update({
      where: { id: documentId },
      data: {
        tags: {
          push: tags,
        },
      },
    });
  }

  static async removeDocumentTags(documentId: string, tags: string[]) {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const updatedTags = document.tags.filter(tag => !tags.includes(tag));

    return await prisma.document.update({
      where: { id: documentId },
      data: {
        tags: updatedTags,
      },
    });
  }

  static async getDocumentsByTags(tags: string[], operator: 'AND' | 'OR' = 'OR') {
    const where: any = {};

    if (operator === 'AND') {
      where.tags = { hasEvery: tags };
    } else {
      where.tags = { hasSome: tags };
    }

    return await prisma.document.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Document Workflow Integration
  static async linkDocumentToOrder(documentId: string, orderId: string) {
    return await this.linkDocumentToEntity(documentId, 'ORDER', orderId);
  }

  static async linkDocumentToCustomer(documentId: string, customerId: string) {
    return await this.linkDocumentToEntity(documentId, 'CUSTOMER', customerId);
  }

  static async linkDocumentToEmployee(documentId: string, employeeId: string) {
    return await this.linkDocumentToEntity(documentId, 'EMPLOYEE', employeeId);
  }

  // Document Audit Trail
  static async getDocumentAuditTrail(documentId: string) {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const versions = await this.getDocumentVersions(documentId);
    const approvals = await this.getDocumentApprovals(documentId);
    const shares = await this.getDocumentShares(documentId);

    return {
      document,
      versions,
      approvals,
      shares,
    };
  }

  // Document Cleanup and Maintenance
  static async cleanupExpiredDocuments() {
    const expiredDocuments = await this.getExpiredDocuments();

    for (const document of expiredDocuments) {
      // Archive expired documents instead of deleting
      await this.updateDocument(document.id, {
        isArchived: true,
      });
    }

    return expiredDocuments.length;
  }

  static async cleanupOrphanedFiles() {
    // This would typically scan the file system for files not referenced in the database
    // For now, it's a placeholder
    console.log('Cleanup orphaned files - placeholder');
    return 0;
  }

  // Document Statistics
  static async getDocumentStatistics() {
    const totalDocuments = await prisma.document.count();
    const totalVersions = await prisma.documentVersion.count();
    const totalApprovals = await prisma.documentApproval.count();
    const totalShares = await prisma.documentShare.count();

    const documentsByCategory = await prisma.document.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const documentsByType = await prisma.document.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    return {
      totalDocuments,
      totalVersions,
      totalApprovals,
      totalShares,
      documentsByCategory: documentsByCategory.map(item => ({
        category: item.category,
        count: item._count.id,
      })),
      documentsByType: documentsByType.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }
}
