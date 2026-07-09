import { NextRequest, NextResponse } from 'next/server';
import { LeadStore } from '@/lib/db/store';
import { TeamRole } from '@/lib/types/lead';

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export async function GET() {
  const store = LeadStore.getInstance();
  const members = store.getAllTeamMembers();
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const store = LeadStore.getInstance();
  const body = await req.json();

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const existing = store.getAllTeamMembers();
  const colorIndex = existing.length % AVATAR_COLORS.length;

  const member = store.addTeamMember({
    name: body.name,
    email: body.email,
    role: (body.role as TeamRole) || 'Sales',
    color: body.color || AVATAR_COLORS[colorIndex],
  });

  return NextResponse.json({ success: true, member });
}

export async function PATCH(req: NextRequest) {
  const store = LeadStore.getInstance();
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const updated = store.updateTeamMember(body.id, {
    name: body.name,
    email: body.email,
    role: body.role,
    color: body.color,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, member: updated });
}

export async function DELETE(req: NextRequest) {
  const store = LeadStore.getInstance();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
  }

  const deleted = store.deleteTeamMember(id);
  return NextResponse.json({ success: deleted });
}
