'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Play, CheckCircle, Clock } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskStage } from '../../types';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onView: (taskId: string) => void;
  onStatusUpdate: (taskId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  userRole: string | null;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case TaskStatus.OVERDUE:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onView,
  onStatusUpdate,
  sortBy,
  sortOrder,
  onSort,
  userRole,
}: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleSort = (field: string) => {
    onSort(field);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('order.orderNumber')}
            >
              Order {getSortIcon('order.orderNumber')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('stage')}
            >
              Stage {getSortIcon('stage')}
            </TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('deadline')}
            >
              Deadline {getSortIcon('deadline')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('priority')}
            >
              Priority {getSortIcon('priority')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status {getSortIcon('status')}
            </TableHead>
            <TableHead>Hours</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">
                      {task.order?.orderNumber || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {task.order?.customer?.firstName} {task.order?.customer?.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStageColor(task.stage)}>
                    {task.stage.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assignedEmployee ? (
                    <div>
                      <div className="font-medium">
                        {task.assignedEmployee.firstName} {task.assignedEmployee.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task.assignedEmployee.employeeNumber}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.deadline ? (
                    <div>
                      <div>{new Date(task.deadline).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(task.deadline).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No deadline</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Est: {task.estimatedHours || 'N/A'}</div>
                    <div>Act: {task.actualHours || 'N/A'}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(task.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(task.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusUpdate(task.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Task
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
