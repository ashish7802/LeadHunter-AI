import { NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';

export async function GET() {
  const store = LeadStore.getInstance();
  const recommendations = store.getAIRecommendations();
  return NextResponse.json({ recommendations });
}
