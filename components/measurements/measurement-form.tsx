'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/ui/form';
import { Input } from 'components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Textarea } from 'components/ui/textarea';
import { Button } from 'components/ui/button';
import { Label } from 'components/ui/label';
import { createMeasurementSchema, updateMeasurementSchema, CreateMeasurementInput, UpdateMeasurementInput } from 'lib/validations/measurement';
import { GarmentType, MeasurementUnit, Measurement } from 'types';
import { getMeasurementTemplate } from 'lib/constants/measurement-templates';

interface MeasurementFormProps {
  mode: 'create' | 'edit';
  customerId: string;
  initialData?: Measurement;
  onSubmit: (data: CreateMeasurementInput | UpdateMeasurementInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function MeasurementForm({
  mode,
  customerId,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: MeasurementFormProps) {
  const [selectedGarmentType, setSelectedGarmentType] = useState<GarmentType | undefined>(
    initialData?.garmentType
  );
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>(
    initialData?.unit || MeasurementUnit.CM
  );
  const [template, setTemplate] = useState<any>(null);

  const schema = mode === 'create' ? createMeasurementSchema : updateMeasurementSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      garmentType: initialData?.garmentType || undefined,
      unit: initialData?.unit || MeasurementUnit.CM,
      measurements: initialData?.measurements || {},
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (selectedGarmentType) {
      const template = getMeasurementTemplate(selectedGarmentType);
      setTemplate(template);
    }
  }, [selectedGarmentType]);

  const handleSubmit = async (data: any) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  disabled={mode === 'edit'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select garment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={GarmentType.SHIRT}>Shirt</SelectItem>
                    <SelectItem value={GarmentType.SUIT}>Suit</SelectItem>
                    <SelectItem value={GarmentType.DRESS}>Dress</SelectItem>
                    <SelectItem value={GarmentType.TROUSER}>Trouser</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedUnit(value as MeasurementUnit);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={MeasurementUnit.CM}>Centimeters (cm)</SelectItem>
                    <SelectItem value={MeasurementUnit.INCH}>Inches</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {template && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Measurements ({template.description})
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.fields.map((field: any) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={`measurements.${field.name}`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.label} {field.required && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={field.step || 0.1}
                          min={field.min}
                          max={field.max}
                          placeholder={field.placeholder}
                          {...formField}
                          onChange={(e) => formField.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes or special instructions"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Measurement' : 'Update Measurement'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
