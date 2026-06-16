
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
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/language-context";
import { FilePlus, Search, PlusCircle, Download, CheckSquare, Square } from "lucide-react";
import { usePrescriptions } from '@/hooks/use-prescriptions';
import { usePatients } from '@/hooks/use-patients';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';

const statusVariant = (delivered?: boolean) => delivered ? 'default' : 'secondary';

export default function PrescriptionsPage() {
  const { t } = useLanguage();
  const { prescriptions, loading, error, create, toggleDelivered } = usePrescriptions();
  const { patients } = usePatients();
  const { user } = useAuth();
  const [search,setSearch] = useState('');
  const [open,setOpen] = useState(false);
  const [form,setForm] = useState({ patientId:'', medName:'', dosage:'', duration:'' });
  const filtered = useMemo(()=> prescriptions.filter(p=> !search || p.id.toLowerCase().includes(search.toLowerCase()) ), [prescriptions, search]);
  const patientMap = useMemo(()=> Object.fromEntries(patients.map(p=>[p.id, p])), [patients]);

  async function handleAdd() {
    if(!form.patientId || !form.medName || !form.dosage) return;
    await create({ patientId: form.patientId, doctor: user?.email || 'doctor@example.com', meds:[{ name: form.medName, dosage: form.dosage, duration: form.duration||'5d' }] });
    setForm({ patientId:'', medName:'', dosage:'', duration:'' });
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <FilePlus className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t('sidebar.prescriptions')}</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {t('prescriptions.description')}
        </p>
      </div>

       <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>{t('prescriptions.prescriptionList')}</CardTitle>
                        <CardDescription>{t('prescriptions.prescriptionListDescription')}</CardDescription>
                    </div>
                     <div className="flex gap-2 w-full sm:w-auto">
                       <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('prescriptions.searchPlaceholder')} className="pl-10" />
                       </div>
                       <Dialog open={open} onOpenChange={setOpen}>
                         <DialogTrigger asChild>
                           <Button>
                             <PlusCircle className="mr-2 h-4 w-4" />
                             {t('prescriptions.newPrescription')}
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="max-w-md">
                           <DialogHeader>
                             <DialogTitle>New Prescription</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-3 py-2">
                             <div className="space-y-1">
                               <label className="text-xs font-medium">Patient</label>
                               <select aria-label="Patient" value={form.patientId} onChange={e=>setForm(f=>({...f, patientId:e.target.value}))} className="w-full border rounded px-2 py-1 text-sm bg-background">
                                 <option value="">Select</option>
                                 {patients.map(p=> <option key={p.id} value={p.id}>{p.name} ({p.age})</option>)}
                               </select>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                               <div className="col-span-1 space-y-1">
                                 <label className="text-xs font-medium">Med Name</label>
                                 <Input value={form.medName} onChange={e=>setForm(f=>({...f, medName:e.target.value}))} />
                               </div>
                               <div className="col-span-1 space-y-1">
                                 <label className="text-xs font-medium">Dosage</label>
                                 <Input value={form.dosage} onChange={e=>setForm(f=>({...f, dosage:e.target.value}))} placeholder="1-0-1" />
                               </div>
                               <div className="col-span-1 space-y-1">
                                 <label className="text-xs font-medium">Duration</label>
                                 <Input value={form.duration} onChange={e=>setForm(f=>({...f, duration:e.target.value}))} placeholder="5d" />
                               </div>
                             </div>
                             <div className="flex justify-end gap-2 pt-2">
                               <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                               <Button type="button" onClick={handleAdd} disabled={!form.patientId || !form.medName || !form.dosage}>Save</Button>
                             </div>
                           </div>
                         </DialogContent>
                       </Dialog>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('prescriptions.prescriptionID')}</TableHead>
                            <TableHead>{t('prescriptions.patientName')}</TableHead>
                            <TableHead>{t('prescriptions.prescribedBy')}</TableHead>
                            <TableHead>{t('prescriptions.date')}</TableHead>
                            <TableHead>{t('prescriptions.status')}</TableHead>
                            <TableHead className="text-right">{t('prescriptions.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono">{item.id}</TableCell>
                            <TableCell className="font-medium">{patientMap[item.patientId]?.name || item.patientId}</TableCell>
                            <TableCell>{item.doctor}</TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(item.delivered)}>{item.delivered ? 'Filled' : 'Pending'}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="sm" onClick={()=>toggleDelivered(item.id, !item.delivered)}>
                                {item.delivered ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />} {item.delivered ? 'Mark Pending' : 'Mark Filled'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                {t('records.download')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!loading && !filtered.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm">No prescriptions</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>

  </div>
  );
}
