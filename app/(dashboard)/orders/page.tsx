'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, ShoppingBag } from 'lucide-react';
import { OrderTable } from '../../../components/orders/order-table';
import { OrderFilters } from '../../../components/orders/order-filters';
import { OrderDialog } from '../../../components/orders/order-dialog';
import { OrderListSkeleton } from '../../../components/orders/order-list-skeleton';
import { Order, OrderStatus, OrderPriority, GarmentType } from '../../../types';
import { CreateOrderInput, UpdateOrderInput } from '../../../lib/validations/order';
import { fetchOrders, deleteOrder } from '../../../lib/api/orders';
import { useToast } from '../../../hooks/use-toast';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
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
    customerId: searchParams.get('customerId') || '',
    status: (searchParams.get('status') as OrderStatus) || null,
    garmentType: (searchParams.get('garmentType') as GarmentType) || null,
    priority: (searchParams.get('priority') as OrderPriority) || null,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sortBy: searchParams.get('sortBy') || 'orderDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  // Dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    selectedOrder: null as Order | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    order: null as Order | null,
  });

  // Fetch orders function
  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchOrders({
        search: filters.search || undefined,
        customerId: filters.customerId || undefined,
        status: filters.status || undefined,
        garmentType: filters.garmentType || undefined,
        priority: filters.priority || undefined,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      });

      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchOrdersData();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.customerId) params.set('customerId', filters.customerId);
    if (filters.status) params.set('status', filters.status);
    if (filters.garmentType) params.set('garmentType', filters.garmentType);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.set('dateTo', filters.dateTo.toISOString());
    if (sorting.sortBy !== 'orderDate') params.set('sortBy', sorting.sortBy);
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
      selectedOrder: null,
    });
  };

  const handleEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedOrder: order,
      });
    }
  };

  const handleDelete = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDeleteDialog({
        open: true,
        order,
      });
    }
  };

  const handleStatusUpdate = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setDialogState({
        open: true,
        mode: 'status-update',
        selectedOrder: order,
      });
    }
  };

  const handleView = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleDialogSuccess = () => {
    fetchOrdersData();
    toast({
      title: 'Success',
      description: 'Order saved successfully',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.order) return;

    try {
      await deleteOrder(deleteDialog.order.id);
      setDeleteDialog({ open: false, order: null });
      fetchOrdersData();
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      customerId: '',
      status: null,
      garmentType: null,
      priority: null,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <OrderListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Orders</h1>
              <p className="text-muted-foreground">
                Manage customer orders and track order status
              </p>
            </div>
            {session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER' ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <OrderFilters
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => handleFilterChange('status', status)}
            garmentTypeFilter={filters.garmentType}
            onGarmentTypeFilterChange={(type) => handleFilterChange('garmentType', type)}
            priorityFilter={filters.priority}
            onPriorityFilterChange={(priority) => handleFilterChange('priority', priority)}
            dateFromFilter={filters.dateFrom}
            onDateFromFilterChange={(date) => handleFilterChange('dateFrom', date)}
            dateToFilter={filters.dateTo}
            onDateToFilterChange={(date) => handleFilterChange('dateTo', date)}
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
              <Button onClick={fetchOrdersData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <OrderTable
              orders={orders}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onStatusUpdate={handleStatusUpdate}
              sortBy={sorting.sortBy}
              sortOrder={sorting.sortOrder}
              onSort={handleSort}
              userRole={session?.user?.role || null}
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
            {pagination.total} orders
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

      {/* Order Dialog */}
      <OrderDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        order={dialogState.selectedOrder || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {deleteDialog.order?.orderNumber}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
