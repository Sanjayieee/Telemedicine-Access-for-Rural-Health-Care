import { NextRequest, NextResponse } from 'next/server';
import { createPrescription, listPrescriptions, updatePrescriptionDelivered } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') || undefined;
  return NextResponse.json(await listPrescriptions(patientId));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, doctor, meds } = body || {};
    if(!patientId || !doctor || !Array.isArray(meds) || !meds.length) return NextResponse.json({ ok:false, error:'Missing fields' }, { status:400 });
    const pres = createPrescription(patientId, doctor, meds);
    return NextResponse.json({ ok:true, prescription: pres });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, delivered } = body || {};
    if(!id) return NextResponse.json({ ok:false, error:'Missing id' }, { status:400 });
    const updated = await updatePrescriptionDelivered(id, !!delivered);
    if(!updated) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
    return NextResponse.json({ ok:true, prescription: updated });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
