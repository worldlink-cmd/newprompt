'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Separator } from '../../../../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, User, CreditCard } from 'lucide-react';
import { CustomerDialog } from '../../../../components/customers/customer-dialog';
import { CustomerProfileSkeleton } from '../../../../components/customers/customer-profile-skeleton';
import { MeasurementsList } from '../../../../components/measurements/measurements-list';
import { MeasurementDialog } from '../../../../components/measurements/measurement-dialog';
import { MeasurementHistoryDialog } from '../../../../components/measurements/measurement-history-dialog';
import { Customer, Measurement, GarmentType, Order } from '../../../../types';
import { formatPhoneNumber, getCustomerFullName, formatCustomerAddress, calculateAge } from '../../../../lib/utils';
import { fetchCustomerMeasurements, deleteMeasurement } from '../../../../lib/api/measurements';
import { fetchOrders } from '../../../../lib/api/orders';
import { useToast } from '../../../../hooks/use-toast';
import { UserRole } from '../../../../types';
import { OrderTable } from '../../../../components/orders/order-table';

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  // State management
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Measurement state
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [measurementDialogMode, setMeasurementDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | undefined>();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedGarmentType, setSelectedGarmentType] = useState<GarmentType | undefined>();
  const [deleteMeasurementDialogOpen, setDeleteMeasurementDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<Measurement | undefined>();

  // Order state
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch customer function
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/customers/${customerId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Customer not found');
        }
        throw new Error('Failed to fetch customer');
      }

      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer on mount
  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchMeasurements();
      fetchCustomerOrders();
    }
  }, [customerId]);

  // Fetch measurements function
  const fetchMeasurements = async () => {
    try {
      setMeasurementsLoading(true);
      const data = await fetchCustomerMeasurements(customerId, { isLatest: true });
      setMeasurements(data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setMeasurementsLoading(false);
    }
  };

  // Fetch customer orders function
  const fetchCustomerOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetchOrders({
        customerId: customerId,
        sortBy: 'orderDate',
        sortOrder: 'desc',
      });
      setCustomerOrders(response.orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handler functions
  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleBack = () => {
    router.push('/dashboard/customers');
  };

  const handleEditSuccess = () => {
    fetchCustomer();
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // Measurement handlers
  const handleAddMeasurement = () => {
    setMeasurementDialogMode('create');
    setSelectedMeasurement(undefined);
    setMeasurementDialogOpen(true);
  };

  const handleEditMeasurement = (measurement: Measurement) => {
    setMeasurementDialogMode('edit');
    setSelectedMeasurement(measurement);
    setMeasurementDialogOpen(true);
  };

  const handleDeleteMeasurement = (measurement: Measurement) => {
    setMeasurementToDelete(measurement);
    setDeleteMeasurementDialogOpen(true);
  };

  const handleDeleteMeasurementConfirm = async () => {
    if (!measurementToDelete) return;
    try {
      await deleteMeasurement(customerId, measurementToDelete.id);
      fetchMeasurements();
      setDeleteMeasurementDialogOpen(false);
      setMeasurementToDelete(undefined);
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  };

  const handleViewHistory = (garmentType: GarmentType) => {
    setSelectedGarmentType(garmentType);
    setHistoryDialogOpen(true);
  };

  const handleMeasurementSuccess = () => {
    fetchMeasurements();
    setMeasurementDialogOpen(false);
  };

  if (loading) {
    return <CustomerProfileSkeleton />;
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error || 'Customer not found'}</p>
              <Button onClick={handleBack} variant="outline">
                Back to Customers
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
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {getCustomerFullName(customer.firstName, customer.lastName)}
            </h1>
            <p className="text-muted-foreground">{customer.customerNumber}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge variant={customer.isActive ? 'default' : 'secondary'}>
          {customer.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contact">Contact Details</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Personal Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Full Name:</span>
                  <span>{getCustomerFullName(customer.firstName, customer.lastName)}</span>
                </div>

                {customer.gender && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="capitalize">{customer.gender}</span>
                  </div>
                )}

                {customer.dateOfBirth && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span>{new Date(customer.dateOfBirth).toLocaleDateString()} (Age: {calculateAge(new Date(customer.dateOfBirth))})</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Customer Number:</span>
                  <span className="font-mono">{customer.customerNumber}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created:</span>
                  <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Contact Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span>{customer.email}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone:</span>
                  <span>{formatPhoneNumber(customer.phone)}</span>
                </div>

                {customer.alternatePhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Alternate Phone:</span>
                    <span>{formatPhoneNumber(customer.alternatePhone)}</span>
                  </div>
                )}

                {customer.preferredContactMethod && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Preferred Contact:</span>
                    <Badge variant="outline">{customer.preferredContactMethod}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Address Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.address || customer.city || customer.state || customer.postalCode || customer.country ? (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">Address:</span>
                    <p className="mt-1 text-sm">
                      {formatCustomerAddress(
                        customer.address,
                        customer.city,
                        customer.state,
                        customer.postalCode,
                        customer.country
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address provided</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customer.city && (
                  <div>
                    <span className="text-sm font-medium">City:</span>
                    <p className="text-sm">{customer.city}</p>
                  </div>
                )}
                {customer.state && (
                  <div>
                    <span className="text-sm font-medium">State:</span>
                    <p className="text-sm">{customer.state}</p>
                  </div>
                )}
                {customer.postalCode && (
                  <div>
                    <span className="text-sm font-medium">Postal Code:</span>
                    <p className="text-sm">{customer.postalCode}</p>
                  </div>
                )}
                {customer.country && (
                  <div>
                    <span className="text-sm font-medium">Country:</span>
                    <p className="text-sm">{customer.country}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Additional Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.notes ? (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="mt-1 text-sm">{customer.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes provided</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Customer Preferences</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Preferred Contact Method:</span>
                {customer.preferredContactMethod ? (
                  <Badge variant="outline">{customer.preferredContactMethod}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Loyalty Points:</span>
                <span className="font-semibold">{customer.loyaltyPoints}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-6">
          <MeasurementsList
            measurements={measurements}
            onAdd={handleAddMeasurement}
            onEdit={handleEditMeasurement}
            onDelete={handleDeleteMeasurement}
            onViewHistory={handleViewHistory}
            loading={measurementsLoading}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Customer Orders</h3>
                <Button
                  onClick={() => router.push('/dashboard/orders?customerId=' + customerId)}
                  size="sm"
                >
                  View All Orders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : customerOrders.length > 0 ? (
                <OrderTable
                  orders={customerOrders}
                  onEdit={(orderId) => router.push(`/dashboard/orders/${orderId}`)}
                  onDelete={() => {}} // Not needed here, remove from table
                  onView={(orderId) => router.push(`/dashboard/orders/${orderId}`)}
                  sortBy="orderDate"
                  sortOrder="desc"
                  onSort={() => {}} // Not needed here
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No orders found for this customer</p>
                  <Button
                    onClick={() => router.push('/dashboard/orders?customerId=' + customerId)}
                    variant="outline"
                  >
                    Create First Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Measurement history is available in the Measurements tab. Order history will be available in Phase 4.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Phase 4: Order Management</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <CustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        customer={customer}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customer.firstName} {customer.lastName}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Measurement Dialog */}
      <MeasurementDialog
        open={measurementDialogOpen}
        onOpenChange={setMeasurementDialogOpen}
        mode={measurementDialogMode}
        customerId={customerId}
        measurement={selectedMeasurement}
        onSuccess={handleMeasurementSuccess}
      />

      {/* Measurement History Dialog */}
      <MeasurementHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        customerId={customerId}
        garmentType={selectedGarmentType!}
        currentMeasurementId={selectedMeasurement?.id}
      />

      {/* Delete Measurement Confirmation Dialog */}
      <AlertDialog open={deleteMeasurementDialogOpen} onOpenChange={setDeleteMeasurementDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Measurement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this measurement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeasurementConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
