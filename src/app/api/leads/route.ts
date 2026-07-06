import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';
import { CRMFilters } from '@/lib/types/lead';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const store = LeadStore.getInstance();

    const filters: Partial<CRMFilters> = {
      searchQuery: searchParams.get('searchQuery') || '',
      country: searchParams.get('country') || 'All',
      industry: searchParams.get('industry') || 'All',
      platform: searchParams.get('platform') || 'All',
      priority: searchParams.get('priority') || 'All',
      websiteStatus: searchParams.get('websiteStatus') || 'All',
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : 0,
    };

    const leads = store.getAllLeads(filters);
    const metrics = store.getMetrics();

    return NextResponse.json({
      success: true,
      leads,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pipelineStatus, userNote, tagToAdd, tagToRemove } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });
    }

    const store = LeadStore.getInstance();
    const lead = store.getLeadById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    if (pipelineStatus) {
      lead.pipelineStatus = pipelineStatus;
    }

    if (userNote) {
      lead.userNotes.unshift(`[${new Date().toLocaleTimeString()}] ${userNote}`);
    }

    if (tagToAdd && !lead.tags.includes(tagToAdd)) {
      lead.tags.push(tagToAdd);
    }

    if (tagToRemove) {
      lead.tags = lead.tags.filter((t) => t !== tagToRemove);
    }

    store.saveLead(lead);

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 });
    }

    const store = LeadStore.getInstance();
    const deleted = store.deleteLead(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
