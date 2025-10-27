'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { createMaterialUsageSchema, updateMaterialUsageSchema, CreateMaterialUsageInput, UpdateMaterialUsageInput } from 'lib/validations/material-usage';
import { MaterialUsage } from '../../types';

interface MaterialUsageFormProps {
  mode: 'create' | 'edit';
  initialData?: MaterialUsage;
  onSubmit: (data: CreateMaterialUsageInput | UpdateMaterialUsageInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MaterialUsageForm({ mode, initialData, onSubmit, onCancel, isLoading }: MaterialUsageFormProps) {
  const schema = mode === 'create' ? createMaterialUsageSchema : updateMaterialUsageSchema;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; customerName: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<{ id: string; name: string; sku: string; unit: string; unitPrice: number }[]>([]);

  const form = useForm<CreateMaterialUsageInput | UpdateMaterialUsageInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      orderId: initialData.orderId,
      inventoryItemId: initialData.inventoryItemId,
      quantity: Number(initialData.quantity),
      unitPrice: Number(initialData.unitPrice),
      totalCost: Number(initialData.totalCost),
      usageDate: initialData.usageDate,
      notes: initialData.notes || '',
    } : {
      orderId: '',
      inventoryItemId: '',
      quantity: 1,
      unitPrice: 0,
      totalCost: 0,
      usageDate: new Date(),
      notes: '',
    },
  });

  // Watch for changes in quantity and unit price to recalculate total cost
  const watchedQuantity = form.watch("quantity");
  const watchedUnitPrice = form.watch("unitPrice");
  useEffect(() => {
    const total = watchedQuantity * watchedUnitPrice;
    form.setValue("totalCost", total);
  }, [watchedQuantity, watchedUnitPrice, form]);

  // Fetch orders and inventory items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, inventoryResponse] = await Promise.all([
          fetch('/api/orders?limit=100'),
          fetch('/api/inventory?limit=100'),
        ]);

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const formattedOrders = ordersData.orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`,
          }));
          setOrders(formattedOrders);
        }

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          setInventoryItems(inventoryData.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: CreateMaterialUsageInput | UpdateMaterialUsageInput) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {submitError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {submitError}
          </div>
        )}

        {/* Order and Material Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Material Usage Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select order</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.orderNumber} - {order.customerName}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select material</option>
                      {inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.sku})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quantity and Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quantity and Cost</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <div className="space-y-1">
                <label className="text-sm font-medium">Total Cost</label>
                <div className="text-lg font-semibold">
                  {form.watch("totalCost").toFixed(2)} AED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date and Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="usageDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter any notes about this material usage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Add Material Usage' : 'Update Material Usage'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
