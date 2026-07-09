import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';
import { UserFeedbackType } from '@/lib/types/lead';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, feedback } = body;

    if (!leadId || !feedback) {
      return NextResponse.json({ success: false, error: 'leadId and feedback required' }, { status: 400 });
    }

    const store = LeadStore.getInstance();
    
    const updatedLead = store.submitFeedback(leadId, feedback as UserFeedbackType);
    if (!updatedLead) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
