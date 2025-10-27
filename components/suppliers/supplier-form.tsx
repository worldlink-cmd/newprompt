'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { createSupplierSchema, updateSupplierSchema, CreateSupplierInput, UpdateSupplierInput } from 'lib/validations/supplier';
import { SupplierStatus, PaymentTerms, Supplier } from '../../types';

interface SupplierFormProps {
  mode: 'create' | 'edit';
  initialData?: Supplier;
  onSubmit: (data: CreateSupplierInput | UpdateSupplierInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierForm({ mode, initialData, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const schema = mode === 'create' ? createSupplierSchema : updateSupplierSchema;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateSupplierInput | UpdateSupplierInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      supplierNumber: initialData.supplierNumber,
      name: initialData.name,
      email: initialData.email || '',
      phone: initialData.phone,
      alternatePhone: initialData.alternatePhone || '',
      address: initialData.address || '',
      city: initialData.city || '',
      state: initialData.state || '',
      postalCode: initialData.postalCode || '',
      country: initialData.country || '',
      taxId: initialData.taxId || '',
      paymentTerms: initialData.paymentTerms,
      leadTimeDays: initialData.leadTimeDays,
      minimumOrder: initialData.minimumOrder || undefined,
      notes: initialData.notes || '',
      status: initialData.status,
      isActive: initialData.isActive,
    } : {
      supplierNumber: '',
      name: '',
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      taxId: '',
      paymentTerms: PaymentTerms.NET_30,
      leadTimeDays: 7,
      minimumOrder: undefined,
      notes: '',
      status: SupplierStatus.ACTIVE,
      isActive: true,
    },
  });

  const handleSubmit = async (data: CreateSupplierInput | UpdateSupplierInput) => {
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="supplierNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-generated if empty" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="alternatePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter alternate phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tax identification number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PaymentTerms.NET_15}>Net 15</SelectItem>
                      <SelectItem value={PaymentTerms.NET_30}>Net 30</SelectItem>
                      <SelectItem value={PaymentTerms.NET_45}>Net 45</SelectItem>
                      <SelectItem value={PaymentTerms.NET_60}>Net 60</SelectItem>
                      <SelectItem value={PaymentTerms.CASH_ON_DELIVERY}>Cash on Delivery</SelectItem>
                      <SelectItem value={PaymentTerms.ADVANCE_PAYMENT}>Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="leadTimeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter lead time in days"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter minimum order amount"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      value={field.value || ''}
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
                      <SelectItem value={SupplierStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={SupplierStatus.INACTIVE}>Inactive</SelectItem>
                      <SelectItem value={SupplierStatus.SUSPENDED}>Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Supplier' : 'Update Supplier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
