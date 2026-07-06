import { NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = LeadStore.getInstance();
    const history = store.getRunHistory();
    return NextResponse.json({ success: true, history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
