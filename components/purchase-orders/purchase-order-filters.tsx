'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X, Calendar } from 'lucide-react';
import { PurchaseOrderStatus } from 'types';

interface PurchaseOrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  supplierId: string;
  onSupplierIdChange: (supplierId: string) => void;
  statusFilter: PurchaseOrderStatus | '';
  onStatusFilterChange: (status: PurchaseOrderStatus | '') => void;
  dateFrom: string;
  onDateFromChange: (dateFrom: string) => void;
  dateTo: string;
  onDateToChange: (dateTo: string) => void;
  onReset: () => void;
}

export function PurchaseOrderFilters({
  searchQuery,
  onSearchChange,
  supplierId,
  onSupplierIdChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}: PurchaseOrderFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    supplierId ||
    statusFilter ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by order number, supplier, or notes"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Supplier Filter */}
        <div className="relative">
          <Input
            placeholder="Supplier ID"
            value={supplierId}
            onChange={(e) => onSupplierIdChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as PurchaseOrderStatus | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value={PurchaseOrderStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={PurchaseOrderStatus.PENDING_APPROVAL}>Pending Approval</SelectItem>
            <SelectItem value={PurchaseOrderStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={PurchaseOrderStatus.ORDERED}>Ordered</SelectItem>
            <SelectItem value={PurchaseOrderStatus.PARTIALLY_RECEIVED}>Partially Received</SelectItem>
            <SelectItem value={PurchaseOrderStatus.RECEIVED}>Received</SelectItem>
            <SelectItem value={PurchaseOrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

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
