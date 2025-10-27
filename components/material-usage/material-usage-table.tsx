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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { MaterialUsage } from 'types';
import { formatCurrency } from 'lib/utils';

interface MaterialUsageTableProps {
  materialUsages: MaterialUsage[];
  onEdit: (materialUsageId: string) => void;
  onDelete: (materialUsageId: string) => void;
  onView: (materialUsageId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function MaterialUsageTable({
  materialUsages,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortOrder,
  onSort,
}: MaterialUsageTableProps) {
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

  if (materialUsages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No material usage records found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="order">Order</SortableHeader>
            <SortableHeader field="inventoryItem">Material</SortableHeader>
            <SortableHeader field="quantity">Quantity</SortableHeader>
            <SortableHeader field="unitPrice">Unit Price</SortableHeader>
            <SortableHeader field="totalCost">Total Cost</SortableHeader>
            <SortableHeader field="usageDate">Usage Date</SortableHeader>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materialUsages.map((materialUsage) => (
            <TableRow key={materialUsage.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{materialUsage.order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {materialUsage.order.customer.firstName} {materialUsage.order.customer.lastName}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{materialUsage.inventoryItem.name}</div>
                  <div className="text-sm text-muted-foreground">{materialUsage.inventoryItem.sku}</div>
                </div>
              </TableCell>
              <TableCell>
                {Number(materialUsage.quantity)} {materialUsage.inventoryItem.unit}
              </TableCell>
              <TableCell>
                {formatCurrency(Number(materialUsage.unitPrice))}
              </TableCell>
              <TableCell>
                {formatCurrency(Number(materialUsage.totalCost))}
              </TableCell>
              <TableCell>
                {new Date(materialUsage.usageDate).toLocaleDateString()}
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
                    <DropdownMenuItem onClick={() => onView(materialUsage.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(materialUsage.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(materialUsage.id)}
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
