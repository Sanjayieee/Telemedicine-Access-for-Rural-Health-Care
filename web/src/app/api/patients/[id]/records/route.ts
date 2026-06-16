import { NextRequest, NextResponse } from 'next/server';
import { listPatientRecords, createPatientRecord } from '@/lib/db';
import { extractSymptomsFromNote } from '@/lib/ml';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await listPatientRecords(id));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { note, type, vitals } = body || {};
    if(!note || !type) return NextResponse.json({ ok:false, error:'Missing fields' }, { status:400 });
  const user = await getCurrentUser();
  const createdBy = user?.email || 'anonymous@example.com';
  // sanitize vitals
  let cleanVitals: any | undefined;
  if(vitals && typeof vitals === 'object') {
    const allowed = ['systolic','diastolic','pulse','spo2','tempC'];
    cleanVitals = {};
    for(const k of allowed) {
      if(vitals[k] !== undefined && vitals[k] !== null && vitals[k] !== '') {
        const num = Number(vitals[k]);
        if(!Number.isNaN(num)) cleanVitals[k] = num;
      }
    }
    if(Object.keys(cleanVitals).length === 0) cleanVitals = undefined;
  }
  const rec = await createPatientRecord({ 
    patientId: id, 
    note, 
    type, 
    createdBy,
    vitals: cleanVitals, 
    symptoms: extractSymptomsFromNote(note) 
  });
    return NextResponse.json({ ok:true, record: rec });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
