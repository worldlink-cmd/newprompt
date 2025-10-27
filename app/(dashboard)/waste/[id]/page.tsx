'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Calendar, Package, DollarSign, FileText, User, Calculator, AlertTriangle } from 'lucide-react';
import { Waste } from '@/types';

export default function WasteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [waste, setWaste] = useState<Waste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWaste();
  }, [params.id]);

  const fetchWaste = async () => {
    try {
      const response = await fetch(`/api/waste/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch waste record');
      }
      const data = await response.json();
      setWaste(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this waste record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/waste/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete waste record');
      }

      router.push('/dashboard/waste');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete waste record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading waste record details...</div>
      </div>
    );
  }

  if (error || !waste) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-destructive">
          {error || 'Waste record not found'}
        </div>
      </div>
    );
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'CUTTING_LOSS':
        return 'bg-blue-100 text-blue-800';
      case 'STITCHING_ERROR':
        return 'bg-orange-100 text-orange-800';
      case 'QUALITY_REJECT':
        return 'bg-red-100 text-red-800';
      case 'EXCESS_MATERIAL':
        return 'bg-purple-100 text-purple-800';
      case 'DAMAGED_GOODS':
        return 'bg-gray-100 text-gray-800';
      case 'OTHER':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'CUTTING_LOSS':
      case 'STITCHING_ERROR':
      case 'QUALITY_REJECT':
      case 'EXCESS_MATERIAL':
      case 'DAMAGED_GOODS':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
            <h1 className="text-3xl font-bold">Waste Record</h1>
            <p className="text-muted-foreground">Waste Details</p>
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

      {/* Reason Badge */}
      <div className="flex items-center space-x-2">
        <Badge className={getReasonColor(waste.reason)}>
          <div className="flex items-center space-x-1">
            {getReasonIcon(waste.reason)}
            <span>{waste.reason.replace('_', ' ')}</span>
          </div>
        </Badge>
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
                  <p className="font-medium">{waste.inventoryItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {waste.inventoryItem.sku}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Category:</span>{' '}
                  {waste.inventoryItem.category.replace('_', ' ')}
                </div>
                {waste.inventoryItem.unit && (
                  <div className="text-sm">
                    <span className="font-medium">Unit:</span> {waste.inventoryItem.unit}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Waste Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Waste Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quantity:</span>
                  <span className="text-sm font-bold">
                    {waste.quantity} {waste.inventoryItem.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unit Cost:</span>
                  <span className="text-sm">
                    {waste.unitCost.toLocaleString()} AED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="text-lg font-bold">
                    {waste.totalCost.toLocaleString()} AED
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Waste Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Waste Date
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Date:</span>{' '}
                  {new Date(waste.wasteDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Time:</span>{' '}
                  {new Date(waste.wasteDate).toLocaleTimeString()}
                </div>
                {waste.createdByUser && (
                  <div className="text-sm">
                    <span className="font-medium">Recorded by:</span>{' '}
                    {waste.createdByUser.name || waste.createdByUser.email}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {waste.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{waste.description}</p>
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
                    {new Date(waste.createdAt).toLocaleDateString()} at{' '}
                    {new Date(waste.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {new Date(waste.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(waste.updatedAt).toLocaleTimeString()}
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
                Order associated with this waste record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {waste.order ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Number:</span>
                    <Badge variant="outline">{waste.order.orderNumber}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Customer:</span>
                    <span className="text-sm">
                      {waste.order.customer.firstName} {waste.order.customer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Order Date:</span>
                    <span className="text-sm">
                      {new Date(waste.order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge>{waste.order.status}</Badge>
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
