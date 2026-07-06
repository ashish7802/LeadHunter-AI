'use client';

import React from 'react';
import { Lead } from '@/lib/types/lead';
import { Mail, CheckCircle, ShieldCheck, Globe, ChevronRight, Trash2 } from 'lucide-react';

interface TableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, status: Lead['pipelineStatus']) => void;
  onDeleteLead?: (leadId: string) => void;
}

export const LeadTable: React.FC<TableProps> = ({ leads, onSelectLead, onDeleteLead }) => {
  if (leads.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 my-4">
        <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-3">
          <Globe className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Leads Match Your Filter Criteria</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Try expanding your search query, changing country filter, or click "Run AI Pipeline" to discover fresh high-intent web dev leads.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Score</th>
              <th className="py-3.5 px-4">Company / Lead</th>
              <th className="py-3.5 px-4">Target Need</th>
              <th className="py-3.5 px-4">Estimated Budget</th>
              <th className="py-3.5 px-4">Website Opportunity</th>
              <th className="py-3.5 px-4">Verification</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {leads.map((lead) => {
              const isHot = lead.leadScore >= 90;
              const isQualified = lead.leadScore >= 80 && lead.leadScore < 90;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  {/* Lead Score Pill */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-sm tracking-tight border shadow-lg ${
                          isHot
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                            : isQualified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span>{lead.leadScore}</span>
                      </div>
                    </div>
                  </td>

                  {/* Company & Author Details */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                          {lead.companyName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-gray-400">
                          {lead.country === 'India' ? '🇮🇳 India' : lead.country === 'Canada' ? '🇨🇦 Canada' : 'Global'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                        <span className="font-medium text-gray-300">{lead.leadName}</span>
                        <span>•</span>
                        <span>{lead.city}</span>
                        <span>•</span>
                        <span className="capitalize text-indigo-400 font-mono">{lead.platform}</span>
                      </div>
                    </div>
                  </td>

                  {/* Need Summary & Category */}
                  <td className="py-4 px-4 max-w-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {lead.needCategory}
                        </span>
                        <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                          {lead.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {lead.needSummary}
                      </p>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-emerald-400 text-xs">
                        {lead.estimatedBudget}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">Verified Intent</span>
                    </div>
                  </td>

                  {/* Website Analysis Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {lead.websiteAnalysis.hasWebsite ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Needs Redesign</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>No Website (Prime)</span>
                      </span>
                    )}
                  </td>

                  {/* Verification Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        <span>Real Source</span>
                      </span>
                      {lead.publicEmail && (
                        <span title={`Email: ${lead.publicEmail}`}>
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        </span>
                      )}
                    </div>
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
                        <span>Inspect</span>
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
                          title="Remove Lead"
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
  );
};
