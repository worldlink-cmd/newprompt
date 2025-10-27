'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskStage } from '../../types';
import { fetchTasks, updateTaskStatus } from '../../lib/api/tasks';
import { useToast } from '../../hooks/use-toast';

interface TaskBoardProps {
  onTaskEdit: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskView: (taskId: string) => void;
  userRole: string | null;
}

const STATUS_COLUMNS = [
  { status: TaskStatus.PENDING, title: 'Pending', color: 'bg-yellow-100 border-yellow-300' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  { status: TaskStatus.COMPLETED, title: 'Completed', color: 'bg-green-100 border-green-300' },
  { status: TaskStatus.OVERDUE, title: 'Overdue', color: 'bg-red-100 border-red-300' },
];

export function TaskBoard({ onTaskEdit, onTaskDelete, onTaskView, userRole }: TaskBoardProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      const response = await fetchTasks({
        limit: 100, // Get all tasks for the board
      });
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();

    if (!draggedTask) return;

    try {
      // Find the task being dropped
      const task = tasks.find(t => t.id === draggedTask);
      if (!task || task.status === newStatus) return;

      // Update task status
      await updateTaskStatus(draggedTask, {
        status: newStatus,
        notes: `Status changed to ${newStatus.replace('_', ' ')}`,
      });

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === draggedTask
            ? { ...t, status: newStatus }
            : t
        )
      );

      toast({
        title: 'Success',
        description: `Task moved to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    } finally {
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case TaskPriority.NORMAL:
        return 'bg-blue-100 text-blue-800';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: TaskStage) => {
    switch (stage) {
      case TaskStage.RECEIVED:
        return 'bg-purple-100 text-purple-800';
      case TaskStage.CUTTING:
        return 'bg-indigo-100 text-indigo-800';
      case TaskStage.STITCHING:
        return 'bg-pink-100 text-pink-800';
      case TaskStage.QUALITY_CHECK:
        return 'bg-teal-100 text-teal-800';
      case TaskStage.PRESSING:
        return 'bg-cyan-100 text-cyan-800';
      case TaskStage.READY:
        return 'bg-green-100 text-green-800';
      case TaskStage.DELIVERED:
        return 'bg-emerald-100 text-emerald-800';
      case TaskStage.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Task Board</CardTitle>
          <Button onClick={fetchTasksData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((column) => (
            <div
              key={column.status}
              className={`border-2 border-dashed rounded-lg p-4 ${column.color} min-h-[400px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="secondary">
                  {getTasksByStatus(column.status).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {getTasksByStatus(column.status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">
                          {task.order?.orderNumber || 'N/A'}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskView(task.id);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {task.order?.customer?.firstName} {task.order?.customer?.lastName}
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge className={`text-xs ${getStageColor(task.stage)}`}>
                          {task.stage.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>

                      {task.assignedEmployee && (
                        <div className="text-xs text-muted-foreground">
                          👤 {task.assignedEmployee.firstName} {task.assignedEmployee.lastName}
                        </div>
                      )}

                      {task.deadline && (
                        <div className="text-xs text-muted-foreground">
                          📅 {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-medium">
                          {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
                        </span>

                        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskEdit(task.id);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskDelete(task.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {getTasksByStatus(column.status).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          💡 Drag tasks between columns to update their status
        </div>
      </CardContent>
    </Card>
  );
}
