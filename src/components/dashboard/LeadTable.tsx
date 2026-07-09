'use client';

import React from 'react';
import { Lead, TeamMember, OpportunityStage } from '@/lib/types/lead';
import { Mail, CheckCircle, ShieldCheck, Globe, ChevronRight, Trash2, Star, User, Clock, Calendar } from 'lucide-react';

interface TableProps {
  leads: Lead[];
  teamMembers: TeamMember[];
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: OpportunityStage) => void;
  onAssign: (leadId: string, memberId: string | null) => void;
  onToggleStar: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
}

const STAGES: OpportunityStage[] = [
  'Discovered', 'AI Qualified', 'Company Verified', 'Contact Verified',
  'Needs Research', 'Ready For Outreach', 'Outreach Sent', 'Follow-up Scheduled',
  'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Archived'
];

export const LeadTable: React.FC<TableProps> = ({
  leads,
  teamMembers,
  onSelectLead,
  onStageChange,
  onAssign,
  onToggleStar,
  onDeleteLead
}) => {
  const [activeTab, setActiveTab] = React.useState<OpportunityStage | 'All'>('All');

  const filteredLeads = React.useMemo(() => {
    if (activeTab === 'All') {
      return leads.filter(l => l.stage !== 'Archived' && l.stage !== 'Lost');
    }
    return leads.filter(lead => lead.stage === activeTab);
  }, [leads, activeTab]);

  return (
    <div className="flex flex-col gap-4">
      {/* Smart Dashboard Queues Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
            activeTab === 'All'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
          }`}
        >
          Active Board ({leads.filter(l => l.stage !== 'Archived' && l.stage !== 'Lost').length})
        </button>
        {STAGES.map(stage => {
          const count = leads.filter(l => l.stage === stage).length;
          if (count === 0 && stage !== 'Discovered' && stage !== 'AI Qualified') return null;

          return (
            <button
              key={stage}
              onClick={() => setActiveTab(stage)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                activeTab === stage
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
              }`}
            >
              {stage} ({count})
            </button>
          );
        })}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 my-4 bg-white/5">
          <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Opportunities Found</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            No opportunities in this lifecycle stage. Scan public feeds or move deals here.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-10">Star</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Company / Lead</th>
                  <th className="py-3.5 px-4">Target Need</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Website</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredLeads.map((lead) => {
                  const score = lead.manualScoreOverride !== null ? lead.manualScoreOverride : (lead.qualityScore?.totalScore || 0);
                  const assignedMember = teamMembers.find(m => m.id === lead.assignedTo);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      {/* Star */}
                      <td className="py-4 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(lead.id);
                          }}
                          className="text-gray-400 hover:text-yellow-400 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${lead.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </button>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          score >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                          score >= 60 ? 'text-amber-400 bg-amber-500/10' :
                          'text-gray-400 bg-gray-500/10'
                        }`}>
                          {score}
                        </span>
                      </td>

                      {/* Company & Author */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                            {lead.companyName}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {lead.leadName} • {lead.city || 'Global'}
                          </span>
                        </div>
                      </td>

                      {/* Need */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 w-fit">
                            {lead.intentCategory}
                          </span>
                          <p className="text-xs text-gray-300 line-clamp-1 leading-relaxed">
                            {lead.needSummary}
                          </p>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`font-bold text-xs ${
                          lead.opportunityValue === 'Enterprise' ? 'text-purple-400' :
                          lead.opportunityValue === 'High' ? 'text-emerald-400' :
                          lead.opportunityValue === 'Medium' ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {lead.opportunityValue}
                        </span>
                      </td>

                      {/* Website */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.websiteAnalysis?.hasWebsite ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Redesign</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>No Website</span>
                          </span>
                        )}
                      </td>

                      {/* Assigned to */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.assignedTo || ''}
                          onChange={(e) => onAssign(lead.id, e.target.value || null)}
                          className="bg-[#111827] border border-white/10 rounded-lg text-[11px] px-2 py-1 text-white focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Stage Selector */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => onStageChange(lead.id, e.target.value as OpportunityStage)}
                          className="bg-[#111827] border border-white/10 rounded-lg text-[11px] px-2 py-1 text-white focus:outline-none font-medium"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLead(lead);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium text-xs border border-indigo-500/30 transition-colors"
                          >
                            <span>CRM</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to remove ${lead.companyName}?`)) {
                                  onDeleteLead(lead.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
