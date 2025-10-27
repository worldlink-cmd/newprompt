'use client';

import { Card, CardHeader, CardContent } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { Separator } from 'components/ui/separator';
import { Measurement, GarmentType, MeasurementUnit } from 'types';
import { formatMeasurement, getGarmentTypeLabel, getMeasurementVersionLabel, formatMeasurementDate } from 'lib/utils';
import { Edit, Trash2, History } from 'lucide-react';

interface MeasurementCardProps {
  measurement: Measurement;
  onEdit: (measurement: Measurement) => void;
  onDelete: (measurement: Measurement) => void;
  onViewHistory: (garmentType: GarmentType) => void;
  showActions?: boolean;
}

export function MeasurementCard({
  measurement,
  onEdit,
  onDelete,
  onViewHistory,
  showActions = true,
}: MeasurementCardProps) {
  const isLatest = measurement.isLatest;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={isLatest ? 'default' : 'secondary'}>
              {getGarmentTypeLabel(measurement.garmentType)}
            </Badge>
            <Badge variant={isLatest ? 'default' : 'outline'}>
              {getMeasurementVersionLabel(measurement.version, isLatest)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatMeasurementDate(new Date(measurement.createdAt))}
          </div>
        </div>
        {measurement.createdByUser && (
          <div className="text-sm text-muted-foreground">
            Created by {measurement.createdByUser.name || measurement.createdByUser.email}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(measurement.measurements).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span>{formatMeasurement(value, measurement.unit)}</span>
            </div>
          ))}
        </div>

        {measurement.notes && (
          <>
            <Separator />
            <div className="text-sm">
              <span className="font-medium">Notes:</span> {measurement.notes}
            </div>
          </>
        )}

        {showActions && (
          <>
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(measurement)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewHistory(measurement.garmentType)}
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(measurement)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
