'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
      redirect: false,
    });
    router.push('/login');
  };

  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  return (
    <header className="bg-card border-b p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {userName}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Profile</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleSettings}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
