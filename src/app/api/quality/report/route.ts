import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  try {
    const store = LeadStore.getInstance();
    const report = store.generateQualityReport();
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
