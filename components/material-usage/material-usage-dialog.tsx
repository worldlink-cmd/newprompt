'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { MaterialUsageForm } from './material-usage-form';
import { MaterialUsage } from 'types';
import { CreateMaterialUsageInput, UpdateMaterialUsageInput } from 'lib/validations/material-usage';

interface MaterialUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  materialUsage?: MaterialUsage;
  onSuccess: () => void;
}

export function MaterialUsageDialog({
  open,
  onOpenChange,
  mode,
  materialUsage,
  onSuccess,
}: MaterialUsageDialogProps) {
  const handleSubmit = async (data: CreateMaterialUsageInput | UpdateMaterialUsageInput) => {
    try {
      const url = mode === 'create'
        ? '/api/material-usage'
        : `/api/material-usage/${materialUsage?.id}`;

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
        throw new Error(error.error || 'Failed to save material usage');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving material usage:', error);
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
            {mode === 'create' ? 'Add Material Usage' : 'Edit Material Usage'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Record materials used for an order.'
              : 'Update the material usage information.'
            }
          </DialogDescription>
        </DialogHeader>

        <MaterialUsageForm
          mode={mode}
          initialData={materialUsage}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
