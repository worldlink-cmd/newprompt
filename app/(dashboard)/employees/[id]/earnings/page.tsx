'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../components/ui/table';
import { Badge } from '../../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { Download } from 'lucide-react';
import { PeriodType, PayrollStatus } from '../../../../../types';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

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
}

interface EarningsSummary {
  totalEarnings: number;
  totalDeductions: number;
  totalNetPay: number;
  averageMonthlyEarnings: number;
  payrollCount: number;
}

export default function EmployeeEarningsPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      // Fetch employee details
      const employeeResponse = await fetch(`/api/employees/${employeeId}`);
      if (employeeResponse.ok) {
        const employeeData = await employeeResponse.json();
        setEmployee(employeeData);
      }

      // Fetch payrolls
      const payrollsResponse = await fetch(`/api/payroll?employeeId=${employeeId}`);
      if (payrollsResponse.ok) {
        const payrollsData = await payrollsResponse.json();
        setPayrolls(payrollsData.payrolls);

        // Calculate summary
        const summary = calculateSummary(payrollsData.payrolls);
        setSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (payrolls: Payroll[]): EarningsSummary => {
    const totalEarnings = payrolls.reduce((sum, p) => sum + p.totalEarnings, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + (p.taxDeductions + p.otherDeductions), 0);
    const totalNetPay = payrolls.reduce((sum, p) => sum + p.netPay, 0);
    const averageMonthlyEarnings = payrolls.length > 0 ? totalEarnings / payrolls.length : 0;

    return {
      totalEarnings,
      totalDeductions,
      totalNetPay,
      averageMonthlyEarnings,
      payrollCount: payrolls.length,
    };
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

  if (!employee) {
    return <div className="p-6">Employee not found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {employee.firstName} {employee.lastName} - Earnings
        </h1>
        <p className="text-muted-foreground">Employee Number: {employee.employeeNumber}</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {summary.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {summary.totalDeductions.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {summary.totalNetPay.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {summary.averageMonthlyEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payrolls" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payrolls">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>Complete payroll history for this employee</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                          <button
                            onClick={() => handleDownloadPayslip(payroll.id, 'pdf')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
