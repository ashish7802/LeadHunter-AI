'use client';

import React from 'react';
import { PipelineMetrics } from '@/lib/types/lead';
import { Target, Flame, CheckCircle2, Trophy, Award, BrainCircuit, ShieldAlert, Users, Percent, Calendar, FileText } from 'lucide-react';

interface MetricsProps {
  metrics: PipelineMetrics;
}

export const MetricsOverview: React.FC<MetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Opportunities',
      value: metrics.totalOpportunities,
      subtitle: 'Worldwide prospects',
      icon: Target,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Meetings Booked',
      value: metrics.meetingsBooked ?? 0,
      subtitle: 'Discovery scheduled',
      icon: Calendar,
      color: 'from-indigo-500 via-purple-500 to-pink-500',
    },
    {
      title: 'Proposals Sent',
      value: metrics.proposalsSent ?? 0,
      subtitle: 'In negotiation',
      icon: FileText,
      color: 'from-cyan-500 to-indigo-500',
    },
    {
      title: 'Won Clients',
      value: metrics.wonOpportunities ?? 0,
      subtitle: 'Closed won deals',
      icon: Trophy,
      color: 'from-emerald-500 to-teal-500',
      pulse: (metrics.wonOpportunities ?? 0) > 0,
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate ?? 0}%`,
      subtitle: 'Won / Progressed',
      icon: Percent,
      color: 'from-amber-500 to-rose-500',
    },
    {
      title: 'Avg Quality Score',
      value: metrics.totalOpportunities > 0 ? `${metrics.avgOpportunityScore}/100` : '0/100',
      subtitle: 'Weighted AI signals',
      icon: Award,
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="glass-panel-interactive rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                  {c.title}
                  {c.pulse && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  )}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:scale-105 transition-transform">
                  {c.value}
                </div>
                <p className="text-[11px] text-gray-400 truncate">{c.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continuous Learning Report */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden bg-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          Continuous Learning AI Report
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-medium">Avg Agency Fit</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.avgAgencyFitScore ?? 0}%</div>
            <p className="text-[10px] text-gray-500 mt-1">Overall fit alignment</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium">Noise Eliminated</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.totalNoiseEliminated ?? 0}</div>
            <p className="text-[10px] text-gray-500 mt-1">Recruiters/Spam/Students</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium">Contact Match Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.contactMatchRate ?? 0}%</div>
            <p className="text-[10px] text-gray-500 mt-1">Verified contact info</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium">False Positive Est.</span>
            </div>
            <div className="text-2xl font-bold text-white">{metrics.falsePositiveRate ?? 0}%</div>
            <p className="text-[10px] text-gray-500 mt-1">AI confidence adjustment</p>
          </div>
        </div>
      </div>
    </div>
  );
};
