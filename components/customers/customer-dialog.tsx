'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { CustomerForm } from './customer-form';
import { Customer } from 'types';
import { CreateCustomerInput, UpdateCustomerInput } from 'lib/validations/customer';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  customer?: Customer;
  onSuccess: () => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  mode,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const handleSubmit = async (data: CreateCustomerInput | UpdateCustomerInput) => {
    try {
      const url = mode === 'create'
        ? '/api/customers'
        : `/api/customers/${customer?.id}`;

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
        throw new Error(error.error || 'Failed to save customer');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving customer:', error);
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
            {mode === 'create' ? 'Create New Customer' : 'Edit Customer'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the customer details below to create a new customer record.'
              : 'Update the customer information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <CustomerForm
          mode={mode}
          initialData={customer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
