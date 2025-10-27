'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, X } from 'lucide-react';
import { TaskStatus, TaskPriority, TaskStage } from '../../types';

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: TaskStage | null;
  onStageFilterChange: (stage: TaskStage | null) => void;
  statusFilter: TaskStatus | null;
  onStatusFilterChange: (status: TaskStatus | null) => void;
  priorityFilter: TaskPriority | null;
  onPriorityFilterChange: (priority: TaskPriority | null) => void;
  overdueFilter: boolean;
  onOverdueFilterChange: (overdue: boolean) => void;
  onReset: () => void;
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  overdueFilter,
  onOverdueFilterChange,
  onReset,
}: TaskFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchQuery);
  };

  const handleSearchReset = () => {
    setLocalSearchQuery('');
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search tasks..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            {localSearchQuery && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSearchReset}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>

        {/* Stage Filter */}
        <div className="space-y-2">
          <Label>Stage</Label>
          <Select
            value={stageFilter || ''}
            onValueChange={(value) => onStageFilterChange(value as TaskStage || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All stages</SelectItem>
              {Object.values(TaskStage).map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={statusFilter || ''}
            onValueChange={(value) => onStatusFilterChange(value as TaskStatus || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {Object.values(TaskStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priorityFilter || ''}
            onValueChange={(value) => onPriorityFilterChange(value as TaskPriority || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              {Object.values(TaskPriority).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overdue Filter */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="overdue"
          checked={overdueFilter}
          onChange={(e) => onOverdueFilterChange(e.target.checked)}
          className="h-4 w-4 rounded border border-primary"
        />
        <Label htmlFor="overdue">Show overdue tasks only</Label>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
