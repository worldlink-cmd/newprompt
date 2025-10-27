'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../../types';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [lowStock, setLowStock] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('true');

  useEffect(() => {
    fetchItems();
  }, [search, category, lowStock, isActive]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (lowStock === 'true') params.append('lowStock', 'true');
      if (isActive !== '') params.append('isActive', isActive);

      const response = await fetch(`/api/inventory?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (item: InventoryItem) => {
    return Number(item.currentStock) <= Number(item.minStockLevel);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage materials, fabrics, and accessories</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
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
                  placeholder="Search inventory..."
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
                {Object.values(InventoryCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={lowStock} onValueChange={setLowStock}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Low Stock</SelectItem>
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

      {/* Inventory Grid */}
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
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No inventory items found</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {isLowStock(item) && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.imageUrls.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span>{item.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{item.category.replace('_', ' ')}</Badge>
                  </div>
                  {item.unitPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span>{item.currency} {item.unitPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className={isLowStock(item) ? 'text-red-600 font-medium' : ''}>
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Level:</span>
                    <span>{item.minStockLevel} {item.unit}</span>
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
