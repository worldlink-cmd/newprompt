'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Download, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { PeriodType, PayrollStatus } from '../../../types';

interface Payroll {
  id: string;
  period: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  baseSalary: number;
  overtimePay: number;
  commissionPay: number;
  bonusPay: number;
  totalEarnings: number;
  taxDeductions: number;
  otherDeductions: number;
  netPay: number;
  status: PayrollStatus;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

interface PayrollFormData {
  employeeId: string;
  period: string;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
}

export default function PayrollPage() {
  const { data: session } = useSession();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<PayrollFormData>({
    employeeId: '',
    period: '',
    periodType: PeriodType.MONTHLY,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await fetch('/api/payroll');
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data.payrolls);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPayrolls();
        setFormData({
          employeeId: '',
          period: '',
          periodType: PeriodType.MONTHLY,
          startDate: '',
          endDate: '',
        });
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPayslip = async (payrollId: string, format: 'pdf' | 'html') => {
    try {
      const response = await fetch(`/api/payroll/${payrollId}/payslip?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${payrollId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
    }
  };

  const getStatusBadge = (status: PayrollStatus) => {
    switch (status) {
      case PayrollStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case PayrollStatus.APPROVED:
        return <Badge variant="default">Approved</Badge>;
      case PayrollStatus.PAID:
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case PayrollStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee payrolls and generate payslips</p>
        </div>
      </div>

      <Tabs defaultValue="payrolls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payrolls">Payrolls</TabsTrigger>
          <TabsTrigger value="generate">Generate Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payrolls</CardTitle>
              <CardDescription>View and manage generated payrolls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Tax Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payroll.employee.firstName} {payroll.employee.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payroll.employee.employeeNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payroll.period}</div>
                          <div className="text-sm text-muted-foreground">
                            {payroll.periodType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>AED {payroll.totalEarnings.toFixed(2)}</TableCell>
                      <TableCell>AED {payroll.taxDeductions.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        AED {payroll.netPay.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPayslip(payroll.id, 'pdf')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPayslip(payroll.id, 'html')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Payroll</CardTitle>
              <CardDescription>Create a new payroll for an employee</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneratePayroll} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Enter employee ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <Input
                      id="period"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      placeholder="e.g., 2023-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodType">Period Type</Label>
                    <Select
                      value={formData.periodType}
                      onValueChange={(value: PeriodType) => setFormData({ ...formData, periodType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PeriodType.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={PeriodType.BI_WEEKLY}>Bi-weekly</SelectItem>
                        <SelectItem value={PeriodType.WEEKLY}>Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={generating}>
                  {generating ? 'Generating...' : 'Generate Payroll'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
