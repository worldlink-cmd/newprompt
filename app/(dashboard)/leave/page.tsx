'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, FileText, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { LeaveRequestTable } from '../../../components/leave/leave-request-table';
import { LeaveRequestDialog } from '../../../components/leave/leave-request-dialog';
import { LeaveBalanceTable } from '../../../components/leave/leave-balance-table';
import { LeaveApprovalDialog } from '../../../components/leave/leave-approval-dialog';
import { LeaveDashboard } from '../../../components/leave/leave-dashboard';
import { LeaveRequest, LeaveRequestFormData, LeaveStatus, LeaveTypeModel } from '../../../types';
import { useToast } from '../../../hooks/use-toast';

export default function LeavePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [requestDialog, setRequestDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    selectedRequest: null as LeaveRequest | null,
  });

  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    request: null as LeaveRequest | null,
  });

  // Fetch data
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/leave/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch leave requests');
      }

      const data = await response.json();
      setLeaveRequests(data.requests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/leave/types');
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data.leaveTypes);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, []);

  // Handler functions
  const handleCreateRequest = () => {
    setRequestDialog({
      open: true,
      mode: 'create',
      selectedRequest: null,
    });
  };

  const handleEditRequest = (request: LeaveRequest) => {
    setRequestDialog({
      open: true,
      mode: 'edit',
      selectedRequest: request,
    });
  };

  const handleApproveRequest = (request: LeaveRequest) => {
    setApprovalDialog({
      open: true,
      request,
    });
  };

  const handleRequestSuccess = () => {
    fetchLeaveRequests();
    setRequestDialog({ open: false, mode: 'create', selectedRequest: null });
    toast({
      title: 'Success',
      description: 'Leave request submitted successfully',
    });
  };

  const handleApprovalSuccess = () => {
    fetchLeaveRequests();
    setApprovalDialog({ open: false, request: null });
    toast({
      title: 'Success',
      description: 'Leave request updated successfully',
    });
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
        </Card>
        <Card>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-muted-foreground">
                Manage employee leave requests, approvals, and leave balances
              </p>
            </div>
            {(session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'MANAGER' ? (
              <Button onClick={handleCreateRequest}>
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchLeaveRequests} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Dashboard */}
      <LeaveDashboard requests={leaveRequests} />

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Leave Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage leave requests from all employees
              </p>
            </CardHeader>
            <CardContent>
              <LeaveRequestTable
                requests={leaveRequests}
                onEdit={handleEditRequest}
                onApprove={handleApproveRequest}
                onRefresh={fetchLeaveRequests}
                userRole={(session?.user as any)?.role || null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track leave entitlements and remaining balances for all employees
              </p>
            </CardHeader>
            <CardContent>
              <LeaveBalanceTable
                onRefresh={fetchLeaveRequests}
                userRole={(session?.user as any)?.role || null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={requestDialog.open}
        onOpenChange={(open) => setRequestDialog(prev => ({ ...prev, open }))}
        mode={requestDialog.mode}
        request={requestDialog.selectedRequest || undefined}
        leaveTypes={leaveTypes}
        onSuccess={handleRequestSuccess}
      />

      {/* Leave Approval Dialog */}
      <LeaveApprovalDialog
        open={approvalDialog.open}
        onOpenChange={(open) => setApprovalDialog(prev => ({ ...prev, open }))}
        request={approvalDialog.request || undefined}
        onSuccess={handleApprovalSuccess}
      />
    </div>
  );
}
