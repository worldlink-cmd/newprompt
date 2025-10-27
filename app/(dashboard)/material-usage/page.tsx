'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, Package } from 'lucide-react';
import { MaterialUsageTable } from '../../../components/material-usage/material-usage-table';
import { MaterialUsageFilters } from '../../../components/material-usage/material-usage-filters';
import { MaterialUsageDialog } from '../../../components/material-usage/material-usage-dialog';
import { MaterialUsageListSkeleton } from '../../../components/material-usage/material-usage-list-skeleton';
import { MaterialUsage } from 'types';
import { CreateMaterialUsageInput, UpdateMaterialUsageInput } from 'lib/validations/material-usage';

export default function MaterialUsagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [materialUsages, setMaterialUsages] = useState<MaterialUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    orderId: searchParams.get('orderId') || '',
    inventoryItemId: searchParams.get('inventoryItemId') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  // Dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    selectedMaterialUsage: null as MaterialUsage | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    materialUsage: null as MaterialUsage | null,
  });

  // Fetch material usages function
  const fetchMaterialUsages = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        orderId: filters.orderId,
        inventoryItemId: filters.inventoryItemId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/material-usage?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch material usage');
      }

      const data = await response.json();
      setMaterialUsages(data.materialUsages);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch material usages on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchMaterialUsages();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.orderId) params.set('orderId', filters.orderId);
    if (filters.inventoryItemId) params.set('inventoryItemId', filters.inventoryItemId);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (sorting.sortBy !== 'createdAt') params.set('sortBy', sorting.sortBy);
    if (sorting.sortOrder !== 'desc') params.set('sortOrder', sorting.sortOrder);

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }, [filters, sorting]);

  // Handler functions
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: string) => {
    setSorting(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleCreate = () => {
    setDialogState({
      open: true,
      mode: 'create',
      selectedMaterialUsage: null,
    });
  };

  const handleEdit = (materialUsageId: string) => {
    const materialUsage = materialUsages.find(mu => mu.id === materialUsageId);
    if (materialUsage) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedMaterialUsage: materialUsage,
      });
    }
  };

  const handleDelete = (materialUsageId: string) => {
    const materialUsage = materialUsages.find(mu => mu.id === materialUsageId);
    if (materialUsage) {
      setDeleteDialog({
        open: true,
        materialUsage,
      });
    }
  };

  const handleView = (materialUsageId: string) => {
    router.push(`/dashboard/material-usage/${materialUsageId}`);
  };

  const handleDialogSuccess = () => {
    fetchMaterialUsages();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.materialUsage) return;

    try {
      const response = await fetch(`/api/material-usage/${deleteDialog.materialUsage.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material usage');
      }

      setDeleteDialog({ open: false, materialUsage: null });
      fetchMaterialUsages();
    } catch (error) {
      console.error('Error deleting material usage:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      orderId: '',
      inventoryItemId: '',
      dateFrom: '',
      dateTo: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <MaterialUsageListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Material Usage</h1>
              <p className="text-muted-foreground">
                Track materials used in orders and calculate costs
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Material Usage
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <MaterialUsageFilters
            orderId={filters.orderId}
            onOrderIdChange={(orderId) => handleFilterChange('orderId', orderId)}
            inventoryItemId={filters.inventoryItemId}
            onInventoryItemIdChange={(inventoryItemId) => handleFilterChange('inventoryItemId', inventoryItemId)}
            dateFrom={filters.dateFrom}
            onDateFromChange={(dateFrom) => handleFilterChange('dateFrom', dateFrom)}
            dateTo={filters.dateTo}
            onDateToChange={(dateTo) => handleFilterChange('dateTo', dateTo)}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchMaterialUsages} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <MaterialUsageTable
              materialUsages={materialUsages}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              sortBy={sorting.sortBy}
              sortOrder={sorting.sortOrder}
              onSort={handleSort}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} material usages
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Material Usage Dialog */}
      <MaterialUsageDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        materialUsage={dialogState.selectedMaterialUsage || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material Usage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material usage record?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
