'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Badge } from '../ui/badge';
import { updateOrderStatusSchema, validStatusTransitions } from '../../lib/validations/order';
import { OrderStatus } from '../../types';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { updateOrderStatus } from '../../lib/api/orders';
import { useToast } from '../../hooks/use-toast';

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentStatus: OrderStatus;
  onSuccess: () => void;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
  onSuccess,
}: StatusUpdateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateOrderStatusSchema),
    defaultValues: {
      status: currentStatus,
      notes: '',
    },
  });

  const selectedStatus = form.watch('status');
  const availableTransitions = validStatusTransitions[currentStatus] || [];

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId, data.status, data.notes);
      toast({
        title: 'Success',
        description: `Order status updated to ${getOrderStatusLabel(data.status)}`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Move this order to the next stage in the workflow process.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Current Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <Badge className={getOrderStatusColor(currentStatus)}>
                {getOrderStatusLabel(currentStatus)}
              </Badge>
            </div>

            {/* Available Transitions */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Status</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {availableTransitions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => field.onChange(status)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            field.value === status
                              ? 'border-primary bg-primary/10'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {getOrderStatusLabel(status)}
                            </span>
                            <Badge
                              variant="outline"
                              className={getOrderStatusColor(status)}
                            >
                              {status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
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
                      placeholder="Add any notes about this status change..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
