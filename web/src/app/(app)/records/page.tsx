
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";
import { ClipboardList, Download, FileText, FlaskConical, HeartPulse } from "lucide-react";

const records = [
    { type: "Prescription", title: "Follow-up for Hypertension", date: "July 15, 2024", doctor: "Dr. Anjali Sharma", icon: FileText },
    { type: "Lab Report", title: "Complete Blood Count (CBC)", date: "July 10, 2024", doctor: "Pathology Lab", icon: FlaskConical },
    { type: "Consultation Note", title: "General Check-up", date: "June 28, 2024", doctor: "Dr. Vikram Singh", icon: HeartPulse },
    { type: "Prescription", title: "Skin Rash Treatment", date: "May 10, 2024", doctor: "Dr. Priya Desai", icon: FileText },
]

export default function RecordsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('records.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('records.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('records.medicalHistory')}</CardTitle>
            <CardDescription>{t('records.historyDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {records.map((record, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-4">
                        <div className="flex items-center gap-4">
                            <record.icon className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{record.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">{record.type}</span> from {record.doctor}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto">
                            <p className="text-sm font-medium text-muted-foreground flex-grow">{record.date}</p>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4"/>
                                {t('records.download')}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
