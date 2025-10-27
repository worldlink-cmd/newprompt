import { z } from 'zod';
import { TaskStatus, TaskPriority, TaskStage } from '../../types';

// Task creation schema
export const createTaskSchema = z.object({
  orderId: z.string().min(1, 'Order is required'),
  stage: z.nativeEnum(TaskStage, {
    required_error: 'Stage is required',
  }),
  assignedEmployeeId: z.string().optional(),
  deadline: z.coerce.date().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.NORMAL),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Task update schema
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  actualHours: z.number().min(0, 'Actual hours must be positive').optional(),
});

// Task status update schema
export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    required_error: 'Status is required',
  }),
  notes: z.string().optional(),
  actualHours: z.number().min(0, 'Actual hours must be positive').optional(),
});

// Task assignment schema
export const assignTaskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  notes: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
