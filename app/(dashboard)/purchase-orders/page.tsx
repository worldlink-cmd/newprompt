'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, ShoppingCart } from 'lucide-react';
import { PurchaseOrderTable } from '../../../components/purchase-orders/purchase-order-table';
import { PurchaseOrderFilters } from '../../../components/purchase-orders/purchase-order-filters';
import { PurchaseOrderDialog } from '../../../components/purchase-orders/purchase-order-dialog';
import { PurchaseOrderListSkeleton } from '../../../components/purchase-orders/purchase-order-list-skeleton';
import { PurchaseOrder, PurchaseOrderStatus } from 'types';
import { CreatePurchaseOrderInput, UpdatePurchaseOrderInput } from 'lib/validations/purchase-order';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
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
    supplierId: searchParams.get('supplierId') || '',
    status: (searchParams.get('status') as PurchaseOrderStatus) || '',
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
    selectedPurchaseOrder: null as PurchaseOrder | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    purchaseOrder: null as PurchaseOrder | null,
  });

  // Fetch purchase orders function
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: filters.search,
        supplierId: filters.supplierId,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/purchase-orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch purchase orders');
      }

      const data = await response.json();
      setPurchaseOrders(data.purchaseOrders);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchase orders on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.supplierId) params.set('supplierId', filters.supplierId);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
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
      selectedPurchaseOrder: null,
    });
  };

  const handleEdit = (purchaseOrderId: string) => {
    const purchaseOrder = purchaseOrders.find(po => po.id === purchaseOrderId);
    if (purchaseOrder) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedPurchaseOrder: purchaseOrder,
      });
    }
  };

  const handleDelete = (purchaseOrderId: string) => {
    const purchaseOrder = purchaseOrders.find(po => po.id === purchaseOrderId);
    if (purchaseOrder) {
      setDeleteDialog({
        open: true,
        purchaseOrder,
      });
    }
  };

  const handleView = (purchaseOrderId: string) => {
    router.push(`/dashboard/purchase-orders/${purchaseOrderId}`);
  };

  const handleDialogSuccess = () => {
    fetchPurchaseOrders();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.purchaseOrder) return;

    try {
      const response = await fetch(`/api/purchase-orders/${deleteDialog.purchaseOrder.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }

      setDeleteDialog({ open: false, purchaseOrder: null });
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      supplierId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <PurchaseOrderListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Purchase Orders</h1>
              <p className="text-muted-foreground">
                Manage your purchase orders and track supplier deliveries
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <PurchaseOrderFilters
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            supplierId={filters.supplierId}
            onSupplierIdChange={(supplierId) => handleFilterChange('supplierId', supplierId)}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => handleFilterChange('status', status)}
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
              <Button onClick={fetchPurchaseOrders} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <PurchaseOrderTable
              purchaseOrders={purchaseOrders}
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
            {pagination.total} purchase orders
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

      {/* Purchase Order Dialog */}
      <PurchaseOrderDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        purchaseOrder={dialogState.selectedPurchaseOrder || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete purchase order {deleteDialog.purchaseOrder?.orderNumber}?
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
