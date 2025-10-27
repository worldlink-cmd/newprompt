'use client';

import { MeasurementCard } from 'components/measurements/measurement-card';
import { Button } from 'components/ui/button';
import { Measurement, GarmentType } from 'types';
import { getGarmentTypeLabel } from 'lib/utils';
import { Plus } from 'lucide-react';

interface MeasurementsListProps {
  measurements: Measurement[];
  onAdd: () => void;
  onEdit: (measurement: Measurement) => void;
  onDelete: (measurement: Measurement) => void;
  onViewHistory: (garmentType: GarmentType) => void;
  loading: boolean;
}

export function MeasurementsList({
  measurements,
  onAdd,
  onEdit,
  onDelete,
  onViewHistory,
  loading,
}: MeasurementsListProps) {
  // Group measurements by garment type
  const groupedMeasurements = measurements.reduce((acc, measurement) => {
    const type = measurement.garmentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(measurement);
    return acc;
  }, {} as Record<GarmentType, Measurement[]>);

  // Get the latest measurement for each garment type
  const latestMeasurements = Object.values(groupedMeasurements).map((group) =>
    group.find((m) => m.isLatest) || group[0]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Measurements</h2>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Measurement
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Measurements</h2>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Measurement
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No measurements recorded yet.</p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Measurement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Measurements</h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Measurement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestMeasurements.map((measurement) => (
          <div key={`${measurement.garmentType}-${measurement.id}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {getGarmentTypeLabel(measurement.garmentType)}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewHistory(measurement.garmentType)}
              >
                View History
              </Button>
            </div>
            <MeasurementCard
              measurement={measurement}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewHistory={onViewHistory}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
