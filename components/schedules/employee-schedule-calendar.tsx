'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { ScheduleTemplate, EmployeeSchedule, ShiftType, ScheduleStatus } from '../../types';

interface EmployeeScheduleCalendarProps {
  templates: ScheduleTemplate[];
  onRefresh: () => void;
  userRole: string | null;
}

export function EmployeeScheduleCalendar({ templates, onRefresh, userRole }: EmployeeScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/employee-schedules?date=${selectedDate.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data.schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const getShiftTypeColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case ShiftType.MORNING:
        return 'bg-yellow-100 text-yellow-800';
      case ShiftType.AFTERNOON:
        return 'bg-orange-100 text-orange-800';
      case ShiftType.EVENING:
        return 'bg-blue-100 text-blue-800';
      case ShiftType.NIGHT:
        return 'bg-purple-100 text-purple-800';
      case ShiftType.SPLIT:
        return 'bg-green-100 text-green-800';
      case ShiftType.CUSTOM:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case ScheduleStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ScheduleStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ScheduleStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule =>
      new Date(schedule.scheduleDate).toDateString() === date.toDateString()
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates();

  return (
    <div className="space-y-4">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
            ← Previous Week
          </Button>
          <div className="text-lg font-semibold">
            Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
            Next Week →
          </Button>
        </div>

        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Assign Schedule
          </Button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center font-semibold text-sm bg-muted rounded">
            {day}
          </div>
        ))}

        {/* Date Cells */}
        {weekDates.map((date, index) => {
          const daySchedules = getSchedulesForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded ${
                isToday ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="text-sm font-medium mb-2">
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="text-xs p-1 rounded bg-background border"
                  >
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getShiftTypeColor(schedule.template.shiftType)}`}>
                        {schedule.template.shiftType}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </Badge>
                    </div>

                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">
                          {schedule.employee.firstName} {schedule.employee.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      {schedule.notes && (
                        <div className="text-muted-foreground truncate">
                          {schedule.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {daySchedules.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No schedules
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Morning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>Afternoon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Evening</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
          <span>Night</span>
        </div>
      </div>
    </div>
  );
}
