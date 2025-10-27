'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Plus, Users } from 'lucide-react';
import { EmployeeTable } from '../../../components/employees/employee-table';
import { EmployeeDialog } from '../../../components/employees/employee-dialog';
import { EmployeeListSkeleton } from '../../../components/employees/employee-list-skeleton';
import { Employee, UserRole, EmployeeListItem } from 'types';
import { CreateEmployeeInput, UpdateEmployeeInput } from 'lib/validations/employee';

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
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
    role: (searchParams.get('role') as UserRole) || 'ALL',
    status: searchParams.get('status') === 'false' ? false : searchParams.get('status') === 'true' ? true : '',
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
    selectedEmployee: null as Employee | null,
  });

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    employee: null as Employee | null,
  });

  // Fetch employees function
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        isActive: filters.status.toString(),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/employees?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on mount and when filters/sorting/pagination change
  useEffect(() => {
    fetchEmployees();
  }, [filters, sorting, pagination.page, pagination.limit]);

  // Update URL with current filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.role) params.set('role', filters.role);
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
      selectedEmployee: null,
    });
  };

  const handleEdit = (employee: EmployeeListItem) => {
    const fullEmployee = employees.find(e => e.id === employee.id);
    if (fullEmployee) {
      setDialogState({
        open: true,
        mode: 'edit',
        selectedEmployee: fullEmployee,
      });
    }
  };

  const handleDelete = (employee: EmployeeListItem) => {
    const fullEmployee = employees.find(e => e.id === employee.id);
    if (fullEmployee) {
      setDeleteDialog({
        open: true,
        employee: fullEmployee,
      });
    }
  };

  const handleView = (employee: EmployeeListItem) => {
    router.push(`/dashboard/employees/${employee.id}`);
  };

  const handleDialogSuccess = () => {
    fetchEmployees();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.employee) return;

    try {
      const response = await fetch(`/api/employees/${deleteDialog.employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setDeleteDialog({ open: false, employee: null });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return <EmployeeListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Employees</h1>
              <p className="text-muted-foreground">
                Manage your tailoring business employees and their roles
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchEmployees} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              isLoading={loading}
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
            {pagination.total} employees
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

      {/* Employee Dialog */}
      <EmployeeDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        mode={dialogState.mode}
        employee={dialogState.selectedEmployee || undefined}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))} >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.employee?.firstName} {deleteDialog.employee?.lastName}?
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
