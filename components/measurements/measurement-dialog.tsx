'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { MeasurementForm } from 'components/measurements/measurement-form';
import { Measurement } from 'types';
import { CreateMeasurementInput, UpdateMeasurementInput } from 'lib/validations/measurement';
import { createMeasurement, updateMeasurement } from 'lib/api/measurements';
import { useToast } from 'hooks/use-toast';

interface MeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  customerId: string;
  measurement?: Measurement;
  onSuccess: () => void;
}

export function MeasurementDialog({
  open,
  onOpenChange,
  mode,
  customerId,
  measurement,
  onSuccess,
}: MeasurementDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: CreateMeasurementInput | UpdateMeasurementInput) => {
    setIsLoading(true);
    try {
      if (mode === 'create') {
        await createMeasurement(customerId, data as CreateMeasurementInput);
        toast({
          title: 'Success',
          description: 'Measurement created successfully.',
        });
      } else if (mode === 'edit' && measurement) {
        await updateMeasurement(customerId, measurement.id, data as UpdateMeasurementInput);
        toast({
          title: 'Success',
          description: 'Measurement updated successfully.',
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Measurement' : 'Edit Measurement'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Select garment type and enter measurements for the customer.'
              : 'Update the measurement details.'}
          </DialogDescription>
        </DialogHeader>
        <MeasurementForm
          mode={mode}
          customerId={customerId}
          initialData={measurement}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
