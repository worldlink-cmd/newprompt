'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { ScheduleTemplate, ShiftType } from '../../types';
import { useToast } from '../../hooks/use-toast';

const scheduleTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  shiftType: z.nativeEnum(ShiftType),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakDuration: z.coerce.number().min(0, 'Break duration must be positive'),
  isActive: z.boolean(),
});

type ScheduleTemplateFormData = z.infer<typeof scheduleTemplateSchema>;

interface ScheduleTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  template?: ScheduleTemplate;
  onSuccess: () => void;
}

export function ScheduleTemplateDialog({
  open,
  onOpenChange,
  mode,
  template,
  onSuccess,
}: ScheduleTemplateDialogProps) {
  const { toast } = useToast();
  const isEdit = mode === 'edit';

  const form = useForm<ScheduleTemplateFormData>({
    resolver: zodResolver(scheduleTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      shiftType: ShiftType.MORNING,
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      isActive: true,
    },
  });

  useEffect(() => {
    if (template && isEdit) {
      form.reset({
        name: template.name,
        description: template.description || '',
        shiftType: template.shiftType,
        startTime: new Date(template.startTime).toTimeString().slice(0, 5),
        endTime: new Date(template.endTime).toTimeString().slice(0, 5),
        breakDuration: template.breakDuration,
        isActive: template.isActive,
      });
    } else if (!isEdit) {
      form.reset({
        name: '',
        description: '',
        shiftType: ShiftType.MORNING,
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 60,
        isActive: true,
      });
    }
  }, [template, isEdit, form]);

  const onSubmit = async (data: ScheduleTemplateFormData) => {
    try {
      // Convert time strings to Date objects
      const startDateTime = new Date();
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date();
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const payload = {
        ...data,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      const url = isEdit ? `/api/schedules/templates/${template?.id}` : '/api/schedules/templates';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save template');
      }

      toast({
        title: 'Success',
        description: `Schedule template ${isEdit ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  const getShiftTypeOptions = () => {
    return Object.values(ShiftType).map((type) => (
      <SelectItem key={type} value={type}>
        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
      </SelectItem>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Schedule Template' : 'Create Schedule Template'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Shift" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of this shift template"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shiftType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getShiftTypeOptions()}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="breakDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this template for use in scheduling
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
