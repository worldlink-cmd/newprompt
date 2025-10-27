import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { ClockInOutData } from '../../../../types';

// POST /api/attendance/clock - Clock in/out for employees
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ClockInOutData = await request.json();

    if (!body.employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if employee has a schedule for today
    const schedule = await prisma.employeeSchedule.findFirst({
      where: {
        employeeId: body.employeeId,
        scheduleDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // Check if attendance record exists for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId: body.employeeId,
          attendanceDate: today,
        },
      },
    });

    if (!existingAttendance) {
      // Create new attendance record (clock in)
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: body.employeeId,
          scheduleId: schedule?.id,
          attendanceDate: today,
          clockInTime: now,
          status: 'PRESENT',
          locationIn: body.location,
          ipAddress: body.ipAddress,
          notes: body.notes,
        },
      });

      return NextResponse.json({
        attendance,
        action: 'clocked_in',
        message: 'Successfully clocked in'
      }, { status: 201 });
    } else {
      // Update existing attendance record (clock out)
      const updatedAttendance = await prisma.attendance.update({
        where: {
          employeeId_attendanceDate: {
            employeeId: body.employeeId,
            attendanceDate: today,
          },
        },
        data: {
          clockOutTime: now,
          locationOut: body.location,
          ipAddress: body.ipAddress,
          notes: body.notes,
          // Calculate hours
          regularHours: 8, // Default 8 hours, should be calculated based on schedule
          status: 'PRESENT',
        },
      });

      return NextResponse.json({
        attendance: updatedAttendance,
        action: 'clocked_out',
        message: 'Successfully clocked out'
      });
    }
  } catch (error) {
    console.error('Error with clock operation:', error);
    return NextResponse.json(
      { error: 'Failed to process clock operation' },
      { status: 500 }
    );
  }
}

// GET /api/attendance/clock - Get current clock status for employee
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId,
          attendanceDate: today,
        },
      },
      include: {
        schedule: {
          include: {
            template: true,
          },
        },
      },
    });

    const isClockedIn = attendance && attendance.clockInTime && !attendance.clockOutTime;

    return NextResponse.json({
      attendance,
      isClockedIn,
      canClockIn: !attendance,
      canClockOut: isClockedIn,
    });
  } catch (error) {
    console.error('Error fetching clock status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clock status' },
      { status: 500 }
    );
  }
}
