"use client";
import { useEffect, useState, use } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PatientRiskBadge } from '@/components/patient-risk-badge';
import { extractSymptomsFromNote } from '@/lib/ml';
import { useAuth } from '@/context/auth-context';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Patient { id:string; name:string; age:number; gender?:string; createdAt:number; updatedAt:number; chronic?:boolean; lastRisk?:{score:number; level:'low'|'moderate'|'high'; updatedAt:number; model_version:string}; }
interface Record { id:string; note:string; type:string; createdAt:number; createdBy:string; vitals?:any; symptoms?:string[]; }

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const { user } = useAuth();
  const [patient,setPatient] = useState<Patient|null>(null);
  const [records,setRecords] = useState<Record[]>([]);
  const [note,setNote] = useState('');
  const [type,setType] = useState<'visit'|'lab'|'prescription'|'followup'>('visit');
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState('');
  const [saving,setSaving] = useState(false);
  const [chronic,setChronic] = useState(false);
  const [vitals,setVitals] = useState({ systolic:'', diastolic:'', pulse:'', spo2:'', tempC:'' });

  async function load() {
    setLoading(true); setErr('');
    try {
      const pRes = await fetch(`/api/patients`);
      const plist = await pRes.json();
      const p = plist.find((x:Patient)=>x.id===patientId);
  setPatient(p||null);
  if(p?.chronic) setChronic(true);
      const rRes = await fetch(`/api/patients/${patientId}/records`);
      const rdata = await rRes.json();
      setRecords(rdata);
    } catch(e:any){ setErr(e.message); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[patientId]);

  async function addRecord() {
    if(!note) return;
    setSaving(true);
    try {
      const vitalsPayload = Object.fromEntries(Object.entries(vitals).filter(([_,v])=>v!==''));
      const res = await fetch(`/api/patients/${patientId}/records`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ note, type, vitals: Object.keys(vitalsPayload).length? Object.fromEntries(Object.entries(vitalsPayload).map(([k,v])=>[k, Number(v)])) : undefined }) });
      const data = await res.json();
      if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
      setRecords(cur=>[data.record, ...cur]);
      setNote('');
      setVitals({ systolic:'', diastolic:'', pulse:'', spo2:'', tempC:'' });
    } catch(e:any){ setErr(e.message); }
    finally { setSaving(false); }
  }

  if(loading) return <p className="p-4 text-sm text-muted-foreground">Loading...</p>;
  if(err) return <p className="p-4 text-sm text-red-600">{err}</p>;
  if(!patient) return <p className="p-4 text-sm text-muted-foreground">Not found</p>;

  // Derive heuristic symptoms from most recent record note (basic demo)
  const latestNote = records[0]?.note || '';
  const symptoms = extractSymptomsFromNote(latestNote);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/patients"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>Back</Button></Link>
        <h1 className="text-2xl font-bold tracking-tight">{patient.name}</h1>
        <Badge variant="secondary">{patient.age}y</Badge>
        {patient.gender && <Badge>{patient.gender}</Badge>}
        {patient.chronic && <Badge variant="outline" className="border-amber-500 text-amber-600">Chronic</Badge>}
        <PatientRiskBadge 
          age={patient.age} 
          chronic={!!patient.chronic} 
          symptoms={symptoms} 
          patientId={patient.id}
          cachedRisk={patient.lastRisk}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add Record</CardTitle>
            <CardDescription>Visit, lab, prescription or follow-up note.</CardDescription>
          </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <input id="chronic" type="checkbox" checked={chronic} onChange={e=> setChronic(e.target.checked)} onBlur={async()=>{
                  // Persist chronic flag
                  await fetch(`/api/patients/${patientId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chronic }) });
                  load();
                }} />
                <label htmlFor="chronic" className="cursor-pointer select-none">Chronic condition</label>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Type</label>
                <select aria-label="Type" value={type} onChange={e=>setType(e.target.value as any)} className="w-full border rounded px-2 py-1 text-sm bg-background">
                  <option value="visit">Visit</option>
                  <option value="lab">Lab</option>
                  <option value="prescription">Prescription</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Note</label>
                <Textarea value={note} onChange={e=>setNote(e.target.value)} rows={5} placeholder="Clinical notes..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium">BP Sys</label>
                  <input aria-label="Systolic" className="border rounded px-2 py-1 text-xs" value={vitals.systolic} onChange={e=>setVitals(v=>({...v, systolic:e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium">BP Dia</label>
                  <input aria-label="Diastolic" className="border rounded px-2 py-1 text-xs" value={vitals.diastolic} onChange={e=>setVitals(v=>({...v, diastolic:e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium">Pulse</label>
                  <input aria-label="Pulse" className="border rounded px-2 py-1 text-xs" value={vitals.pulse} onChange={e=>setVitals(v=>({...v, pulse:e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium">SpO2</label>
                  <input aria-label="SpO2" className="border rounded px-2 py-1 text-xs" value={vitals.spo2} onChange={e=>setVitals(v=>({...v, spo2:e.target.value}))} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-medium">Temp (°C)</label>
                  <input aria-label="Temperature (C)" className="border rounded px-2 py-1 text-xs w-full" value={vitals.tempC} onChange={e=>setVitals(v=>({...v, tempC:e.target.value}))} />
                </div>
              </div>
              <Button disabled={!note || saving} onClick={addRecord}>{saving? 'Saving...' : 'Save Record'}</Button>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>{records.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {records.map(r=> (
                <li key={r.id} className="border rounded p-3 bg-secondary/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{r.type}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-snug">{r.note}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">by {r.createdBy}</p>
                </li>
              ))}
              {!records.length && <li className="text-sm text-muted-foreground">No records</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
