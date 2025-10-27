'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from 'components/ui/dialog';
import { ScrollArea } from 'components/ui/scroll-area';
import { Button } from 'components/ui/button';
import { MeasurementCard } from 'components/measurements/measurement-card';
import { Measurement, GarmentType } from 'types';
import { fetchCustomerMeasurements } from 'lib/api/measurements';

interface MeasurementHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  garmentType: GarmentType;
  currentMeasurementId?: string;
}

export function MeasurementHistoryDialog({
  open,
  onOpenChange,
  customerId,
  garmentType,
  currentMeasurementId,
}: MeasurementHistoryDialogProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && customerId && garmentType) {
      fetchHistory();
    }
  }, [open, customerId, garmentType]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerMeasurements(customerId, {
        garmentType,
        // Omit isLatest parameter to get all versions (API defaults to true when omitted)
      });
      // Sort by version descending (newest first)
      const sorted = data.sort((a, b) => b.version - a.version);
      setMeasurements(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch measurement history');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Measurement History - {garmentType}
          </DialogTitle>
          <DialogDescription>
            View all measurement versions for this garment type.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{error}</div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No measurement history found.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement) => (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  onEdit={() => {}} // Read-only
                  onDelete={() => {}} // Read-only
                  onViewHistory={() => {}} // Read-only
                  showActions={false}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
