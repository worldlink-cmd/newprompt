'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { MapPin, Clock, Play, Square } from 'lucide-react';
import { ClockInOutData } from '../../types';

const clockInOutSchema = z.object({
  location: z.string().optional(),
  notes: z.string().optional(),
});

type ClockInOutFormData = z.infer<typeof clockInOutSchema>;

interface ClockInOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'clock_in' | 'clock_out';
  employeeId: string;
  onSuccess: () => void;
}

export function ClockInOutDialog({
  open,
  onOpenChange,
  mode,
  employeeId,
  onSuccess,
}: ClockInOutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  const form = useForm<ClockInOutFormData>({
    resolver: zodResolver(clockInOutSchema),
    defaultValues: {
      location: '',
      notes: '',
    },
  });

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          form.setValue('location', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a default location or leave empty
          setCurrentLocation('Location unavailable');
        }
      );
    }
  };

  useEffect(() => {
    if (open) {
      getCurrentLocation();
    }
  }, [open]);

  const onSubmit = async (data: ClockInOutFormData) => {
    setIsSubmitting(true);

    try {
      const payload: ClockInOutData = {
        employeeId,
        location: data.location || currentLocation,
        notes: data.notes,
      };

      const response = await fetch('/api/attendance/clock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process clock operation');
      }

      onSuccess();
    } catch (error) {
      console.error('Error with clock operation:', error);
      // You could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    getCurrentLocation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'clock_in' ? (
              <>
                <Play className="h-5 w-5 text-green-600" />
                Clock In
              </>
            ) : (
              <>
                <Square className="h-5 w-5 text-red-600" />
                Clock Out
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Time Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Location Field */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter location or use GPS"
                          {...field}
                          value={field.value || currentLocation}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGetLocation}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes Field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about your work today..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={mode === 'clock_in'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }
                >
                  {isSubmitting ? 'Processing...' : mode === 'clock_in' ? 'Clock In' : 'Clock Out'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
