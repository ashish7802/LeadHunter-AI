'use client';

import React from 'react';
import { Lead } from '@/lib/types/lead';
import { ChevronRight, Flame, MapPin, Building2, Globe } from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['pipelineStatus']) => void;
}

const STAGES: Lead['pipelineStatus'][] = [
  'Contact Today',
  'Contact This Week',
  'Monitor',
  'Needs Research',
  'Archived',
];

export const LeadPipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onSelectLead,
  onUpdateStatus,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.pipelineStatus === stage);

        return (
          <div key={stage} className="glass-panel rounded-2xl p-4 flex flex-col h-full border border-white/10 min-w-[240px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-gray-200 tracking-wide uppercase">{stage}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-cyan-300">
                {stageLeads.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {stageLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 italic border border-dashed border-white/5 rounded-xl">
                  No leads in stage
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {lead.companyName}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (lead.qualityScore?.totalScore || 0) >= 90 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {lead.qualityScore?.totalScore || 0}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-300 line-clamp-2 mb-2 font-light">
                      {lead.needSummary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                      <span className="font-mono text-emerald-400 font-semibold">{lead.estimatedBudget}</span>
                      <span>{lead.country === 'India' ? '🇮🇳' : '🇨🇦'} {lead.city}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
