'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, Users } from 'lucide-react';
import { CustomerTable } from '../../../components/customers/customer-table';
import { CustomerFilters } from '../../../components/customers/customer-filters';
import { CustomerDialog } from '../../../components/customers/customer-dialog';
import { CustomerListSkeleton } from '../../../components/customers/customer-list-skeleton';
import { Customer, Gender, PreferredContactMethod } from 'types';
import { CreateCustomerInput, UpdateCustomerInput } from 'lib/validations/customer';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
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
    gender: (searchParams.get('gender') as Gender) || undefined,
    contactMethod: (searchParams.get('contactMethod') as PreferredContactMethod) || undefined,
    status: searchParams.get('status') === 'false' ? false : searchParams.get('status') === 'true' ? true : undefined,
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
    selectedCustomer: null as Customer | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    customer: null as Customer | null,
  });

  // Fetch customers function
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: filters.search,
        gender: filters.gender,
        preferredContactMethod: filters.contactMethod,
      isActive: filters.status,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/customers?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchCustomers();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.contactMethod) params.set('contactMethod', filters.contactMethod);
    if (filters.status !== '') params.set('status', filters.status.toString());
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
      selectedCustomer: null,
    });
  };

  const handleEdit = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedCustomer: customer,
      });
    }
  };

  const handleDelete = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setDeleteDialog({
        open: true,
        customer,
      });
    }
  };

  const handleView = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  const handleDialogSuccess = () => {
    fetchCustomers();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.customer) return;

    try {
      const response = await fetch(`/api/customers/${deleteDialog.customer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      setDeleteDialog({ open: false, customer: null });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      gender: '',
      contactMethod: '',
      status: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <CustomerListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Customers</h1>
              <p className="text-muted-foreground">
                Manage your customer database and track customer information
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <CustomerFilters
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            genderFilter={filters.gender}
            onGenderFilterChange={(gender) => handleFilterChange('gender', gender)}
            contactMethodFilter={filters.contactMethod}
            onContactMethodFilterChange={(method) => handleFilterChange('contactMethod', method)}
            statusFilter={filters.status}
            onStatusFilterChange={(status) => handleFilterChange('status', status)}
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
              <Button onClick={fetchCustomers} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
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
            {pagination.total} customers
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

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        customer={dialogState.selectedCustomer || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.customer?.firstName} {deleteDialog.customer?.lastName}?
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
