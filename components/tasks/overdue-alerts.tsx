'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { fetchTasks } from '../../lib/api/tasks';
import { useToast } from '../../hooks/use-toast';

interface OverdueTask extends Task {
  daysOverdue: number;
}

export function OverdueAlerts() {
  const { toast } = useToast();
  const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchOverdueTasks = async () => {
    try {
      setLoading(true);
      const response = await fetchTasks({
        overdue: true,
        status: TaskStatus.PENDING,
        limit: 10,
      });

      const tasksWithDays = response.tasks.map((task: Task) => ({
        ...task,
        daysOverdue: task.deadline
          ? Math.ceil((new Date().getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      }));

      setOverdueTasks(tasksWithDays);
    } catch (error) {
      console.error('Error fetching overdue tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load overdue tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueTasks();

    // Set up interval to check for overdue tasks every 5 minutes
    const interval = setInterval(fetchOverdueTasks, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Show notification for new overdue tasks
  useEffect(() => {
    if (overdueTasks.length > 0) {
      const urgentTasks = overdueTasks.filter(task => task.daysOverdue >= 3);
      if (urgentTasks.length > 0) {
        toast({
          title: 'Urgent: Overdue Tasks',
          description: `${urgentTasks.length} task(s) are ${urgentTasks[0].daysOverdue >= 3 ? 'critically' : ''} overdue`,
          variant: 'destructive',
        });
      }
    }
  }, [overdueTasks, toast]);

  if (loading) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-700">Overdue Tasks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2 border rounded">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (overdueTasks.length === 0) {
    return null;
  }

  const displayTasks = showAll ? overdueTasks : overdueTasks.slice(0, 3);
  const hasMore = overdueTasks.length > 3;

  const getUrgencyColor = (daysOverdue: number) => {
    if (daysOverdue >= 7) return 'bg-red-100 text-red-800 border-red-300';
    if (daysOverdue >= 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getUrgencyText = (daysOverdue: number) => {
    if (daysOverdue >= 7) return 'Critical';
    if (daysOverdue >= 3) return 'Urgent';
    return 'Overdue';
  };

  return (
    <Card className="mb-6 border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-700">
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </div>
          <Button
            onClick={fetchOverdueTasks}
            variant="outline"
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex justify-between items-center p-3 border rounded-lg ${getUrgencyColor(task.daysOverdue)}`}
            >
              <div className="space-y-1">
                <div className="font-medium">
                  {task.order?.orderNumber || 'N/A'}
                </div>
                <div className="text-sm">
                  {task.order?.customer?.firstName} {task.order?.customer?.lastName}
                </div>
                <div className="text-xs">
                  {task.stage.replace('_', ' ')} • Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="outline" className="text-xs">
                  {getUrgencyText(task.daysOverdue)}
                </Badge>
                <div className="text-sm font-medium">
                  {task.daysOverdue} day{task.daysOverdue !== 1 ? 's' : ''} overdue
                </div>
              </div>
            </div>
          ))}

          {hasMore && !showAll && (
            <Button
              onClick={() => setShowAll(true)}
              variant="outline"
              className="w-full"
            >
              Show {overdueTasks.length - 3} more overdue tasks
            </Button>
          )}

          {showAll && hasMore && (
            <Button
              onClick={() => setShowAll(false)}
              variant="outline"
              className="w-full"
            >
              Show less
            </Button>
          )}
        </div>

        {overdueTasks.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {overdueTasks.filter(t => t.daysOverdue >= 7).length > 0
                  ? `${overdueTasks.filter(t => t.daysOverdue >= 7).length} critically overdue tasks require immediate attention`
                  : 'Overdue tasks need to be addressed promptly'
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
