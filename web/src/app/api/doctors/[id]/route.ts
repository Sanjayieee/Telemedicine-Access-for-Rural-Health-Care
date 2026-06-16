import { NextRequest, NextResponse } from 'next/server';
import { getDoctor, updateDoctor, deleteDoctor } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctor = await getDoctor(id);
    
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    return NextResponse.json(doctor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const doctor = await updateDoctor(id, body);
    
    if (!doctor) {
      return NextResponse.json({ ok: false, error: 'Doctor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, doctor });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteDoctor(id);
    
    if (!success) {
      return NextResponse.json({ ok: false, error: 'Doctor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}