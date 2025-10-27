'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, CheckSquare } from 'lucide-react';
import { TaskTable } from '../../../components/tasks/task-table';
import { TaskFilters } from '../../../components/tasks/task-filters';
import { TaskDialog } from '../../../components/tasks/task-dialog';
import { TaskListSkeleton } from '../../../components/tasks/task-list-skeleton';
import { WorkloadDashboard } from '../../../components/tasks/workload-dashboard';
import { OverdueAlerts } from '../../../components/tasks/overdue-alerts';
import { TaskBoard } from '../../../components/tasks/task-board';
import { Task, TaskStatus, TaskPriority, TaskStage } from '../../../types';
import { CreateTaskInput, UpdateTaskInput } from '../../../types';
import { fetchTasks, deleteTask } from '../../../lib/api/tasks';
import { useToast } from '../../../hooks/use-toast';

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    orderId: searchParams.get('orderId') || '',
    stage: (searchParams.get('stage') as TaskStage) || null,
    assignedEmployeeId: searchParams.get('assignedEmployeeId') || '',
    status: (searchParams.get('status') as TaskStatus) || null,
    priority: (searchParams.get('priority') as TaskPriority) || null,
    overdue: searchParams.get('overdue') === 'true',
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  // Dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    selectedTask: null as Task | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    task: null as Task | null,
  });

  // Fetch tasks function
  const fetchTasksData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchTasks({
        search: filters.search || undefined,
        orderId: filters.orderId || undefined,
        stage: filters.stage || undefined,
        assignedEmployeeId: filters.assignedEmployeeId || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        overdue: filters.overdue,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      });

      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchTasksData();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.orderId) params.set('orderId', filters.orderId);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.assignedEmployeeId) params.set('assignedEmployeeId', filters.assignedEmployeeId);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.overdue) params.set('overdue', 'true');
    if (sorting.sortBy !== 'createdAt') params.set('sortBy', sorting.sortBy);
    if (sorting.sortOrder !== 'desc') params.set('sortOrder', sorting.sortOrder);

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }, [filters, sorting]);

  // Handler functions
  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    setSorting(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleCreate = () => {
    setDialogState({
      open: true,
      mode: 'create',
      selectedTask: null,
    });
  };

  const handleEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedTask: task,
      });
    }
  };

  const handleDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDeleteDialog({
        open: true,
        task,
      });
    }
  };

  const handleStatusUpdate = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDialogState({
        open: true,
        mode: 'status-update',
        selectedTask: task,
      });
    }
  };

  const handleView = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  const handleDialogSuccess = () => {
    fetchTasksData();
    toast({
      title: 'Success',
      description: 'Task saved successfully',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.task) return;

    try {
      await deleteTask(deleteDialog.task.id);
      setDeleteDialog({ open: false, task: null });
      fetchTasksData();
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      orderId: '',
      stage: null,
      assignedEmployeeId: '',
      status: null,
      priority: null,
      overdue: false,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Tasks</h1>
              <p className="text-muted-foreground">
                Manage task assignments and track workflow progress
              </p>
            </div>
            {(session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'MANAGER' ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {/* Overdue Alerts */}
      <OverdueAlerts />

      {/* Workload Dashboard */}
      <WorkloadDashboard />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <TaskFilters
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            stageFilter={filters.stage}
            onStageFilterChange={(stage) => handleFilterChange('stage', stage)}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => handleFilterChange('status', status)}
            priorityFilter={filters.priority}
            onPriorityFilterChange={(priority) => handleFilterChange('priority', priority)}
            overdueFilter={filters.overdue}
            onOverdueFilterChange={(overdue) => handleFilterChange('overdue', overdue)}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Task Board View */}
      <TaskBoard
        onTaskEdit={handleEdit}
        onTaskDelete={handleDelete}
        onTaskView={handleView}
        userRole={(session?.user as any)?.role || null}
      />

      {/* Table View */}
      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchTasksData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onStatusUpdate={handleStatusUpdate}
              sortBy={sorting.sortBy}
              sortOrder={sorting.sortOrder}
              onSort={handleSort}
              userRole={(session?.user as any)?.role || null}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} tasks
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Task Dialog */}
      <TaskDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        task={dialogState.selectedTask || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
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
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
