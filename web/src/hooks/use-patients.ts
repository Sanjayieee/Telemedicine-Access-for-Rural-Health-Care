"use client";
import { useEffect, useState, useCallback } from 'react';

export interface PatientDTO { id:string; name:string; age:number; gender?:string; createdAt:number; updatedAt:number; }

export function usePatients() {
  const [patients,setPatients] = useState<PatientDTO[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string>('');

  const load = useCallback(async ()=>{
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/patients', { cache:'no-store' });
      if(!res.ok) throw new Error('Failed to load patients');
      const data = await res.json();
      setPatients(data);
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  },[]);

  const create = useCallback(async (p: {id?:string; name:string; age:number; gender?:string}) => {
    const res = await fetch('/api/patients', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) });
    const data = await res.json();
    if(!res.ok || !data.ok) throw new Error(data.error||'Failed');
    setPatients(cur=>[data.patient, ...cur]);
    return data.patient as PatientDTO;
  },[]);

  useEffect(()=>{ load(); },[load]);

  return { patients, loading, error, reload: load, create };
}
