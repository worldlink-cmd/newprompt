'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, Users } from 'lucide-react';
import { SupplierTable } from '../../../components/suppliers/supplier-table';
import { SupplierFilters } from '../../../components/suppliers/supplier-filters';
import { SupplierDialog } from '../../../components/suppliers/supplier-dialog';
import { SupplierListSkeleton } from '../../../components/suppliers/supplier-list-skeleton';
import { Supplier, SupplierStatus } from 'types';
import { CreateSupplierInput, UpdateSupplierInput } from 'lib/validations/supplier';

export default function SuppliersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as SupplierStatus) || '',
    isActive: searchParams.get('isActive') === 'false' ? false : searchParams.get('isActive') === 'true' ? true : '',
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
    selectedSupplier: null as Supplier | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    supplier: null as Supplier | null,
  });

  // Fetch suppliers function
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: filters.search,
        status: filters.status,
        isActive: filters.isActive.toString(),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/suppliers?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      setSuppliers(data.suppliers);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchSuppliers();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.isActive !== '') params.set('isActive', filters.isActive.toString());
    if (sorting.sortBy !== 'createdAt') params.set('sortBy', sorting.sortBy);
    if (sorting.sortOrder !== 'desc') params.set('sortOrder', sorting.sortOrder);

    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }, [filters, sorting]);

  // Handler functions
  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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
      selectedSupplier: null,
    });
  };

  const handleEdit = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedSupplier: supplier,
      });
    }
  };

  const handleDelete = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setDeleteDialog({
        open: true,
        supplier,
      });
    }
  };

  const handleView = (supplierId: string) => {
    router.push(`/dashboard/suppliers/${supplierId}`);
  };

  const handleDialogSuccess = () => {
    fetchSuppliers();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.supplier) return;

    try {
      const response = await fetch(`/api/suppliers/${deleteDialog.supplier.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      setDeleteDialog({ open: false, supplier: null });
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      isActive: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <SupplierListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Suppliers</h1>
              <p className="text-muted-foreground">
                Manage your supplier database and track supplier information
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <SupplierFilters
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => handleFilterChange('status', status)}
            activeFilter={filters.isActive}
            onActiveFilterChange={(active) => handleFilterChange('isActive', active)}
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
              <Button onClick={fetchSuppliers} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <SupplierTable
              suppliers={suppliers}
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
            {pagination.total} suppliers
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

      {/* Supplier Dialog */}
      <SupplierDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        supplier={dialogState.selectedSupplier || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.supplier?.name}?
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
