import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { Button } from '../../components/ui/button';
import { Users, ShoppingBag, Palette, Image, CheckSquare, UserCheck, Calendar, Clock, FileText, Package, Truck, ShoppingCart, Wrench, Trash2 } from 'lucide-react';
import { UserRole } from '../../types';
import { DashboardHeader } from './components/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <nav className="mt-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                Overview
              </Button>
            </Link>
            {((session.user as any)?.role === UserRole.ADMIN || (session.user as any)?.role === UserRole.MANAGER) && (
              <Link href="/customers">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </Button>
              </Link>
            )}
            <Link href="/orders">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="ghost" className="w-full justify-start">
                <CheckSquare className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            </Link>
            {((session.user as any)?.role === UserRole.ADMIN || (session.user as any)?.role === UserRole.MANAGER) && (
              <>
                <Link href="/employees">
                  <Button variant="ghost" className="w-full justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Employees
                  </Button>
                </Link>
                <Link href="/schedules">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedules
                  </Button>
                </Link>
                <Link href="/attendance">
                  <Button variant="ghost" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Attendance
                  </Button>
                </Link>
                <Link href="/leave">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Leave Management
                  </Button>
                </Link>
                <Link href="/fabrics">
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Fabrics
                  </Button>
                </Link>
                <Link href="/designs">
                  <Button variant="ghost" className="w-full justify-start">
                    <Image className="mr-2 h-4 w-4" />
                    Designs
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Inventory
                  </Button>
                </Link>
                <Link href="/suppliers">
                  <Button variant="ghost" className="w-full justify-start">
                    <Truck className="mr-2 h-4 w-4" />
                    Suppliers
                  </Button>
                </Link>
                <Link href="/purchase-orders">
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase Orders
                  </Button>
                </Link>
                <Link href="/material-usage">
                  <Button variant="ghost" className="w-full justify-start">
                    <Wrench className="mr-2 h-4 w-4" />
                    Material Usage
                  </Button>
                </Link>
                <Link href="/waste">
                  <Button variant="ghost" className="w-full justify-start">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Waste Management
                  </Button>
                </Link>
              </>
            )}
            {/* Add more navigation items based on role */}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader userName={session.user?.name || 'User'} />

        {/* Content area */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
