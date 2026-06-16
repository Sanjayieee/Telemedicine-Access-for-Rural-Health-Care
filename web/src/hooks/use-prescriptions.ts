"use client";
import { useEffect, useState, useCallback } from 'react';

export interface Med { name:string; dosage:string; duration:string; }
export interface Prescription { id:string; patientId:string; doctor:string; createdAt:number; meds: Med[]; delivered?: boolean; }

export function usePrescriptions(patientId?: string) {
  const [items,setItems] = useState<Prescription[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const load = useCallback(async ()=>{
    setLoading(true); setError('');
    try {
      const url = patientId ? `/api/prescriptions?patientId=${encodeURIComponent(patientId)}` : '/api/prescriptions';
      const res = await fetch(url, { cache:'no-store' });
      if(!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  },[patientId]);

  const create = useCallback(async (payload: { patientId:string; doctor:string; meds: Med[] }) => {
    const res = await fetch('/api/prescriptions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
    setItems(cur=>[data.prescription, ...cur]);
    return data.prescription as Prescription;
  },[]);

  const toggleDelivered = useCallback(async (id:string, delivered:boolean) => {
    const res = await fetch('/api/prescriptions', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, delivered }) });
    const data = await res.json();
    if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
    setItems(cur=>cur.map(p=>p.id===id? data.prescription : p));
  },[]);

  useEffect(()=>{ load(); },[load]);

  return { prescriptions: items, loading, error, reload: load, create, toggleDelivered };
}
