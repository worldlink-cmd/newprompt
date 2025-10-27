'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X } from 'lucide-react';
import { OrderStatus, OrderPriority, GarmentType } from '../../types';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: OrderStatus | '';
  onStatusFilterChange: (status: OrderStatus | '') => void;
  garmentTypeFilter: GarmentType | '';
  onGarmentTypeFilterChange: (type: GarmentType | '') => void;
  priorityFilter: OrderPriority | '';
  onPriorityFilterChange: (priority: OrderPriority | '') => void;
  dateFromFilter: Date | undefined;
  onDateFromFilterChange: (date: Date | undefined) => void;
  dateToFilter: Date | undefined;
  onDateToFilterChange: (date: Date | undefined) => void;
  onReset: () => void;
}

export function OrderFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  garmentTypeFilter,
  onGarmentTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFromFilter,
  onDateFromFilterChange,
  dateToFilter,
  onDateToFilterChange,
  onReset,
}: OrderFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    statusFilter ||
    garmentTypeFilter ||
    priorityFilter ||
    dateFromFilter ||
    dateToFilter;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by order number, customer name, or service description"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as OrderStatus | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={OrderStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Garment Type Filter */}
        <Select value={garmentTypeFilter} onValueChange={(value) => onGarmentTypeFilterChange(value as GarmentType | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Garment Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Garment Types</SelectItem>
            <SelectItem value={GarmentType.SHIRT}>Shirt</SelectItem>
            <SelectItem value={GarmentType.SUIT}>Suit</SelectItem>
            <SelectItem value={GarmentType.DRESS}>Dress</SelectItem>
            <SelectItem value={GarmentType.TROUSER}>Trouser</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={(value) => onPriorityFilterChange(value as OrderPriority | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value={OrderPriority.LOW}>Low</SelectItem>
            <SelectItem value={OrderPriority.NORMAL}>Normal</SelectItem>
            <SelectItem value={OrderPriority.HIGH}>High</SelectItem>
            <SelectItem value={OrderPriority.URGENT}>Urgent</SelectItem>
          </SelectContent>
        </Select>

        {/* Date From Filter */}
        <Input
          type="date"
          placeholder="Order date from"
          value={dateFromFilter ? dateFromFilter.toISOString().split('T')[0] : ''}
          onChange={(e) => onDateFromFilterChange(e.target.value ? new Date(e.target.value) : undefined)}
        />

        {/* Date To Filter */}
        <Input
          type="date"
          placeholder="Order date to"
          value={dateToFilter ? dateToFilter.toISOString().split('T')[0] : ''}
          onChange={(e) => onDateToFilterChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onReset} className="text-sm">
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
