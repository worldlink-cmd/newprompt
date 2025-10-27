'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { OrderForm } from './order-form';
import { Order } from '../../types';
import { CreateOrderInput, UpdateOrderInput } from '../../lib/validations/order';
import { createOrder, updateOrder } from '../../lib/api/orders';
import { useToast } from '../../hooks/use-toast';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  order?: Order;
  onSuccess: () => void;
}

export function OrderDialog({
  open,
  onOpenChange,
  mode,
  order,
  onSuccess,
}: OrderDialogProps) {
  const { toast } = useToast();

  const handleSubmit = async (data: CreateOrderInput | UpdateOrderInput) => {
    try {
      if (mode === 'create') {
        await createOrder(data as CreateOrderInput);
        toast({
          title: 'Success',
          description: 'Order created successfully',
        });
      } else {
        await updateOrder(order!.id, data as UpdateOrderInput);
        toast({
          title: 'Success',
          description: 'Order updated successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save order',
        variant: 'destructive',
      });
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
            {mode === 'create' ? 'Create New Order' : 'Edit Order'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the order details below to create a new order.'
              : 'Update the order information below.'
            }
          </DialogDescription>
        </DialogHeader>

        <OrderForm
          mode={mode}
          initialData={order}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
