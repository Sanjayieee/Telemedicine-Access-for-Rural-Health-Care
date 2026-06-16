
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Video,
  ClipboardList,
  Pill,
  CalendarDays,
  LifeBuoy,
  Settings,
  Users,
  FilePlus,
  PackageSearch,
  Activity,
  MessageCircle,
  Database,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { useAuth } from '@/context/auth-context';
import type {UserRole} from '@/lib/auth';

const baseItems = {
  dashboard: { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  patients: { href: '/patients', icon: Users, labelKey: 'patients' },
  doctors: { href: '/doctors', icon: UserCheck, labelKey: 'doctors' },
  cases: { href: '/cases', icon: Activity, labelKey: 'cases' },
  consultations: { href: '/consultations', icon: Video, labelKey: 'consultations' },
  prescriptions: { href: '/prescriptions', icon: FilePlus, labelKey: 'prescriptions' },
  records: { href: '/records', icon: ClipboardList, labelKey: 'healthRecords' },
  pharmacy: { href: '/pharmacy', icon: PackageSearch, labelKey: 'pharmacy' },
  schedule: { href: '/schedule', icon: CalendarDays, labelKey: 'schedule' },
  symptomChecker: { href: '/symptom-checker', icon: Stethoscope, labelKey: 'symptomChecker' },
  chatDemo: { href: '/chat-demo', icon: MessageCircle, labelKey: 'chatbot' },
  toolbarDemo: { href: '/toolbar-demo', icon: Settings, labelKey: 'toolbarDemo' },
  dbStatus: { href: '/db-status', icon: Database, labelKey: 'databaseStatus' },
  support: { href: '/support', icon: LifeBuoy, labelKey: 'support' },
  settings: { href: '/settings', icon: Settings, labelKey: 'settings' },
};

const roleMenus: Record<UserRole, string[]> = {
  doctor: ['dashboard','patients','doctors','cases','consultations','prescriptions','records','symptomChecker','chatDemo','toolbarDemo'],
  health_worker: ['dashboard','patients','doctors','symptomChecker','chatDemo','toolbarDemo'],
  pharmacy: ['dashboard','pharmacy','prescriptions','chatDemo','toolbarDemo'],
  admin: ['dashboard','patients','doctors','cases','consultations','prescriptions','records','pharmacy','schedule','symptomChecker','chatDemo','toolbarDemo'],
  ngo: ['dashboard','cases','patients','doctors','chatDemo','toolbarDemo'],
};

export function MainSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const role = user?.role || 'doctor';
  const menuItems = roleMenus[role].map(k => baseItems[k as keyof typeof baseItems]).filter(Boolean);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary"><rect width="256" height="256" fill="none"></rect><path d="M128,24a104,104,0,1,0,104,104A104.2,104.2,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"></path><path d="M128,64a20,20,0,0,0-20,20v40H72a20,20,0,0,0,0,40h36v40a20,20,0,0,0,40,0V164h36a20,20,0,0,0,0-40H148V84A20,20,0,0,0,128,64Z"></path></svg>
          <span className="text-lg font-semibold">Swasthya Punjab</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: t(`sidebar.${item.labelKey}`) }}
                >
                  <item.icon />
                  <span>{t(`sidebar.${item.labelKey}`)}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
          <SidebarMenuItem>
            <Link href="#">
              <SidebarMenuButton tooltip={{ children: t('sidebar.support') }}>
                <LifeBuoy />
                <span>{t('sidebar.support')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="#">
              <SidebarMenuButton tooltip={{ children: t('sidebar.settings') }}>
                <Settings />
                <span>{t('sidebar.settings')}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
