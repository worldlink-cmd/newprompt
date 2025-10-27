'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { Design, DesignCategory } from '../../../types';

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [fabricId, setFabricId] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('true');

  useEffect(() => {
    fetchDesigns();
  }, [search, category, fabricId, isActive]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (fabricId) params.append('fabricId', fabricId);
      if (isActive !== '') params.append('isActive', isActive);

      const response = await fetch(`/api/designs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.designs);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Design Catalog</h1>
          <p className="text-muted-foreground">Manage your design templates and patterns</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Design
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
                  placeholder="Search designs..."
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
                {Object.values(DesignCategory).map((cat) => (
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

      {/* Design Grid */}
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
        ) : designs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No designs found</p>
          </div>
        ) : (
          designs.map((design) => (
            <Card key={design.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                    <CardDescription>{design.description}</CardDescription>
                  </div>
                  <Badge variant={design.isActive ? 'default' : 'secondary'}>
                    {design.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {design.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={design.imageUrl}
                      alt={design.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{design.category}</Badge>
                  </div>
                  {design.style && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style:</span>
                      <span>{design.style}</span>
                    </div>
                  )}
                  {design.fabric && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabric:</span>
                      <span>{design.fabric.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
