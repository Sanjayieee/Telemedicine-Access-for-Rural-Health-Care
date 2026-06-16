import {NextRequest, NextResponse} from 'next/server';
import {createPatient, getPatient, listPatients, listPrescriptions, listStockItems} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expect shape similar to SyncPayload
    const created: string[] = [];
    const skipped: string[] = [];
    if(Array.isArray(body.patients)) {
      for(const p of body.patients) {
        if(await getPatient(p.id)) { skipped.push(p.id); continue; }
        await createPatient(p); created.push(p.id);
      }
    }
    return NextResponse.json({ok:true, createdCount: created.length, skippedCount: skipped.length});
  } catch (e:any) {
    return NextResponse.json({ok:false, error: e.message}, {status:400});
  }
}

export async function GET() {
  // Simple export - just return basic status
  return NextResponse.json({ status: 'sync not implemented' });
}
