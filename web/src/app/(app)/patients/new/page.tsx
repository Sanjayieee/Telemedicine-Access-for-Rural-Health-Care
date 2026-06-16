"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore - types added via @types/uuid dev dependency
import { v4 as uuid } from 'uuid';
// @ts-ignore - qrcode has its own types but fallback ignore if unresolved
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { queueSync } from '@/lib/offline';
import { usePatients } from '@/hooks/use-patients';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function NewPatientPage() {
  const router = useRouter();
  const [name,setName] = useState('');
  const [age,setAge] = useState<number | ''>('');
  const [gender,setGender] = useState('');
  const [qr,setQr] = useState<string | null>(null);
  const [id,setId] = useState('');
  const { create } = usePatients();
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);

  async function handleGenerate() {
    if(!name || !age) { setStatus('Name & age required'); return; }
    setBusy(true); setStatus('Generating...');
    try {
      const pid = uuid();
      setId(pid);
      const dataUrl = await QRCode.toDataURL(pid, { width: 240 });
      setQr(dataUrl);
      if(typeof navigator !== 'undefined' && !navigator.onLine) {
        // Queue offline draft
        await queueSync({ type:'patientDraft', patients:[{ id: pid, name, age:Number(age), gender, createdAt: Date.now(), updatedAt: Date.now(), records: [] }], records: [] });
        setStatus('Queued offline draft');
      } else {
        await create({ id: pid, name, age:Number(age), gender });
        setStatus('Patient created');
      }
    } catch(e:any) {
      setStatus(e.message);
    } finally {
      setBusy(false);
      setTimeout(()=>setStatus(''), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register Patient</CardTitle>
          <CardDescription>Generate a QR ID for a new patient (offline-capable soon).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <input aria-label="Name" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Age</label>
              <input aria-label="Age" placeholder="Age" type="number" value={age} onChange={e=>setAge(e.target.value?Number(e.target.value):'')} className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Gender</label>
              <select aria-label="Gender" value={gender} onChange={e=>setGender(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" disabled={busy} onClick={handleGenerate}>{busy ? 'Please wait...' : 'Generate QR'}</Button>
            <Button type="button" variant="secondary" onClick={()=>router.push('/patients')}>Back</Button>
          </div>
          {qr && (
            <div className="flex flex-col items-center gap-2">
              <img src={qr} alt="QR" className="border rounded bg-white p-2" />
              <p className="text-xs text-muted-foreground">Patient ID: {id}</p>
            </div>
          )}
          {status && <p className="text-xs text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
