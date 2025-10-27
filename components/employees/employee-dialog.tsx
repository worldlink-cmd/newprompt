'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { EmployeeForm } from './employee-form';
import { Employee } from 'types';
import { CreateEmployeeInput, UpdateEmployeeInput } from 'lib/validations/employee';

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  employee?: Employee;
  onSuccess: () => void;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  mode,
  employee,
  onSuccess,
}: EmployeeDialogProps) {
  const handleSubmit = async (data: CreateEmployeeInput | UpdateEmployeeInput) => {
    try {
      const url = mode === 'create'
        ? '/api/employees'
        : `/api/employees/${employee?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save employee');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Employee' : 'Edit Employee'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the employee details below to create a new employee record.'
              : 'Update the employee information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <EmployeeForm
          mode={mode}
          initialData={employee}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
