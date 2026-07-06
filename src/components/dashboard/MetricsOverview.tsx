'use client';

import React from 'react';
import { PipelineMetrics } from '@/lib/types/lead';
import { Target, Flame, CheckCircle2, Globe2, Award } from 'lucide-react';

interface MetricsProps {
  metrics: PipelineMetrics;
}

export const MetricsOverview: React.FC<MetricsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Discovered Leads',
      value: metrics.totalLeads,
      subtitle: 'Real public social signals',
      icon: Target,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Qualified High-Intent',
      value: metrics.qualifiedLeads,
      subtitle: 'Score ≥ 80 | Verified intent',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Hot Leads (Immediate)',
      value: metrics.hotLeads,
      subtitle: 'Score ≥ 90 | Urgent need',
      icon: Flame,
      color: 'from-amber-500 to-rose-500',
      pulse: metrics.hotLeads > 0,
    },
    {
      title: 'India Prospects 🇮🇳',
      value: metrics.indiaLeads,
      subtitle: 'Bengaluru, Mumbai, Delhi',
      icon: Globe2,
      color: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Canada Prospects 🇨🇦',
      value: metrics.canadaLeads,
      subtitle: 'Toronto, Montreal, Vancouver',
      icon: Globe2,
      color: 'from-red-500 to-rose-600',
    },
    {
      title: 'Avg Quality Score',
      value: metrics.totalLeads > 0 ? `${metrics.avgLeadScore}/100` : '0/100',
      subtitle: 'Weighted AI signals',
      icon: Award,
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="glass-panel-interactive rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                {c.title}
                {c.pulse && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
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
  );
};
