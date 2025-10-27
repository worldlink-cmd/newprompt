'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { PurchaseOrderForm } from './purchase-order-form';
import { PurchaseOrder } from 'types';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from 'lib/validations/purchase-order';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  purchaseOrder?: PurchaseOrder;
  onSuccess: () => void;
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  mode,
  purchaseOrder,
  onSuccess,
}: PurchaseOrderDialogProps) {
  const handleSubmit = async (data: CreatePurchaseOrderInput | UpdatePurchaseOrderInput) => {
    try {
      const url = mode === 'create'
        ? '/api/purchase-orders'
        : `/api/purchase-orders/${purchaseOrder?.id}`;

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
        throw new Error(error.error || 'Failed to save purchase order');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Purchase Order' : 'Edit Purchase Order'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the purchase order details below to create a new purchase order.'
              : 'Update the purchase order information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <PurchaseOrderForm
          mode={mode}
          initialData={purchaseOrder}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
