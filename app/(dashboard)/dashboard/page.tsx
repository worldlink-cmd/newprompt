import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name} ({session.user?.role})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-muted-foreground">Placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-muted-foreground">Placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-muted-foreground">Placeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0</p>
            <p className="text-muted-foreground">Placeholder</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">New Order</Button>
            <Button variant="outline" className="w-full">View Tasks</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
