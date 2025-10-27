'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import { Attendance, AttendanceStatus } from '../../types';

interface AttendanceDashboardProps {
  attendance: Attendance[];
}

export function AttendanceDashboard({ attendance }: AttendanceDashboardProps) {
  // Calculate today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter today's attendance
  const todayAttendance = attendance.filter(record =>
    new Date(record.attendanceDate).toDateString() === today.toDateString()
  );

  // Calculate statistics
  const totalEmployees = attendance.length;
  const presentToday = todayAttendance.filter(record => record.status === AttendanceStatus.PRESENT).length;
  const lateToday = todayAttendance.filter(record => record.status === AttendanceStatus.LATE).length;
  const absentToday = todayAttendance.filter(record => record.status === AttendanceStatus.ABSENT).length;
  const overtimeToday = todayAttendance.filter(record => record.status === AttendanceStatus.OVERTIME).length;

  // Calculate total hours worked today
  const totalHoursToday = todayAttendance.reduce((total, record) => {
    if (record.clockInTime && record.clockOutTime) {
      const start = new Date(record.clockInTime);
      const end = new Date(record.clockOutTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }
    return total;
  }, 0);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800';
      case AttendanceStatus.LATE:
        return 'bg-yellow-100 text-yellow-800';
      case AttendanceStatus.HALF_DAY:
        return 'bg-blue-100 text-blue-800';
      case AttendanceStatus.OVERTIME:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    {
      title: 'Present Today',
      value: presentToday,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Late Arrivals',
      value: lateToday,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Absent Today',
      value: absentToday,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Overtime',
      value: overtimeToday,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.title === 'Present Today' && `${Math.round((presentToday / Math.max(totalEmployees, 1)) * 100)}% of total employees`}
              {stat.title === 'Late Arrivals' && 'Arrived after scheduled time'}
              {stat.title === 'Absent Today' && 'Not present at work'}
              {stat.title === 'Overtime' && 'Working beyond regular hours'}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Additional Summary Card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalHoursToday.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Total Hours Worked</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((presentToday / Math.max(totalEmployees, 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {todayAttendance.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Present: {presentToday}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Late: {lateToday}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Absent: {absentToday}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Overtime: {overtimeToday}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
