'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { Customer } from 'types';
import { formatPhoneNumber, getCustomerFullName } from 'lib/utils';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customerId: string) => void;
  onDelete: (customerId: string) => void;
  onView: (customerId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
}: CustomerTableProps) {
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(field)}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        {children}
        {sortBy === field && (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </TableHead>
  );

  const getContactMethodBadgeVariant = (method: string | null) => {
    switch (method) {
      case 'EMAIL':
        return 'default';
      case 'PHONE':
        return 'secondary';
      case 'WHATSAPP':
        return 'outline';
      case 'SMS':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="customerNumber">Customer Number</SortableHeader>
            <SortableHeader field="firstName">Name</SortableHeader>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Preferred Contact</TableHead>
            <TableHead>Status</TableHead>
            <SortableHeader field="createdAt">Created Date</SortableHeader>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                {customer.customerNumber}
              </TableCell>
              <TableCell>
                {getCustomerFullName(customer.firstName, customer.lastName)}
              </TableCell>
              <TableCell>
                {customer.email || '-'}
              </TableCell>
              <TableCell>
                {formatPhoneNumber(customer.phone)}
              </TableCell>
              <TableCell>
                {customer.preferredContactMethod ? (
                  <Badge variant={getContactMethodBadgeVariant(customer.preferredContactMethod)}>
                    {customer.preferredContactMethod}
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(customer.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(customer.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(customer.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
