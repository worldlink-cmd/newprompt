'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X } from 'lucide-react';
import { SupplierStatus } from 'types';

interface SupplierFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: SupplierStatus | '';
  onStatusFilterChange: (status: SupplierStatus | '') => void;
  activeFilter: boolean | '';
  onActiveFilterChange: (active: boolean | '') => void;
  onReset: () => void;
}

export function SupplierFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  onReset,
}: SupplierFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    statusFilter ||
    activeFilter !== '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or supplier number"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as SupplierStatus | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value={SupplierStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={SupplierStatus.INACTIVE}>Inactive</SelectItem>
            <SelectItem value={SupplierStatus.SUSPENDED}>Suspended</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filter */}
        <Select value={activeFilter.toString()} onValueChange={(value) => onActiveFilterChange(value === 'true' ? true : value === 'false' ? false : '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Suppliers</SelectItem>
            <SelectItem value="true">Active Only</SelectItem>
            <SelectItem value="false">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
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
