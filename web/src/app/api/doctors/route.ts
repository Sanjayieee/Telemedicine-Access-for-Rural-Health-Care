import { NextRequest, NextResponse } from 'next/server';
import { createDoctor, listDoctors } from '@/lib/db';

export async function GET() {
  try {
    const doctors = await listDoctors();
    return NextResponse.json(doctors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, email, phone, specialization, department, license, 
      status, experience, qualification, address, emergencyContact 
    } = body || {};
    
    if (!name || !email || !specialization || !department || !license || !experience) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing required fields: name, email, specialization, department, license, experience' 
      }, { status: 400 });
    }
    
    const doctor = await createDoctor({ 
      name, 
      email, 
      phone, 
      specialization, 
      department, 
      license, 
      status: status || 'active',
      experience: Number(experience), 
      qualification: qualification || '',
      address, 
      emergencyContact 
    });
    
    return NextResponse.json({ ok: true, doctor });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}