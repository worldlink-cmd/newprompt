'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X } from 'lucide-react';
import { Gender, PreferredContactMethod } from 'types';

interface CustomerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  genderFilter: Gender | '';
  onGenderFilterChange: (gender: Gender | '') => void;
  contactMethodFilter: PreferredContactMethod | '';
  onContactMethodFilterChange: (method: PreferredContactMethod | '') => void;
  statusFilter: boolean | '';
  onStatusFilterChange: (status: boolean | '') => void;
  onReset: () => void;
}

export function CustomerFilters({
  searchQuery,
  onSearchChange,
  genderFilter,
  onGenderFilterChange,
  contactMethodFilter,
  onContactMethodFilterChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
}: CustomerFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    genderFilter ||
    contactMethodFilter ||
    statusFilter !== '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or customer number"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Gender Filter */}
        <Select value={genderFilter} onValueChange={(value) => onGenderFilterChange(value as Gender | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Genders</SelectItem>
            <SelectItem value={Gender.MALE}>Male</SelectItem>
            <SelectItem value={Gender.FEMALE}>Female</SelectItem>
            <SelectItem value={Gender.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Contact Method Filter */}
        <Select value={contactMethodFilter} onValueChange={(value) => onContactMethodFilterChange(value as PreferredContactMethod | '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Contact Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Contact Methods</SelectItem>
            <SelectItem value={PreferredContactMethod.EMAIL}>Email</SelectItem>
            <SelectItem value={PreferredContactMethod.PHONE}>Phone</SelectItem>
            <SelectItem value={PreferredContactMethod.WHATSAPP}>WhatsApp</SelectItem>
            <SelectItem value={PreferredContactMethod.SMS}>SMS</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter.toString()} onValueChange={(value) => onStatusFilterChange(value === 'true' ? true : value === 'false' ? false : '')}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
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
