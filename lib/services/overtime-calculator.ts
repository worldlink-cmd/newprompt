import { prisma } from '../prisma';
import { AttendanceStatus } from '../../types';

export interface OvertimeCalculationInput {
  employeeId: string;
  startDate: Date;
  endDate: Date;
}

export interface OvertimeCalculationResult {
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalWeekendHours: number;
  totalHolidayHours: number;
  dailyBreakdown: {
    date: Date;
    regularHours: number;
    overtimeHours: number;
    weekendHours: number;
    holidayHours: number;
    status: AttendanceStatus;
  }[];
  calculationDetails: any;
}

export class OvertimeCalculator {
  static async calculateOvertime(input: OvertimeCalculationInput): Promise<OvertimeCalculationResult> {
    // Get salary structure for the employee
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { employeeId: input.employeeId },
    });

    if (!salaryStructure) {
      throw new Error(`No salary structure found for employee: ${input.employeeId}`);
    }

    // Get attendance records for the period
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: input.employeeId,
        attendanceDate: {
          gte: input.startDate,
          lte: input.endDate,
        },
      },
      orderBy: {
        attendanceDate: 'asc',
      },
    });

    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalWeekendHours = 0;
    let totalHolidayHours = 0;
    const dailyBreakdown: any[] = [];

    const calculationDetails: any = {
      employeeId: input.employeeId,
      period: { startDate: input.startDate, endDate: input.endDate },
      standardHours: salaryStructure.standardHours,
      overtimeRate: salaryStructure.overtimeRate,
      weekendRate: salaryStructure.weekendRate,
      holidayRate: salaryStructure.holidayRate,
    };

    for (const record of attendanceRecords) {
      const dayOfWeek = record.attendanceDate.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let regularHours = 0;
      let overtimeHours = 0;
      let weekendHours = 0;
      let holidayHours = 0;

      if (record.clockInTime && record.clockOutTime && record.status === AttendanceStatus.PRESENT) {
        // Calculate worked hours
        const workedMinutes = (record.clockOutTime.getTime() - record.clockInTime.getTime()) / (1000 * 60);
        const workedHours = workedMinutes / 60;

        // Subtract break time
        const breakHours = record.totalBreakMinutes / 60;
        const netWorkedHours = workedHours - breakHours;

        if (netWorkedHours > 0) {
          if (netWorkedHours <= salaryStructure.standardHours) {
            regularHours = netWorkedHours;
          } else {
            regularHours = salaryStructure.standardHours;
            const extraHours = netWorkedHours - salaryStructure.standardHours;

            if (isWeekend) {
              weekendHours = extraHours;
            } else {
              overtimeHours = extraHours;
            }
          }
        }
      }

      totalRegularHours += regularHours;
      totalOvertimeHours += overtimeHours;
      totalWeekendHours += weekendHours;
      totalHolidayHours += holidayHours;

      dailyBreakdown.push({
        date: record.attendanceDate,
        regularHours,
        overtimeHours,
        weekendHours,
        holidayHours,
        status: record.status,
      });
    }

    calculationDetails.dailyBreakdown = dailyBreakdown;

    return {
      totalRegularHours,
      totalOvertimeHours,
      totalWeekendHours,
      totalHolidayHours,
      dailyBreakdown,
      calculationDetails,
    };
  }

  static calculateOvertimePay(calculationResult: OvertimeCalculationResult, salaryStructure: any): number {
    const regularPay = calculationResult.totalRegularHours * salaryStructure.hourlyRate;
    const overtimePay = calculationResult.totalOvertimeHours * salaryStructure.hourlyRate * salaryStructure.overtimeRate;
    const weekendPay = calculationResult.totalWeekendHours * salaryStructure.hourlyRate * salaryStructure.weekendRate;
    const holidayPay = calculationResult.totalHolidayHours * salaryStructure.hourlyRate * salaryStructure.holidayRate;

    return regularPay + overtimePay + weekendPay + holidayPay;
  }

  static async updateAttendanceWithOvertime(employeeId: string, startDate: Date, endDate: Date) {
    const calculationResult = await this.calculateOvertime({ employeeId, startDate, endDate });

    // Update attendance records with calculated hours
    for (const day of calculationResult.dailyBreakdown) {
      await prisma.attendance.updateMany({
        where: {
          employeeId,
          attendanceDate: day.date,
        },
        data: {
          regularHours: day.regularHours,
          overtimeHours: day.overtimeHours,
        },
      });
    }

    return calculationResult;
  }
}
