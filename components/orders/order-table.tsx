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
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2, Workflow } from 'lucide-react';
import { Order } from '../../types';
import {
  formatOrderDate,
  getCustomerFullName,
  getOrderStatusLabel,
  getOrderStatusColor,
  getOrderPriorityLabel,
  getOrderPriorityColor,
  getGarmentTypeLabel,
  getOrderTypeLabel,
  formatCurrency
} from '../../lib/utils';
import { OrderType } from '../../types';

interface OrderTableProps {
  orders: Order[];
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onView: (orderId: string) => void;
  onStatusUpdate: (orderId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  userRole: string | null;
}

export function OrderTable({
  orders,
  onEdit,
  onDelete,
  onView,
  onStatusUpdate,
  sortBy,
  sortOrder,
  onSort,
  userRole,
}: OrderTableProps) {
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

  const isOverdue = (deliveryDate: Date) => {
    return deliveryDate < new Date();
  };

  const getDeliveryDateColor = (deliveryDate: Date) => {
    return isOverdue(deliveryDate) ? 'text-red-600 font-medium' : '';
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderNumber">Order Number</SortableHeader>
            <SortableHeader field="customer.lastName">Customer</SortableHeader>
            <TableHead>Garment Type</TableHead>
            <TableHead>Order Type</TableHead>
            <TableHead>Service</TableHead>
            <SortableHeader field="orderDate">Order Date</SortableHeader>
            <SortableHeader field="deliveryDate">Delivery Date</SortableHeader>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.orderNumber}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {order.customer ? getCustomerFullName(order.customer.firstName, order.customer.lastName) : 'Unknown Customer'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.customer?.customerNumber}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{getGarmentTypeLabel(order.garmentType)}</span>
                  {order.isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getOrderTypeLabel(order.orderType)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={order.serviceDescription}>
                  {order.serviceDescription}
                </div>
              </TableCell>
              <TableCell>
                {formatOrderDate(order.orderDate)}
              </TableCell>
              <TableCell className={getDeliveryDateColor(order.deliveryDate)}>
                {formatOrderDate(order.deliveryDate)}
                {isOverdue(order.deliveryDate) && (
                  <div className="text-xs text-red-600">Overdue</div>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getOrderStatusColor(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {order.priority !== 'NORMAL' && (
                  <Badge className={getOrderPriorityColor(order.priority)}>
                    {getOrderPriorityLabel(order.priority)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {order.totalAmount ? (
                  <div>
                    <div className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    {order.depositAmount && (
                      <div className="text-xs text-muted-foreground">
                        Deposit: {formatCurrency(order.depositAmount)}
                      </div>
                    )}
                    {order.balanceAmount && (
                      <div className="text-xs text-muted-foreground">
                        Balance: {formatCurrency(order.balanceAmount)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
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
                    <DropdownMenuItem onClick={() => onView(order.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusUpdate(order.id)}>
                      <Workflow className="mr-2 h-4 w-4" />
                      Update Status
                    </DropdownMenuItem>
                    {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                      <DropdownMenuItem onClick={() => onEdit(order.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {userRole === 'ADMIN' && (
                      <DropdownMenuItem
                        onClick={() => onDelete(order.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
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
