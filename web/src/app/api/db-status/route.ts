import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseInfo } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const dbInfo = await getDatabaseInfo();
    return NextResponse.json({
      success: true,
      database: dbInfo
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: { type: 'unknown', connected: false }
    }, { status: 500 });
  }
}