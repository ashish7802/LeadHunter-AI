'use client';

import React from 'react';
import { Lead, TeamMember, FollowUp } from '@/lib/types/lead';
import { Calendar, Mail, Phone, MessageSquare, Clock, User, Check, AlertCircle } from 'lucide-react';

interface FollowUpManagerProps {
  leads: Lead[];
  teamMembers: TeamMember[];
  onSelectLead: (lead: Lead) => void;
  onCompleteFollowUp: (leadId: string, followUpId: string) => void;
}

const TYPE_ICONS: Record<FollowUp['type'], React.ComponentType<{ className?: string }>> = {
  'Email': Mail,
  'Call': Phone,
  'LinkedIn': MessageSquare,
  'Meeting': Calendar,
  'Other': Clock
};

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  leads,
  teamMembers,
  onSelectLead,
  onCompleteFollowUp,
}) => {
  const now = new Date();

  // Find all pending follow-ups
  const pendingItems: { lead: Lead; followUp: FollowUp }[] = [];
  leads.forEach(lead => {
    lead.followUps?.forEach(f => {
      if (f.status === 'Pending') {
        pendingItems.push({ lead, followUp: f });
      }
    });
  });

  // Group items by timeframe
  const overdue: typeof pendingItems = [];
  const today: typeof pendingItems = [];
  const thisWeek: typeof pendingItems = [];

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  pendingItems.forEach(item => {
    const date = new Date(item.followUp.scheduledDate);
    if (date < startOfToday) {
      overdue.push(item);
    } else if (date >= startOfToday && date < endOfToday) {
      today.push(item);
    } else if (date >= endOfToday && date < endOfThisWeek) {
      thisWeek.push(item);
    }
  });

  // Sort chronologically
  overdue.sort((a, b) => new Date(a.followUp.scheduledDate).getTime() - new Date(b.followUp.scheduledDate).getTime());
  today.sort((a, b) => new Date(a.followUp.scheduledDate).getTime() - new Date(b.followUp.scheduledDate).getTime());
  thisWeek.sort((a, b) => new Date(a.followUp.scheduledDate).getTime() - new Date(b.followUp.scheduledDate).getTime());

  const renderItem = (item: { lead: Lead; followUp: FollowUp }, isOverdue: boolean) => {
    const { lead, followUp } = item;
    const Icon = TYPE_ICONS[followUp.type] || Clock;

    return (
      <div 
        key={followUp.id}
        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          isOverdue 
            ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/30' 
            : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}
      >
        <div className="space-y-1.5 flex-1 pr-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectLead(lead)}
              className="text-sm font-semibold text-white hover:text-indigo-400 text-left transition-colors"
            >
              {lead.companyName}
            </button>
            <span className="text-[10px] text-gray-500">•</span>
            <span className="text-xs text-gray-400">{lead.leadName}</span>
          </div>

          <p className="text-xs text-gray-300 line-clamp-1">{followUp.notes || 'No description provided.'}</p>

          <div className="flex flex-wrap gap-3 items-center text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="capitalize">{followUp.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{new Date(followUp.scheduledDate).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>{followUp.assignedTo}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onCompleteFollowUp(lead.id, followUp.id)}
          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Complete</span>
        </button>
      </div>
    );
  };

  const hasAny = overdue.length > 0 || today.length > 0 || thisWeek.length > 0;

  if (!hasAny) {
    return (
      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
        <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">All caught up!</h3>
        <p className="text-xs text-gray-400 mt-1">No pending follow-ups or action items scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Overdue Action Items ({overdue.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {overdue.map(item => renderItem(item, true))}
          </div>
        </div>
      )}

      {/* Today Section */}
      {today.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Scheduled For Today ({today.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {today.map(item => renderItem(item, false))}
          </div>
        </div>
      )}

      {/* This Week Section */}
      {thisWeek.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Upcoming This Week ({thisWeek.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {thisWeek.map(item => renderItem(item, false))}
          </div>
        </div>
      )}
    </div>
  );
};
