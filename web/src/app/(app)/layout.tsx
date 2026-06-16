
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { ChatBot } from '@/components/chatbot/chatbot';
import {getCurrentUser} from '@/lib/auth';
import {AuthProvider} from '@/context/auth-context';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
      <AuthProvider initialUser={user}>
        <SidebarProvider>
          <MainSidebar />
          <SidebarInset className="bg-background">
            <Header />
            <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
              {children}
            </main>
            <ChatBot />
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
  );
}
