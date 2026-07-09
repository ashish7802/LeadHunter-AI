'use client';

import React, { useRef } from 'react';
import { Lead, TeamMember, OpportunityStage } from '@/lib/types/lead';
import { Star, ChevronRight, ChevronLeft, Clock, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface OpportunityBoardProps {
  leads: Lead[];
  teamMembers: TeamMember[];
  onSelectLead: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: OpportunityStage) => void;
  onToggleStar: (leadId: string) => void;
}

const STAGES: OpportunityStage[] = [
  'Discovered', 'AI Qualified', 'Company Verified', 'Contact Verified',
  'Needs Research', 'Ready For Outreach', 'Outreach Sent', 'Follow-up Scheduled',
  'Meeting Booked', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Archived'
];

const STAGE_COLORS: Record<OpportunityStage, string> = {
  'Discovered': 'border-t-blue-500/80 bg-blue-500/5',
  'AI Qualified': 'border-t-indigo-500/80 bg-indigo-500/5',
  'Company Verified': 'border-t-cyan-500/80 bg-cyan-500/5',
  'Contact Verified': 'border-t-sky-500/80 bg-sky-500/5',
  'Needs Research': 'border-t-purple-500/80 bg-purple-500/5',
  'Ready For Outreach': 'border-t-pink-500/80 bg-pink-500/5',
  'Outreach Sent': 'border-t-amber-500/80 bg-amber-500/5',
  'Follow-up Scheduled': 'border-t-orange-500/80 bg-orange-500/5',
  'Meeting Booked': 'border-t-yellow-500/80 bg-yellow-500/5',
  'Proposal Sent': 'border-t-teal-500/80 bg-teal-500/5',
  'Negotiation': 'border-t-lime-500/80 bg-lime-500/5',
  'Won': 'border-t-emerald-500/80 bg-emerald-500/5',
  'Lost': 'border-t-rose-500/80 bg-rose-500/5',
  'Archived': 'border-t-gray-500/80 bg-gray-500/5'
};

const STAGE_TEXT_COLORS: Record<OpportunityStage, string> = {
  'Discovered': 'text-blue-400',
  'AI Qualified': 'text-indigo-400',
  'Company Verified': 'text-cyan-400',
  'Contact Verified': 'text-sky-400',
  'Needs Research': 'text-purple-400',
  'Ready For Outreach': 'text-pink-400',
  'Outreach Sent': 'text-amber-400',
  'Follow-up Scheduled': 'text-orange-400',
  'Meeting Booked': 'text-yellow-400',
  'Proposal Sent': 'text-teal-400',
  'Negotiation': 'text-lime-400',
  'Won': 'text-emerald-400',
  'Lost': 'text-rose-400',
  'Archived': 'text-gray-400'
};

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({
  leads,
  teamMembers,
  onSelectLead,
  onStageChange,
  onToggleStar,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  const getDaysInStage = (lead: Lead): number => {
    if (!lead.stageHistory || lead.stageHistory.length === 0) return 0;
    const lastEvent = lead.stageHistory[lead.stageHistory.length - 1];
    const diff = Date.now() - new Date(lastEvent.changedAt).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const getValueColor = (val: string) => {
    if (val === 'Enterprise') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (val === 'High') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (val === 'Medium') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const scroll = (direction: 'left' | 'right') => {
    if (boardRef.current) {
      const scrollAmount = 400;
      boardRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filter out empty columns except the first 6
  const activeStages = STAGES.filter((stage, idx) => {
    if (idx < 6) return true;
    return leads.some(l => l.stage === stage);
  });

  return (
    <div className="relative w-full overflow-hidden">
      {/* Scroll controls */}
      <div className="absolute right-4 top-[-48px] flex items-center gap-2 z-10">
        <button
          onClick={() => scroll('left')}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={boardRef}
        className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
        style={{ minHeight: 'calc(100vh - 280px)' }}
      >
        {activeStages.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage);
          const borderStyle = STAGE_COLORS[stage] || 'border-t-white/10 bg-white/5';
          const textStyle = STAGE_TEXT_COLORS[stage] || 'text-gray-400';

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-80 rounded-xl bg-white/5 border border-white/10 flex flex-col snap-start overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-4 border-t-4 border-b border-white/10 ${borderStyle} flex items-center justify-between`}>
                <span className={`font-semibold text-sm ${textStyle}`}>{stage}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold">
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {stageLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/5 rounded-xl">
                    <p className="text-xs text-gray-500">No opportunities in this stage</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const days = getDaysInStage(lead);
                    const assignedMember = teamMembers.find(m => m.id === lead.assignedTo);
                    const score = lead.manualScoreOverride !== null ? lead.manualScoreOverride : (lead.qualityScore?.totalScore || 0);

                    return (
                      <motion.div
                        key={lead.id}
                        whileHover={{ y: -2 }}
                        onClick={() => onSelectLead(lead)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-white line-clamp-1 flex-1">
                            {lead.companyName}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStar(lead.id);
                            }}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${lead.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {lead.leadName} • {lead.needSummary}
                        </p>

                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(score)}`}>
                            Score: {score}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getValueColor(lead.opportunityValue)}`}>
                            {lead.opportunityValue}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{days}d in stage</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Direction controls */}
                            <div className="flex items-center gap-1">
                              {STAGES.indexOf(stage) > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const prevStage = STAGES[STAGES.indexOf(stage) - 1];
                                    onStageChange(lead.id, prevStage);
                                  }}
                                  title="Move Left"
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {STAGES.indexOf(stage) < STAGES.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStage = STAGES[STAGES.indexOf(stage) + 1];
                                    onStageChange(lead.id, nextStage);
                                  }}
                                  title="Move Right"
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Assignee Avatar */}
                            {assignedMember ? (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase"
                                style={{ backgroundColor: assignedMember.color }}
                                title={`Assigned to ${assignedMember.name}`}
                              >
                                {assignedMember.name.substring(0, 2)}
                              </div>
                            ) : (
                              <div
                                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-gray-400"
                                title="Unassigned"
                              >
                                <User className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
