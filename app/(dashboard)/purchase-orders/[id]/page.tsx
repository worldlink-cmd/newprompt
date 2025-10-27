'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Calendar, Building, FileText, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PurchaseOrder } from '@/types';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [params.id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchase order');
      }
      const data = await response.json();
      setPurchaseOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this purchase order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/purchase-orders/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase order');
      }

      router.push('/dashboard/purchase-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading purchase order details...</div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-destructive">
          {error || 'Purchase order not found'}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'ORDERED':
        return 'bg-purple-100 text-purple-800';
      case 'PARTIALLY_RECEIVED':
        return 'bg-orange-100 text-orange-800';
      case 'RECEIVED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{purchaseOrder.orderNumber}</h1>
            <p className="text-muted-foreground">Purchase Order Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(purchaseOrder.status)}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(purchaseOrder.status)}
            <span>{purchaseOrder.status.replace('_', ' ')}</span>
          </div>
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{purchaseOrder.supplier.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Supplier #{purchaseOrder.supplier.supplierNumber}
                  </p>
                </div>
                {purchaseOrder.supplier.email && (
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {purchaseOrder.supplier.email}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Phone:</span> {purchaseOrder.supplier.phone}
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Date:</span>
                  <span className="text-sm">
                    {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                  </span>
                </div>
                {purchaseOrder.expectedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expected Date:</span>
                    <span className="text-sm">
                      {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Currency:</span>
                  <Badge variant="outline">{purchaseOrder.currency}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">
                    {purchaseOrder.totalAmount.toLocaleString()} {purchaseOrder.currency}
                  </span>
                </div>
                {purchaseOrder.approvedByUser && (
                  <div className="text-sm">
                    <span className="font-medium">Approved by:</span>{' '}
                    {purchaseOrder.approvedByUser.name || purchaseOrder.approvedByUser.email}
                  </div>
                )}
                {purchaseOrder.approvedAt && (
                  <div className="text-sm">
                    <span className="font-medium">Approved on:</span>{' '}
                    {new Date(purchaseOrder.approvedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{purchaseOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">
                    {new Date(purchaseOrder.createdAt).toLocaleDateString()} at{' '}
                    {new Date(purchaseOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {new Date(purchaseOrder.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(purchaseOrder.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Items included in this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Order items feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>
                Inventory receipts for this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receipts feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Payment transactions for this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment history feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
