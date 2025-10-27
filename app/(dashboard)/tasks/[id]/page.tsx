'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Separator } from '../../../../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Clock, User, CheckSquare, AlertTriangle } from 'lucide-react';
import { TaskDialog } from '../../../../components/tasks/task-dialog';
import { Task, TaskStatus, TaskPriority, TaskStage } from '../../../../types';
import { useToast } from '../../../../hooks/use-toast';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  // State management
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch task function
  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/${taskId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error('Failed to fetch task');
      }

      const data = await response.json();
      setTask(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch task on mount
  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  // Handler functions
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleBack = () => {
    router.push('/dashboard/tasks');
  };

  const handleEditSuccess = () => {
    fetchTask();
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error || 'Task not found'}</p>
              <Button onClick={handleBack} variant="outline">
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Task Details</h1>
            <p className="text-muted-foreground">Task ID: {task.id}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center space-x-2">
        <Badge variant={task.status === TaskStatus.COMPLETED ? 'default' : task.status === TaskStatus.IN_PROGRESS ? 'secondary' : 'outline'}>
          {task.status}
        </Badge>
        <Badge variant="outline">
          {task.priority}
        </Badge>
        <Badge variant="outline">
          {task.stage}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Task Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Stage:</span>
                  <span>{task.stage}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>

                {task.deadline && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Deadline:</span>
                    <span>{new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                )}

                {task.estimatedHours && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Estimated Hours:</span>
                    <span>{task.estimatedHours}</span>
                  </div>
                )}

                {task.actualHours && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Actual Hours:</span>
                    <span>{task.actualHours}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Created:</span>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Updated:</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {task.notes && (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="mt-1 text-sm">{task.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          {task.order && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Related Order</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Order Number:</span>
                    <span>{task.order.orderNumber}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Customer:</span>
                    <span>{task.order.customer.firstName} {task.order.customer.lastName}</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/orders/${task.order.id}`)}
                  variant="outline"
                  size="sm"
                >
                  View Order Details
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Assignment Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.assignedEmployee ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assigned Employee:</span>
                    <span>{task.assignedEmployee.firstName} {task.assignedEmployee.lastName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Employee Number:</span>
                    <span>{task.assignedEmployee.employeeNumber}</span>
                  </div>

                  {task.assignedAt && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Assigned At:</span>
                      <span>{new Date(task.assignedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {task.completedAt && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Completed At:</span>
                      <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No employee assigned</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Task History</h3>
            </CardHeader>
            <CardContent>
              {task.history && task.history.length > 0 ? (
                <div className="space-y-4">
                  {task.history.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant="outline">{entry.status}</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{entry.user.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <TaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        task={task}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
