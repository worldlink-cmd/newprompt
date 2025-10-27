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
import { PurchaseOrder } from 'types';
import { formatCurrency } from 'lib/utils';

interface PurchaseOrderTableProps {
  purchaseOrders: PurchaseOrder[];
  onEdit: (purchaseOrderId: string) => void;
  onDelete: (purchaseOrderId: string) => void;
  onView: (purchaseOrderId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function PurchaseOrderTable({
  purchaseOrders,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
}: PurchaseOrderTableProps) {
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
      case 'DRAFT':
        return 'secondary';
      case 'PENDING_APPROVAL':
        return 'outline';
      case 'APPROVED':
        return 'default';
      case 'ORDERED':
        return 'default';
      case 'PARTIALLY_RECEIVED':
        return 'outline';
      case 'RECEIVED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (purchaseOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No purchase orders found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderNumber">Order Number</SortableHeader>
            <SortableHeader field="supplier">Supplier</SortableHeader>
            <TableHead>Status</TableHead>
            <SortableHeader field="totalAmount">Total Amount</SortableHeader>
            <SortableHeader field="orderDate">Order Date</SortableHeader>
            <SortableHeader field="expectedDate">Expected Date</SortableHeader>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((purchaseOrder) => (
            <TableRow key={purchaseOrder.id}>
              <TableCell className="font-medium">
                {purchaseOrder.orderNumber}
              </TableCell>
              <TableCell>
                {purchaseOrder.supplier.name}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(purchaseOrder.status)}>
                  {purchaseOrder.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {formatCurrency(Number(purchaseOrder.totalAmount))}
              </TableCell>
              <TableCell>
                {new Date(purchaseOrder.orderDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {purchaseOrder.expectedDate
                  ? new Date(purchaseOrder.expectedDate).toLocaleDateString()
                  : '-'
                }
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
                    <DropdownMenuItem onClick={() => onView(purchaseOrder.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(purchaseOrder.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(purchaseOrder.id)}
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
