'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmployeeListItem, UserRole } from '../../types';
import { formatDate, getCustomerFullName } from '../../lib/utils';

interface EmployeeTableProps {
  employees: EmployeeListItem[];
  onEdit: (employee: EmployeeListItem) => void;
  onDelete: (employee: EmployeeListItem) => void;
  onView: (employee: EmployeeListItem) => void;
  isLoading?: boolean;
}

export function EmployeeTable({ employees, onEdit, onDelete, onView, isLoading }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.phone.includes(searchTerm) ||
                         employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' ||
                         (statusFilter === 'ACTIVE' && employee.isActive) ||
                         (statusFilter === 'INACTIVE' && !employee.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.MANAGER:
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.CUTTER:
        return 'Cutter';
      case UserRole.STITCHER:
        return 'Stitcher';
      case UserRole.PRESSER:
        return 'Presser';
      case UserRole.DELIVERY:
        return 'Delivery';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
        <CardDescription>
          Manage your tailoring business employees
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="role">Role</Label>
            <Select value={roleFilter} onValueChange={(value: UserRole | 'ALL') => setRoleFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                <SelectItem value={UserRole.CUTTER}>Cutter</SelectItem>
                <SelectItem value={UserRole.STITCHER}>Stitcher</SelectItem>
                <SelectItem value={UserRole.PRESSER}>Presser</SelectItem>
                <SelectItem value={UserRole.DELIVERY}>Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={(value: 'ALL' | 'ACTIVE' | 'INACTIVE') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employeeNumber}
                    </TableCell>
                    <TableCell>
                      {getCustomerFullName(employee.firstName, employee.lastName)}
                    </TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(employee.role)}>
                        {getRoleLabel(employee.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(employee.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(employee)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(employee)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(employee)}
                          disabled={!employee.isActive}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
