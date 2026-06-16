
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import { Bell, Pill, ClipboardList, CalendarCheck } from "lucide-react";

const notifications = [
    { 
        icon: Pill, 
        title: "Medicine Reminder", 
        description: "Time to take your daily vitamins.", 
        time: "5 minutes ago",
        read: false,
    },
    { 
        icon: CalendarCheck, 
        title: "Appointment Confirmed", 
        description: "Your appointment with Dr. Anjali Sharma for tomorrow at 10:30 AM is confirmed.", 
        time: "1 hour ago",
        read: false,
    },
    { 
        icon: ClipboardList, 
        title: "Lab Report Available", 
        description: "Your Complete Blood Count report is now available in your Health Records.", 
        time: "3 hours ago",
        read: true,
    },
    { 
        icon: Pill, 
        title: "Medicine Reminder", 
        description: "Time to take Paracetamol (500mg).", 
        time: "8 hours ago",
        read: true,
    },
]

export default function NotificationsPage() {
  const { t } = useLanguage();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('notifications.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('notifications.description')}
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('notifications.recentNotifications')}</CardTitle>
                <CardDescription>{t('notifications.unread').replace('{count}', unreadCount.toString())}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notifications.map((item, index) => (
                        <div key={index} className={`flex items-start gap-4 p-4 rounded-lg ${!item.read ? 'bg-secondary/80' : 'bg-secondary/30'}`}>
                            <div className={`mt-1 p-2 rounded-full ${!item.read ? 'bg-primary/20' : 'bg-muted'}`}>
                                <item.icon className={`h-5 w-5 ${!item.read ? 'text-primary' : 'text-muted-foreground'}`}/>
                            </div>
                            <div className="flex-grow">
                                <p className={`font-semibold ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="text-right">
                                 <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
       </Card>

    </div>
  );
}
