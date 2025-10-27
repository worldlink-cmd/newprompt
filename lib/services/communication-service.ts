import { prisma } from '../prisma';
import {
  CreateCommunicationTemplateInput,
  CreateMessageLogInput,
  CreateBulkMessageInput,
  CreateProviderConfigInput
} from '../validations/communication';

export class CommunicationService {
  // Template Management
  static async createTemplate(data: CreateCommunicationTemplateInput, userId: string) {
    return await prisma.communicationTemplate.create({
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

  static async getTemplates(filters: {
    category?: string;
    communicationType?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      communicationType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (communicationType) where.communicationType = communicationType;
    if (isActive !== undefined) where.isActive = isActive;

    const [templates, total] = await Promise.all([
      prisma.communicationTemplate.findMany({
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
              messages: true,
            },
          },
        },
      }),
      prisma.communicationTemplate.count({ where }),
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

  static async getTemplateById(id: string) {
    return await prisma.communicationTemplate.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
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
          take: 10,
        },
      },
    });
  }

  static async updateTemplate(id: string, data: Partial<CreateCommunicationTemplateInput>) {
    return await prisma.communicationTemplate.update({
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

  static async deleteTemplate(id: string) {
    return await prisma.communicationTemplate.delete({
      where: { id },
    });
  }

  // Message Processing
  static async processTemplateVariables(content: string, variables: Record<string, string> = {}): Promise<string> {
    let processedContent = content;

    // Replace variables in the format {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });

    return processedContent;
  }

  static async sendMessage(data: CreateMessageLogInput, userId: string) {
    // Get template
    const template = await prisma.communicationTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Process template variables
    const processedContent = await this.processTemplateVariables(template.content, data.metadata as Record<string, string>);
    const processedSubject = template.subject ? await this.processTemplateVariables(template.subject, data.metadata as Record<string, string>) : undefined;

    // Get provider configuration
    const providerConfig = await this.getActiveProvider(template.communicationType);

    if (!providerConfig) {
      throw new Error(`No active provider found for ${template.communicationType}`);
    }

    // Send message based on type
    let result;
    try {
      switch (template.communicationType) {
        case 'SMS':
          result = await this.sendSMS(providerConfig, data.recipient, processedContent);
          break;
        case 'WHATSAPP':
          result = await this.sendWhatsApp(providerConfig, data.recipient, processedContent);
          break;
        case 'EMAIL':
          result = await this.sendEmail(providerConfig, data.recipient, processedSubject || '', processedContent);
          break;
        default:
          throw new Error(`Unsupported communication type: ${template.communicationType}`);
      }

      // Log successful message
      return await prisma.messageLog.create({
        data: {
          ...data,
          content: processedContent,
          subject: processedSubject,
          status: 'SENT',
          provider: providerConfig.provider,
          providerMessageId: result.messageId,
          sentAt: new Date(),
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
          template: {
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

    } catch (error) {
      // Log failed message
      return await prisma.messageLog.create({
        data: {
          ...data,
          content: processedContent,
          subject: processedSubject,
          status: 'FAILED',
          provider: providerConfig.provider,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          failedAt: new Date(),
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
          template: {
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
  }

  static async sendBulkMessages(data: CreateBulkMessageInput, userId: string) {
    // Get template
    const template = await prisma.communicationTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Get customers
    let customers;
    if (data.customerIds && data.customerIds.length > 0) {
      customers = await prisma.customer.findMany({
        where: {
          id: { in: data.customerIds },
          isActive: true,
        },
      });
    } else if (data.customerSegmentId) {
      customers = await prisma.customer.findMany({
        where: {
          isActive: true,
          segments: {
            some: {
              segmentId: data.customerSegmentId,
            },
          },
        },
      });
    } else {
      throw new Error('Either customerIds or customerSegmentId must be provided');
    }

    // Process and send messages
    const results = [];
    for (const customer of customers) {
      const variables = {
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerNumber: customer.customerNumber,
        ...data.variables,
      };

      const processedContent = await this.processTemplateVariables(template.content, variables);
      const processedSubject = template.subject ? await this.processTemplateVariables(template.subject, variables) : undefined;

      const messageData: CreateMessageLogInput = {
        customerId: customer.id,
        templateId: template.id,
        communicationType: data.communicationType,
        recipient: customer.phone, // This should be email for email type
        subject: processedSubject,
        content: processedContent,
        metadata: variables,
      };

      const result = await this.sendMessage(messageData, userId);
      results.push(result);
    }

    return results;
  }

  // Provider Integration Methods
  private static async getActiveProvider(communicationType: string) {
    return await prisma.communicationProvider.findFirst({
      where: {
        communicationType,
        isActive: true,
      },
    });
  }

  private static async sendSMS(provider: any, to: string, content: string) {
    // Twilio integration example
    if (provider.provider === 'TWILIO') {
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + provider.accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(provider.accountSid + ':' + provider.apiSecret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: provider.fromNumber,
          To: to,
          Body: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const result = await response.json();
      return { messageId: result.sid };
    }

    throw new Error('SMS provider not supported');
  }

  private static async sendWhatsApp(provider: any, to: string, content: string) {
    // WhatsApp Business API integration example
    if (provider.provider === 'WHATSAPP_BUSINESS') {
      const response = await fetch(provider.webhookUrl || 'https://graph.facebook.com/v17.0/' + provider.accountId + '/messages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + provider.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: content },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const result = await response.json();
      return { messageId: result.messages?.[0]?.id };
    }

    throw new Error('WhatsApp provider not supported');
  }

  private static async sendEmail(provider: any, to: string, subject: string, content: string) {
    // SendGrid integration example
    if (provider.provider === 'SENDGRID') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + provider.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: provider.fromEmail },
          subject: subject,
          content: [{ type: 'text/plain', value: content }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return { messageId: 'sent' };
    }

    throw new Error('Email provider not supported');
  }

  // Message Log Management
  static async getMessageLogs(filters: {
    customerId?: string;
    communicationType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      customerId,
      communicationType,
      status,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (communicationType) where.communicationType = communicationType;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [messages, total] = await Promise.all([
      prisma.messageLog.findMany({
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
          template: {
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
      }),
      prisma.messageLog.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateMessageStatus(id: string, status: string, metadata?: any) {
    const updateData: any = { status };

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (status === 'FAILED') {
      updateData.failedAt = new Date();
      if (metadata?.errorMessage) {
        updateData.errorMessage = metadata.errorMessage;
      }
    }

    return await prisma.messageLog.update({
      where: { id },
      data: updateData,
    });
  }

  // Provider Configuration Management
  static async createProviderConfig(data: CreateProviderConfigInput, userId: string) {
    return await prisma.communicationProvider.create({
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

  static async getProviderConfigs(filters: {
    provider?: string;
    communicationType?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      provider,
      communicationType,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (provider) where.provider = provider;
    if (communicationType) where.communicationType = communicationType;
    if (isActive !== undefined) where.isActive = isActive;

    const [providers, total] = await Promise.all([
      prisma.communicationProvider.findMany({
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
      prisma.communicationProvider.count({ where }),
    ]);

    return {
      providers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Automated Message Scheduling
  static async scheduleAutomatedMessages() {
    // Get pending scheduled messages
    const pendingMessages = await prisma.messageLog.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        customer: true,
        template: true,
      },
    });

    // Process each message
    for (const message of pendingMessages) {
      try {
        await this.sendMessage({
          customerId: message.customerId,
          templateId: message.templateId,
          communicationType: message.communicationType,
          recipient: message.recipient,
          subject: message.subject || undefined,
          content: message.content,
          metadata: message.metadata as any,
        }, message.createdBy || '');

        // Update status to sent
        await this.updateMessageStatus(message.id, 'SENT');
      } catch (error) {
        console.error('Failed to send scheduled message:', error);
        await this.updateMessageStatus(message.id, 'FAILED', {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return pendingMessages.length;
  }

  // Analytics and Reporting
  static async getCommunicationAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    communicationType?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.communicationType) where.communicationType = filters.communicationType;

    const result = await prisma.messageLog.aggregate({
      where,
      _count: {
        id: true,
      },
      _avg: {
        id: true, // This will be used for counting
      },
    });

    const statusBreakdown = await prisma.messageLog.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    const typeBreakdown = await prisma.messageLog.groupBy({
      by: ['communicationType'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      totalMessages: result._count.id,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.id,
      })),
      typeBreakdown: typeBreakdown.map(item => ({
        communicationType: item.communicationType,
        count: item._count.id,
      })),
    };
  }

  static async getDeliveryRates(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    communicationType?: string;
  }) {
    const where: any = {
      status: { in: ['SENT', 'DELIVERED', 'FAILED'] },
    };

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.communicationType) where.communicationType = filters.communicationType;

    const result = await prisma.messageLog.groupBy({
      by: ['communicationType', 'status'],
      where,
      _count: {
        id: true,
      },
    });

    return result.map(item => ({
      communicationType: item.communicationType,
      status: item.status,
      count: item._count.id,
    }));
  }

  // Template Variable Extraction
  static extractTemplateVariables(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  // Quick Send Methods
  static async sendOrderStatusUpdate(orderId: string, status: string, userId: string) {
    // Get order with customer
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            preferredContactMethod: true,
          },
        },
      },
    });

    if (!order || !order.customer) {
      throw new Error('Order or customer not found');
    }

    // Get appropriate template
    const template = await prisma.communicationTemplate.findFirst({
      where: {
        category: 'ORDER_STATUS',
        communicationType: order.customer.preferredContactMethod === 'EMAIL' ? 'EMAIL' : 'SMS',
        isActive: true,
      },
    });

    if (!template) {
      throw new Error('No active order status template found');
    }

    // Prepare variables
    const variables = {
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      orderNumber: order.orderNumber,
      status: status,
      serviceDescription: order.serviceDescription,
    };

    const recipient = order.customer.preferredContactMethod === 'EMAIL' ? order.customer.email || '' : order.customer.phone;

    return await this.sendMessage({
      customerId: order.customer.id,
      templateId: template.id,
      communicationType: template.communicationType,
      recipient,
      content: await this.processTemplateVariables(template.content, variables),
      subject: template.subject ? await this.processTemplateVariables(template.subject, variables) : undefined,
      metadata: variables,
    }, userId);
  }

  static async sendAppointmentReminder(appointmentId: string, userId: string) {
    // This would integrate with the appointment system
    // For now, it's a placeholder
    console.log('Appointment reminder for:', appointmentId);
  }

  static async sendBirthdayWish(customerId: string, userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const template = await prisma.communicationTemplate.findFirst({
      where: {
        category: 'BIRTHDAY',
        isActive: true,
      },
    });

    if (!template) {
      throw new Error('No active birthday template found');
    }

    const variables = {
      customerName: `${customer.firstName} ${customer.lastName}`,
    };

    return await this.sendMessage({
      customerId,
      templateId: template.id,
      communicationType: template.communicationType,
      recipient: customer.phone,
      content: await this.processTemplateVariables(template.content, variables),
      subject: template.subject ? await this.processTemplateVariables(template.subject, variables) : undefined,
      metadata: variables,
    }, userId);
  }
}
