import { NextRequest, NextResponse } from 'next/server';
import { computeRisk } from '@/lib/ml';
import { getPatient, updatePatientRisk } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    // If patientId provided, derive defaults from patient
    let patientAge = payload.age;
    let symptoms = payload.symptoms;
    let hasChronic = !!payload.hasChronic;
    if(payload.patientId) {
      const p = getPatient(payload.patientId);
      if(!p) return NextResponse.json({ ok:false, error:'Patient not found' }, { status:404 });
      if(typeof patientAge !== 'number') patientAge = p.age;
      if(!Array.isArray(symptoms)) symptoms = p.records[0]?.symptoms || [];
      if(typeof hasChronic !== 'boolean') hasChronic = !!p.chronic;
    }
    if (typeof patientAge !== 'number' || !Array.isArray(symptoms)) {
      return NextResponse.json({ ok:false, error:'Invalid payload (age/symptoms)' }, { status:400 });
    }
    const risk = computeRisk({
      age: patientAge,
      symptoms,
      hasChronic,
      vitals: payload.vitals,
      followUpDays: payload.followUpDays
    });
    if(payload.patientId) updatePatientRisk(payload.patientId, { score:risk.score, level:risk.level, model_version:risk.model_version });
    return NextResponse.json({ ok:true, risk, cached: !!payload.patientId });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 });
  }
}
