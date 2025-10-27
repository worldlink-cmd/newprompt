'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Clock, MapPin, Calendar, Users, Play, Square } from 'lucide-react';
import { AttendanceTable } from '../../../components/attendance/attendance-table';
import { ClockInOutDialog } from '../../../components/attendance/clock-in-out-dialog';
import { AttendanceDashboard } from '../../../components/attendance/attendance-dashboard';
import { Attendance, AttendanceStatus } from '../../../types';
import { useToast } from '../../../hooks/use-toast';

export default function AttendancePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockStatus, setClockStatus] = useState<{
    isClockedIn: boolean;
    canClockIn: boolean;
    canClockOut: boolean;
    attendance?: Attendance;
  } | null>(null);

  // Clock in/out dialog state
  const [clockDialog, setClockDialog] = useState({
    open: false,
    mode: 'clock_in' as 'clock_in' | 'clock_out',
  });

  // Get current user's employee ID (this would need to be implemented based on your user system)
  const currentEmployeeId = (session?.user as any)?.employeeId || 'current-employee-id';

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/attendance');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }

      const data = await response.json();
      setAttendance(data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch clock status
  const fetchClockStatus = async () => {
    try {
      const response = await fetch(`/api/attendance/clock?employeeId=${currentEmployeeId}`);
      if (response.ok) {
        const data = await response.json();
        setClockStatus(data);
      }
    } catch (error) {
      console.error('Error fetching clock status:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchClockStatus();
  }, []);

  // Clock in/out handlers
  const handleClockIn = () => {
    setClockDialog({ open: true, mode: 'clock_in' });
  };

  const handleClockOut = () => {
    setClockDialog({ open: true, mode: 'clock_out' });
  };

  const handleClockSuccess = () => {
    fetchAttendance();
    fetchClockStatus();
    setClockDialog({ open: false, mode: 'clock_in' });
    toast({
      title: 'Success',
      description: `Successfully ${clockDialog.mode === 'clock_in' ? 'clocked in' : 'clocked out'}`,
    });
  };

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

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Attendance Management</h1>
              <p className="text-muted-foreground">
                Track employee attendance, clock-in/out times, and work hours
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clockStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Current Status</div>
                  <div className="flex items-center gap-2">
                    <Badge className={clockStatus.isClockedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {clockStatus.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </Badge>
                    {clockStatus.attendance && (
                      <span className="text-sm text-muted-foreground">
                        {clockStatus.isClockedIn && clockStatus.attendance.clockInTime
                          ? `Since ${formatTime(clockStatus.attendance.clockInTime)}`
                          : 'Ready to clock in'
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {clockStatus.canClockIn && (
                    <Button onClick={handleClockIn} className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      Clock In
                    </Button>
                  )}
                  {clockStatus.canClockOut && (
                    <Button onClick={handleClockOut} variant="outline">
                      <Square className="h-4 w-4 mr-2" />
                      Clock Out
                    </Button>
                  )}
                </div>
              </div>

              {clockStatus.attendance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(clockStatus.attendance.attendanceDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {clockStatus.attendance.clockInTime && (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">Clock In</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(clockStatus.attendance.clockInTime)}
                        </div>
                      </div>
                    </div>
                  )}

                  {clockStatus.attendance.clockOutTime && (
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="text-sm font-medium">Clock Out</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(clockStatus.attendance.clockOutTime)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Unable to load clock status</h3>
              <p className="mt-2 text-muted-foreground">
                Please try refreshing the page or contact your administrator.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Dashboard */}
      <AttendanceDashboard attendance={attendance} />

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <p className="text-sm text-muted-foreground">
            View and manage attendance records for all employees
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchAttendance} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <AttendanceTable
              attendance={attendance}
              onRefresh={fetchAttendance}
              userRole={(session?.user as any)?.role || null}
            />
          )}
        </CardContent>
      </Card>

      {/* Clock In/Out Dialog */}
      <ClockInOutDialog
        open={clockDialog.open}
        onOpenChange={(open) => setClockDialog(prev => ({ ...prev, open }))}
        mode={clockDialog.mode}
        employeeId={currentEmployeeId}
        onSuccess={handleClockSuccess}
      />
    </div>
  );
}
