import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData, resetData, isEmpty, listPatients, listPrescriptions, listStock } from '@/lib/db';

export async function POST(req: NextRequest) {
  if(process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok:false, error:'Seeding disabled in production' }, { status:403 });
  }
  try {
    const body = await req.json().catch(()=>({}));
    if(body.reset) {
      await resetData();
    }
    let result = await seedDemoData();
    if(result.skipped) {
      // Already had data; return counts
      const patients = await listPatients();
      const prescriptions = await listPrescriptions();
      const stock = await listStock();
      result = {
        skipped:true,
        patients: patients.length,
        prescriptions: prescriptions.length,
        stock: stock.length,
      } as any;
    }
    return NextResponse.json({ ok:true, ...result, empty: await isEmpty() });
  } catch(e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 });
  }
}
