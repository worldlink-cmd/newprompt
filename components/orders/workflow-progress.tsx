'use client';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { OrderStatus } from '../../types';
import { getOrderStatusLabel, getOrderStatusColor } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface WorkflowProgressProps {
  currentStatus: OrderStatus;
  history?: Array<{
    status: OrderStatus;
    timestamp: Date;
    user: {
      name: string | null;
      email: string;
    };
  }>;
  className?: string;
}

const workflowStages: OrderStatus[] = [
  OrderStatus.RECEIVED,
  OrderStatus.CUTTING,
  OrderStatus.STITCHING,
  OrderStatus.QUALITY_CHECK,
  OrderStatus.PRESSING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
];

export function WorkflowProgress({ currentStatus, history = [], className }: WorkflowProgressProps) {
  const currentStageIndex = workflowStages.indexOf(currentStatus);
  const completedStages = workflowStages.slice(0, currentStageIndex);
  const currentStage = workflowStages[currentStageIndex];
  const remainingStages = workflowStages.slice(currentStageIndex + 1);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Workflow Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress: {completedStages.length} of {workflowStages.length - 1} stages completed</span>
            <Badge className={getOrderStatusColor(currentStatus)}>
              {getOrderStatusLabel(currentStatus)}
            </Badge>
          </div>

          {/* Workflow Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStageIndex / (workflowStages.length - 2)) * 100}%` }}
              />
            </div>

            {/* Stage Indicators */}
            <div className="relative flex justify-between">
              {workflowStages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isUpcoming = index > currentStageIndex;
                const isFinal = stage === OrderStatus.DELIVERED;

                return (
                  <div key={stage} className="flex flex-col items-center space-y-2">
                    {/* Stage Circle */}
                    <div className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && 'bg-background border-primary text-primary animate-pulse',
                      isUpcoming && 'bg-background border-muted text-muted-foreground',
                      isFinal && 'bg-emerald-100 border-emerald-500 text-emerald-700'
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : isCurrent ? (
                        <Circle className="h-6 w-6 fill-current" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </div>

                    {/* Stage Label */}
                    <div className="text-center">
                      <div className={cn(
                        'text-xs font-medium',
                        isCompleted && 'text-primary',
                        isCurrent && 'text-primary font-semibold',
                        isUpcoming && 'text-muted-foreground'
                      )}>
                        {getOrderStatusLabel(stage)}
                      </div>

                      {/* Stage History */}
                      {history.find(h => h.status === stage) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(history.find(h => h.status === stage)!.timestamp).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Stage Info */}
          {currentStage && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Current Stage</div>
                  <div className="text-sm text-muted-foreground">
                    {getOrderStatusLabel(currentStatus)}
                  </div>
                </div>
                <Badge className={getOrderStatusColor(currentStatus)}>
                  Active
                </Badge>
              </div>
            </div>
          )}

          {/* Next Stage Info */}
          {remainingStages.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">Next Stage</div>
                  <div className="text-sm text-blue-700">
                    {getOrderStatusLabel(remainingStages[0])}
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Upcoming
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
