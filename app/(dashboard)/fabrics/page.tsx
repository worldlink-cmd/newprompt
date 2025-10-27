'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { Fabric, FabricCategory } from '../../../types';

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('true');

  useEffect(() => {
    fetchFabrics();
  }, [search, category, isActive]);

  const fetchFabrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (isActive !== '') params.append('isActive', isActive);

      const response = await fetch(`/api/fabrics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFabrics(data.fabrics);
      }
    } catch (error) {
      console.error('Error fetching fabrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fabric Catalog</h1>
          <p className="text-muted-foreground">Manage your fabric inventory and samples</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Fabric
        </Button>
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
                  placeholder="Search fabrics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {Object.values(FabricCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fabric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : fabrics.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No fabrics found</p>
          </div>
        ) : (
          fabrics.map((fabric) => (
            <Card key={fabric.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{fabric.name}</CardTitle>
                    <CardDescription>{fabric.description}</CardDescription>
                  </div>
                  <Badge variant={fabric.isActive ? 'default' : 'secondary'}>
                    {fabric.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {fabric.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={fabric.imageUrl}
                      alt={fabric.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{fabric.category}</Badge>
                  </div>
                  {fabric.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{fabric.color}</span>
                    </div>
                  )}
                  {fabric.pricePerMeter && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price/Meter:</span>
                      <span>${fabric.pricePerMeter}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span>{fabric.stockQuantity} meters</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
