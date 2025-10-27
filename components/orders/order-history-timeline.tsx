'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Clock, User, MessageSquare } from 'lucide-react';
import { OrderStatus } from '../../types';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface OrderHistoryTimelineProps {
  history: Array<{
    id: string;
    status: OrderStatus;
    notes?: string | null;
    timestamp: Date;
    user: {
      name: string | null;
      email: string;
    };
  }>;
  className?: string;
}

export function OrderHistoryTimeline({ history, className }: OrderHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No status changes recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record, index) => (
            <div key={record.id} className="relative">
              {/* Timeline Line */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-muted" />
              )}

              <div className="flex gap-4">
                {/* Timeline Dot */}
                <div className={cn(
                  'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2',
                  'bg-background border-muted'
                )}>
                  <div className={cn(
                    'h-3 w-3 rounded-full',
                    getOrderStatusColor(record.status).includes('bg-') ?
                      getOrderStatusColor(record.status).replace('bg-', 'bg-').replace(' text-', ' text-').replace(' border-', ' border-') :
                      'bg-primary'
                  )} />
                </div>

                {/* History Content */}
                <div className="flex-1 space-y-2 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getOrderStatusColor(record.status)}>
                        {getOrderStatusLabel(record.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      {record.user.name || record.user.email}
                    </span>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 p-2 bg-muted rounded text-muted-foreground">
                        {record.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
