'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Task, TaskStatus, TaskPriority, TaskStage } from '../../types';
import { CreateTaskInput, UpdateTaskInput } from '../../types';
import { createTaskSchema, updateTaskSchema } from '../../lib/validations/task';
import { createTask, updateTask } from '../../lib/api/tasks';
import { fetchOrders } from '../../lib/api/orders';
import { fetchEmployees } from '../../lib/api/employees';
import { useToast } from '../../hooks/use-toast';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit' | 'status-update';
  task?: Task;
  onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, mode, task, onSuccess }: TaskDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const form = useForm<CreateTaskInput | UpdateTaskInput>({
    resolver: zodResolver(mode === 'edit' ? updateTaskSchema : createTaskSchema),
    defaultValues: {
      orderId: '',
      stage: TaskStage.RECEIVED,
      assignedEmployeeId: '',
      deadline: undefined,
      priority: TaskPriority.NORMAL,
      estimatedHours: undefined,
      notes: '',
      ...(mode === 'edit' && task ? {
        id: task.id,
        orderId: task.orderId,
        stage: task.stage,
        assignedEmployeeId: task.assignedEmployeeId || '',
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        priority: task.priority,
        estimatedHours: task.estimatedHours || undefined,
        notes: task.notes || '',
        status: task.status,
        actualHours: task.actualHours || undefined,
      } : {}),
    },
  });

  // Fetch orders and employees for dropdowns
  useEffect(() => {
    if (open) {
      fetchOrders({ limit: 100 }).then(response => setOrders(response.orders));
      fetchEmployees({ limit: 100 }).then(response => setEmployees(response.employees));
    }
  }, [open]);

  const onSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      setIsLoading(true);

      if (mode === 'create') {
        await createTask(data as CreateTaskInput);
        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      } else if (mode === 'edit') {
        await updateTask(task!.id, data as UpdateTaskInput);
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save task',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Task' : mode === 'edit' ? 'Edit Task' : 'Update Task Status'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Order Selection */}
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - {order.customer.firstName} {order.customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stage Selection */}
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TaskStage).map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee Assignment */}
            <FormField
              control={form.control}
              name="assignedEmployeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Employee (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TaskPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Hours */}
            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hours (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status (for edit mode) */}
            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actual Hours (for edit mode) */}
            {mode === 'edit' && (
              <FormField
                control={form.control}
                name="actualHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Hours (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
