'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommissionRuleSchema, type CreateCommissionRuleInput } from '../../lib/validations/salary';
import { OrderType, CalculationType } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface CommissionRuleFormProps {
  onSubmit: (data: CreateCommissionRuleInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateCommissionRuleInput>;
}

export function CommissionRuleForm({ onSubmit, onCancel, initialData }: CommissionRuleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCommissionRuleInput>({
    resolver: zodResolver(createCommissionRuleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      orderType: initialData?.orderType || OrderType.BESPOKE_SUIT,
      calculationType: initialData?.calculationType || CalculationType.PERCENTAGE,
      basePercentage: initialData?.basePercentage || undefined,
      fixedAmount: initialData?.fixedAmount || undefined,
      complexityMultiplierMin: initialData?.complexityMultiplierMin || 1.0,
      complexityMultiplierMax: initialData?.complexityMultiplierMax || 3.0,
      timeBonusEarly: initialData?.timeBonusEarly || 0.1,
      timePenaltyDelay: initialData?.timePenaltyDelay || 0.05,
      qualityBonus: initialData?.qualityBonus || 0.05,
      conditions: initialData?.conditions || undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  const calculationType = watch('calculationType');

  const handleFormSubmit = async (data: CreateCommissionRuleInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Commission Rule' : 'Create Commission Rule'}</CardTitle>
        <CardDescription>
          Configure commission calculation rules for different order types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Bespoke Suit Standard"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select
                value={watch('orderType')}
                onValueChange={(value) => setValue('orderType', value as OrderType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.orderType && <p className="text-sm text-red-500">{errors.orderType.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description of the rule"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="calculationType">Calculation Type</Label>
            <Select
              value={calculationType}
              onValueChange={(value) => setValue('calculationType', value as CalculationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calculation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CalculationType.PERCENTAGE}>Percentage of Order</SelectItem>
                <SelectItem value={CalculationType.FIXED}>Fixed Amount</SelectItem>
                <SelectItem value={CalculationType.TIERED}>Tiered Rates</SelectItem>
                <SelectItem value={CalculationType.HYBRID}>Hybrid (Percentage + Fixed)</SelectItem>
              </SelectContent>
            </Select>
            {errors.calculationType && <p className="text-sm text-red-500">{errors.calculationType.message}</p>}
          </div>

          {calculationType === CalculationType.PERCENTAGE && (
            <div className="space-y-2">
              <Label htmlFor="basePercentage">Base Percentage (%)</Label>
              <Input
                id="basePercentage"
                type="number"
                step="0.01"
                {...register('basePercentage', { valueAsNumber: true })}
                placeholder="e.g., 10.5"
              />
              {errors.basePercentage && <p className="text-sm text-red-500">{errors.basePercentage.message}</p>}
            </div>
          )}

          {calculationType === CalculationType.FIXED && (
            <div className="space-y-2">
              <Label htmlFor="fixedAmount">Fixed Amount (AED)</Label>
              <Input
                id="fixedAmount"
                type="number"
                step="0.01"
                {...register('fixedAmount', { valueAsNumber: true })}
                placeholder="e.g., 50.00"
              />
              {errors.fixedAmount && <p className="text-sm text-red-500">{errors.fixedAmount.message}</p>}
            </div>
          )}

          {calculationType === CalculationType.HYBRID && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePercentage">Base Percentage (%)</Label>
                <Input
                  id="basePercentage"
                  type="number"
                  step="0.01"
                  {...register('basePercentage', { valueAsNumber: true })}
                  placeholder="e.g., 8.0"
                />
                {errors.basePercentage && <p className="text-sm text-red-500">{errors.basePercentage.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fixedAmount">Fixed Amount (AED)</Label>
                <Input
                  id="fixedAmount"
                  type="number"
                  step="0.01"
                  {...register('fixedAmount', { valueAsNumber: true })}
                  placeholder="e.g., 25.00"
                />
                {errors.fixedAmount && <p className="text-sm text-red-500">{errors.fixedAmount.message}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complexityMultiplierMin">Min Complexity Multiplier</Label>
              <Input
                id="complexityMultiplierMin"
                type="number"
                step="0.1"
                {...register('complexityMultiplierMin', { valueAsNumber: true })}
                placeholder="1.0"
              />
              {errors.complexityMultiplierMin && <p className="text-sm text-red-500">{errors.complexityMultiplierMin.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexityMultiplierMax">Max Complexity Multiplier</Label>
              <Input
                id="complexityMultiplierMax"
                type="number"
                step="0.1"
                {...register('complexityMultiplierMax', { valueAsNumber: true })}
                placeholder="3.0"
              />
              {errors.complexityMultiplierMax && <p className="text-sm text-red-500">{errors.complexityMultiplierMax.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityBonus">Quality Bonus</Label>
              <Input
                id="qualityBonus"
                type="number"
                step="0.01"
                {...register('qualityBonus', { valueAsNumber: true })}
                placeholder="0.05"
              />
              {errors.qualityBonus && <p className="text-sm text-red-500">{errors.qualityBonus.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeBonusEarly">Early Completion Bonus</Label>
              <Input
                id="timeBonusEarly"
                type="number"
                step="0.01"
                {...register('timeBonusEarly', { valueAsNumber: true })}
                placeholder="0.1"
              />
              {errors.timeBonusEarly && <p className="text-sm text-red-500">{errors.timeBonusEarly.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePenaltyDelay">Delay Penalty</Label>
              <Input
                id="timePenaltyDelay"
                type="number"
                step="0.01"
                {...register('timePenaltyDelay', { valueAsNumber: true })}
                placeholder="0.05"
              />
              {errors.timePenaltyDelay && <p className="text-sm text-red-500">{errors.timePenaltyDelay.message}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
