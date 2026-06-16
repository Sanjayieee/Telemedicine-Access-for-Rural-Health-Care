"use client";

import { SymptomCheckerClient } from "@/components/symptom-checker-client";
import { useLanguage } from "@/context/language-context";
import { Stethoscope } from "lucide-react";

export default function SymptomCheckerPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t('symptomChecker.title')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('symptomChecker.description')}
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-400 mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-700/50">
          <strong>🏥 Rural Telemedicine AI:</strong> {t('symptomChecker.disclaimer')}
        </p>
        <div className="text-sm text-green-700 dark:text-green-400 mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-700/50">
          <strong>📋 Structured Analysis Includes:</strong>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>Possible medical conditions</li>
            <li>Urgency level (Emergency/Medium/Low)</li>
            <li>Recommended actions & next steps</li>
            <li>Ayushman Bharat/ABHA coverage info</li>
          </ul>
        </div>
      </div>

      <SymptomCheckerClient />

    </div>
  );
}
