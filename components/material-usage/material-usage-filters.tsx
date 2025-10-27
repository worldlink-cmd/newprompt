'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X, Calendar } from 'lucide-react';

interface MaterialUsageFiltersProps {
  orderId: string;
  onOrderIdChange: (orderId: string) => void;
  inventoryItemId: string;
  onInventoryItemIdChange: (inventoryItemId: string) => void;
  dateFrom: string;
  onDateFromChange: (dateFrom: string) => void;
  dateTo: string;
  onDateToChange: (dateTo: string) => void;
  onReset: () => void;
}

export function MaterialUsageFilters({
  orderId,
  onOrderIdChange,
  inventoryItemId,
  onInventoryItemIdChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}: MaterialUsageFiltersProps) {
  const hasActiveFilters =
    orderId ||
    inventoryItemId ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Order ID Filter */}
        <div className="relative">
          <Input
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => onOrderIdChange(e.target.value)}
          />
        </div>

        {/* Inventory Item ID Filter */}
        <div className="relative">
          <Input
            placeholder="Inventory Item ID"
            value={inventoryItemId}
            onChange={(e) => onInventoryItemIdChange(e.target.value)}
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="date"
            placeholder="Date from"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="date"
            placeholder="Date to"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <Button variant="outline" onClick={onReset} className="w-full">
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
