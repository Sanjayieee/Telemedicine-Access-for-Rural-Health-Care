import { NextResponse } from 'next/server';
import { listStockItems } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await listStockItems());
}
