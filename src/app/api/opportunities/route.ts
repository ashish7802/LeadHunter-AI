import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';
import { OpportunityStage } from '@/lib/types/lead';

export async function GET(req: NextRequest) {
  const store = LeadStore.getInstance();
  const { searchParams } = new URL(req.url);

  const filters = {
    searchQuery: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    industry: searchParams.get('industry') || '',
    platform: searchParams.get('platform') || '',
    priority: searchParams.get('priority') || '',
    websiteStatus: searchParams.get('websiteStatus') || '',
    minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : 0,
    maxScore: 100,
    opportunityValue: searchParams.get('opportunityValue') || '',
    service: searchParams.get('service') || '',
    stage: searchParams.get('stage') || '',
    assignedTo: searchParams.get('assignedTo') || '',
    isStarred: searchParams.get('isStarred') || '',
    hasFollowUp: searchParams.get('hasFollowUp') || '',
    label: searchParams.get('label') || '',
    meetingStatus: searchParams.get('meetingStatus') || '',
    proposalStatus: searchParams.get('proposalStatus') || '',
  };

  const leads = store.getAllLeads(filters);
  const metrics = store.getMetrics();

  return NextResponse.json({ leads, metrics, total: leads.length });
}

export async function PATCH(req: NextRequest) {
  const store = LeadStore.getInstance();
  const body = await req.json();
  const { id, action, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 });
  }

  let result = null;

  switch (action) {
    case 'updateStage':
      result = store.updateStage(id, data.stage as OpportunityStage, data.changedBy || 'User', data.note);
      break;
    case 'addNote':
      result = store.addNote(id, data.author || 'User', data.content, data.mentions);
      break;
    case 'addFollowUp':
      result = store.addFollowUp(id, {
        scheduledDate: data.scheduledDate,
        type: data.type || 'Email',
        assignedTo: data.assignedTo || 'User',
        notes: data.notes,
      });
      break;
    case 'completeFollowUp':
      result = store.completeFollowUp(id, data.followUpId);
      break;
    case 'toggleStar':
      result = store.toggleStar(id);
      break;
    case 'assign':
      result = store.setAssignment(id, data.teamMemberId);
      break;
    case 'setScore':
      result = store.setManualScore(id, data.score);
      break;
    case 'addLabel':
      result = store.addLabel(id, data.label);
      break;
    case 'removeLabel':
      result = store.removeLabel(id, data.label);
      break;
    case 'updateMeeting':
      result = store.updateMeetingStatus(id, data.meetingStatus);
      break;
    case 'updateProposal':
      result = store.updateProposalStatus(id, data.proposalStatus);
      break;
    case 'addTag': {
      const lead = store.getLeadById(id);
      if (lead && data.tag && !lead.tags.includes(data.tag)) {
        lead.tags.push(data.tag);
        result = store.saveLead(lead);
      }
      break;
    }
    case 'removeTag': {
      const leadForTag = store.getLeadById(id);
      if (leadForTag && data.tag) {
        leadForTag.tags = leadForTag.tags.filter((t: string) => t !== data.tag);
        result = store.saveLead(leadForTag);
      }
      break;
    }
    case 'updateStatus': {
      const leadForStatus = store.getLeadById(id);
      if (leadForStatus) {
        leadForStatus.pipelineStatus = data.pipelineStatus;
        result = store.saveLead(leadForStatus);
      }
      break;
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  if (!result) {
    return NextResponse.json({ error: 'Opportunity not found or action failed' }, { status: 404 });
  }

  return NextResponse.json({ success: true, lead: result });
}

export async function DELETE(req: NextRequest) {
  const store = LeadStore.getInstance();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 });
  }

  const deleted = store.deleteLead(id);
  return NextResponse.json({ success: deleted });
}
