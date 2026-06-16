import { NextRequest, NextResponse } from 'next/server';
import { createPatient, listPatients } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await listPatients());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, age, gender } = body || {};
    if(!name || !age) return NextResponse.json({ ok:false, error:'Missing fields' }, { status:400 });
    const p = await createPatient({ name, age: Number(age), gender });
    return NextResponse.json({ ok:true, patient: p });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
