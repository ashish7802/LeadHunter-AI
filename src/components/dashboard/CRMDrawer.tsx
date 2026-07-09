'use client';

import React, { useState } from 'react';
import { Lead, Company, TeamMember, OpportunityStage, InternalNote, FollowUp } from '@/lib/types/lead';
import { 
  X, Star, Users, Briefcase, FileText, Calendar, Clock, 
  MapPin, Globe, Mail, Phone, ExternalLink, ShieldCheck, 
  Trash2, Plus, MessageSquare, AlertTriangle, AlertCircle, 
  Check, CheckCircle2, ChevronRight, Play, Info, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CRMDrawerProps {
  lead: Lead | null;
  company?: Company & { leads: Lead[] };
  teamMembers: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (leadId: string, stage: OpportunityStage) => void;
  onToggleStar: (leadId: string) => void;
  onAssign: (leadId: string, memberId: string | null) => void;
  onAddNote: (leadId: string, content: string) => void;
  onAddFollowUp: (leadId: string, data: { scheduledDate: string; type: FollowUp['type']; assignedTo: string; notes?: string }) => void;
  onCompleteFollowUp: (leadId: string, followUpId: string) => void;
  onAddLabel: (leadId: string, label: string) => void;
  onRemoveLabel: (leadId: string, label: string) => void;
  onUpdateMeeting: (leadId: string, status: Lead['meetingStatus']) => void;
  onUpdateProposal: (leadId: string, status: Lead['proposalStatus']) => void;
  onDelete: (leadId: string) => void;
}

type TabType = 'overview' | 'activity' | 'outreach' | 'followups';

const STAGES: OpportunityStage[] = [
  'Discovered', 'AI Qualified', 'Company Verified', 'Contact Verified',
  'Needs Research', 'Ready For Outreach', 'Outreach Sent', 'Follow-up Scheduled',
  'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Archived'
];

export const CRMDrawer: React.FC<CRMDrawerProps> = ({
  lead,
  company,
  teamMembers,
  isOpen,
  onClose,
  onStageChange,
  onToggleStar,
  onAssign,
  onAddNote,
  onAddFollowUp,
  onCompleteFollowUp,
  onAddLabel,
  onRemoveLabel,
  onUpdateMeeting,
  onUpdateProposal,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [noteContent, setNoteContent] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Follow-up form state
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpType, setFollowUpType] = useState<FollowUp['type']>('Email');
  const [followUpAssignee, setFollowUpAssignee] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  if (!lead) return null;

  const score = lead.manualScoreOverride !== null ? lead.manualScoreOverride : (lead.qualityScore?.totalScore || 0);

  const getScoreBarColor = (val: number) => {
    if (val >= 8) return 'bg-emerald-500';
    if (val >= 5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    onAddNote(lead.id, noteContent);
    setNoteContent('');
  };

  const handleAddFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate || !followUpAssignee) return;
    onAddFollowUp(lead.id, {
      scheduledDate: followUpDate,
      type: followUpType,
      assignedTo: followUpAssignee,
      notes: followUpNotes || undefined,
    });
    setFollowUpDate('');
    setFollowUpAssignee('');
    setFollowUpNotes('');
  };

  const handleAddLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddLabel(lead.id, newLabel.trim());
    setNewLabel('');
  };

  // Compile timeline events chronologically (newest first)
  const timeline: { id: string; type: 'stage' | 'note' | 'followup' | 'raw'; date: string; title: string; content: string; iconColor: string; author?: string }[] = [];

  lead.stageHistory?.forEach((event, idx) => {
    timeline.push({
      id: `stage-${idx}-${event.changedAt}`,
      type: 'stage',
      date: event.changedAt,
      title: `Stage changed to ${event.toStage}`,
      content: event.note || `Transitioned from ${event.fromStage}`,
      iconColor: 'bg-indigo-500/20 text-indigo-400',
      author: event.changedBy,
    });
  });

  lead.internalNotes?.forEach((note) => {
    timeline.push({
      id: note.id,
      type: 'note',
      date: note.createdAt,
      title: `Internal note by ${note.author}`,
      content: note.content,
      iconColor: 'bg-emerald-500/20 text-emerald-400',
      author: note.author,
    });
  });

  lead.followUps?.forEach((f) => {
    timeline.push({
      id: f.id,
      type: 'followup',
      date: f.completedAt || f.scheduledDate,
      title: f.completedAt ? `${f.type} Follow-up completed` : `${f.type} Follow-up scheduled`,
      content: `Assigned to ${f.assignedTo}. ${f.notes || ''}`,
      iconColor: f.completedAt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
    });
  });

  lead.timelineEvents?.forEach((ev, idx) => {
    timeline.push({
      id: `raw-${idx}-${ev.date}`,
      type: 'raw',
      date: ev.date,
      title: ev.title,
      content: ev.description,
      iconColor: 'bg-blue-500/20 text-blue-400',
    });
  });

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-4xl bg-[#090D16] border-l border-white/10 shadow-2xl z-50 flex overflow-hidden text-gray-300"
          >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-white/10">
              {/* Top Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {lead.companyName}
                      <button 
                        onClick={() => onToggleStar(lead.id)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star className={`w-5 h-5 ${lead.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                    </h2>
                    <p className="text-xs text-gray-400">{lead.leadName} • {lead.needSummary}</p>
                  </div>
                </div>

                {/* Quick Stage Badge Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Stage:</span>
                  <select
                    value={lead.stage}
                    onChange={(e) => onStageChange(lead.id, e.target.value as OpportunityStage)}
                    className="bg-white/5 border border-white/10 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="bg-[#111827] text-white">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-white/10 bg-white/5 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'activity', label: 'Timeline & Notes', icon: MessageSquare },
                  { id: 'outreach', label: 'Outreach Brief', icon: FileText },
                  { id: 'followups', label: 'Follow-ups', icon: Calendar }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-white bg-white/[0.02]'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ─── TAB: OVERVIEW ──────────────────────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Score breakdown & Agency Fit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quality Score Breakdown */}
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                          <span>Opportunity Quality Score</span>
                          <span className="text-lg font-bold text-indigo-400">{score}/100</span>
                        </h3>
                        <div className="space-y-2 text-xs">
                          {[
                            { label: 'Business Verification', val: lead.qualityScore?.businessVerification },
                            { label: 'Decision Maker Confidence', val: lead.qualityScore?.decisionMakerConfidence },
                            { label: 'Purchase Intent', val: lead.qualityScore?.purchaseIntent },
                            { label: 'Public Contact Info', val: lead.qualityScore?.publicContactAvailability },
                            { label: 'Website Opportunity', val: lead.qualityScore?.websiteOpportunity },
                            { label: 'Service Match', val: lead.qualityScore?.serviceMatch },
                            { label: 'Company Maturity', val: lead.qualityScore?.companyMaturity },
                            { label: 'Buying Signal Strength', val: lead.qualityScore?.buyingSignalStrength }
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-400">{item.label}</span>
                                <span className="font-semibold text-white">{item.val ?? 0}/10</span>
                              </div>
                              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getScoreBarColor(item.val ?? 0)}`} 
                                  style={{ width: `${(item.val ?? 0) * 10}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Agency Fit Summary */}
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                            <span>Agency Fit Engine</span>
                            <span className="text-lg font-bold text-emerald-400">{lead.agencyFit?.agencyFitScore ?? 0}%</span>
                          </h3>
                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-gray-400 block mb-1">Primary Matched Service:</span>
                              <span className="font-semibold text-white text-sm bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg inline-block">
                                {lead.agencyFit?.primaryService || 'None'}
                              </span>
                            </div>
                            {lead.agencyFit?.secondaryServices && lead.agencyFit.secondaryServices.length > 0 && (
                              <div>
                                <span className="text-gray-400 block mb-1">Secondary Services:</span>
                                <div className="flex flex-wrap gap-1">
                                  {lead.agencyFit.secondaryServices.map((s, i) => (
                                    <span key={i} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-gray-300">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-400 block mb-1">Recommended Tech Stack / Solution:</span>
                              <p className="text-gray-300 leading-relaxed italic bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                                "{lead.agencyFit?.recommendedSolution || 'No solution generated yet'}"
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-gray-500 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI Assessment Match Confidence: {lead.agencyFit?.confidence ?? 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* User Feedback Loop */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Collaborative Quality Feedback</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Excellent Opportunity', val: 'Excellent', color: 'hover:bg-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                          { label: 'Good Deal', val: 'Good', color: 'hover:bg-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
                          { label: 'Average Match', val: 'Average', color: 'hover:bg-blue-500/20 hover:border-blue-500/30 text-blue-400 border-blue-500/20 bg-blue-500/5' },
                          { label: 'Poor Fit', val: 'Poor', color: 'hover:bg-yellow-500/20 hover:border-yellow-500/30 text-yellow-400 border-yellow-500/20 bg-yellow-500/5' },
                          { label: 'Wrong Classification', val: 'Wrong', color: 'hover:bg-orange-500/20 hover:border-orange-500/30 text-orange-400 border-orange-500/20 bg-orange-500/5' },
                          { label: 'Spam Post', val: 'Spam', color: 'hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-400 border-rose-500/20 bg-rose-500/5' },
                          { label: 'Duplicate Entry', val: 'Duplicate', color: 'hover:bg-gray-500/20 hover:border-gray-500/30 text-gray-400 border-gray-500/20 bg-gray-500/5' }
                        ].map((btn) => {
                          const isActive = lead.userFeedback === btn.val;
                          return (
                            <button
                              key={btn.val}
                              onClick={() => {
                                lead.userFeedback = btn.val as any;
                                onStageChange(lead.id, lead.stage); // triggers page reload
                                fetch('/api/opportunities/feedback', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ leadId: lead.id, feedback: btn.val })
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : btn.color
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Self-Critique / Uncertainty warnings */}
                    {lead.uncertaintyPoints && lead.uncertaintyPoints.length > 0 && (
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>AI Self-Critique & Uncertainty Check</span>
                        </h4>
                        <ul className="list-disc list-inside text-xs text-rose-300 space-y-1">
                          {lead.uncertaintyPoints.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Revenue Validation Scorecard */}
                    {lead.revenueValidation && (
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-sm font-semibold text-white">Revenue Validation Assessment</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            lead.revenueValidation.confidence === 'Very High' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                            lead.revenueValidation.confidence === 'High' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' :
                            lead.revenueValidation.confidence === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          }`}>
                            Outreach Priority: {lead.revenueValidation.confidence} Confidence
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          {[
                            { label: 'Business Legitimacy', val: lead.revenueValidation.legitimacy },
                            { label: 'Purchase Intent', val: lead.revenueValidation.intent },
                            { label: 'Ideal Service Match', val: lead.revenueValidation.fit },
                            { label: 'Contact Availability', val: lead.revenueValidation.contact },
                            { label: 'Website Opportunity', val: lead.revenueValidation.website },
                            { label: 'Company Maturity', val: lead.revenueValidation.maturity },
                            { label: 'Deal Urgency', val: lead.revenueValidation.urgency },
                            { label: 'Estimated Effort', val: lead.revenueValidation.effort },
                            { label: 'Estimated Contract Value', val: lead.revenueValidation.value }
                          ].map((metric, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-gray-400 block mb-1">{metric.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{metric.val}/10</span>
                                <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${metric.val * 10}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5 md:col-span-3">
                            <span className="text-gray-400 block mb-1">Competition Level</span>
                            <span className="font-semibold text-white uppercase tracking-wider">{lead.revenueValidation.competition}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs">
                          <span className="text-gray-400 font-semibold block mb-1">Validation Reasoning:</span>
                          <p className="text-gray-300 leading-relaxed italic">"{lead.revenueValidation.reasoning}"</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Metadata */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 block mb-0.5">Opportunity Value</span>
                        <span className="font-semibold text-white">{lead.opportunityValue}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Budget Target</span>
                        <span className="font-semibold text-white">{lead.estimatedBudget || 'Not Estimated'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Industry Segment</span>
                        <span className="font-semibold text-white">{lead.industry || 'General'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Origin Location</span>
                        <span className="font-semibold text-white">{lead.city || 'Unknown'}, {lead.country || 'Global'}</span>
                      </div>
                    </div>

                    {/* Website Analysis Details */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                      <h3 className="text-sm font-semibold text-white">Website Observability Analysis</h3>
                      {lead.websiteAnalysis?.url ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Observed Domain:</span>
                            <a 
                              href={lead.websiteAnalysis.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              {lead.websiteAnalysis.url}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                              <span className="text-gray-400">HTTPS Protocol</span>
                              <span className={`font-semibold ${lead.websiteAnalysis.usesHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {lead.websiteAnalysis.usesHttps ? 'Secured' : 'No'}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                              <span className="text-gray-400">Mobile Friendly</span>
                              <span className={`font-semibold ${lead.websiteAnalysis.isMobileFriendly ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {lead.websiteAnalysis.isMobileFriendly ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                              <span className="text-gray-400">Contact Form</span>
                              <span className={`font-semibold ${lead.websiteAnalysis.hasContactPage ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {lead.websiteAnalysis.hasContactPage ? 'Found' : 'Missing'}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                              <span className="text-gray-400">CTAs Present</span>
                              <span className={`font-semibold ${lead.websiteAnalysis.hasCallsToAction ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {lead.websiteAnalysis.hasCallsToAction ? 'Yes' : 'None'}
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                            <span className="text-gray-400 block mb-1">Observation Diagnostics:</span>
                            <p className="text-gray-200">{lead.websiteAnalysis.agencyHelpSummary}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                          <p className="text-xs text-gray-500">No website domain found for this prospect during discovery.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB: ACTIVITY & NOTES ──────────────────────── */}
                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    {/* Add note form */}
                    <form onSubmit={handleAddNoteSubmit} className="space-y-3">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add internal notes for team collaboration... Use standard markdown."
                        rows={3}
                        className="w-full p-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Save Note
                        </button>
                      </div>
                    </form>

                    {/* Timeline List */}
                    <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-6 py-2">
                      {timeline.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No timeline history recorded yet.</p>
                      ) : (
                        timeline.map((event) => (
                          <div key={event.id} className="relative">
                            {/* Bullet Dot */}
                            <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${event.iconColor} border border-[#090D16] shadow-sm`}>
                              {event.type === 'stage' && <ChevronRight className="w-3.5 h-3.5" />}
                              {event.type === 'note' && <MessageSquare className="w-3 h-3" />}
                              {event.type === 'followup' && <Calendar className="w-3 h-3" />}
                              {event.type === 'raw' && <FileText className="w-3.5 h-3.5" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(event.date).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 leading-relaxed whitespace-pre-line">
                                {event.content}
                              </p>
                              {event.author && (
                                <span className="text-[10px] text-indigo-400 font-medium block">
                                  By {event.author}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB: OUTREACH BRIEF ────────────────────────── */}
                {activeTab === 'outreach' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-indigo-400" />
                        AI Strategic Placement Recommendation
                      </h3>
                      <div className="space-y-3 text-xs leading-relaxed text-gray-300">
                        <div>
                          <span className="text-gray-500 font-semibold block mb-0.5">Opportunity Context:</span>
                          <p>{lead.internalWorkspace?.opportunitySummary}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-semibold block mb-0.5">AI Reasoning:</span>
                          <p>{lead.internalWorkspace?.aiReasoning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Target Business Pain Points */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h3 className="text-sm font-semibold text-white">Business Pain Points Detected</h3>
                      <ul className="list-disc list-inside text-xs space-y-1.5 text-gray-300">
                        {lead.internalWorkspace?.businessPainPoints?.map((p, i) => (
                          <li key={i}>{p}</li>
                        )) || <li className="text-gray-500 italic">No explicit pain points detected.</li>}
                      </ul>
                    </div>

                    {/* Suggested Services */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h3 className="text-sm font-semibold text-white">Suggested Agency Pitch Items</h3>
                      <div className="flex flex-wrap gap-2">
                        {lead.internalWorkspace?.suggestedAgencyServices?.map((s, i) => (
                          <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-medium">
                            {s}
                          </span>
                        )) || <span className="text-gray-500 italic">None</span>}
                      </div>
                    </div>

                    {/* Outreach Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <h4 className="font-semibold text-white text-sm mb-2">Outreach Strategy</h4>
                        <div>
                          <span className="text-gray-500 block mb-0.5">Recommended Channel</span>
                          <span className="font-semibold text-indigo-400 capitalize bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 inline-block">
                            {lead.internalWorkspace?.recommendedOutreachChannel || 'Email / LinkedIn'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-500 block mb-0.5">Suggested Timing</span>
                          <span className="font-semibold text-white">
                            {lead.internalWorkspace?.recommendedFollowUpTiming || 'Morning (Local Time)'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                        <h4 className="font-semibold text-white text-sm mb-2">Public Contact Inquiries</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{lead.publicEmail || 'Email unavailable'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{lead.publicPhone || 'Phone unavailable'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next actions list */}
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <h3 className="text-sm font-semibold text-white">Recommended Next Outreach Steps</h3>
                      <ol className="list-decimal list-inside text-xs space-y-2 text-gray-300">
                        {lead.internalWorkspace?.nextActions?.map((act, i) => (
                          <li key={i} className="pl-1">{act}</li>
                        )) || <li className="text-gray-500 italic">None</li>}
                      </ol>
                    </div>
                  </div>
                )}

                {/* ─── TAB: FOLLOW-UPS ────────────────────────────── */}
                {activeTab === 'followups' && (
                  <div className="space-y-6">
                    {/* Add Followup Form */}
                    <form onSubmit={handleAddFollowUpSubmit} className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Schedule Action Item
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold block">Date & Time</label>
                          <input 
                            type="datetime-local" 
                            required
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold block">Activity Type</label>
                          <select
                            value={followUpType}
                            onChange={(e) => setFollowUpType(e.target.value as FollowUp['type'])}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                          >
                            <option value="Email" className="bg-[#111827]">Email Outreach</option>
                            <option value="Call" className="bg-[#111827]">Phone Call</option>
                            <option value="LinkedIn" className="bg-[#111827]">LinkedIn InMail</option>
                            <option value="Meeting" className="bg-[#111827]">Discovery Meeting</option>
                            <option value="Other" className="bg-[#111827]">General Task</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-semibold block">Owner</label>
                          <select
                            required
                            value={followUpAssignee}
                            onChange={(e) => setFollowUpAssignee(e.target.value)}
                            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                          >
                            <option value="" className="bg-[#111827]">Choose Assignee...</option>
                            {teamMembers.map(m => (
                              <option key={m.id} value={m.name} className="bg-[#111827]">{m.name} ({m.role})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 font-semibold block">Action Description / Notes</label>
                        <input
                          type="text"
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          placeholder="What needs to be done? e.g. Send website proposal deck"
                          className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Schedule Event
                        </button>
                      </div>
                    </form>

                    {/* Stats & Current Scheduler */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div>
                        <span className="text-gray-500 block mb-0.5">Outreach Attempts</span>
                        <span className="font-semibold text-white">{lead.contactAttempts || 0} times</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Last Contact</span>
                        <span className="font-semibold text-white">
                          {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Meeting Schedule</span>
                        <span className="font-semibold text-white">{lead.meetingStatus}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Proposal Status</span>
                        <span className="font-semibold text-white">{lead.proposalStatus}</span>
                      </div>
                    </div>

                    {/* List of Tasks */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-white">Scheduled Tasks</h4>
                      <div className="space-y-2">
                        {lead.followUps?.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">No tasks scheduled for this lead yet.</p>
                        ) : (
                          lead.followUps?.map((f) => {
                            const isOverdue = f.status === 'Pending' && new Date(f.scheduledDate) < new Date();
                            const statusColor = f.status === 'Completed' 
                              ? 'border-emerald-500/20 bg-emerald-500/5' 
                              : isOverdue 
                                ? 'border-rose-500/20 bg-rose-500/5' 
                                : 'border-amber-500/20 bg-amber-500/5';
                            
                            return (
                              <div key={f.id} className={`p-4 rounded-xl border flex items-center justify-between ${statusColor}`}>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-white">{f.type} Action</span>
                                    {isOverdue && <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[9px]">OVERDUE</span>}
                                  </div>
                                  <p className="text-xs text-gray-300">{f.notes}</p>
                                  <span className="text-[10px] text-gray-400">
                                    Target Date: {new Date(f.scheduledDate).toLocaleString()} • Owner: {f.assignedTo}
                                  </span>
                                </div>
                                {f.status === 'Pending' && (
                                  <button
                                    onClick={() => onCompleteFollowUp(lead.id, f.id)}
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Done
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Actions Panel */}
            <div className="w-80 h-full overflow-y-auto p-6 bg-white/[0.01] flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2.5">CRM Workspace</h3>

                {/* Team Assignment */}
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block">Owner Assignee</label>
                  <select
                    value={lead.assignedTo || ''}
                    onChange={(e) => onAssign(lead.id, e.target.value || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-xs font-semibold px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="" className="bg-[#111827]">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#111827]">{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                {/* Star rating override */}
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block">AI Rating Override</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      placeholder="AI Score (0-100)"
                      value={lead.manualScoreOverride !== null ? lead.manualScoreOverride : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        onSetScore(lead.id, val);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Meeting status */}
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block">Meeting Status</label>
                  <select
                    value={lead.meetingStatus || 'None'}
                    onChange={(e) => onUpdateMeeting(lead.id, e.target.value as Lead['meetingStatus'])}
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="None" className="bg-[#111827]">None</option>
                    <option value="Requested" className="bg-[#111827]">Requested</option>
                    <option value="Scheduled" className="bg-[#111827]">Scheduled</option>
                    <option value="Completed" className="bg-[#111827]">Completed</option>
                    <option value="No Show" className="bg-[#111827]">No Show</option>
                  </select>
                </div>

                {/* Proposal status */}
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block">Proposal Status</label>
                  <select
                    value={lead.proposalStatus || 'None'}
                    onChange={(e) => onUpdateProposal(lead.id, e.target.value as Lead['proposalStatus'])}
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="None" className="bg-[#111827]">None</option>
                    <option value="Draft" className="bg-[#111827]">Draft</option>
                    <option value="Sent" className="bg-[#111827]">Sent</option>
                    <option value="Viewed" className="bg-[#111827]">Viewed</option>
                    <option value="Accepted" className="bg-[#111827]">Accepted</option>
                    <option value="Rejected" className="bg-[#111827]">Rejected</option>
                  </select>
                </div>

                {/* Custom labels */}
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block">Labels</label>
                  <form onSubmit={handleAddLabelSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add label..."
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-1.5 text-white focus:outline-none"
                    />
                    <button type="submit" className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lead.customLabels?.map((l) => (
                      <span key={l} className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">
                        {l}
                        <button type="button" onClick={() => onRemoveLabel(lead.id, l)} className="text-indigo-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legacy Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-gray-500 font-bold uppercase block">Metadata Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags?.map((t) => (
                      <span key={t} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-white/10">
                {confirmDelete ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-rose-400 font-bold text-center">Permanently remove opportunity?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Lead
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Score override dispatch helper
  function onSetScore(id: string, val: number | null) {
    onStageChange(id, lead!.stage); // Dummy dispatch to force parent rerender, but actually we will dispatch actions through PATCH API
    fetch('/api/opportunities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'setScore', score: val })
    }).then(res => {
      if (res.ok) {
        if (lead) lead.manualScoreOverride = val;
      }
    });
  }
};
