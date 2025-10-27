import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, CheckSquare, UserCheck, Calendar, Clock, FileText, Palette, Image, Package, Truck, ShoppingCart, Wrench, Trash2, BarChart3, Settings } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Track customer information, measurements, and preferences.',
      href: '/login',
      badge: 'CRM'
    },
    {
      icon: ShoppingBag,
      title: 'Order Management',
      description: 'Manage orders from intake to delivery with full workflow tracking.',
      href: '/login',
      badge: 'Orders'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Assign and track tasks for different stages of production.',
      href: '/login',
      badge: 'Tasks'
    },
    {
      icon: UserCheck,
      title: 'Employee Management',
      description: 'Manage staff, schedules, attendance, and performance.',
      href: '/login',
      badge: 'HR'
    },
    {
      icon: Calendar,
      title: 'Scheduling',
      description: 'Create and manage employee schedules and templates.',
      href: '/login',
      badge: 'Schedule'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Clock in/out system with detailed attendance reports.',
      href: '/login',
      badge: 'Attendance'
    },
    {
      icon: FileText,
      title: 'Leave Management',
      description: 'Handle leave requests, approvals, and balance tracking.',
      href: '/login',
      badge: 'Leave'
    },
    {
      icon: Palette,
      title: 'Fabric Management',
      description: 'Catalog and manage fabric inventory and suppliers.',
      href: '/login',
      badge: 'Inventory'
    },
    {
      icon: Image,
      title: 'Design Catalog',
      description: 'Maintain a catalog of designs and patterns.',
      href: '/login',
      badge: 'Designs'
    },
    {
      icon: Package,
      title: 'Inventory Control',
      description: 'Track stock levels, low stock alerts, and material usage.',
      href: '/login',
      badge: 'Inventory'
    },
    {
      icon: Truck,
      title: 'Supplier Management',
      description: 'Manage suppliers, purchase orders, and payments.',
      href: '/login',
      badge: 'Suppliers'
    },
    {
      icon: ShoppingCart,
      title: 'Purchase Orders',
      description: 'Create and track purchase orders for materials.',
      href: '/login',
      badge: 'Purchasing'
    },
    {
      icon: Wrench,
      title: 'Material Usage',
      description: 'Track material usage and costs for orders.',
      href: '/login',
      badge: 'Usage'
    },
    {
      icon: Trash2,
      title: 'Waste Management',
      description: 'Monitor and reduce waste in production processes.',
      href: '/login',
      badge: 'Waste'
    },
    {
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Generate financial reports and analytics.',
      href: '/login',
      badge: 'Reports'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure system settings and user permissions.',
      href: '/login',
      badge: 'Admin'
    }
  ];

  const roles = [
    {
      title: 'Admin',
      description: 'Full access to all features and management tools.',
      icon: Settings
    },
    {
      title: 'Manager',
      description: 'Manage orders, staff, and business operations.',
      icon: UserCheck
    },
    {
      title: 'Cutter',
      description: 'Handle fabric cutting and preparation tasks.',
      icon: Wrench
    },
    {
      title: 'Stitcher',
      description: 'Perform stitching and sewing operations.',
      icon: ShoppingBag
    },
    {
      title: 'Presser',
      description: 'Manage pressing and finishing processes.',
      icon: Package
    },
    {
      title: 'Delivery',
      description: 'Handle order delivery and logistics.',
      icon: Truck
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tailoring Business Management</h1>
              <p className="text-muted-foreground">Comprehensive solution for tailoring operations</p>
            </div>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Streamline Your Tailoring Business
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive management system designed specifically for tailoring businesses.
            Manage customers, orders, employees, inventory, and more in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your tailoring business efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {feature.description}
                  </CardDescription>
                  <Link href={feature.href}>
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Access Feature
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">User Roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Role-based access control for different team members
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <role.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of tailoring businesses already using our platform
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Login to Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 Tailoring Business Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
