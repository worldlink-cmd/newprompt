'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { createOrderSchema, updateOrderSchema, CreateOrderInput, UpdateOrderInput } from '../../lib/validations/order';
import {
  OrderStatus,
  OrderPriority,
  GarmentType,
  OrderType,
  Order,
  Customer,
  Measurement,
  ImageType,
  ImageUploadResponse
} from '../../types';
import { fetchCustomers } from '../../lib/api/customers';
import { fetchLatestMeasurements } from '../../lib/api/measurements';
import { calculateEstimatedDelivery } from '../../lib/api/orders';
import { LEAD_TIME_BY_ORDER_TYPE } from '../../lib/constants/order-config';
import { getGarmentTypeLabel } from '../../lib/utils';
import { Calendar, Upload, X, Image as ImageIcon } from 'lucide-react';

interface OrderFormProps {
  mode: 'create' | 'edit';
  initialData?: Order;
  onSubmit: (data: CreateOrderInput | UpdateOrderInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrderForm({ mode, initialData, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const schema = mode === 'create' ? createOrderSchema : updateOrderSchema;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [availableMeasurements, setAvailableMeasurements] = useState<Measurement[]>([]);
  const [selectedGarmentType, setSelectedGarmentType] = useState<GarmentType | undefined>();
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<Date | undefined>();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && initialData ? {
      customerId: initialData.customerId,
      measurementId: initialData.measurementId || undefined,
      garmentType: initialData.garmentType,
      orderType: initialData.orderType,
      serviceDescription: initialData.serviceDescription,
      specialInstructions: initialData.specialInstructions || '',
      deliveryDate: initialData.deliveryDate,
      priority: initialData.priority,
      totalAmount: initialData.totalAmount || undefined,
      depositAmount: initialData.depositAmount || undefined,
      isUrgent: initialData.isUrgent,
      pieces: initialData.pieces,
      originalMeasurements: initialData.originalMeasurements,
      modifiedMeasurements: initialData.modifiedMeasurements,
      alterationNotes: initialData.alterationNotes || '',
    } : {
      customerId: '',
      measurementId: undefined,
      garmentType: undefined,
      orderType: undefined,
      serviceDescription: '',
      specialInstructions: '',
      deliveryDate: undefined,
      priority: OrderPriority.NORMAL,
      totalAmount: undefined,
      depositAmount: undefined,
      isUrgent: false,
      pieces: undefined,
      originalMeasurements: undefined,
      modifiedMeasurements: undefined,
      alterationNotes: '',
    },
  });

  // Fetch customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetchCustomers({ limit: 100, sortBy: 'lastName', sortOrder: 'asc' });
        setCustomers(response.customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    loadCustomers();
  }, []);

  // Fetch measurements when customer is selected
  useEffect(() => {
    const loadMeasurements = async () => {
      if (!selectedCustomerId) {
        setAvailableMeasurements([]);
        return;
      }

      try {
        const measurements = await fetchLatestMeasurements(selectedCustomerId);
        setAvailableMeasurements(measurements);
      } catch (error) {
        console.error('Error fetching measurements:', error);
        setAvailableMeasurements([]);
      }
    };
    loadMeasurements();
  }, [selectedCustomerId]);

  // Update estimated delivery when order type or urgent status changes
  useEffect(() => {
    const orderType = form.watch('orderType');
    const isUrgent = form.watch('isUrgent');

    if (orderType) {
      const leadTime = LEAD_TIME_BY_ORDER_TYPE[orderType] || 7;
      const urgentLeadTime = isUrgent ? 2 : leadTime;
      const estimated = calculateEstimatedDelivery(new Date(), urgentLeadTime);
      setEstimatedDeliveryDate(estimated);

      // Auto-set delivery date if not already set
      if (!form.getValues('deliveryDate')) {
        form.setValue('deliveryDate', estimated);
      }
    }
  }, [form.watch('orderType'), form.watch('isUrgent')]);

  const handleSubmit = async (data: CreateOrderInput | UpdateOrderInput) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const filteredMeasurements = availableMeasurements.filter(
    m => !selectedGarmentType || m.garmentType === selectedGarmentType
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {submitError && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {submitError}
          </div>
        )}

        {/* Customer Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Selection</h3>
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCustomerId(value);
                  }}
                  defaultValue={field.value}
                  disabled={mode === 'edit'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} ({customer.customerNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Garment & Service */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Garment & Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="garmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garment Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedGarmentType(value as GarmentType);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select garment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(GarmentType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getGarmentTypeLabel(type)}
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
              name="orderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(OrderType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="serviceDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the service required (e.g., Custom tailored shirt, Suit alteration, etc.)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requirements or notes"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Measurement Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Measurement Selection</h3>
          <FormField
            control={form.control}
            name="measurementId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === 'none') {
                      field.onChange(undefined);
                    } else {
                      field.onChange(value);
                    }
                  }}
                  defaultValue={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select measurement or leave empty to create without" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No measurement</SelectItem>
                    {filteredMeasurements.map((measurement) => (
                      <SelectItem key={measurement.id} value={measurement.id}>
                        {getGarmentTypeLabel(measurement.garmentType)} - Version {measurement.version}
                        {measurement.isLatest && ' (Latest)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Delivery & Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery & Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  {estimatedDeliveryDate && (
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Estimated delivery: {estimatedDeliveryDate.toLocaleDateString()}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Urgent Order</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark as urgent for faster processing
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depositAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Balance Amount ($)</FormLabel>
              <div className="p-2 bg-muted rounded-md">
                {(() => {
                  const total = form.watch('totalAmount') || 0;
                  const deposit = form.watch('depositAmount') || 0;
                  const balance = total - deposit;
                  return balance >= 0 ? balance.toFixed(2) : '0.00';
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Attachments */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Photo Attachments</h3>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4" />
                Design References & Photos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload design references, fabric samples, or any visual materials for this order
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Design Reference Upload */}
                <div className="space-y-2">
                  <FormLabel>Design References</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload design references or inspiration images
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Customer Photos Upload */}
                <div className="space-y-2">
                  <FormLabel>Customer Photos (Optional)</FormLabel>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload customer photos or existing garment images
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Images Display */}
                <div className="space-y-2">
                  <FormLabel>Uploaded Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Placeholder for uploaded images */}
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">No images</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Order' : 'Update Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
