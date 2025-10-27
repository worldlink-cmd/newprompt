'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RefreshCw, Users, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { fetchWorkloadData } from '../../lib/api/tasks';
import { useToast } from '../../hooks/use-toast';

interface WorkloadData {
  employeeWorkload: Array<{
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    role: string;
    activeTasks: number;
    totalEstimatedHours: number;
    overdueTasks: number;
    capacity: number;
    utilization: number;
    skills: string[];
  }>;
  taskDistribution: Array<{
    stage: string;
    count: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
  }>;
  summary: {
    totalEmployees: number;
    totalActiveTasks: number;
    totalOverdueTasks: number;
    averageUtilization: number;
  };
}

export function WorkloadDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWorkloadData();
      setData(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load workload data');
      toast({
        title: 'Error',
        description: 'Failed to load workload data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error || 'No data available'}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 100) return 'bg-red-100';
    if (utilization >= 80) return 'bg-orange-100';
    if (utilization >= 60) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{data.summary.totalEmployees}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{data.summary.totalActiveTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold text-red-600">{data.summary.totalOverdueTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className={`text-2xl font-bold ${getUtilizationColor(data.summary.averageUtilization)}`}>
                {data.summary.averageUtilization.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Workload */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Employee Workload</CardTitle>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.employeeWorkload.map((employee) => (
              <div key={employee.employeeId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{employee.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {employee.employeeNumber} • {employee.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getUtilizationColor(employee.utilization)}`}>
                      {employee.utilization.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Utilization</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{employee.activeTasks}</div>
                    <div className="text-xs text-muted-foreground">Active Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{employee.totalEstimatedHours}h</div>
                    <div className="text-xs text-muted-foreground">Est. Hours</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${employee.overdueTasks > 0 ? 'text-red-600' : ''}`}>
                      {employee.overdueTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUtilizationBgColor(employee.utilization)}`}
                    style={{ width: `${Math.min(employee.utilization, 100)}%` }}
                  ></div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {employee.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {employee.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.taskDistribution.map((item) => (
                <div key={item.stage} className="flex justify-between items-center">
                  <span className="text-sm">{item.stage.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${data.summary.totalActiveTasks > 0 ? (item.count / data.summary.totalActiveTasks) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.priorityDistribution.map((item) => (
                <div key={item.priority} className="flex justify-between items-center">
                  <span className="text-sm">{item.priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${data.summary.totalActiveTasks > 0 ? (item.count / data.summary.totalActiveTasks) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
