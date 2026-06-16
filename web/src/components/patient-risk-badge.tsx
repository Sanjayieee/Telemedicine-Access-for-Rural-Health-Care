"use client";
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Vitals { systolic?: number; diastolic?: number; pulse?: number; spo2?: number; tempC?: number; }
interface RiskState { score:number; level:'low'|'moderate'|'high'; factors:string[]; model_version:string; disclaimer:string; }
interface CachedRisk { score:number; level:'low'|'moderate'|'high'; updatedAt?:number; model_version?:string; }

export function PatientRiskBadge({ age, symptoms, chronic, vitals, followUpDays, patientId, cachedRisk }:{ age:number; symptoms:string[]; chronic:boolean; vitals?:Vitals; followUpDays?:number; patientId?:string; cachedRisk?:CachedRisk|null }) {
  const [risk,setRisk] = useState<RiskState|null>(null);
  const [err,setErr] = useState<string|null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check if cached risk is recent (within 24 hours)
  const isCacheValid = cachedRisk && cachedRisk.updatedAt && (Date.now() - cachedRisk.updatedAt) < 24 * 60 * 60 * 1000;

  const fetchRisk = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid && cachedRisk) {
      // Use cached risk
      setRisk({
        score: cachedRisk.score,
        level: cachedRisk.level,
        factors: [],
        model_version: cachedRisk.model_version || 'unknown',
        disclaimer: "Using cached risk assessment"
      });
      return;
    }

    setErr(null); 
    if (forceRefresh) setRefreshing(true);
    else setRisk(null);
    
    try {
      const payload = patientId ? 
        { patientId } : 
        { age, symptoms, hasChronic: chronic, vitals, followUpDays };
      
      const res = await fetch('/api/ml/risk', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify(payload) 
      });
      const data = await res.json();
      if(!res.ok || !data.ok) { 
        setErr(data.error||'Error'); 
        return; 
      }
      setRisk(data.risk);
    } catch(e:any){ 
      setErr(e.message); 
    } finally { 
      setRefreshing(false);
    }
  };

  useEffect(()=>{
    fetchRisk();
  },[age, chronic, followUpDays, vitals?.systolic, vitals?.diastolic, vitals?.pulse, vitals?.spo2, vitals?.tempC, symptoms.join('|'), patientId, cachedRisk?.updatedAt]);

  if(err) return <span className="text-xs px-2 py-1 rounded bg-gray-300 text-gray-700" title={err}>Risk N/A</span>;
  if(!risk) return <span className="text-xs px-2 py-1 rounded bg-gray-200 animate-pulse">Risk...</span>;
  
  const color = risk.level==='high' ? 'bg-red-600' : risk.level==='moderate' ? 'bg-amber-500' : 'bg-emerald-600';
  const cacheIndicator = isCacheValid ? '📋' : '';
  
  return (
    <div className="inline-flex items-center gap-1">
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded text-white ${color}`} title={`${cacheIndicator}Model: ${risk.model_version}\n${risk.disclaimer}\nFactors: ${risk.factors.join(', ')}`}>
        {cacheIndicator}{risk.level.toUpperCase()} {risk.score}
      </span>
      {patientId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchRisk(true)}
          disabled={refreshing}
          className="h-6 w-6 p-0"
          title="Refresh risk assessment"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}
