import { prisma } from '../prisma';
import {
  CreateAppointmentInput,
  CreateAppointmentBookingInput,
  CreateAppointmentTemplateInput,
  CreateAvailabilityInput
} from '../validations/appointment';

export class AppointmentService {
  // Appointment Management
  static async createAppointment(data: CreateAppointmentInput, userId: string) {
    // Calculate duration if not provided
    const duration = data.duration || this.calculateDuration(data.startDateTime, data.endDateTime);

    return await prisma.appointment.create({
      data: {
        ...data,
        duration,
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
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
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

  static async getAppointments(filters: {
    customerId?: string;
    employeeId?: string;
    serviceId?: string;
    orderId?: string;
    appointmentType?: string;
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
      employeeId,
      serviceId,
      orderId,
      appointmentType,
      status,
      dateFrom,
      dateTo,
      sortBy = 'startDateTime',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (employeeId) where.employeeId = employeeId;
    if (serviceId) where.serviceId = serviceId;
    if (orderId) where.orderId = orderId;
    if (appointmentType) where.appointmentType = appointmentType;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.startDateTime = {};
      if (dateFrom) where.startDateTime.gte = dateFrom;
      if (dateTo) where.startDateTime.lte = dateTo;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
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
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              category: true,
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
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAppointmentById(id: string) {
    return await prisma.appointment.findUnique({
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
            preferredContactMethod: true,
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
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            basePrice: true,
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

  static async updateAppointment(id: string, data: Partial<CreateAppointmentInput>) {
    return await prisma.appointment.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
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
        service: {
          select: {
            id: true,
            name: true,
            category: true,
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

  static async deleteAppointment(id: string) {
    return await prisma.appointment.delete({
      where: { id },
    });
  }

  // Availability Management
  static async createAvailability(data: CreateAvailabilityInput, userId: string) {
    return await prisma.employeeAvailability.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
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

  static async getEmployeeAvailability(employeeId: string, dateFrom?: Date, dateTo?: Date) {
    const where: any = { employeeId };

    if (dateFrom || dateTo) {
      // This would need a more complex query for date range
      // For now, return all availability for the employee
    }

    return await prisma.employeeAvailability.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  static async checkAvailability(employeeId: string, startDateTime: Date, endDateTime: Date): Promise<boolean> {
    // Get employee's availability for the day of the week
    const dayOfWeek = startDateTime.getDay();
    const availability = await prisma.employeeAvailability.findFirst({
      where: {
        employeeId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      return false;
    }

    // Check if the requested time falls within availability
    const requestedStart = startDateTime.getHours() * 60 + startDateTime.getMinutes();
    const requestedEnd = endDateTime.getHours() * 60 + endDateTime.getMinutes();

    const availableStart = this.timeToMinutes(availability.startTime);
    const availableEnd = this.timeToMinutes(availability.endTime);

    return requestedStart >= availableStart && requestedEnd <= availableEnd;
  }

  static async findAvailableSlots(filters: {
    employeeId?: string;
    serviceId?: string;
    date: Date;
    duration?: number;
  }) {
    const { employeeId, serviceId, date, duration = 60 } = filters;

    // Get service duration if serviceId provided
    let serviceDuration = duration;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { name: true }, // Would need duration field in service model
      });
      // For now, use default duration
    }

    // Get employees
    let employees;
    if (employeeId) {
      employees = await prisma.employee.findMany({
        where: { id: employeeId, isActive: true },
      });
    } else {
      employees = await prisma.employee.findMany({
        where: { isActive: true },
      });
    }

    const availableSlots = [];

    for (const employee of employees) {
      const employeeAvailability = await this.getEmployeeAvailability(employee.id);

      for (const availability of employeeAvailability) {
        if (availability.dayOfWeek === date.getDay()) {
          const slots = await this.generateTimeSlots(
            employee.id,
            date,
            availability.startTime,
            availability.endTime,
            serviceDuration
          );

          availableSlots.push({
            employee,
            availability,
            slots,
          });
        }
      }
    }

    return availableSlots;
  }

  // Calendar Integration
  static async getCalendarEvents(filters: {
    employeeId?: string;
    customerId?: string;
    startDate: Date;
    endDate: Date;
  }) {
    const { employeeId, customerId, startDate, endDate } = filters;

    const where: any = {
      startDateTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (employeeId) where.employeeId = employeeId;
    if (customerId) where.customerId = customerId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            customerNumber: true,
            firstName: true,
            lastName: true,
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
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.customer.firstName} ${appointment.customer.lastName} - ${appointment.title}`,
      start: appointment.startDateTime,
      end: appointment.endDateTime,
      type: 'appointment',
      status: appointment.status,
      priority: appointment.priority,
      customer: appointment.customer,
      employee: appointment.employee,
      service: appointment.service,
      color: this.getAppointmentColor(appointment.status),
    }));
  }

  // Appointment Booking
  static async bookAppointment(data: CreateAppointmentBookingInput, userId: string) {
    // Find available slots
    const availableSlots = await this.findAvailableSlots({
      employeeId: data.employeeId,
      date: data.preferredDateTime,
      duration: data.duration,
    });

    // Find the best slot
    const bestSlot = this.findBestSlot(availableSlots, data.preferredDateTime);

    if (!bestSlot) {
      throw new Error('No available slots found for the requested time');
    }

    // Create appointment
    return await this.createAppointment({
      customerId: data.customerId,
      serviceId: data.serviceId,
      employeeId: bestSlot.employee.id,
      appointmentType: data.appointmentType,
      title: `${data.appointmentType} - ${bestSlot.employee.firstName}`,
      startDateTime: bestSlot.startTime,
      endDateTime: bestSlot.endTime,
      duration: data.duration,
      notes: data.notes,
    }, userId);
  }

  // Automated Reminders
  static async scheduleReminders(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            preferredContactMethod: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment || !appointment.requiresConfirmation) {
      return;
    }

    // Schedule reminders (24h, 2h, 30min before)
    const reminderTimes = [
      new Date(appointment.startDateTime.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
      new Date(appointment.startDateTime.getTime() - 2 * 60 * 60 * 1000),  // 2 hours before
      new Date(appointment.startDateTime.getTime() - 30 * 60 * 1000),     // 30 minutes before
    ];

    for (const reminderTime of reminderTimes) {
      if (reminderTime > new Date()) {
        await prisma.appointmentReminder.create({
          data: {
            appointmentId,
            reminderType: appointment.customer.preferredContactMethod === 'EMAIL' ? 'EMAIL' : 'SMS',
            scheduledFor: reminderTime,
            status: 'PENDING',
          },
        });
      }
    }
  }

  static async processReminders() {
    const pendingReminders = await prisma.appointmentReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        appointment: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                preferredContactMethod: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    for (const reminder of pendingReminders) {
      try {
        // Send reminder using communication service
        // This would integrate with the CommunicationService
        console.log('Sending reminder for appointment:', reminder.appointment.id);

        // Update reminder status
        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      } catch (error) {
        console.error('Failed to send reminder:', error);
        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return pendingReminders.length;
  }

  // Analytics and Reporting
  static async getAppointmentAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    employeeId?: string;
    appointmentType?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.startDateTime = {};
      if (filters.dateFrom) where.startDateTime.gte = filters.dateFrom;
      if (filters.dateTo) where.startDateTime.lte = filters.dateTo;
    }

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.appointmentType) where.appointmentType = filters.appointmentType;

    const result = await prisma.appointment.aggregate({
      where,
      _count: {
        id: true,
      },
      _avg: {
        duration: true,
      },
    });

    const statusBreakdown = await prisma.appointment.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    const typeBreakdown = await prisma.appointment.groupBy({
      by: ['appointmentType'],
      where,
      _count: {
        id: true,
      },
    });

    return {
      totalAppointments: result._count.id,
      averageDuration: Number(result._avg.duration) || 0,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.id,
      })),
      typeBreakdown: typeBreakdown.map(item => ({
        appointmentType: item.appointmentType,
        count: item._count.id,
      })),
    };
  }

  static async getEmployeeUtilization(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    employeeId?: string;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.startDateTime = {};
      if (filters.dateFrom) where.startDateTime.gte = filters.dateFrom;
      if (filters.dateTo) where.startDateTime.lte = filters.dateTo;
    }

    if (filters.employeeId) where.employeeId = filters.employeeId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Group by employee and calculate utilization
    const utilizationByEmployee = appointments.reduce((acc, appointment) => {
      const employeeId = appointment.employeeId || 'unassigned';
      const employee = appointment.employee;

      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee,
          totalDuration: 0,
          appointmentCount: 0,
        };
      }

      acc[employeeId].totalDuration += appointment.duration || 0;
      acc[employeeId].appointmentCount += 1;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(utilizationByEmployee);
  }

  // Utility Methods
  private static calculateDuration(startDateTime: Date, endDateTime: Date): number {
    return Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)); // minutes
  }

  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static generateTimeSlots(
    employeeId: string,
    date: Date,
    startTime: string,
    endTime: string,
    duration: number
  ): Array<{ startTime: Date; endTime: Date }> {
    const slots = [];
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (let currentMinutes = startMinutes; currentMinutes + duration <= endMinutes; currentMinutes += duration) {
      const startDateTime = new Date(date);
      startDateTime.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + duration);

      slots.push({
        startTime: startDateTime,
        endTime: endDateTime,
      });
    }

    return slots;
  }

  private static findBestSlot(availableSlots: any[], preferredDateTime: Date): any | null {
    for (const slot of availableSlots) {
      for (const timeSlot of slot.slots) {
        const timeDiff = Math.abs(timeSlot.startTime.getTime() - preferredDateTime.getTime());
        if (timeDiff <= 30 * 60 * 1000) { // Within 30 minutes
          return {
            employee: slot.employee,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          };
        }
      }
    }
    return null;
  }

  private static getAppointmentColor(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return '#3B82F6'; // Blue
      case 'CONFIRMED':
        return '#10B981'; // Green
      case 'IN_PROGRESS':
        return '#F59E0B'; // Yellow
      case 'COMPLETED':
        return '#059669'; // Dark Green
      case 'CANCELLED':
        return '#EF4444'; // Red
      case 'NO_SHOW':
        return '#6B7280'; // Gray
      default:
        return '#6B7280'; // Gray
    }
  }

  // Conflict Detection
  static async checkForConflicts(
    employeeId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const where: any = {
      employeeId,
      OR: [
        {
          AND: [
            { startDateTime: { lte: startDateTime } },
            { endDateTime: { gt: startDateTime } },
          ],
        },
        {
          AND: [
            { startDateTime: { lt: endDateTime } },
            { endDateTime: { gte: endDateTime } },
          ],
        },
        {
          AND: [
            { startDateTime: { gte: startDateTime } },
            { endDateTime: { lte: endDateTime } },
          ],
        },
      ],
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const conflictingAppointments = await prisma.appointment.count({ where });
    return conflictingAppointments > 0;
  }

  // Bulk Operations
  static async bulkUpdateStatus(appointmentIds: string[], status: string, userId: string) {
    return await prisma.appointment.updateMany({
      where: {
        id: { in: appointmentIds },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  static async getUpcomingAppointments(hours: number = 24) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await prisma.appointment.findMany({
      where: {
        startDateTime: {
          gte: now,
          lte: futureTime,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
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
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });
  }

  static async getOverdueAppointments() {
    const now = new Date();

    return await prisma.appointment.findMany({
      where: {
        endDateTime: {
          lt: now,
        },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
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
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        endDateTime: 'asc',
      },
    });
  }
}
