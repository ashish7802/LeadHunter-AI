import { NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export async function GET() {
  const store = LeadStore.getInstance();
  const analytics = store.getAnalytics();
  return NextResponse.json(analytics);
}
