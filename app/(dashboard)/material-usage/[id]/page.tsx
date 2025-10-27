'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Calendar, Package, DollarSign, FileText, User, Calculator } from 'lucide-react';
import { MaterialUsage } from '@/types';

export default function MaterialUsageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [materialUsage, setMaterialUsage] = useState<MaterialUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterialUsage();
  }, [params.id]);

  const fetchMaterialUsage = async () => {
    try {
      const response = await fetch(`/api/material-usage/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch material usage');
      }
      const data = await response.json();
      setMaterialUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material usage record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/material-usage/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material usage');
      }

      router.push('/dashboard/material-usage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete material usage');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading material usage details...</div>
      </div>
    );
  }

  if (error || !materialUsage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-destructive">
          {error || 'Material usage not found'}
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Material Usage</h1>
            <p className="text-muted-foreground">Usage Record Details</p>
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

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="order">Order Information</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Material Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Material Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{materialUsage.inventoryItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {materialUsage.inventoryItem.sku}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Category:</span>{' '}
                  {materialUsage.inventoryItem.category.replace('_', ' ')}
                </div>
                {materialUsage.inventoryItem.unit && (
                  <div className="text-sm">
                    <span className="font-medium">Unit:</span> {materialUsage.inventoryItem.unit}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Usage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantity:</span>
                  <span className="text-sm font-bold">
                    {materialUsage.quantity} {materialUsage.inventoryItem.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unit Price:</span>
                  <span className="text-sm">
                    {materialUsage.unitPrice.toLocaleString()} AED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">
                    {materialUsage.totalCost.toLocaleString()} AED
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Usage Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Usage Date
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(materialUsage.usageDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Time:</span>{' '}
                  {new Date(materialUsage.usageDate).toLocaleTimeString()}
                </div>
                {materialUsage.createdByUser && (
                  <div className="text-sm">
                    <span className="font-medium">Recorded by:</span>{' '}
                    {materialUsage.createdByUser.name || materialUsage.createdByUser.email}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {materialUsage.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{materialUsage.notes}</p>
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
                    {new Date(materialUsage.createdAt).toLocaleDateString()} at{' '}
                    {new Date(materialUsage.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {new Date(materialUsage.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(materialUsage.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>
                Order associated with this material usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {materialUsage.order ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Number:</span>
                    <Badge variant="outline">{materialUsage.order.orderNumber}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer:</span>
                    <span className="text-sm">
                      {materialUsage.order.customer.firstName} {materialUsage.order.customer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Date:</span>
                    <span className="text-sm">
                      {new Date(materialUsage.order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge>{materialUsage.order.status}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No associated order</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
