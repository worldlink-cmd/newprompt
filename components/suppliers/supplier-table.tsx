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
import { Supplier } from 'types';
import { formatPhoneNumber } from 'lib/utils';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplierId: string) => void;
  onDelete: (supplierId: string) => void;
  onView: (supplierId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
}: SupplierTableProps) {
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentTermsBadgeVariant = (terms: string) => {
    switch (terms) {
      case 'NET_15':
        return 'default';
      case 'NET_30':
        return 'secondary';
      case 'NET_45':
        return 'outline';
      case 'NET_60':
        return 'destructive';
      case 'CASH_ON_DELIVERY':
        return 'default';
      case 'ADVANCE_PAYMENT':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No suppliers found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="supplierNumber">Supplier Number</SortableHeader>
            <SortableHeader field="name">Name</SortableHeader>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Payment Terms</TableHead>
            <TableHead>Status</TableHead>
            <SortableHeader field="createdAt">Created Date</SortableHeader>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">
                {supplier.supplierNumber}
              </TableCell>
              <TableCell>
                {supplier.name}
              </TableCell>
              <TableCell>
                {supplier.email || '-'}
              </TableCell>
              <TableCell>
                {formatPhoneNumber(supplier.phone)}
              </TableCell>
              <TableCell>
                <Badge variant={getPaymentTermsBadgeVariant(supplier.paymentTerms)}>
                  {supplier.paymentTerms.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(supplier.status)}>
                  {supplier.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(supplier.createdAt).toLocaleDateString()}
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
                    <DropdownMenuItem onClick={() => onView(supplier.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(supplier.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(supplier.id)}
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
