'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Clock, MapPin, Calendar } from 'lucide-react';
import { Attendance, AttendanceStatus } from '../../types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface AttendanceTableProps {
  attendance: Attendance[];
  onRefresh: () => void;
  userRole: string | null;
}

export function AttendanceTable({ attendance, onRefresh, userRole }: AttendanceTableProps) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    record: null as Attendance | null,
  });

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

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateHours = (clockIn: Date | string | null, clockOut: Date | string | null) => {
    if (!clockIn || !clockOut) return 'N/A';
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  const handleDelete = (record: Attendance) => {
    setDeleteDialog({
      open: true,
      record,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.record) return;

    try {
      const response = await fetch(`/api/attendance/${deleteDialog.record.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
    } finally {
      setDeleteDialog({ open: false, record: null });
    }
  };

  if (attendance.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No attendance records</h3>
        <p className="mt-2 text-muted-foreground">
          Attendance records will appear here once employees start clocking in/out.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {attendance.map((record) => (
          <div
            key={record.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {record.employee.firstName} {record.employee.lastName}
                  </h3>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  Employee ID: {record.employee.employeeNumber}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-muted-foreground">
                        {formatDate(record.attendanceDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Clock In</div>
                      <div className="text-muted-foreground">
                        {formatTime(record.clockInTime)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium">Clock Out</div>
                      <div className="text-muted-foreground">
                        {formatTime(record.clockOutTime)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium">Hours</div>
                      <div className="text-muted-foreground">
                        {calculateHours(record.clockInTime, record.clockOutTime)}
                      </div>
                    </div>
                  </div>
                </div>

                {(record.locationIn || record.locationOut) && (
                  <div className="flex items-center gap-4 text-sm">
                    {record.locationIn && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">
                          In: {record.locationIn}
                        </span>
                      </div>
                    )}
                    {record.locationOut && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-muted-foreground">
                          Out: {record.locationOut}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {record.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes: </span>
                    <span className="text-muted-foreground">{record.notes}</span>
                  </div>
                )}
              </div>

              {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Handle edit */}}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
