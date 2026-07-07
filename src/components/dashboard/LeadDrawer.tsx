'use client';

import React, { useState } from 'react';
import { Lead } from '@/lib/types/lead';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  Building2,
  MapPin,
  Trash2,
  CheckCircle2,
  BrainCircuit,
  MessageSquareQuote,
  Target
} from 'lucide-react';

interface DrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: Lead['pipelineStatus']) => void;
  onAddNote: (leadId: string, note: string) => void;
  onAddTag: (leadId: string, tag: string) => void;
  onDeleteLead?: (leadId: string) => void;
}

export const LeadDrawer: React.FC<DrawerProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteLead,
}) => {
  const [newNote, setNewNote] = useState('');

  if (!lead) return null;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(lead.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-2xl bg-[#0F172A] border-l border-white/10 h-full overflow-y-auto p-6 text-gray-200 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-lg tracking-tight border shadow-xl ${
                  lead.leadScore >= 90
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <span>{lead.leadScore}</span>
                <span className="text-[9px] font-normal uppercase tracking-wider">Score</span>
              </div>

              <div className="flex flex-col gap-2 w-32 pl-1 border-l border-white/10 hidden sm:flex">
                <div>
                  <div className="flex justify-between text-[9px] font-medium mb-1 uppercase tracking-wider">
                    <span className="text-gray-400">Intent</span>
                    <span className="text-emerald-400">{lead.intentConfidence ?? 0}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lead.intentConfidence ?? 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-medium mb-1 uppercase tracking-wider">
                    <span className="text-gray-400">Business</span>
                    <span className="text-indigo-400">{lead.businessConfidence ?? 0}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${lead.businessConfidence ?? 0}%` }} />
                  </div>
                </div>
              </div>

              <div className="ml-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{lead.companyName}</h2>
                  <span className="px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10 font-mono text-gray-300">
                    {lead.country === 'India' ? '🇮🇳 India' : lead.country === 'Canada' ? '🇨🇦 Canada' : 'Global'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lead.businessType}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lead.city}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pipeline Status Selector */}
          <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">Pipeline Stage:</span>
            <select
              value={lead.pipelineStatus}
              onChange={(e) => onUpdateStatus(lead.id, e.target.value as Lead['pipelineStatus'])}
              className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 focus:outline-none"
            >
              <option value="New Lead">New Discovered Lead</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Closed Won">Closed Won 🎉</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* AI Intelligence Summary - Sales Consultant's Thought Process */}
          <div className="mb-6 rounded-xl overflow-hidden border border-indigo-500/20 bg-[#0B101E]">
            <div className="bg-indigo-500/10 p-3 border-b border-indigo-500/20 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold text-indigo-300">Sales Consultant's Thought Process</h3>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-200 leading-relaxed font-medium mb-4 italic">
                "{lead.humanReasoning || "No detailed reasoning available."}"
              </p>
              
              <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                {lead.explainability && (
                  <>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Why Qualified</span>
                      </div>
                      <p className="text-xs text-gray-300">{lead.explainability.whyQualified}</p>
                    </div>
                    
                    {lead.explainability.intentSentences && lead.explainability.intentSentences.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Intent Signals</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                          {lead.explainability.intentSentences.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Target className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Business Capability</span>
                        </div>
                        <p className="text-xs text-gray-300">{lead.explainability.businessCapability}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Phone className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Contact Validation</span>
                        </div>
                        <p className="text-xs text-gray-300">{lead.explainability.contactValidation}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Public Contact Details */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Public Source Contact Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <Mail className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Public Email</span>
                  <span className="text-xs font-mono font-medium text-white">
                    {lead.publicEmail || 'Not published in post'}
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Public Phone</span>
                  <span className="text-xs font-mono font-medium text-white">
                    {lead.publicPhone || 'Not published in post'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Original Source Post */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Original Social Post ({lead.platform})
              </h3>
              <a
                href={lead.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <span>Verify Source URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="p-4 rounded-xl bg-[#090D16] border border-white/10 text-xs font-mono text-gray-300 leading-relaxed">
              <div className="flex items-center justify-between text-gray-500 mb-2 pb-2 border-b border-white/5 text-[11px]">
                <span>Author: {lead.leadName} ({lead.authorHandle})</span>
                <span>{new Date(lead.sourceTimestamp).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap">{lead.rawContent}</p>
            </div>
          </div>

          {/* Lead Score Signals Breakdown */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Weighted Score Breakdown (Total: {lead.leadScore}/100)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Website Need Signal:</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.websiteNeed}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Owner Intent:</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.businessOwnerIntent}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Budget Clarity:</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.budgetClarity}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Urgency Signal:</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.urgency}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Country Match (IN/CA):</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.targetCountryMatch}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
                <span className="text-gray-400">Public Contact Bonus:</span>
                <span className="font-semibold text-emerald-400">+{lead.scoreBreakdown.publicContact}</span>
              </div>
            </div>
          </div>

          {/* Notes & Activity */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Team Notes & Activity
            </h3>
            <div className="space-y-2 mb-3">
              {lead.userNotes.map((note, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
                  {note}
                </div>
              ))}
            </div>
            <form onSubmit={handleNoteSubmit} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
              >
                Add Note
              </button>
            </form>
          </div>

        </div>

        {/* Drawer Bottom Actions */}
        {onDeleteLead && (
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${lead.companyName}?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Lead</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
