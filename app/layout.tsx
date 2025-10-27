import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/lib/convex';
import { ClientSessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/toaster';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tailoring Business Management System',
  description: 'Comprehensive management system for tailoring businesses',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider session={session}>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClientSessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
