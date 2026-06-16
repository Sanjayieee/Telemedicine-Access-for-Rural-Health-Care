
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import { Activity, AlertTriangle, ArrowRight } from "lucide-react";

const cases = [
  {
    patientId: "P001",
    patientName: "Ramesh Kumar",
    issue: "High Fever & Chest Pain",
    priority: "High",
    date: "2024-07-28",
  },
  {
    patientId: "P015",
    patientName: "Sunita Devi",
    issue: "Irregular Heartbeat Detected",
    priority: "High",
    date: "2024-07-28",
  },
  {
    patientId: "P042",
    patientName: "Amit Singh",
    issue: "Abnormal Blood Sugar Levels",
    priority: "Medium",
    date: "2024-07-27",
  },
    {
    patientId: "P033",
    patientName: "Geeta Rani",
    issue: "Persistent Cough",
    priority: "Low",
    date: "2024-07-26",
  },
];

const getPriorityVariant = (priority: string) => {
    switch (priority) {
        case "High":
            return "destructive";
        case "Medium":
            return "default";
        case "Low":
            return "secondary";
        default:
            return "outline";
    }
}

export default function CasesPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('sidebar.cases')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('cases.description')}
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('cases.flaggedCases')}</CardTitle>
                <CardDescription>{t('cases.flaggedCasesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('cases.patientID')}</TableHead>
                            <TableHead>{t('cases.patientName')}</TableHead>
                            <TableHead>{t('cases.issue')}</TableHead>
                            <TableHead>{t('cases.priority')}</TableHead>
                            <TableHead>{t('cases.dateFlagged')}</TableHead>
                            <TableHead className="text-right">{t('cases.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cases.map((caseItem) => (
                            <TableRow key={caseItem.patientId}>
                                <TableCell className="font-medium">{caseItem.patientId}</TableCell>
                                <TableCell>{caseItem.patientName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {caseItem.priority === 'High' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                        {caseItem.issue}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getPriorityVariant(caseItem.priority)}>{caseItem.priority}</Badge>
                                </TableCell>
                                <TableCell>{caseItem.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                        {t('cases.reviewCase')} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>

    </div>
  );
}
