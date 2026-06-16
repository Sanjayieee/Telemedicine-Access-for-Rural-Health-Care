
'use client';
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Users, Activity, FilePlus, PackageSearch, Database } from "lucide-react";
import { HealthWorkerOfflinePanel } from '@/components/health-worker-offline-panel';
import { TriagePanel } from '@/components/triage-panel';
import { useLanguage } from "@/context/language-context";
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const professionalFeatures = [
  {
    titleKey: "managePatients",
    descriptionKey: "addAndUpdatePatientRecords",
    href: "/patients",
    icon: UserPlus,
    ctaKey: "viewPatients",
  },
  {
    titleKey: "reviewCases",
    descriptionKey: "reviewAIFlaggedCases",
    href: "/cases",
    icon: Activity,
    ctaKey: "reviewNow",
  },
  {
    titleKey: "teleconsultRequests",
    descriptionKey: "manageIncomingRequests",
    href: "/consultations",
    icon: Users,
    ctaKey: "viewRequests",
  },
  {
    titleKey: "updatePrescriptions",
    descriptionKey: "createAndManagePrescriptions",
    href: "/prescriptions",
    icon: FilePlus,
    ctaKey: "managePrescriptions",
  },
];


export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const role = user?.role || 'doctor';
  const [counts,setCounts] = useState<{patients:number; prescriptions:number; stock:number}|null>(null);
  const [seedStatus,setSeedStatus] = useState('');
  const [busy,setBusy] = useState(false);

  async function fetchCounts() {
    try {
      const [p, pres, st] = await Promise.all([
        fetch('/api/patients').then(r=>r.json()).catch(()=>[]),
        fetch('/api/prescriptions').then(r=>r.json()).catch(()=>[]),
        fetch('/api/stock').then(r=>r.json()).catch(()=>[]),
      ]);
      setCounts({ patients: p.length||0, prescriptions: pres.length||0, stock: st.length||0 });
    } catch {}
  }
  useEffect(()=>{ fetchCounts(); },[]);

  async function seed(reset=false) {
    setBusy(true); setSeedStatus(reset?'Resetting...':'Seeding...');
    try {
      const res = await fetch('/api/seed', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reset }) });
      const data = await res.json();
      if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
      setSeedStatus(data.skipped? 'Skipped (data exists)' : (reset ? 'Reset & Seeded' : 'Seeded'));
      fetchCounts();
      setTimeout(()=> setSeedStatus(''), 3000);
    } catch(e:any){ setSeedStatus(e.message); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex flex-col gap-8">
      <div>
  <h1 className="text-3xl font-bold tracking-tight">Dashboard – {role.replace('_',' ')}</h1>
  <p className="text-muted-foreground">Role-tailored view. (Demo)</p>
      </div>

      {role === 'doctor' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {professionalFeatures.map((feature) => (
          <Card key={feature.titleKey} className="flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">
                {t(`dashboard.professionalFeatures.${feature.titleKey}`)}
              </CardTitle>
              <feature.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {t(`dashboard.professionalFeatures.${feature.descriptionKey}`)}
              </p>
            </CardContent>
            <div className="p-6 pt-0">
               <Link href={feature.href}>
                <Button className="w-full">
                  {t(`dashboard.professionalFeatures.${feature.ctaKey}`)} <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
        </div>
      )}
      {role === 'health_worker' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-dashed"><CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Register patients, sync offline records, print QR cards.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">(Placeholder health worker tools)</p></CardContent></Card>
          <HealthWorkerOfflinePanel />
        </div>
      )}
      {role === 'doctor' && (
        <TriagePanel />
      )}
      {role === 'pharmacy' && (
        <Card className="border-dashed"><CardHeader><CardTitle>Stock Overview</CardTitle><CardDescription>Update inventory & view pending prescriptions.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">(Placeholder pharmacy widgets)</p></CardContent></Card>
      )}
      {role === 'admin' && (
        <Card className="border-dashed">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>High-level KPIs across facilities.</CardDescription>
            </div>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">Patients <Badge variant="secondary">{counts?.patients ?? 0}</Badge></div>
              <div className="flex items-center gap-1">Prescriptions <Badge variant="secondary">{counts?.prescriptions ?? 0}</Badge></div>
              <div className="flex items-center gap-1">Stock Items <Badge variant="secondary">{counts?.stock ?? 0}</Badge></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" disabled={busy} onClick={()=>seed(false)}>Seed Demo</Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={()=>seed(true)}>Reset & Seed</Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={fetchCounts}>Refresh Counts</Button>
            </div>
            {seedStatus && <p className="text-xs text-muted-foreground">{seedStatus}</p>}
            <p className="text-[11px] text-muted-foreground">Dev only seeding. Disabled in production.</p>
          </CardContent>
        </Card>
      )}
      {role === 'ngo' && (
        <Card className="border-dashed"><CardHeader><CardTitle>Outreach Snapshot</CardTitle><CardDescription>Villages covered & high-need cases.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">(Placeholder NGO stats)</p></CardContent></Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.analytics.title')}</CardTitle>
            <CardDescription>{t('dashboard.analytics.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('dashboard.analytics.placeholder')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.activity.title')}</CardTitle>
            <CardDescription>{t('dashboard.activity.description')}</CardDescription>
          </CardHeader>
          <CardContent>
               <p className="text-sm text-muted-foreground">{t('dashboard.activity.placeholder')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
