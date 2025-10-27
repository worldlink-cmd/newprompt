'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Separator } from '../../../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, User, Ruler, DollarSign, ShoppingBag, Clock, Workflow } from 'lucide-react';
import { OrderDialog } from '../../../../components/orders/order-dialog';
import { WorkflowProgress } from '../../../../components/orders/workflow-progress';
import { StatusUpdateDialog } from '../../../../components/orders/status-update-dialog';
import { OrderHistoryTimeline } from '../../../../components/orders/order-history-timeline';
import { Order, UserRole } from '../../../types';
import {
  formatOrderDate,
  getCustomerFullName,
  getOrderStatusLabel,
  getOrderStatusColor,
  getOrderPriorityLabel,
  getOrderPriorityColor,
  getGarmentTypeLabel,
  formatCurrency,
  formatMeasurement
} from '../../../lib/utils';
import { fetchOrderById, deleteOrder } from '../../../lib/api/orders';
import { useToast } from '../../../hooks/use-toast';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  // State management
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);

  // Fetch order function
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order on mount
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Handler functions
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    setStatusUpdateDialogOpen(true);
  };

  const handleBack = () => {
    router.push('/dashboard/orders');
  };

  const handleEditSuccess = () => {
    fetchOrder();
    setEditDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Order updated successfully',
    });
  };

  const handleStatusUpdateSuccess = () => {
    fetchOrder();
    setStatusUpdateDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Order status updated successfully',
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteOrder(orderId);
      router.push('/dashboard/orders');
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

  const isOverdue = (deliveryDate: Date) => {
    return deliveryDate < new Date();
  };

  const getDeliveryDateColor = (deliveryDate: Date) => {
    return isOverdue(deliveryDate) ? 'text-red-600 font-medium' : '';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error || 'Order not found'}</p>
              <Button onClick={handleBack} variant="outline">
                Back to Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Order Details</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button onClick={handleStatusUpdate} variant="outline">
            <Workflow className="mr-2 h-4 w-4" />
            Update Status
          </Button>
          {session?.user?.role === 'ADMIN' && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Status and Priority Badges */}
      <div className="flex items-center space-x-2">
        <Badge className={getOrderStatusColor(order.status)}>
          {getOrderStatusLabel(order.status)}
        </Badge>
        {order.priority !== 'NORMAL' && (
          <Badge className={getOrderPriorityColor(order.priority)}>
            {getOrderPriorityLabel(order.priority)}
          </Badge>
        )}
        {order.isUrgent && (
          <Badge variant="destructive">
            Urgent
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="customer">Customer Information</TabsTrigger>
          <TabsTrigger value="measurement">Measurement Details</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Workflow Progress */}
          <WorkflowProgress
            currentStatus={order.status}
            history={order.history || []}
          />

          {/* Order Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium flex items-center">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Order Number:</span>
                  <span className="font-mono">{order.orderNumber}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Order Date:</span>
                  <span>{formatOrderDate(order.orderDate)}</span>
                </div>

                <div className={`flex items-center space-x-2 ${getDeliveryDateColor(order.deliveryDate)}`}>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Delivery Date:</span>
                  <span>{formatOrderDate(order.deliveryDate)}</span>
                  {isOverdue(order.deliveryDate) && (
                    <Badge variant="destructive" className="text-xs">Overdue</Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Garment Type:</span>
                  <span>{getGarmentTypeLabel(order.garmentType)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Priority:</span>
                  <Badge className={getOrderPriorityColor(order.priority)}>
                    {getOrderPriorityLabel(order.priority)}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Service Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">Service Description:</span>
                <p className="mt-1 text-sm">{order.serviceDescription}</p>
              </div>

              {order.specialInstructions ? (
                <div>
                  <span className="text-sm font-medium">Special Instructions:</span>
                  <p className="mt-1 text-sm">{order.specialInstructions}</p>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium">Special Instructions:</span>
                  <p className="mt-1 text-sm text-muted-foreground">No special instructions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <div className="text-lg font-semibold">
                    {order.totalAmount ? formatCurrency(order.totalAmount) : 'Not set'}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Deposit Amount:</span>
                  <div className="text-lg">
                    {order.depositAmount ? formatCurrency(order.depositAmount) : 'Not set'}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Balance Amount:</span>
                  <div className="text-lg font-semibold">
                    {order.balanceAmount ? formatCurrency(order.balanceAmount) : 'Not set'}
                  </div>
                </div>
              </div>

              {order.totalAmount && order.depositAmount && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Status:</span>
                    <Badge variant={order.balanceAmount === 0 ? 'default' : 'secondary'}>
                      {order.balanceAmount === 0 ? 'Fully Paid' : 'Partially Paid'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          {order.customer ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Customer Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Name:</span>
                    <span>{getCustomerFullName(order.customer.firstName, order.customer.lastName)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Customer Number:</span>
                    <span className="font-mono">{order.customer.customerNumber}</span>
                  </div>

                  {order.customer.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email:</span>
                      <span>{order.customer.email}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                    <span>{order.customer.phone}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">View Full Customer Profile:</span>
                  <Button variant="outline" size="sm">
                    View Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Customer information not available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="measurement" className="space-y-6">
          {order.measurement ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium flex items-center">
                  <Ruler className="mr-2 h-5 w-5" />
                  Measurement Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Garment Type:</span>
                    <span>{getGarmentTypeLabel(order.measurement.garmentType)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Version:</span>
                    <span>Version {order.measurement.version} {order.measurement.isLatest && '(Current)'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Unit:</span>
                    <span className="uppercase">{order.measurement.unit}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created:</span>
                    <span>{formatOrderDate(order.measurement.createdAt)}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-medium">Measurements:</span>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(order.measurement.measurements).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-sm font-medium">
                          {formatMeasurement(value, order.measurement.unit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">View Full Measurement History:</span>
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Ruler className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No measurement linked to this order</p>
                  <Button variant="outline">
                    Link Measurement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <OrderHistoryTimeline history={order.history || []} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <OrderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        order={order}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {order.orderNumber}?
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

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        open={statusUpdateDialogOpen}
        onOpenChange={setStatusUpdateDialogOpen}
        orderId={order.id}
        currentStatus={order.status}
        onSuccess={handleStatusUpdateSuccess}
      />
    </div>
  );
}
