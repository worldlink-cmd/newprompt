'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';

interface WasteRecord {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  date: Date;
  recordedBy: string;
}

export default function WastePage() {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  useEffect(() => {
    fetchWasteRecords();
  }, [search, reason, sortBy, sortOrder]);

  const fetchWasteRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (reason) params.append('reason', reason);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      // Since waste API might not be implemented yet, using mock data
      const mockData: WasteRecord[] = [
        {
          id: '1',
          materialName: 'Cotton Fabric',
          quantity: 2.5,
          unit: 'meters',
          reason: 'Cutting Error',
          cost: 25.00,
          date: new Date('2023-10-20'),
          recordedBy: 'John Doe'
        },
        {
          id: '2',
          materialName: 'Thread',
          quantity: 0.5,
          unit: 'spools',
          reason: 'Machine Malfunction',
          cost: 15.00,
          date: new Date('2023-10-19'),
          recordedBy: 'Jane Smith'
        }
      ];

      setWasteRecords(mockData);
    } catch (error) {
      console.error('Error fetching waste records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'cutting error':
        return 'destructive';
      case 'machine malfunction':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Waste Management</h1>
          <p className="text-muted-foreground">Track and analyze material waste</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Waste
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Waste Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$40.00</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waste Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wasteRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost per Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$20.00</div>
            <p className="text-xs text-muted-foreground">Average waste cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search waste records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Reasons</SelectItem>
                <SelectItem value="cutting_error">Cutting Error</SelectItem>
                <SelectItem value="machine_malfunction">Machine Malfunction</SelectItem>
                <SelectItem value="quality_issue">Quality Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Waste Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash2 className="mr-2 h-4 w-4" />
            Waste Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : wasteRecords.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mt-4">No waste records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wasteRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium">{record.materialName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{record.quantity} {record.unit}</span>
                      <span>•</span>
                      <Badge variant={getReasonColor(record.reason) as any}>
                        {record.reason.replace('_', ' ')}
                      </Badge>
                      <span>•</span>
                      <span>by {record.recordedBy}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">${record.cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
