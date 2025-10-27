'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { SupplierForm } from './supplier-form';
import { Supplier } from 'types';
import { CreateSupplierInput, UpdateSupplierInput } from 'lib/validations/supplier';

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  supplier?: Supplier;
  onSuccess: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  mode,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const handleSubmit = async (data: CreateSupplierInput | UpdateSupplierInput) => {
    try {
      const url = mode === 'create'
        ? '/api/suppliers'
        : `/api/suppliers/${supplier?.id}`;

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
        throw new Error(error.error || 'Failed to save supplier');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
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
            {mode === 'create' ? 'Create New Supplier' : 'Edit Supplier'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the supplier details below to create a new supplier record.'
              : 'Update the supplier information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <SupplierForm
          mode={mode}
          initialData={supplier}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
