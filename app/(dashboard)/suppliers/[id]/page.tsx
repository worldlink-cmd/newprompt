'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, CreditCard, Building } from 'lucide-react';
import { Supplier } from '@/types';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplier();
  }, [params.id]);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier');
      }
      const data = await response.json();
      setSupplier(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      const response = await fetch(`/api/suppliers/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      router.push('/dashboard/suppliers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading supplier details...</div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-destructive">
          {error || 'Supplier not found'}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">Supplier #{supplier.supplierNumber}</p>
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
        <Badge className={getStatusColor(supplier.status)}>
          {supplier.status}
        </Badge>
        {supplier.isActive && (
          <Badge variant="secondary">Active</Badge>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{supplier.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                {supplier.alternatePhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{supplier.alternatePhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {supplier.address && (
                  <p className="text-sm">{supplier.address}</p>
                )}
                <div className="flex flex-wrap gap-1 text-sm text-muted-foreground">
                  {supplier.city && <span>{supplier.city}</span>}
                  {supplier.state && <span>{supplier.state}</span>}
                  {supplier.postalCode && <span>{supplier.postalCode}</span>}
                  {supplier.country && <span>{supplier.country}</span>}
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Terms:</span>
                  <Badge variant="outline">{supplier.paymentTerms}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lead Time:</span>
                  <span className="text-sm">{supplier.leadTimeDays} days</span>
                </div>
                {supplier.minimumOrder && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Min Order:</span>
                    <span className="text-sm">{supplier.minimumOrder} AED</span>
                  </div>
                )}
                {supplier.taxId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tax ID:</span>
                    <span className="text-sm">{supplier.taxId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{supplier.notes}</p>
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
                    {new Date(supplier.createdAt).toLocaleDateString()} at{' '}
                    {new Date(supplier.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">
                    {new Date(supplier.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(supplier.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Purchase orders associated with this supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Purchase orders feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Payment transactions with this supplier
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
