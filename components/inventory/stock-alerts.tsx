'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import { InventoryItem } from '../../types';

export default function StockAlerts() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/low-stock');
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-4 w-4 text-green-500" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All items are above minimum stock levels.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
          Stock Alerts
        </CardTitle>
        <CardDescription>
          Items below minimum stock levels ({lowStockItems.length} items)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {item.imageUrls.length > 0 ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.sku} | Current: {item.currentStock} {item.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="destructive">
                  Low Stock
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Min: {item.minStockLevel} {item.unit}
                </p>
              </div>
            </div>
          ))}
          {lowStockItems.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              +{lowStockItems.length - 5} more items
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
