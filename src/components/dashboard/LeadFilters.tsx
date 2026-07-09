'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { TeamMember, OpportunityStage } from '@/lib/types/lead';

interface FiltersProps {
  industryFilter: string;
  onIndustryChange: (val: string) => void;
  platformFilter: string;
  onPlatformChange: (val: string) => void;
  opportunityValueFilter: string;
  onOpportunityValueChange: (val: string) => void;
  serviceFilter: string;
  onServiceChange: (val: string) => void;
  websiteFilter: string;
  onWebsiteChange: (val: string) => void;
  
  // CRM Lifecycle and Assignment
  stageFilter: string;
  onStageChange: (val: string) => void;
  assignedFilter: string;
  onAssignedChange: (val: string) => void;
  starredFilter: string;
  onStarredChange: (val: string) => void;
  labelFilter: string;
  onLabelChange: (val: string) => void;
  
  teamMembers: TeamMember[];
  onReset: () => void;
}

const STAGES: OpportunityStage[] = [
  'Discovered', 'AI Qualified', 'Company Verified', 'Contact Verified',
  'Needs Research', 'Ready For Outreach', 'Outreach Sent', 'Follow-up Scheduled',
  'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Archived'
];

export const LeadFilters: React.FC<FiltersProps> = ({
  industryFilter,
  onIndustryChange,
  platformFilter,
  onPlatformChange,
  opportunityValueFilter,
  onOpportunityValueChange,
  serviceFilter,
  onServiceChange,
  websiteFilter,
  onWebsiteChange,
  
  stageFilter,
  onStageChange,
  assignedFilter,
  onAssignedChange,
  starredFilter,
  onStarredChange,
  labelFilter,
  onLabelChange,
  
  teamMembers,
  onReset,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/10 text-xs">
      
      <div className="flex items-center gap-2 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span>Refine Pipeline & CRM</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Stage */}
        <select
          value={stageFilter}
          onChange={(e) => onStageChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Stages</option>
          {STAGES.map(s => (
            <option key={s} value={s} className="bg-[#111827]">{s}</option>
          ))}
        </select>

        {/* Assigned Rep */}
        <select
          value={assignedFilter}
          onChange={(e) => onAssignedChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Assignments</option>
          <option value="Unassigned" className="bg-[#111827]">Unassigned</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.id} className="bg-[#111827]">{m.name} ({m.role})</option>
          ))}
        </select>

        {/* Starred */}
        <select
          value={starredFilter}
          onChange={(e) => onStarredChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Favorites</option>
          <option value="true" className="bg-[#111827]">⭐ Starred Only</option>
        </select>

        {/* Value */}
        <select
          value={opportunityValueFilter}
          onChange={(e) => onOpportunityValueChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Values</option>
          <option value="Enterprise" className="bg-[#111827]">Enterprise</option>
          <option value="High" className="bg-[#111827]">High Value</option>
          <option value="Medium" className="bg-[#111827]">Medium Value</option>
          <option value="Low" className="bg-[#111827]">Low Value</option>
        </select>

        {/* Service */}
        <select
          value={serviceFilter}
          onChange={(e) => onServiceChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Services</option>
          <option value="Custom Web Development" className="bg-[#111827]">Custom Web Dev</option>
          <option value="AI Automation" className="bg-[#111827]">AI Automation</option>
          <option value="Lead Generation Systems" className="bg-[#111827]">Lead Gen</option>
          <option value="SaaS Development" className="bg-[#111827]">SaaS Dev</option>
          <option value="E-commerce Solutions" className="bg-[#111827]">E-commerce</option>
          <option value="Landing Pages" className="bg-[#111827]">Landing Pages</option>
        </select>

        {/* Website Opportunity */}
        <select
          value={websiteFilter}
          onChange={(e) => onWebsiteChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">Website Status</option>
          <option value="No Website" className="bg-[#111827]">🚀 No Website (High Opportunity)</option>
          <option value="Has Website" className="bg-[#111827]">🌐 Existing Website (Redesign)</option>
        </select>

        {/* Source */}
        <select
          value={platformFilter}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-300 focus:outline-none focus:border-indigo-500/50"
        >
          <option value="All" className="bg-[#111827]">All Sources</option>
          <option value="twitter" className="bg-[#111827]">X (Twitter)</option>
          <option value="linkedin" className="bg-[#111827]">LinkedIn</option>
          <option value="reddit" className="bg-[#111827]">Reddit</option>
          <option value="facebook" className="bg-[#111827]">Facebook</option>
        </select>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

    </div>
  );
};
