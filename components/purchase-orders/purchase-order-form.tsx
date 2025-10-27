'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { createPurchaseOrderSchema, updatePurchaseOrderSchema, CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from 'lib/validations/purchase-order';
import { PurchaseOrderStatus, PaymentTerms, PurchaseOrder } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface PurchaseOrderFormProps {
  mode: 'create' | 'edit';
  initialData?: PurchaseOrder;
  onSubmit: (data: CreatePurchaseOrderInput | UpdatePurchaseOrderInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PurchaseOrderForm({ mode, initialData, onSubmit, onCancel, isLoading }: PurchaseOrderFormProps) {
  const schema = mode === 'create' ? createPurchaseOrderSchema : updatePurchaseOrderSchema;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; supplierNumber: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<{ id: string; name: string; sku: string; unitPrice: number }[]>([]);

  const form = useForm<CreatePurchaseOrderInput | UpdatePurchaseOrderInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      supplierId: initialData.supplierId,
      orderDate: initialData.orderDate,
      expectedDate: initialData.expectedDate || undefined,
      status: initialData.status,
      totalAmount: Number(initialData.totalAmount),
      currency: initialData.currency,
      notes: initialData.notes || '',
      items: initialData.items.map(item => ({
        inventoryItemId: item.inventoryItemId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        notes: item.notes || '',
      })),
    } : {
      supplierId: '',
      orderDate: new Date(),
      expectedDate: undefined,
      status: PurchaseOrderStatus.DRAFT,
      totalAmount: 0,
      currency: 'AED',
      notes: '',
      items: [{
        inventoryItemId: '',
        quantity: 1,
        unitPrice: 0,
        notes: '',
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch for changes in items to recalculate total
  const watchedItems = form.watch("items");
  useEffect(() => {
    const total = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    form.setValue("totalAmount", total);
  }, [watchedItems, form]);

  // Fetch suppliers and inventory items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersResponse, inventoryResponse] = await Promise.all([
          fetch('/api/suppliers?limit=100'),
          fetch('/api/inventory?limit=100'),
        ]);

        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData.suppliers);
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

  const handleSubmit = async (data: CreatePurchaseOrderInput | UpdatePurchaseOrderInput) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const addItem = () => {
    append({
      inventoryItemId: '',
      quantity: 1,
      unitPrice: 0,
      notes: '',
    });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.supplierNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="orderDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Date</FormLabel>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expectedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Date</FormLabel>
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
                      <SelectItem value={PurchaseOrderStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={PurchaseOrderStatus.PENDING_APPROVAL}>Pending Approval</SelectItem>
                      <SelectItem value={PurchaseOrderStatus.APPROVED}>Approved</SelectItem>
                      <SelectItem value={PurchaseOrderStatus.ORDERED}>Ordered</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Order Items</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.inventoryItemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory Item</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
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
                    name={`items.${index}.unitPrice`}
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
                    <div className="text-sm text-muted-foreground">
                      Total: {form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)} AED
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Item notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold">
              Total Amount: {form.watch("totalAmount")} {form.watch("currency")}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Information</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter any special notes or requirements" {...field} />
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
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Purchase Order' : 'Update Purchase Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
