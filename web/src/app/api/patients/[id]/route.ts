import { NextRequest, NextResponse } from 'next/server';
import { getPatient, updatePatientChronic } from '@/lib/db';

// PATCH /api/patients/:id  { chronic: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { chronic } = body || {};
    if (typeof chronic !== 'boolean') {
      return NextResponse.json({ ok:false, error:'chronic boolean required' }, { status:400 });
    }
    const updated = updatePatientChronic(id, chronic);
    if(!updated) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
    return NextResponse.json({ ok:true, patient: getPatient(id) });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 });
  }
}
